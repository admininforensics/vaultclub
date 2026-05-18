from django.contrib import admin

from children.models import Child


@admin.register(Child)
class ChildAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "parent", "active", "created_at")
    list_filter = ("active",)
    search_fields = ("first_name", "last_name", "parent__user__email")
