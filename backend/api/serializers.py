from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import FavoriteShop

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name")
        read_only_fields = ("id",)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "email", "password", "password_confirm", "first_name", "last_name")

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )


class FavoriteShopSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteShop
        fields = (
            "id",
            "yelp_id",
            "shop_name",
            "shop_image_url",
            "shop_rating",
            "shop_address",
            "latitude",
            "longitude",
            "created_at",
        )
        read_only_fields = ("id", "created_at")


class FavoriteCreateSerializer(serializers.Serializer):
    yelp_id = serializers.CharField(max_length=128)
    shop_name = serializers.CharField(max_length=255)
    shop_image_url = serializers.URLField(required=False, allow_blank=True)
    shop_rating = serializers.FloatField(required=False, allow_null=True)
    shop_address = serializers.CharField(required=False, allow_blank=True)
    latitude = serializers.FloatField(required=False, allow_null=True)
    longitude = serializers.FloatField(required=False, allow_null=True)
