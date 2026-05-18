from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from accounts.models import ParentProfile
from accounts.serializers import ParentProfileSerializer, RegisterSerializer, UserSerializer


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        return Response(
            {"user": UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data = {"user": UserSerializer(request.user).data}
        if hasattr(request.user, "parent_profile"):
            data["parent_profile"] = ParentProfileSerializer(
                request.user.parent_profile
            ).data
        return Response(data)

    def patch(self, request):
        user = request.user
        if hasattr(user, "parent_profile"):
            ser = ParentProfileSerializer(
                user.parent_profile, data=request.data, partial=True
            )
            ser.is_valid(raise_exception=True)
            ser.save()
            return Response(
                {
                    "user": UserSerializer(user).data,
                    "parent_profile": ser.data,
                }
            )
        return Response({"detail": "No parent profile."}, status=400)


class EmailTokenObtainPairView(TokenObtainPairView):
    """Uses USERNAME_FIELD (email) on the user model."""

    pass
