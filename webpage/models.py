from django.db import models
from django.core.files.uploadedfile import UploadedFile
from django.core.files.base import ContentFile
from django.conf import settings
from PIL import Image as PilImage
import os
import io

class Categoria(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre


class Subcategoria(models.Model):
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.categoria.nombre} - {self.nombre}"


def upload_to_categoria(instance, filename):

    categoria_nombre = instance.subcategoria.categoria.nombre.lower()
    return f"{categoria_nombre}/{filename}"


class FotosSubcategoria(models.Model):
    subcategoria = models.ForeignKey(Subcategoria, on_delete=models.CASCADE, verbose_name='subcategoria')
    imagen = models.ImageField(upload_to=upload_to_categoria, verbose_name="Imagen")
    descripcion = models.CharField(max_length=200, blank=True, null=True, verbose_name="Descripción de la imagen")
    orden = models.PositiveIntegerField(default=0, verbose_name="Orden",
                                         help_text="Orden de visualización (0 = primera)")
    fecha_subida = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de subida")

    class Meta:
        ordering = ['orden', 'fecha_subida']
        verbose_name = "Foto de Subcategoría"
        verbose_name_plural = "Fotos de Subcategorías"

    def __str__(self):
        return f"Foto {self.orden + 1} - {self.subcategoria.nombre}"


    def _process_image(self, image_field, target_width=1200, target_height=800, quality=85):
        """
        Procesa una imagen de evento: la redimensiona y la convierte a WebP.
        Soporta formatos HEIC si pillow-heif está instalado.
        """
        if not image_field:
            return None

        # Solo procesar si es un archivo recién subido
        if not isinstance(image_field.file, UploadedFile):
            return image_field

        try:
            # Verificar que el directorio de destino existe (importante para volumen persistente)
            categoria_nombre = self.subcategoria.categoria.nombre.lower()
            upload_path = categoria_nombre
            full_upload_path = os.path.join(settings.MEDIA_ROOT, upload_path)
            if not os.path.exists(full_upload_path):
                os.makedirs(full_upload_path, exist_ok=True)

            # Detectar formato HEIC por extensión del archivo
            original_filename = getattr(image_field, 'name', '')
            file_extension = os.path.splitext(original_filename.lower())[1]

            # Abrir la imagen, pillow-heif manejará automáticamente HEIC si está registrado
            img = PilImage.open(image_field)

            # Convertir a RGB si es necesario
            if img.mode in ('RGBA', 'P', 'CMYK', 'LAB'):
                img = img.convert('RGB')

            # Redimensionar manteniendo la relación de aspecto
            img.thumbnail((target_width, target_height), PilImage.Resampling.LANCZOS)

            # Guardar en formato WebP
            buffer = io.BytesIO()
            img.save(buffer, format='WEBP', quality=quality)
            buffer.seek(0)

            # Crear nuevo nombre de archivo
            original_filename = image_field.name
            base_name = os.path.splitext(os.path.basename(original_filename))[0]
            categoria_nombre = self.subcategoria.categoria.nombre.lower()
            webp_filename = f"{categoria_nombre}/{base_name}.webp"

            return ContentFile(buffer.getvalue(), name=webp_filename)

        except Exception as e:
            print(f"Error procesando imagen del evento {image_field.name}: {e}")
            if 'heic' in str(e).lower() or 'heif' in str(e).lower():
                print("Nota: Para soporte HEIC, instale: pip install pillow-heif")
            return image_field

    def save(self, *args, **kwargs):
        # Auto-llenar descripciones vacías con el nombre de la subcategoría
        if not self.descripcion and self.subcategoria:
            self.descripcion = self.subcategoria.nombre

        # Procesar la imagen si es nueva
        if self.imagen and self.imagen.name:
            processed_image = self._process_image(self.imagen)
            if processed_image:
                self.imagen = processed_image

        super().save(*args, **kwargs)

class Contacto(models.Model):
    nombre = models.CharField(max_length=100, verbose_name="Nombre")
    email = models.EmailField(verbose_name="Email")
    telefono = models.CharField(max_length=20, blank=True, null=True, verbose_name="Teléfono")
    categoria = models.CharField(max_length=100, blank=True, null=True, verbose_name="Categoría de interés")
    mensaje = models.TextField(verbose_name="Mensaje")
    fecha_contacto = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de contacto")
    email_enviado = models.BooleanField(default=False, verbose_name="Email enviado")

    class Meta:
        ordering = ['-fecha_contacto']
        verbose_name = "Contacto"
        verbose_name_plural = "Contactos"

    def __str__(self):
        return f"{self.nombre} - {self.fecha_contacto.strftime('%d/%m/%Y %H:%M')}"