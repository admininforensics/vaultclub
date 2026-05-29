from datetime import datetime

from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework import permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from bookings.services import spots_remaining
from scheduling.models import ClassOccurrence


class ScheduleOccurrenceSerializer(serializers.ModelSerializer):
    sport = serializers.SerializerMethodField()
    activity_class = serializers.SerializerMethodField()
    venue = serializers.SerializerMethodField()
    coach = serializers.SerializerMethodField()
    spots_remaining = serializers.SerializerMethodField()
    price_amount = serializers.IntegerField(source="price_cents")

    class Meta:
        model = ClassOccurrence
        fields = (
            "id",
            "sport",
            "activity_class",
            "starts_at",
            "ends_at",
            "venue",
            "coach",
            "capacity",
            "spots_remaining",
            "price_amount",
            "currency",
            "status",
        )

    def get_sport(self, obj):
        s = obj.activity_class.sport
        return {"id": str(s.id), "name": s.name}

    def get_activity_class(self, obj):
        ac = obj.activity_class
        return {"id": str(ac.id), "title": ac.title}

    def get_venue(self, obj):
        return obj.venue.name

    def get_coach(self, obj):
        if obj.coach:
            return obj.coach.user.get_full_name() or obj.coach.user.email
        return ""

    def get_spots_remaining(self, obj):
        return spots_remaining(obj)


class ScheduleListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        start = request.query_params.get("start_date")
        end = request.query_params.get("end_date")
        sport_id = request.query_params.get("sport_id")
        category = request.query_params.get("category")
        location = request.query_params.get("location", "").strip()

        if not start or not end:
            return Response(
                {"detail": "start_date and end_date are required (YYYY-MM-DD)."},
                status=400,
            )
        start_d = parse_date(start)
        end_d = parse_date(end)
        if not start_d or not end_d:
            return Response({"detail": "Invalid date format."}, status=400)

        start_dt = timezone.make_aware(datetime.combine(start_d, datetime.min.time()))
        end_dt = timezone.make_aware(datetime.combine(end_d, datetime.max.time()))

        qs = (
            ClassOccurrence.objects.filter(
                starts_at__gte=start_dt,
                starts_at__lte=end_dt,
                status=ClassOccurrence.Status.SCHEDULED,
            )
            .select_related(
                "activity_class",
                "activity_class__sport",
                "venue",
                "coach",
                "coach__user",
            )
            .order_by("starts_at")
        )
        if sport_id:
            qs = qs.filter(activity_class__sport_id=sport_id)
        if category:
            qs = qs.filter(activity_class__sport__category=category)
        if location:
            from django.db.models import Q

            qs = qs.filter(
                Q(venue__city__iexact=location)
                | Q(venue__address__icontains=location)
            )

        ser = ScheduleOccurrenceSerializer(qs, many=True)
        return Response({"results": ser.data})


class ScheduleOccurrenceDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, occurrence_id):
        occ = (
            ClassOccurrence.objects.filter(
                pk=occurrence_id,
                status=ClassOccurrence.Status.SCHEDULED,
            )
            .select_related(
                "activity_class",
                "activity_class__sport",
                "venue",
                "coach",
                "coach__user",
            )
            .first()
        )
        if not occ:
            return Response(status=404)
        return Response(ScheduleOccurrenceSerializer(occ).data)
