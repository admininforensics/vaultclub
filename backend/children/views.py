from rest_framework import permissions, serializers, viewsets
from rest_framework.exceptions import PermissionDenied

from children.models import Child
from accounts.models import ParentProfile


class ChildSerializer(serializers.ModelSerializer):
    class Meta:
        model = Child
        fields = (
            "id",
            "first_name",
            "last_name",
            "date_of_birth",
            "gender",
            "medical_notes",
            "allergies",
            "emergency_notes",
            "active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class ChildViewSet(viewsets.ModelViewSet):
    serializer_class = ChildSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not hasattr(self.request.user, "parent_profile"):
            return Child.objects.none()
        return Child.objects.filter(parent=self.request.user.parent_profile)

    def perform_create(self, serializer):
        try:
            profile = self.request.user.parent_profile
        except ParentProfile.DoesNotExist as exc:
            raise PermissionDenied("Parent profile required.") from exc
        serializer.save(parent=profile)

    def perform_destroy(self, instance):
        instance.active = False
        instance.save(update_fields=["active"])
