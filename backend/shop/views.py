from rest_framework import permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from payments.stripe_service import create_checkout_for_shop_product
from shop.models import ShopProduct
from sports.models import Sport


class ShopProductSerializer(serializers.ModelSerializer):
    programme_name = serializers.SerializerMethodField()
    programme_slug = serializers.SerializerMethodField()

    class Meta:
        model = ShopProduct
        fields = (
            "id",
            "category",
            "programme",
            "programme_name",
            "programme_slug",
            "name",
            "slug",
            "short_description",
            "description",
            "image_url",
            "sku",
            "price_cents",
            "currency",
        )

    def get_programme_name(self, obj):
        return obj.programme.name if obj.programme_id else None

    def get_programme_slug(self, obj):
        return obj.programme.slug if obj.programme_id else None


class ShopProductListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        qs = ShopProduct.objects.filter(active=True).select_related("programme")

        category = request.query_params.get("category")
        if not category or category not in Sport.Category.values:
            return Response(
                {"detail": "Query param category is required (sports, music, tutoring)."},
                status=400,
            )
        qs = qs.filter(category=category)

        programme_slug = request.query_params.get("programme_slug")
        subcategory = request.query_params.get("subcategory")
        if programme_slug:
            qs = qs.filter(programme__slug=programme_slug)
        elif subcategory:
            qs = qs.filter(programme__subcategory__slug=subcategory)
        else:
            qs = qs.filter(programme__isnull=True)

        ser = ShopProductSerializer(qs.order_by("display_order", "name"), many=True)
        return Response({"results": ser.data})


class ShopCheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity") or 1)
        if quantity < 1 or quantity > 20:
            return Response({"detail": "Invalid quantity."}, status=400)

        try:
            product = ShopProduct.objects.get(pk=product_id, active=True)
        except ShopProduct.DoesNotExist:
            return Response({"detail": "Product not found."}, status=404)

        parent = getattr(request.user, "parent_profile", None)
        if parent is None:
            return Response(
                {"detail": "Parent profile required to purchase."},
                status=403,
            )

        try:
            _payment, url = create_checkout_for_shop_product(
                parent=parent,
                product=product,
                quantity=quantity,
            )
        except RuntimeError as exc:
            return Response({"detail": str(exc)}, status=503)

        return Response({"checkout_url": url})
