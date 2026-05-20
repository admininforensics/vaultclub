from django.core.management.base import BaseCommand

from shop.models import ShopProduct
from sports.models import Sport


class Command(BaseCommand):
    help = "Seed demo shop products per category and programme (idempotent)."

    def handle(self, *args, **options):
        created = 0

        category_items = [
            (
                Sport.Category.SPORTS,
                "vault-club-sports-tshirt",
                "Vault Club sports T-shirt",
                "Breathable tee with club logo — all sports.",
                35000,
            ),
            (
                Sport.Category.SPORTS,
                "sports-water-bottle",
                "Sports water bottle",
                "750ml BPA-free bottle.",
                12000,
            ),
            (
                Sport.Category.MUSIC,
                "music-lesson-notebook",
                "Music lesson notebook",
                "Manuscript and lined pages for practice notes.",
                8500,
            ),
            (
                Sport.Category.MUSIC,
                "guitar-picks-pack",
                "Guitar picks (pack of 5)",
                "Assorted thickness for beginners.",
                4500,
            ),
            (
                Sport.Category.TUTORING,
                "study-planner",
                "Study planner",
                "Term planner for homework and tests.",
                9500,
            ),
            (
                Sport.Category.TUTORING,
                "revision-cards",
                "Revision flash cards",
                "Blank index cards for key facts.",
                5500,
            ),
        ]

        for category, slug, name, short, price in category_items:
            _, was_created = ShopProduct.objects.get_or_create(
                slug=slug,
                defaults={
                    "category": category,
                    "programme": None,
                    "name": name,
                    "short_description": short,
                    "price_cents": price,
                    "currency": "ZAR",
                    "active": True,
                },
            )
            if was_created:
                created += 1

        programme_items = [
            ("karate", "karate-gi-youth", "Youth karate gi", "Lightweight uniform sizes 120–140.", 89000),
            ("karate", "karate-belt-white", "White karate belt", "Standard length youth belt.", 15000),
            ("piano", "piano-book-level-1", "Piano method book — Level 1", "Recommended tutor book.", 28000),
            ("piano", "piano-metronome", "Digital metronome", "Compact metronome for home practice.", 32000),
            ("guitar", "guitar-capo", "Guitar capo", "Steel-string capo.", 18000),
            ("guitar", "guitar-strings", "Guitar string set", "Nylon strings for learner guitars.", 14000),
            ("mathematics", "maths-formula-sheet", "Maths formula sheet", "Laminated Grades 4–7 reference.", 7500),
            ("english", "english-essay-guide", "Essay writing guide", "Step-by-step guide for school essays.", 11000),
        ]

        for prog_slug, slug, name, short, price in programme_items:
            programme = Sport.objects.filter(slug=prog_slug).first()
            if not programme:
                continue
            _, was_created = ShopProduct.objects.get_or_create(
                slug=slug,
                defaults={
                    "category": programme.category,
                    "programme": programme,
                    "name": name,
                    "short_description": short,
                    "price_cents": price,
                    "currency": "ZAR",
                    "active": True,
                },
            )
            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(f"Shop products ready (+{created} new)."))
