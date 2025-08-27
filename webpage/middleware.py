import os
from django.conf import settings
from django.http import Http404
from django.utils.deprecation import MiddlewareMixin
from django.views.static import serve


class MediaFilesMiddleware(MiddlewareMixin):
    """
    Middleware para servir archivos de media como fallback
    """

    def process_request(self, request):
        # Solo actuar en producción y para URLs de media
        if not settings.DEBUG and request.path.startswith(settings.MEDIA_URL):
            # Extraer la ruta del archivo relativa al MEDIA_ROOT
            relative_path = request.path[len(settings.MEDIA_URL):]
            file_path = os.path.join(settings.MEDIA_ROOT, relative_path)

            # Si el archivo existe en el volumen persistente, servirlo
            if os.path.exists(file_path) and os.path.isfile(file_path):
                return serve(request, relative_path, document_root=settings.MEDIA_ROOT)

            # Si no existe en el volumen, intentar desde directorio local como fallback
            local_media_root = os.path.join(settings.BASE_DIR, 'media')
            local_file_path = os.path.join(local_media_root, relative_path)

            if os.path.exists(local_file_path) and os.path.isfile(local_file_path):
                return serve(request, relative_path, document_root=local_media_root)
            else:
                raise Http404("Media file not found")

        return None
