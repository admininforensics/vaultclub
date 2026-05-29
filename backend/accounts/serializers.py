from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.models import ParentProfile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "role", "phone_number")


class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    whatsapp_number = serializers.CharField(max_length=32, required=False, allow_blank=True)
    location = serializers.CharField(max_length=255, required=False, allow_blank=True)

    def create(self, validated_data):
        whatsapp = validated_data.pop("whatsapp_number", "")
        location = validated_data.pop("location", "")
        password = validated_data.pop("password")
        email = validated_data.pop("email").lower()
        user = User.objects.create_user(
            email=email,
            password=password,
            role=User.Role.PARENT,
            **validated_data,
        )
        ParentProfile.objects.create(
            user=user,
            whatsapp_number=whatsapp or "",
            location=location or "",
        )
        return user

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value.lower()).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()


class ParentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParentProfile
        fields = (
            "id",
            "whatsapp_number",
            "location",
            "emergency_contact_name",
            "emergency_contact_phone",
            "marketing_opt_in",
        )
