from django.contrib import admin

from bookings.models import AttendanceRecord, Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("id", "child", "occurrence", "parent", "status", "booked_at")
    list_filter = ("status",)
    search_fields = ("child__first_name", "parent__user__email")
    raw_id_fields = ("occurrence", "child", "parent", "payment")


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ("booking", "status", "recorded_by", "recorded_at")
