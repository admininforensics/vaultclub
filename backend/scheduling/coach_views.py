from datetime import timedelta

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from bookings.models import AttendanceRecord, Booking
from config.permissions import IsCoach
from scheduling.models import ClassOccurrence
from scheduling.views import ScheduleOccurrenceSerializer


class CoachClassesView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCoach]

    def get(self, request):
        coach = request.user.coach_profile
        since = timezone.now() - timedelta(days=1)
        qs = (
            ClassOccurrence.objects.filter(coach=coach, starts_at__gte=since)
            .select_related(
                "activity_class",
                "activity_class__sport",
                "venue",
                "coach",
                "coach__user",
            )
            .order_by("starts_at")
        )
        return Response({"results": ScheduleOccurrenceSerializer(qs, many=True).data})


class RosterEntrySerializer(serializers.ModelSerializer):
    child_name = serializers.SerializerMethodField()
    parent_email = serializers.EmailField(source="parent.user.email", read_only=True)

    class Meta:
        model = Booking
        fields = ("id", "child", "child_name", "parent_email", "status")

    def get_child_name(self, obj):
        return f"{obj.child.first_name} {obj.child.last_name}"


class CoachRosterView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCoach]

    def get(self, request, occurrence_id):
        occ = get_object_or_404(
            ClassOccurrence.objects.select_related("coach"),
            pk=occurrence_id,
            coach__user=request.user,
        )
        qs = Booking.objects.filter(
            occurrence=occ,
            status__in=[
                Booking.Status.CONFIRMED,
                Booking.Status.ATTENDED,
                Booking.Status.PENDING_PAYMENT,
            ],
        ).select_related("child", "parent", "parent__user")
        return Response({"results": RosterEntrySerializer(qs, many=True).data})


class AttendanceItemSerializer(serializers.Serializer):
    booking_id = serializers.UUIDField()
    status = serializers.ChoiceField(choices=AttendanceRecord.Status.choices)


class CoachAttendanceView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCoach]

    def post(self, request, occurrence_id):
        occ = get_object_or_404(
            ClassOccurrence,
            pk=occurrence_id,
            coach__user=request.user,
        )
        ser = AttendanceItemSerializer(data=request.data, many=True)
        ser.is_valid(raise_exception=True)

        for row in ser.validated_data:
            booking = Booking.objects.filter(
                pk=row["booking_id"],
                occurrence=occ,
            ).first()
            if not booking:
                continue
            att_status = row["status"]
            ar, _created = AttendanceRecord.objects.update_or_create(
                booking=booking,
                defaults={
                    "status": att_status,
                    "recorded_by": request.user,
                },
            )
            if att_status == AttendanceRecord.Status.ATTENDED:
                booking.status = Booking.Status.ATTENDED
            elif att_status == AttendanceRecord.Status.NO_SHOW:
                booking.status = Booking.Status.NO_SHOW
            booking.save(update_fields=["status"])

        return Response({"detail": "Attendance saved."}, status=status.HTTP_200_OK)
