from django.urls import path
from rest_framework.routers import DefaultRouter

from staff.views import (
    StaffActivityClassViewSet,
    StaffCoachViewSet,
    StaffGenerateOccurrencesView,
    StaffProgrammeViewSet,
    StaffScheduleRuleViewSet,
    StaffSubcategoryViewSet,
    StaffVenueViewSet,
)

router = DefaultRouter()
router.register("programmes", StaffProgrammeViewSet, basename="staff-programme")
router.register("subcategories", StaffSubcategoryViewSet, basename="staff-subcategory")
router.register("activity-classes", StaffActivityClassViewSet, basename="staff-class")
router.register("venues", StaffVenueViewSet, basename="staff-venue")
router.register("coaches", StaffCoachViewSet, basename="staff-coach")
router.register("schedule-rules", StaffScheduleRuleViewSet, basename="staff-rule")

urlpatterns = [
    path(
        "generate-occurrences/",
        StaffGenerateOccurrencesView.as_view(),
        name="staff-generate-occurrences",
    ),
    *router.urls,
]
