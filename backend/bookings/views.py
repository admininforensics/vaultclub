from django.db import transaction
from rest_framework import permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from bookings.models import Booking
from bookings.services import cancel_booking_for_parent, create_pending_booking
from payments.stripe_service import create_checkout_for_booking
from scheduling.models import ClassOccurrence
from scheduling.views import ScheduleOccurrenceSerializer


class BookingSerializer(serializers.ModelSerializer):
    occurrence = ScheduleOccurrenceSerializer(read_only=True)
    child_name = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = (
            "id",
            "occurrence",
            "child",
            "child_name",
            "status",
            "price_amount",
            "currency",
            "booked_at",
            "cancelled_at",
        )

    def get_child_name(self, obj):
        return f"{obj.child.first_name} {obj.child.last_name}"


class CreateBookingSerializer(serializers.Serializer):
    occurrence_id = serializers.UUIDField()
    child_id = serializers.UUIDField()
    payment_method = serializers.ChoiceField(choices=["stripe_checkout"])


class BookingCollectionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, "parent_profile"):
            return Response({"results": []})
        qs = (
            Booking.objects.filter(parent=request.user.parent_profile)
            .select_related(
                "occurrence",
                "occurrence__activity_class",
                "occurrence__activity_class__sport",
                "occurrence__venue",
                "occurrence__coach",
                "occurrence__coach__user",
                "child",
            )
            .order_by("-booked_at")
        )
        return Response({"results": BookingSerializer(qs, many=True).data})

    def post(self, request):
        if not hasattr(request.user, "parent_profile"):
            return Response({"detail": "Parent profile required."}, status=403)

        ser = CreateBookingSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        try:
            with transaction.atomic():
                booking = create_pending_booking(
                    occurrence_id=data["occurrence_id"],
                    child_id=data["child_id"],
                    parent_profile=request.user.parent_profile,
                )
                try:
                    _payment, url = create_checkout_for_booking(booking)
                except RuntimeError as exc:
                    booking.delete()
                    return Response({"detail": str(exc)}, status=503)
        except ClassOccurrence.DoesNotExist:
            return Response({"detail": "Occurrence not found."}, status=404)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=400)
        except PermissionError as exc:
            return Response({"detail": str(exc)}, status=403)

        return Response(
            {
                "booking_id": str(booking.id),
                "status": booking.status,
                "checkout_url": url,
            },
            status=status.HTTP_201_CREATED,
        )


class BookingDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, booking_id):
        if not hasattr(request.user, "parent_profile"):
            return Response(status=403)
        booking = Booking.objects.filter(
            pk=booking_id, parent=request.user.parent_profile
        ).select_related(
            "occurrence",
            "occurrence__activity_class",
            "occurrence__activity_class__sport",
            "occurrence__venue",
            "occurrence__coach",
            "occurrence__coach__user",
            "child",
        ).first()
        if not booking:
            return Response(status=404)
        return Response(BookingSerializer(booking).data)


class BookingCancelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, booking_id):
        if not hasattr(request.user, "parent_profile"):
            return Response(status=403)
        booking = Booking.objects.filter(
            pk=booking_id, parent=request.user.parent_profile
        ).first()
        if not booking:
            return Response(status=404)
        reason = request.data.get("reason", "")
        try:
            cancel_booking_for_parent(booking, request.user.parent_profile, reason=reason)
        except PermissionError:
            return Response(status=403)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=400)
        return Response(BookingSerializer(booking).data)
