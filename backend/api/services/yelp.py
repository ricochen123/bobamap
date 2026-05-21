import hashlib
import json
from datetime import timedelta
from typing import Any

import requests
from django.conf import settings
from django.utils import timezone

from api.models import CachedShopData

YELP_BASE = "https://api.yelp.com/v3"


class YelpServiceError(Exception):
    def __init__(self, message: str, status_code: int | None = None):
        super().__init__(message)
        self.status_code = status_code


class YelpService:
    def __init__(self):
        self.api_key = settings.YELP_API_KEY
        self.cache_ttl = timedelta(seconds=settings.YELP_CACHE_TTL)
        self.session = requests.Session()
        self.session.headers.update(
            {
                "Authorization": f"Bearer {self.api_key}",
                "Accept": "application/json",
            }
        )

    def _ensure_key(self):
        if not self.api_key:
            raise YelpServiceError(
                "YELP_API_KEY is not configured",
                status_code=503,
            )

    def _cache_key(self, prefix: str, params: dict) -> str:
        raw = json.dumps(params, sort_keys=True)
        digest = hashlib.sha256(raw.encode()).hexdigest()[:16]
        return f"{prefix}:{digest}"

    def _get_cached(self, key: str) -> dict | None:
        try:
            row = CachedShopData.objects.get(cache_key=key)
            if timezone.now() - row.updated_at < self.cache_ttl:
                return row.data
        except CachedShopData.DoesNotExist:
            pass
        return None

    def _get_cached_stale(self, key: str) -> dict | None:
        try:
            return CachedShopData.objects.get(cache_key=key).data
        except CachedShopData.DoesNotExist:
            return None

    def _set_cache(self, key: str, data: dict, yelp_id: str = ""):
        CachedShopData.objects.update_or_create(
            cache_key=key,
            defaults={"data": data, "yelp_id": yelp_id},
        )

    def _request(self, path: str, params: dict | None = None) -> dict:
        self._ensure_key()
        url = f"{YELP_BASE}{path}"
        resp = self.session.get(url, params=params or {}, timeout=15)
        if resp.status_code == 401:
            raise YelpServiceError("Invalid Yelp API key", status_code=401)
        if resp.status_code == 429:
            raise YelpServiceError(
                "Yelp rate limit reached — wait about a minute, then try Refresh.",
                status_code=429,
            )
        if not resp.ok:
            raise YelpServiceError(
                resp.json().get("error", {}).get("description", resp.text),
                status_code=resp.status_code,
            )
        return resp.json()

    @staticmethod
    def normalize_business(b: dict) -> dict:
        loc = b.get("location", {}) or {}
        coords = b.get("coordinates", {}) or {}
        hours = b.get("hours") or []
        open_now = None
        if hours and isinstance(hours, list) and hours[0]:
            open_now = hours[0].get("is_open_now")

        return {
            "id": b.get("id"),
            "name": b.get("name"),
            "rating": b.get("rating"),
            "review_count": b.get("review_count"),
            "price": b.get("price"),
            "address": ", ".join(loc.get("display_address") or []),
            "city": loc.get("city"),
            "zip_code": loc.get("zip_code"),
            "latitude": coords.get("latitude"),
            "longitude": coords.get("longitude"),
            "phone": b.get("display_phone") or b.get("phone"),
            "image_url": b.get("image_url"),
            "photos": b.get("photos") or ([b["image_url"]] if b.get("image_url") else []),
            "hours": hours,
            "is_open_now": open_now if open_now is not None else b.get("is_closed") is False,
            "url": b.get("url"),
            "categories": [c.get("title") for c in (b.get("categories") or [])],
            "distance": b.get("distance"),
            "distance_miles": None,
            "reviews": [],
        }

    def search_shops(
        self,
        *,
        latitude: float | None = None,
        longitude: float | None = None,
        location: str | None = None,
        radius: int = 5000,
        limit: int = 50,
        term: str | None = None,
        shop_name: str | None = None,
        open_now: bool | None = None,
        price: str | None = None,
        sort_by: str = "best_match",
        min_rating: float | None = None,
    ) -> list[dict]:
        custom_term = shop_name or term
        search_term = custom_term or "bubble tea"
        yelp_sort = sort_by
        if sort_by == "distance" and latitude is None:
            yelp_sort = "best_match"

        params: dict[str, Any] = {
            "term": search_term,
            "limit": min(limit, 50),
            "sort_by": yelp_sort,
        }
        if latitude is not None and longitude is not None:
            params["latitude"] = latitude
            params["longitude"] = longitude
            params["radius"] = min(radius, 40000)
        elif location:
            params["location"] = location
        if "latitude" not in params and "location" not in params:
            raise YelpServiceError("Provide latitude/longitude or location", status_code=400)

        if open_now:
            params["open_now"] = True
        if price:
            params["price"] = price

        cache_key = self._cache_key("search", params)
        cached = self._get_cached(cache_key)
        if cached:
            businesses = cached.get("businesses", [])
        else:
            try:
                data = self._request("/businesses/search", params)
                businesses = data.get("businesses", [])
                self._set_cache(cache_key, data)
            except YelpServiceError as exc:
                stale = self._get_cached_stale(cache_key)
                if stale and exc.status_code == 429:
                    businesses = stale.get("businesses", [])
                else:
                    raise

        shops = [self.normalize_business(b) for b in businesses]
        if min_rating is not None:
            shops = [s for s in shops if (s.get("rating") or 0) >= min_rating]
        return shops

    def get_business(self, business_id: str) -> dict:
        cache_key = self._cache_key("business", {"id": business_id})
        cached = self._get_cached(cache_key)
        if cached:
            business = cached
        else:
            business = self._request(f"/businesses/{business_id}")
            self._set_cache(cache_key, business, yelp_id=business_id)

        shop = self.normalize_business(business)

        try:
            rev_cache = self._cache_key("reviews", {"id": business_id})
            rev_data = self._get_cached(rev_cache)
            if not rev_data:
                rev_data = self._request(f"/businesses/{business_id}/reviews")
                self._set_cache(rev_cache, rev_data, yelp_id=business_id)
            shop["reviews"] = [
                {
                    "id": r.get("id"),
                    "rating": r.get("rating"),
                    "text": r.get("text"),
                    "user": (r.get("user") or {}).get("name"),
                    "time_created": r.get("time_created"),
                }
                for r in rev_data.get("reviews", [])[:5]
            ]
        except YelpServiceError:
            shop["reviews"] = []

        return shop
