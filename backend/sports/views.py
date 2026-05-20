from django.db.models import Prefetch
from rest_framework import permissions, serializers, viewsets

from sports.models import ActivityClass, ProgramSubcategory, Sport


class ProgramSubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramSubcategory
        fields = ("id", "category", "name", "slug", "display_order")


class SportListSerializer(serializers.ModelSerializer):
    subcategory_slug = serializers.SlugField(source="subcategory.slug", read_only=True)
    subcategory_name = serializers.CharField(source="subcategory.name", read_only=True)

    class Meta:
        model = Sport
        fields = (
            "id",
            "category",
            "subcategory_slug",
            "subcategory_name",
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
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        subcategory = self.request.query_params.get("subcategory")
        if subcategory:
            qs = qs.filter(subcategory__slug=subcategory)
        if self.action == "retrieve":
            return qs.select_related("subcategory").prefetch_related(
                Prefetch(
                    "activity_classes",
                    queryset=ActivityClass.objects.filter(active=True).order_by("title"),
                ),
            )
        return qs.select_related("subcategory")

    lookup_field = "slug"


class ProgramSubcategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProgramSubcategory.objects.filter(active=True).order_by(
        "display_order", "name"
    )
    serializer_class = ProgramSubcategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        return qs
