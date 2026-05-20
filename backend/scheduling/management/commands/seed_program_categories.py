from datetime import date, time

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.utils import timezone

from scheduling.models import ClassScheduleRule
from sports.models import ActivityClass, Coach, ProgramSubcategory, Sport, Venue

User = get_user_model()


class Command(BaseCommand):
    help = "Add music and tutoring demo programmes (idempotent; safe after seed_demo)."

    def handle(self, *args, **options):
        venue, _ = Venue.objects.get_or_create(
            name="Main Studio",
            defaults={
                "address": "1 Example Road, Cape Town",
                "room_or_court": "Studio A",
            },
        )
        music_room, _ = Venue.objects.get_or_create(
            name="Music Room",
            defaults={
                "address": "1 Example Road, Cape Town",
                "room_or_court": "Room B",
            },
        )
        study_room, _ = Venue.objects.get_or_create(
            name="Study Hub",
            defaults={
                "address": "1 Example Road, Cape Town",
                "room_or_court": "Room C",
            },
        )

        coach = Coach.objects.filter(active=True).select_related("user").first()
        if not coach:
            coach_user = User.objects.create_user(
                email="coach@vaultclub.local",
                password="coachpass123",
                first_name="Sam",
                last_name="Coach",
                role=User.Role.COACH,
            )
            coach = Coach.objects.create(user=coach_user, bio="Multi-discipline instructor.")

        today = timezone.localdate()
        created_programs = 0
        created_rules = 0

        specs = [
            {
                "category": Sport.Category.MUSIC,
                "name": "Piano",
                "slug": "piano",
                "short_description": "One-to-one and small-group piano lessons.",
                "long_description": "Classical and contemporary piano for beginners through intermediate.",
                "min_age": 6,
                "max_age": 16,
                "display_order": 10,
                "venue": music_room,
                "weekday": ClassScheduleRule.Weekday.TUESDAY,
                "start": time(16, 0),
                "end": time(17, 0),
                "class_title": "Piano — Beginner (ages 7–12)",
                "class_desc": "Note reading, technique and simple pieces.",
                "capacity": 4,
                "price_cents": 22000,
            },
            {
                "category": Sport.Category.MUSIC,
                "name": "Guitar",
                "slug": "guitar",
                "short_description": "Acoustic guitar fundamentals and rhythm.",
                "long_description": "Chords, strumming and ear training in a relaxed group setting.",
                "min_age": 8,
                "max_age": 14,
                "display_order": 11,
                "venue": music_room,
                "weekday": ClassScheduleRule.Weekday.THURSDAY,
                "start": time(17, 0),
                "end": time(18, 0),
                "class_title": "Guitar — Starter group",
                "class_desc": "Open chords and songs kids love.",
                "capacity": 6,
                "price_cents": 18000,
            },
            {
                "category": Sport.Category.TUTORING,
                "name": "Mathematics",
                "slug": "mathematics",
                "subcategory_slug": "math",
                "short_description": "Primary and early high-school maths support.",
                "long_description": "Homework help, exam prep and confidence-building problem solving.",
                "min_age": 9,
                "max_age": 15,
                "display_order": 20,
                "venue": study_room,
                "weekday": ClassScheduleRule.Weekday.MONDAY,
                "start": time(15, 30),
                "end": time(16, 30),
                "class_title": "Maths tutoring — Grades 4–7",
                "class_desc": "Small-group sessions aligned to school curriculum.",
                "capacity": 8,
                "price_cents": 16000,
            },
            {
                "category": Sport.Category.TUTORING,
                "name": "English",
                "slug": "english",
                "short_description": "Reading, writing and comprehension coaching.",
                "long_description": "Essay structure, literacy skills and exam techniques.",
                "min_age": 10,
                "max_age": 16,
                "display_order": 21,
                "venue": study_room,
                "weekday": ClassScheduleRule.Weekday.FRIDAY,
                "start": time(15, 0),
                "end": time(16, 0),
                "class_title": "English tutoring — Grades 6–9",
                "class_desc": "Focused literacy and assignment support.",
                "capacity": 8,
                "price_cents": 16000,
            },
        ]

        for spec in specs:
            subcategory = ProgramSubcategory.objects.filter(
                category=spec["category"],
                slug=spec.get("subcategory_slug", spec["slug"]),
            ).first()

            sport, created = Sport.objects.get_or_create(
                slug=spec["slug"],
                defaults={
                    "category": spec["category"],
                    "subcategory": subcategory,
                    "name": spec["name"],
                    "short_description": spec["short_description"],
                    "long_description": spec["long_description"],
                    "min_age": spec["min_age"],
                    "max_age": spec["max_age"],
                    "display_order": spec["display_order"],
                    "active": True,
                },
            )
            if created:
                created_programs += 1
            else:
                updates = []
                if sport.category != spec["category"]:
                    sport.category = spec["category"]
                    updates.append("category")
                if subcategory and sport.subcategory_id != subcategory.id:
                    sport.subcategory = subcategory
                    updates.append("subcategory")
                if updates:
                    sport.save(update_fields=updates)

            activity, _ = ActivityClass.objects.get_or_create(
                sport=sport,
                title=spec["class_title"],
                defaults={
                    "description": spec["class_desc"],
                    "min_age": spec["min_age"],
                    "max_age": spec["max_age"],
                    "default_capacity": spec["capacity"],
                    "default_duration_minutes": 60,
                    "skill_level": ActivityClass.SkillLevel.BEGINNER,
                    "default_price_cents": spec["price_cents"],
                    "currency": "ZAR",
                    "active": True,
                },
            )

            rule_exists = ClassScheduleRule.objects.filter(
                activity_class=activity,
                weekday=spec["weekday"],
                start_time=spec["start"],
            ).exists()
            if not rule_exists:
                ClassScheduleRule.objects.create(
                    activity_class=activity,
                    venue=spec["venue"],
                    coach=coach,
                    weekday=spec["weekday"],
                    start_time=spec["start"],
                    end_time=spec["end"],
                    recurrence_start_date=today,
                    recurrence_end_date=None,
                    active=True,
                )
                created_rules += 1

        if created_rules:
            call_command("generate_occurrences", weeks=8)

        self.stdout.write(
            self.style.SUCCESS(
                f"Programmes ready (+{created_programs} new, +{created_rules} schedule rules)."
            )
        )
