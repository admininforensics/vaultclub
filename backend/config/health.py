from django.conf import settings
from django.db import connection
from django.http import JsonResponse


def health(request):
    """Render health check: DB connectivity and migrations (sports_sport table)."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        from sports.models import Sport

        Sport.objects.exists()
    except Exception as exc:
        detail = str(exc) if settings.DEBUG else "database_error"
        return JsonResponse({"status": "error", "detail": detail}, status=503)
    return JsonResponse({"status": "ok"})
