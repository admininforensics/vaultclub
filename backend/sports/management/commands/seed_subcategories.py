from django.core.management.base import BaseCommand

from sports.models import ProgramCategory, ProgramSubcategory, Sport

SUBCATEGORIES = [
    (ProgramCategory.SPORTS, "Karate", "karate", 0),
    (ProgramCategory.SPORTS, "Rugby", "rugby", 1),
    (ProgramCategory.SPORTS, "Tennis", "tennis", 2),
    (ProgramCategory.SPORTS, "Cricket", "cricket", 3),
    (ProgramCategory.SPORTS, "Hockey", "hockey", 4),
    (ProgramCategory.SPORTS, "Track", "track", 5),
    (ProgramCategory.MUSIC, "Piano", "piano", 10),
    (ProgramCategory.MUSIC, "Guitar", "guitar", 11),
    (ProgramCategory.MUSIC, "Singing", "singing", 12),
    (ProgramCategory.MUSIC, "Drums", "drums", 13),
    (ProgramCategory.MUSIC, "Bass", "bass", 14),
    (ProgramCategory.MUSIC, "Flute", "flute", 15),
    (ProgramCategory.TUTORING, "Math", "math", 20),
    (ProgramCategory.TUTORING, "English", "english", 21),
    (ProgramCategory.TUTORING, "Afrikaans", "afrikaans", 22),
    (ProgramCategory.TUTORING, "Science", "science", 23),
]

# Existing programme slugs mapped to subcategory slugs.
PROGRAMME_SUBCATEGORY_MAP = {
    "karate": "karate",
    "piano": "piano",
    "guitar": "guitar",
    "mathematics": "math",
    "english": "english",
}


class Command(BaseCommand):
    help = "Seed programme subcategories and link existing programmes (idempotent)."

    def handle(self, *args, **options):
        created = 0
        linked = 0

        for category, name, slug, display_order in SUBCATEGORIES:
            _, was_created = ProgramSubcategory.objects.get_or_create(
                category=category,
                slug=slug,
                defaults={
                    "name": name,
                    "display_order": display_order,
                    "active": True,
                },
            )
            if was_created:
                created += 1

        for programme_slug, subcategory_slug in PROGRAMME_SUBCATEGORY_MAP.items():
            sport = Sport.objects.filter(slug=programme_slug).first()
            if not sport:
                continue
            subcategory = ProgramSubcategory.objects.filter(
                category=sport.category,
                slug=subcategory_slug,
            ).first()
            if subcategory and sport.subcategory_id != subcategory.id:
                sport.subcategory = subcategory
                sport.save(update_fields=["subcategory"])
                linked += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Subcategories ready (+{created} new, {linked} programmes linked)."
            )
        )
