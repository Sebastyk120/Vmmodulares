from django.apps import AppConfig
import os
from django.conf import settings


def ensure_media_directories():
    """
    Asegura que todos los subdirectorios necesarios para archivos de medios existan.
    Debe llamarse durante la inicialización de la aplicación.
    """
    # Verificar si estamos en Railway con volumen persistente
    if not settings.DEBUG:
        if os.path.exists('/media'):
            if os.path.ismount('/media'):
                print("✓ Usando volumen persistente de Railway: /media")
            else:
                print("⚠ Directorio /media existe pero no está montado como volumen")
        else:
            print("⚠ Directorio /media no existe")

    print(f"MEDIA_ROOT configurado como: {settings.MEDIA_ROOT}")

    # Asegurar que MEDIA_ROOT existe
    if not os.path.exists(settings.MEDIA_ROOT):
        try:
            os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
            print(f"✓ Directorio raíz de media creado: {settings.MEDIA_ROOT}")
        except PermissionError:
            print(f"❌ Error: No se pudo crear {settings.MEDIA_ROOT}. Verificar permisos del volumen.")
            return
        except Exception as e:
            print(f"❌ Error inesperado creando {settings.MEDIA_ROOT}: {e}")
            return
    else:
        print(f"✓ Directorio raíz de media ya existe: {settings.MEDIA_ROOT}")

    directories = [
        'empresa',
        'hogar',
    ]

    for directory in directories:
        directory_path = os.path.join(settings.MEDIA_ROOT, directory)
        if not os.path.exists(directory_path):
            try:
                os.makedirs(directory_path, exist_ok=True)
                print(f"✓ Directorio creado: {directory_path}")
            except PermissionError:
                print(f"❌ Error: No se pudo crear {directory_path}. Verificar permisos.")
            except Exception as e:
                print(f"❌ Error inesperado creando {directory_path}: {e}")
        else:
            print(f"✓ Directorio ya existe: {directory_path}")


class WebpageConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'webpage'

    def ready(self):
        # Solo crear directorios si no estamos en migraciones
        import sys
        if 'migrate' not in sys.argv and 'makemigrations' not in sys.argv:
            ensure_media_directories()

