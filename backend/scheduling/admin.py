from django.contrib import admin, messages
from django.core.management import call_command
from django.http import HttpRequest
from django.shortcuts import redirect
from django.urls import path
from django.utils.html import format_html

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
    search_fields = ("activity_class__title", "venue__name", "coach__user__email")

    change_list_template = "admin/scheduling/classschedulerule/change_list.html"

    def get_urls(self):
        urls = super().get_urls()
        custom = [
            path(
                "generate-occurrences/",
                self.admin_site.admin_view(self.generate_occurrences_view),
                name="scheduling_classschedulerule_generate_occurrences",
            ),
        ]
        return custom + urls

    def generate_occurrences_view(self, request: HttpRequest):
        weeks_raw = request.GET.get("weeks", "8")
        try:
            weeks = int(weeks_raw)
        except ValueError:
            weeks = 8

        if request.method != "POST":
            return redirect("..")

        try:
            call_command("generate_occurrences", weeks=weeks)
        except Exception as exc:
            self.message_user(
                request,
                f"Failed to generate occurrences: {exc}",
                level=messages.ERROR,
            )
        else:
            self.message_user(
                request,
                f"Generated occurrences for the next {weeks} week(s).",
                level=messages.SUCCESS,
            )

        return redirect("..")

    @admin.display(description="Generate occurrences")
    def generate_occurrences_button(self, obj=None):
        # Rendered in the change_list_template
        return format_html("")


@admin.register(ClassOccurrence)
class ClassOccurrenceAdmin(admin.ModelAdmin):
    list_display = (
        "activity_class",
        "starts_at",
        "ends_at",
        "venue",
        "coach",
        "capacity",
        "status",
    )
    list_filter = ("status", "activity_class__sport")
    date_hierarchy = "starts_at"
    search_fields = ("activity_class__title",)
    raw_id_fields = ("schedule_rule", "activity_class", "venue", "coach")
