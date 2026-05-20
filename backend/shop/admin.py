from django.contrib import admin

from shop.models import ShopProduct


@admin.register(ShopProduct)
class ShopProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "programme",
        "price_cents",
        "currency",
        "active",
        "display_order",
    )
    list_filter = ("category", "active", "programme")
    list_editable = ("display_order", "active")
    search_fields = ("name", "slug", "sku")
    prepopulated_fields = {"slug": ("name",)}
    raw_id_fields = ("programme",)
