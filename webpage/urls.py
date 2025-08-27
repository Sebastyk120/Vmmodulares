from django.urls import path
from . import views

app_name = 'webpage'

urlpatterns = [
    path('', views.home, name='home'),
    path('contacto/', views.contacto, name='contacto'),
    # API URLs
    path('api/subcategoria/<int:subcategoria_id>/fotos/', views.get_subcategoria_fotos, name='subcategoria_fotos'),
    # SEO URLs
    path('robots.txt', views.robots_txt, name='robots_txt'),
]