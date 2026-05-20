from django.contrib import admin

from payments.models import CreditLedgerEntry, PackageProduct, Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "parent", "amount", "currency", "status", "created_at")
    list_filter = ("status", "provider")
    search_fields = ("provider_checkout_session_id", "parent__user__email")
    date_hierarchy = "created_at"


@admin.register(PackageProduct)
class PackageProductAdmin(admin.ModelAdmin):
    list_display = ("name", "number_of_credits", "price_amount", "active")


@admin.register(CreditLedgerEntry)
class CreditLedgerEntryAdmin(admin.ModelAdmin):
    list_display = ("parent", "entry_type", "credit_delta", "balance_after", "created_at")
