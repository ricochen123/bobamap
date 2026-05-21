from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import FavoriteShop
from .serializers import (
    FavoriteCreateSerializer,
    FavoriteShopSerializer,
    RegisterSerializer,
    UserSerializer,
)
from .services.geo import enrich_shop_distances, meters_to_miles
from .services.yelp import YelpService, YelpServiceError

User = get_user_model()


def _apply_client_filters(shops: list, request) -> list:
    min_rating = request.query_params.get("min_rating")
    max_distance = request.query_params.get("max_distance")
    sort = request.query_params.get("sort", "best_match")

    if min_rating:
        try:
            threshold = float(min_rating)
            shops = [s for s in shops if (s.get("rating") or 0) >= threshold]
        except ValueError:
            pass

    if max_distance:
        try:
            max_m = float(max_distance)
            shops = [s for s in shops if (s.get("distance") or 0) <= max_m]
        except ValueError:
            pass

    if sort == "rating":
        shops.sort(key=lambda s: s.get("rating") or 0, reverse=True)
    elif sort == "distance":
        shops.sort(key=lambda s: s.get("distance") or float("inf"))

    return shops


class ShopListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        lat = request.query_params.get("lat")
        lng = request.query_params.get("lng")
        location = request.query_params.get("location")
        shop_name = request.query_params.get("name", "").strip() or None
        radius = int(request.query_params.get("radius", 5000))
        term = request.query_params.get("term")
        open_now = request.query_params.get("open_now", "").lower() == "true"
        price = request.query_params.get("price")
        sort_by = request.query_params.get("sort", "best_match")
        has_coords = lat and lng
        if sort_by == "distance" and has_coords:
            yelp_sort = "distance"
        elif sort_by == "rating":
            yelp_sort = "rating"
        else:
            yelp_sort = "best_match"

        latitude = float(lat) if lat else None
        longitude = float(lng) if lng else None

        if not location and latitude is None:
            return Response(
                {"detail": "Provide lat & lng or location (city/zip)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if shop_name and not location and latitude is None:
            return Response(
                {"detail": "Shop name search needs your location or a city/zip."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            service = YelpService()
            shops = service.search_shops(
                latitude=latitude,
                longitude=longitude,
                location=location,
                radius=radius,
                term=term,
                shop_name=shop_name,
                open_now=open_now or None,
                price=price,
                sort_by=yelp_sort,
            )

            ref_lat = request.query_params.get("ref_lat")
            ref_lng = request.query_params.get("ref_lng")
            if ref_lat and ref_lng:
                shops = enrich_shop_distances(shops, float(ref_lat), float(ref_lng))
            elif latitude is not None and longitude is not None:
                shops = enrich_shop_distances(shops, latitude, longitude)

            for shop in shops:
                if shop.get("distance") is not None and shop.get("distance_miles") is None:
                    shop["distance_miles"] = round(meters_to_miles(shop["distance"]), 2)

            shops = _apply_client_filters(shops, request)

            page = int(request.query_params.get("page", 1))
            page_size = int(request.query_params.get("page_size", 20))
            start = (page - 1) * page_size
            end = start + page_size
            total = len(shops)

            return Response(
                {
                    "count": total,
                    "page": page,
                    "page_size": page_size,
                    "results": shops[start:end],
                }
            )
        except YelpServiceError as e:
            return Response({"detail": str(e)}, status=e.status_code or 502)


class ShopDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, shop_id):
        try:
            shop = YelpService().get_business(shop_id)
            return Response(shop)
        except YelpServiceError as e:
            return Response({"detail": str(e)}, status=e.status_code or 502)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class FavoriteListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = FavoriteShop.objects.filter(user=request.user)
        return Response(FavoriteShopSerializer(qs, many=True).data)

    def post(self, request):
        serializer = FavoriteCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        fav, created = FavoriteShop.objects.get_or_create(
            user=request.user,
            yelp_id=data["yelp_id"],
            defaults={
                "shop_name": data["shop_name"],
                "shop_image_url": data.get("shop_image_url", ""),
                "shop_rating": data.get("shop_rating"),
                "shop_address": data.get("shop_address", ""),
                "latitude": data.get("latitude"),
                "longitude": data.get("longitude"),
            },
        )
        if not created:
            return Response(
                FavoriteShopSerializer(fav).data,
                status=status.HTTP_200_OK,
            )
        return Response(
            FavoriteShopSerializer(fav).data,
            status=status.HTTP_201_CREATED,
        )


class FavoriteDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        deleted, _ = FavoriteShop.objects.filter(user=request.user, pk=pk).delete()
        if not deleted:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class FavoriteByYelpIdView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, yelp_id):
        deleted, _ = FavoriteShop.objects.filter(user=request.user, yelp_id=yelp_id).delete()
        if not deleted:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
