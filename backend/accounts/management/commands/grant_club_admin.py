from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Grant club admin role (staff portal + Django admin access when is_staff is set)."

    def add_arguments(self, parser):
        parser.add_argument("email", type=str, help="User email address")
        parser.add_argument(
            "--django-admin",
            action="store_true",
            help="Also set is_staff=True for Django /admin/ access.",
        )

    def handle(self, *args, **options):
        email = options["email"].strip().lower()
        user = User.objects.filter(email__iexact=email).first()
        if not user:
            self.stderr.write(self.style.ERROR(f"No user with email {email}"))
            return

        if user.is_superuser:
            user.role = User.Role.SUPER_ADMIN
        else:
            user.role = User.Role.ADMIN
        update_fields = ["role"]
        if options["django_admin"]:
            user.is_staff = True
            update_fields.append("is_staff")
        user.save(update_fields=update_fields)

        self.stdout.write(
            self.style.SUCCESS(
                f"{email} → role={user.role}, is_staff={user.is_staff}. "
                "Sign in at the public site /auth (not only Django /admin/)."
            )
        )
