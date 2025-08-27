from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from .models import Categoria, Subcategoria


class StaticViewSitemap(Sitemap):
    """Sitemap para páginas estáticas"""
    priority = 0.5
    changefreq = 'daily'

    def items(self):
        return ['webpage:home']  # Ajustar según las URLs que tengas

    def location(self, item):
        return reverse(item)


class CategoriaSitemap(Sitemap):
    """Sitemap para categorías"""
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return Categoria.objects.all()

    def lastmod(self, obj):
        # Si tienes un campo de fecha de modificación, úsalo aquí
        return None

    def location(self, obj):
        # Ajustar según tu estructura de URLs
        return f'/categoria/{obj.id}/'


class SubcategoriaSitemap(Sitemap):
    """Sitemap para subcategorías"""
    changefreq = "weekly"
    priority = 0.7

    def items(self):
        return Subcategoria.objects.all()

    def lastmod(self, obj):
        # Si tienes un campo de fecha de modificación, úsalo aquí
        return None

    def location(self, obj):
        # Ajustar según tu estructura de URLs
        return f'/subcategoria/{obj.id}/'


# Diccionario de sitemaps
sitemaps = {
    'static': StaticViewSitemap,
    'categorias': CategoriaSitemap,
    'subcategorias': SubcategoriaSitemap,
}