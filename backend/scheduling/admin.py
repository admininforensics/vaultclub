from django.contrib import admin

from scheduling.models import ClassOccurrence, ClassScheduleRule


@admin.register(ClassScheduleRule)
class ClassScheduleRuleAdmin(admin.ModelAdmin):
    list_display = (
        "activity_class",
        "venue",
        "coach",
        "get_weekday_display",
        "start_time",
        "end_time",
        "active",
    )
    list_filter = ("active", "weekday")


@admin.register(ClassOccurrence)
class ClassOccurrenceAdmin(admin.ModelAdmin):
    list_display = (
        "activity_class",
        "starts_at",
        "ends_at",
        "venue",
        "capacity",
        "status",
    )
    list_filter = ("status", "activity_class__sport")
    date_hierarchy = "starts_at"
    search_fields = ("activity_class__title",)
