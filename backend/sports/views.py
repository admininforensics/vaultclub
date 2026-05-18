from django.db.models import Prefetch
from rest_framework import permissions, serializers, viewsets

from sports.models import ActivityClass, Sport


class SportListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sport
        fields = (
            "id",
            "name",
            "slug",
            "short_description",
            "image_url",
            "min_age",
            "max_age",
            "display_order",
        )


class ActivityClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityClass
        fields = (
            "id",
            "title",
            "description",
            "min_age",
            "max_age",
            "default_capacity",
            "default_duration_minutes",
            "skill_level",
            "default_price_cents",
            "currency",
        )


class SportDetailSerializer(SportListSerializer):
    activity_classes = ActivityClassSerializer(many=True, read_only=True)

    class Meta(SportListSerializer.Meta):
        fields = SportListSerializer.Meta.fields + ("long_description", "activity_classes")


class SportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Sport.objects.filter(active=True).order_by("display_order", "name")
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return SportDetailSerializer
        return SportListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action == "retrieve":
            return qs.prefetch_related(
                Prefetch(
                    "activity_classes",
                    queryset=ActivityClass.objects.filter(active=True).order_by("title"),
                ),
            )
        return qs

    lookup_field = "slug"
