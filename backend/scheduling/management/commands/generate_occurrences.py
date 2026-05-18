from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from scheduling.models import ClassOccurrence, ClassScheduleRule


class Command(BaseCommand):
    help = "Generate ClassOccurrence rows from active ClassScheduleRule definitions."

    def add_arguments(self, parser):
        parser.add_argument("--weeks", type=int, default=8)

    def handle(self, *args, **options):
        weeks = options["weeks"]
        tz = ZoneInfo(settings.TIME_ZONE)
        today = timezone.localdate()
        horizon = today + timedelta(weeks=weeks)

        created = 0
        rules = ClassScheduleRule.objects.filter(active=True).select_related(
            "activity_class",
            "venue",
            "coach",
        )

        for rule in rules:
            start_scan = max(today, rule.recurrence_start_date)
            end_scan = horizon
            if rule.recurrence_end_date:
                end_scan = min(end_scan, rule.recurrence_end_date)

            if start_scan > end_scan:
                continue

            d = start_scan
            while d <= end_scan:
                if d.weekday() == rule.weekday:
                    start_dt = datetime.combine(d, rule.start_time, tzinfo=tz)
                    end_dt = datetime.combine(d, rule.end_time, tzinfo=tz)
                    if end_dt <= start_dt:
                        end_dt += timedelta(days=1)

                    capacity = rule.capacity_override or rule.activity_class.default_capacity
                    price_cents = rule.activity_class.default_price_cents
                    currency = rule.activity_class.currency

                    exists = ClassOccurrence.objects.filter(
                        schedule_rule=rule,
                        starts_at=start_dt,
                    ).exists()
                    if not exists:
                        ClassOccurrence.objects.create(
                            schedule_rule=rule,
                            activity_class=rule.activity_class,
                            venue=rule.venue,
                            coach=rule.coach,
                            starts_at=start_dt,
                            ends_at=end_dt,
                            capacity=capacity,
                            price_cents=price_cents,
                            currency=currency,
                        )
                        created += 1

                d += timedelta(days=1)

        self.stdout.write(self.style.SUCCESS(f"Generated {created} new occurrence(s)."))
