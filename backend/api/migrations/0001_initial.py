import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="CachedShopData",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("cache_key", models.CharField(db_index=True, max_length=512, unique=True)),
                ("yelp_id", models.CharField(blank=True, db_index=True, max_length=128)),
                ("data", models.JSONField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name_plural": "Cached shop data",
                "ordering": ["-updated_at"],
            },
        ),
        migrations.CreateModel(
            name="FavoriteShop",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("yelp_id", models.CharField(db_index=True, max_length=128)),
                ("shop_name", models.CharField(max_length=255)),
                ("shop_image_url", models.URLField(blank=True)),
                ("shop_rating", models.FloatField(blank=True, null=True)),
                ("shop_address", models.CharField(blank=True, max_length=512)),
                ("latitude", models.FloatField(blank=True, null=True)),
                ("longitude", models.FloatField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="favorite_shops",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
                "unique_together": {("user", "yelp_id")},
            },
        ),
    ]
