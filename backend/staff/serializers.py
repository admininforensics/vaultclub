from django.utils.text import slugify
from rest_framework import serializers

from scheduling.models import ClassScheduleRule
from sports.models import ActivityClass, Coach, ProgramSubcategory, Sport, Venue


def _unique_slug(model, base: str, instance_pk=None) -> str:
    slug = slugify(base) or "item"
    candidate = slug
    n = 2
    qs = model.objects.all()
    if instance_pk:
        qs = qs.exclude(pk=instance_pk)
    while qs.filter(slug=candidate).exists():
        candidate = f"{slug}-{n}"
        n += 1
    return candidate


class StaffSubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramSubcategory
        fields = (
            "id",
            "category",
            "name",
            "slug",
            "display_order",
            "active",
        )
        read_only_fields = ("id",)

    def validate_slug(self, value):
        value = slugify(value) or "subcategory"
        return value

    def create(self, validated_data):
        if not validated_data.get("slug"):
            validated_data["slug"] = _unique_slug(
                ProgramSubcategory,
                validated_data["name"],
            )
        return super().create(validated_data)


class StaffProgrammeSerializer(serializers.ModelSerializer):
    subcategory_id = serializers.PrimaryKeyRelatedField(
        queryset=ProgramSubcategory.objects.all(),
        source="subcategory",
        allow_null=True,
        required=False,
    )
    subcategory_name = serializers.CharField(
        source="subcategory.name", read_only=True, allow_null=True
    )

    class Meta:
        model = Sport
        fields = (
            "id",
            "category",
            "subcategory_id",
            "subcategory_name",
            "name",
            "slug",
            "short_description",
            "long_description",
            "image_url",
            "min_age",
            "max_age",
            "active",
            "display_order",
        )
        read_only_fields = ("id",)

    def validate_slug(self, value):
        if value:
            return slugify(value) or "programme"
        return value

    def create(self, validated_data):
        if not validated_data.get("slug"):
            validated_data["slug"] = _unique_slug(Sport, validated_data["name"])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "slug" in validated_data and not validated_data["slug"]:
            validated_data["slug"] = instance.slug
        elif "slug" in validated_data:
            validated_data["slug"] = slugify(validated_data["slug"]) or instance.slug
        return super().update(instance, validated_data)


class StaffActivityClassSerializer(serializers.ModelSerializer):
    sport_id = serializers.PrimaryKeyRelatedField(
        queryset=Sport.objects.all(),
        source="sport",
    )
    sport_name = serializers.CharField(source="sport.name", read_only=True)

    class Meta:
        model = ActivityClass
        fields = (
            "id",
            "sport_id",
            "sport_name",
            "title",
            "description",
            "min_age",
            "max_age",
            "default_capacity",
            "default_duration_minutes",
            "skill_level",
            "default_price_cents",
            "currency",
            "active",
        )
        read_only_fields = ("id",)


class StaffVenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = (
            "id",
            "name",
            "city",
            "address",
            "image_url",
            "maps_url",
            "room_or_court",
            "capacity_notes",
            "active",
        )
        read_only_fields = ("id",)


class StaffCoachSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    name = serializers.SerializerMethodField()

    class Meta:
        model = Coach
        fields = ("id", "email", "name", "bio", "photo_url", "active")

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.email


class StaffScheduleRuleSerializer(serializers.ModelSerializer):
    activity_class_id = serializers.PrimaryKeyRelatedField(
        queryset=ActivityClass.objects.all(),
        source="activity_class",
    )
    venue_id = serializers.PrimaryKeyRelatedField(
        queryset=Venue.objects.all(),
        source="venue",
    )
    coach_id = serializers.PrimaryKeyRelatedField(
        queryset=Coach.objects.filter(active=True),
        source="coach",
        allow_null=True,
        required=False,
    )
    activity_class_title = serializers.CharField(
        source="activity_class.title", read_only=True
    )
    venue_name = serializers.CharField(source="venue.name", read_only=True)
    coach_name = serializers.SerializerMethodField()
    weekday_display = serializers.CharField(
        source="get_weekday_display", read_only=True
    )

    class Meta:
        model = ClassScheduleRule
        fields = (
            "id",
            "activity_class_id",
            "activity_class_title",
            "venue_id",
            "venue_name",
            "coach_id",
            "coach_name",
            "weekday",
            "weekday_display",
            "start_time",
            "end_time",
            "recurrence_start_date",
            "recurrence_end_date",
            "capacity_override",
            "active",
        )
        read_only_fields = ("id",)

    def get_coach_name(self, obj):
        if not obj.coach_id:
            return ""
        return obj.coach.user.get_full_name() or obj.coach.user.email

    def validate(self, attrs):
        start = attrs.get("start_time", getattr(self.instance, "start_time", None))
        end = attrs.get("end_time", getattr(self.instance, "end_time", None))
        if start and end and end <= start:
            raise serializers.ValidationError(
                {"end_time": "End time must be after start time."}
            )
        return attrs
