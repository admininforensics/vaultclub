from django.db.models import Prefetch
from rest_framework import permissions, serializers, viewsets

from scheduling.models import ClassOccurrence, ClassScheduleRule
from sports.models import ActivityClass, Coach, ProgramSubcategory, Sport, Venue


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


class ProgrammeCoachSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Coach
        fields = ("id", "name", "bio", "photo_url")

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.email


class ProgrammeVenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = ("id", "name", "address", "city", "image_url", "maps_url", "room_or_court")


class SportDetailSerializer(SportListSerializer):
    activity_classes = ActivityClassSerializer(many=True, read_only=True)
    coaches = serializers.SerializerMethodField()
    venues = serializers.SerializerMethodField()

    class Meta(SportListSerializer.Meta):
        fields = SportListSerializer.Meta.fields + (
            "long_description",
            "activity_classes",
            "coaches",
            "venues",
        )

    def get_coaches(self, obj):
        coach_ids = set(
            ClassScheduleRule.objects.filter(
                activity_class__sport=obj,
                coach__isnull=False,
                coach__active=True,
                active=True,
            ).values_list("coach_id", flat=True)
        )
        coach_ids.update(
            ClassOccurrence.objects.filter(
                activity_class__sport=obj,
                coach__isnull=False,
                coach__active=True,
                status=ClassOccurrence.Status.SCHEDULED,
            ).values_list("coach_id", flat=True)
        )
        coaches = (
            Coach.objects.filter(id__in=coach_ids, active=True)
            .select_related("user")
            .order_by("user__first_name", "user__last_name")
        )
        return ProgrammeCoachSerializer(coaches, many=True).data

    def get_venues(self, obj):
        venue_ids = set(
            ClassScheduleRule.objects.filter(
                activity_class__sport=obj,
                venue__active=True,
                active=True,
            ).values_list("venue_id", flat=True)
        )
        venue_ids.update(
            ClassOccurrence.objects.filter(
                activity_class__sport=obj,
                venue__active=True,
                status=ClassOccurrence.Status.SCHEDULED,
            ).values_list("venue_id", flat=True)
        )
        venues = Venue.objects.filter(id__in=venue_ids, active=True).order_by("name")
        return ProgrammeVenueSerializer(venues, many=True).data


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
