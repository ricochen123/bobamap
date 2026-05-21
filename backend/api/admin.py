from django.contrib import admin

from .models import CachedShopData, FavoriteShop


@admin.register(CachedShopData)
class CachedShopDataAdmin(admin.ModelAdmin):
    list_display = ("cache_key", "yelp_id", "updated_at")
    search_fields = ("cache_key", "yelp_id")


@admin.register(FavoriteShop)
class FavoriteShopAdmin(admin.ModelAdmin):
    list_display = ("shop_name", "user", "yelp_id", "shop_rating", "created_at")
    list_filter = ("user",)
    search_fields = ("shop_name", "yelp_id")
