from .models import Categoria, Subcategoria
from django.utils import timezone


def global_context(request):
    """
    Context processor que añade variables globales a todos los templates
    """
    # Obtener todas las categorías para el navbar dropdown
    categorias_nav = Categoria.objects.prefetch_related('subcategoria_set').all()
    
    # Obtener subcategorías destacadas para navegación rápida
    subcategorias_destacadas = Subcategoria.objects.select_related('categoria').all()[:8]

    return {
        'categorias_nav': categorias_nav,
        'subcategorias_destacadas': subcategorias_destacadas,
        'current_year': timezone.now().year,
    }


def seo_context(request):
    """
    Context processor para SEO que añade variables útiles para metadatos
    """
    site_name = "VM Modulares"
    default_description = "VM Modulares - Fabricación de muebles modulares y divisiones para el hogar y la empresa. Soluciones personalizadas en diseño y funcionalidad."
    
    # Keywords relevantes para SEO
    meta_keywords = "muebles modulares, divisiones, hogar, empresa, oficina, diseño personalizado, fabricación, Colombia"

    return {
        'site_name': site_name,
        'default_description': default_description,
        'meta_keywords': meta_keywords,
        'canonical_base_url': f"{request.scheme}://{request.get_host()}",
        'company_info': {
            'name': 'VM Modulares',
            'business_type': 'Fabricación de Muebles Modulares',
            'specialties': ['Hogar', 'Empresa', 'Oficina', 'Divisiones'],
        }
    }
