from django.urls import path

from shop.views import ShopCheckoutView, ShopProductListView

urlpatterns = [
    path("products/", ShopProductListView.as_view()),
    path("checkout/", ShopCheckoutView.as_view()),
]
