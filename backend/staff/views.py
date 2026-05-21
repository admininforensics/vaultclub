from django.core.management import call_command
from rest_framework import mixins, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from config.permissions import IsClubAdmin
from scheduling.models import ClassScheduleRule
from sports.models import ActivityClass, Coach, ProgramSubcategory, Sport, Venue

from staff.serializers import (
    StaffActivityClassSerializer,
    StaffCoachSerializer,
    StaffProgrammeSerializer,
    StaffScheduleRuleSerializer,
    StaffSubcategorySerializer,
    StaffVenueSerializer,
)


class StaffProgrammeViewSet(viewsets.ModelViewSet):
    """Club managers: create and edit programmes (sports, music, tutoring)."""

    queryset = Sport.objects.select_related("subcategory").order_by(
        "display_order", "name"
    )
    serializer_class = StaffProgrammeSerializer
    permission_classes = [IsClubAdmin]
    lookup_field = "id"


class StaffSubcategoryViewSet(viewsets.ModelViewSet):
    queryset = ProgramSubcategory.objects.order_by("display_order", "name")
    serializer_class = StaffSubcategorySerializer
    permission_classes = [IsClubAdmin]
    lookup_field = "id"

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        return qs


class StaffActivityClassViewSet(viewsets.ModelViewSet):
    queryset = ActivityClass.objects.select_related("sport").order_by(
        "sport__name", "title"
    )
    serializer_class = StaffActivityClassSerializer
    permission_classes = [IsClubAdmin]
    lookup_field = "id"

    def get_queryset(self):
        qs = super().get_queryset()
        sport_id = self.request.query_params.get("sport_id")
        if sport_id:
            qs = qs.filter(sport_id=sport_id)
        return qs


class StaffVenueViewSet(viewsets.ModelViewSet):
    queryset = Venue.objects.order_by("name")
    serializer_class = StaffVenueSerializer
    permission_classes = [IsClubAdmin]
    lookup_field = "id"


class StaffCoachViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Coach.objects.filter(active=True).select_related("user").order_by(
        "user__email"
    )
    serializer_class = StaffCoachSerializer
    permission_classes = [IsClubAdmin]


class StaffScheduleRuleViewSet(viewsets.ModelViewSet):
    queryset = ClassScheduleRule.objects.select_related(
        "activity_class",
        "activity_class__sport",
        "venue",
        "coach",
        "coach__user",
    ).order_by("weekday", "start_time")
    serializer_class = StaffScheduleRuleSerializer
    permission_classes = [IsClubAdmin]
    lookup_field = "id"


class StaffGenerateOccurrencesView(APIView):
    permission_classes = [IsClubAdmin]

    def post(self, request):
        weeks = request.data.get("weeks", 8)
        try:
            weeks = int(weeks)
        except (TypeError, ValueError):
            weeks = 8
        weeks = max(1, min(weeks, 52))
        call_command("generate_occurrences", weeks=weeks)
        return Response({"detail": f"Generated occurrences for the next {weeks} week(s)."})
