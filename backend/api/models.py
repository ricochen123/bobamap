from django.conf import settings
from django.db import models


class CachedShopData(models.Model):
    cache_key = models.CharField(max_length=512, unique=True, db_index=True)
    yelp_id = models.CharField(max_length=128, blank=True, db_index=True)
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Cached shop data"
        ordering = ["-updated_at"]

    def __str__(self):
        return self.cache_key[:80]


class FavoriteShop(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favorite_shops",
    )
    yelp_id = models.CharField(max_length=128, db_index=True)
    shop_name = models.CharField(max_length=255)
    shop_image_url = models.URLField(blank=True)
    shop_rating = models.FloatField(null=True, blank=True)
    shop_address = models.CharField(max_length=512, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "yelp_id")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} — {self.shop_name}"
