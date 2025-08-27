#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Vmmodulares.settings')
django.setup()

from webpage.models import Categoria, Subcategoria, FotosSubcategoria

print('=== Estado de la Base de Datos ===')
print(f'Categorías: {Categoria.objects.count()}')
print(f'Subcategorías: {Subcategoria.objects.count()}')
print(f'Fotos: {FotosSubcategoria.objects.count()}')

if Subcategoria.objects.exists():
    primera_sub = Subcategoria.objects.first()
    print(f'Primera subcategoría ID: {primera_sub.id}')
    print(f'Primera subcategoría nombre: {primera_sub.nombre}')
    
    # Verificar fotos de la primera subcategoría
    fotos_primera = FotosSubcategoria.objects.filter(subcategoria=primera_sub)
    print(f'Fotos de la primera subcategoría: {fotos_primera.count()}')
else:
    print('No hay subcategorías en la base de datos')

print('\n=== Creando datos de prueba si no existen ===')

# Crear datos de prueba si no existen
if not Categoria.objects.exists():
    categoria = Categoria.objects.create(
        nombre='Muebles de Oficina',
        descripcion='Mobiliario para espacios de trabajo'
    )
    print(f'Categoría creada: {categoria.nombre}')
    
    subcategoria = Subcategoria.objects.create(
        categoria=categoria,
        nombre='Escritorios Modulares',
        descripcion='Escritorios adaptables para cualquier espacio'
    )
    print(f'Subcategoría creada: {subcategoria.nombre}')
    
    print('Datos de prueba creados exitosamente')
else:
    print('Ya existen datos en la base de datos')