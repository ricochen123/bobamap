from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    FavoriteByYelpIdView,
    FavoriteDeleteView,
    FavoriteListCreateView,
    LoginView,
    MeView,
    RegisterView,
    ShopDetailView,
    ShopListView,
)

urlpatterns = [
    path("shops/", ShopListView.as_view(), name="shop-list"),
    path("shops/<str:shop_id>/", ShopDetailView.as_view(), name="shop-detail"),
    path("favorites/", FavoriteListCreateView.as_view(), name="favorite-list"),
    path("favorites/<int:pk>/", FavoriteDeleteView.as_view(), name="favorite-delete"),
    path("favorites/yelp/<str:yelp_id>/", FavoriteByYelpIdView.as_view(), name="favorite-by-yelp"),
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
]
