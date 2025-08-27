from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.mail import send_mail
from django.conf import settings
from .models import Categoria, Subcategoria, FotosSubcategoria
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url
from captcha.fields import CaptchaField
import json


# Create your views here.

def robots_txt(request):
    """Vista para generar robots.txt dinámicamente"""
    lines = [
        "User-Agent: *",
        "Allow: /",
        "",
        "# Sitemap",
        f"Sitemap: {request.build_absolute_uri('/sitemap.xml')}",
        "",
        "# Disallow admin and private areas",
        "Disallow: /admin/",
        "Disallow: /captcha/",
        "",
        "# Allow all static files",
        "Allow: /static/",
        "Allow: /media/",
        "",
        "# Crawl delay (optional)",
        "Crawl-delay: 1",
    ]
    return HttpResponse('\n'.join(lines), content_type="text/plain")


def home(request):
    """Vista principal de la landing page"""
    # Obtener categorías con sus subcategorías
    categorias = Categoria.objects.prefetch_related('subcategoria_set').all()
    
    # Organizar categorías por tipo
    hogar_categoria = categorias.filter(nombre__iexact='HOGAR').first()
    empresa_categoria = categorias.filter(nombre__iexact='EMPRESA').first()
    
    # Obtener fotos destacadas para cada subcategoría
    fotos_destacadas = {}
    for categoria in categorias:
        for subcategoria in categoria.subcategoria_set.all():
            foto = FotosSubcategoria.objects.filter(
                subcategoria=subcategoria
            ).order_by('orden', 'fecha_subida').first()
            if foto:
                fotos_destacadas[subcategoria.id] = foto
    
    # Generar nuevo captcha para el formulario
    captcha_key = CaptchaStore.generate_key()
    captcha_image = captcha_image_url(captcha_key)
    
    context = {
        'categorias': categorias,
        'hogar_categoria': hogar_categoria,
        'empresa_categoria': empresa_categoria,
        'fotos_destacadas': fotos_destacadas,
        'captcha_key': captcha_key,
        'captcha_image': captcha_image,
        'page_title': 'VM Modulares - Muebles para Hogar y Empresa',
        'meta_description': 'VM Modulares: Fabricación, venta y distribución de muebles modulares para hogar y empresa. Cocinas, baños, dormitorios, oficinas y más.',
        'meta_keywords': 'muebles modulares, cocinas, baños, dormitorios, oficinas, escritorios, sillas, archivadores, VM Modulares'
    }
    
    return render(request, 'home.html', context)


@csrf_exempt
@require_http_methods(["POST"])
def contacto(request):
    """Vista para manejar el formulario de contacto"""
    try:
        # Obtener datos del formulario
        nombre = request.POST.get('nombre', '').strip()
        email = request.POST.get('email', '').strip()
        telefono = request.POST.get('telefono', '').strip()
        categoria = request.POST.get('categoria', '').strip()
        mensaje = request.POST.get('mensaje', '').strip()
        captcha_key = request.POST.get('captcha_0', '').strip()
        captcha_value = request.POST.get('captcha_1', '').strip()
        
        # Validaciones básicas
        if not all([nombre, email, mensaje]):
            return JsonResponse({
                'success': False,
                'message': 'Los campos nombre, email y mensaje son requeridos'
            }, status=400)
        
        # Validar captcha
        if not captcha_key or not captcha_value:
            return JsonResponse({
                'success': False,
                'message': 'El captcha es requerido'
            }, status=400)
        
        try:
            captcha_store = CaptchaStore.objects.get(hashkey=captcha_key)
            if captcha_store.response.lower() != captcha_value.lower():
                return JsonResponse({
                    'success': False,
                    'message': 'El captcha es incorrecto'
                }, status=400)
            # Eliminar el captcha usado
            captcha_store.delete()
        except CaptchaStore.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'El captcha ha expirado o es inválido'
            }, status=400)
        
        # Validar email
        import re
        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, email):
            return JsonResponse({
                'success': False,
                'message': 'Email inválido'
            }, status=400)
        
        # Preparar el mensaje de email
        asunto = f'Nuevo contacto desde VM Modulares - {nombre}'
        mensaje_email = f"""
        Nuevo mensaje de contacto desde la página web:
        
        Nombre: {nombre}
        Email: {email}
        Teléfono: {telefono}
        Categoría de interés: {categoria}
        
        Mensaje:
        {mensaje}
        
        ---
        Este mensaje fue enviado desde el formulario de contacto de VM Modulares.
        """
        
        # Enviar email (configurar en settings.py)
        try:
            send_mail(
                asunto,
                mensaje_email,
                settings.DEFAULT_FROM_EMAIL,
                [settings.DEFAULT_FROM_EMAIL],  # Email al que envio el correo, validar con andres.
                fail_silently=False,
            )
        except Exception as e:
            print(f"Error enviando email: {e}")
            # No fallar si el email no se puede enviar
        
        return JsonResponse({
            'success': True,
            'message': '¡Gracias por contactarnos! Te responderemos pronto.'
        })
        
    except Exception as e:
        print(f"Error en formulario de contacto: {e}")
        return JsonResponse({
            'success': False,
            'message': 'Hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.'
        }, status=500)


@require_http_methods(["GET"])
def get_subcategoria_fotos(request, subcategoria_id):
    """Vista API para obtener las fotos de una subcategoría específica"""
    try:
        subcategoria = Subcategoria.objects.get(id=subcategoria_id)
        fotos = FotosSubcategoria.objects.filter(
            subcategoria=subcategoria
        ).order_by('orden', 'fecha_subida')
        
        fotos_data = []
        for foto in fotos:
            fotos_data.append({
                'id': foto.id,
                'imagen_url': foto.imagen.url if foto.imagen else '',
                'descripcion': foto.descripcion or '',
                'orden': foto.orden
            })
        
        return JsonResponse({
            'success': True,
            'subcategoria': {
                'id': subcategoria.id,
                'nombre': subcategoria.nombre,
                'categoria': subcategoria.categoria.nombre
            },
            'fotos': fotos_data
        })
        
    except Subcategoria.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': 'Subcategoría no encontrada'
        }, status=404)
    except Exception as e:
        print(f"Error obteniendo fotos de subcategoría: {e}")
        return JsonResponse({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=500)