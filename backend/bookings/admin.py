from django.contrib import admin

from bookings.models import AttendanceRecord, Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("id", "child", "occurrence", "parent", "status", "booked_at")
    list_filter = ("status", "occurrence__activity_class__sport")
    search_fields = (
        "id",
        "child__first_name",
        "child__last_name",
        "parent__user__email",
        "occurrence__activity_class__title",
    )
    raw_id_fields = ("occurrence", "child", "parent", "payment")
    date_hierarchy = "booked_at"


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ("booking", "status", "recorded_by", "recorded_at")
