from django.urls import include, path
from config.health import health
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import EmailTokenObtainPairView, MeView, RegisterView
from bookings.views import BookingCancelView, BookingCollectionView, BookingDetailView
from children.views import ChildViewSet
from payments.webhooks import stripe_webhook
from scheduling.coach_views import CoachAttendanceView, CoachClassesView, CoachRosterView
from scheduling.views import (
    ScheduleListView,
    ScheduleOccurrenceDetailView,
)
from sports.views import ProgramSubcategoryViewSet, SportViewSet

router = DefaultRouter()
router.register("children", ChildViewSet, basename="child")
router.register("sports", SportViewSet, basename="sport")
router.register("subcategories", ProgramSubcategoryViewSet, basename="subcategory")

urlpatterns = [
    path("health/", health),
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/", EmailTokenObtainPairView.as_view()),
    path("auth/token/refresh/", TokenRefreshView.as_view()),
    path("auth/me/", MeView.as_view()),
    path(
        "schedule/<uuid:occurrence_id>/",
        ScheduleOccurrenceDetailView.as_view(),
    ),
    path("schedule/", ScheduleListView.as_view()),
    path("bookings/", BookingCollectionView.as_view()),
    path("bookings/<uuid:booking_id>/", BookingDetailView.as_view()),
    path("bookings/<uuid:booking_id>/cancel/", BookingCancelView.as_view()),
    path("shop/", include("shop.urls")),
    path("webhooks/stripe/", stripe_webhook),
    path("coach/classes/", CoachClassesView.as_view()),
    path(
        "coach/classes/<uuid:occurrence_id>/roster/",
        CoachRosterView.as_view(),
    ),
    path(
        "coach/classes/<uuid:occurrence_id>/attendance/",
        CoachAttendanceView.as_view(),
    ),
    path("", include(router.urls)),
]
