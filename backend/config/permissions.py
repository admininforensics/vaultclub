from django.contrib.auth import get_user_model
from rest_framework.permissions import BasePermission

User = get_user_model()


class IsClubAdmin(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        if not u.is_authenticated:
            return False
        if u.is_superuser:
            return True
        return u.role in (User.Role.ADMIN, User.Role.SUPER_ADMIN)


class IsCoach(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return u.is_authenticated and u.role == User.Role.COACH
