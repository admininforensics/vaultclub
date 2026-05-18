from datetime import date, time

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import ParentProfile
from children.models import Child
from scheduling.models import ClassScheduleRule
from sports.models import ActivityClass, Coach, Sport, Venue

User = get_user_model()


class Command(BaseCommand):
    help = "Load minimal demo data for local development."

    def handle(self, *args, **options):
        if Sport.objects.exists():
            self.stdout.write(self.style.WARNING("Demo data already present; skipping."))
            return

        sport = Sport.objects.create(
            name="Karate",
            slug="karate",
            short_description="Beginner-friendly karate fundamentals.",
            long_description="Vault Club Karate builds confidence, discipline and coordination.",
            min_age=6,
            max_age=12,
            display_order=1,
        )
        venue = Venue.objects.create(
            name="Main Studio",
            address="1 Example Road, Cape Town",
            room_or_court="Studio A",
        )

        coach_user = User.objects.create_user(
            email="coach@vaultclub.local",
            password="coachpass123",
            first_name="Sam",
            last_name="Coach",
            role=User.Role.COACH,
        )
        coach = Coach.objects.create(user=coach_user, bio="Black belt instructor.")

        activity = ActivityClass.objects.create(
            sport=sport,
            title="Beginner Karate Ages 7–10",
            description="Stances, basic strikes and safe partner work.",
            min_age=7,
            max_age=10,
            default_capacity=12,
            default_duration_minutes=60,
            skill_level=ActivityClass.SkillLevel.BEGINNER,
            default_price_cents=15000,
            currency="ZAR",
        )

        today = timezone.localdate()
        ClassScheduleRule.objects.create(
            activity_class=activity,
            venue=venue,
            coach=coach,
            weekday=ClassScheduleRule.Weekday.WEDNESDAY,
            start_time=time(15, 0),
            end_time=time(16, 0),
            recurrence_start_date=today,
            recurrence_end_date=None,
            active=True,
        )

        from django.core.management import call_command

        call_command("generate_occurrences", weeks=8)

        parent_user = User.objects.create_user(
            email="parent@vaultclub.local",
            password="parentpass123",
            first_name="Jane",
            last_name="Parent",
            role=User.Role.PARENT,
        )
        profile = ParentProfile.objects.create(
            user=parent_user,
            whatsapp_number="+27820000000",
        )
        Child.objects.create(
            parent=profile,
            first_name="Alex",
            last_name="Parent",
            date_of_birth=date(2016, 3, 15),
        )

        self.stdout.write(self.style.SUCCESS("Demo data created."))
        self.stdout.write("  Coach: coach@vaultclub.local / coachpass123")
        self.stdout.write("  Parent: parent@vaultclub.local / parentpass123")
