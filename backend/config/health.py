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
        return JsonResponse({"status": "error", "detail": str(exc)}, status=503)
    return JsonResponse({"status": "ok"})
