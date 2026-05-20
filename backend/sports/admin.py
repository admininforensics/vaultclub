from django.contrib import admin

from sports.models import ActivityClass, Coach, ProgramSubcategory, Sport, Venue


@admin.register(ProgramSubcategory)
class ProgramSubcategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "slug", "active", "display_order")
    list_filter = ("category", "active")
    list_editable = ("display_order", "active")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


@admin.register(Sport)
class SportAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "subcategory", "slug", "active", "display_order")
    list_filter = ("category", "subcategory", "active")
    list_editable = ("display_order", "active")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ("name", "active")
    list_filter = ("active",)


@admin.register(Coach)
class CoachAdmin(admin.ModelAdmin):
    list_display = ("user", "active")
    list_filter = ("active",)


@admin.register(ActivityClass)
class ActivityClassAdmin(admin.ModelAdmin):
    list_display = ("title", "sport", "skill_level", "active", "default_capacity")
    list_filter = ("sport", "active", "skill_level")
    search_fields = ("title", "sport__name")
