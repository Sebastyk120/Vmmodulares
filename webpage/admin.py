from django.contrib import admin
from django.utils.html import format_html
from .models import Categoria, Subcategoria, FotosSubcategoria, Contacto


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'cantidad_subcategorias')
    search_fields = ('nombre',)
    ordering = ('nombre',)
    
    def cantidad_subcategorias(self, obj):
        count = obj.subcategoria_set.count()
        return f"{count} subcategoría{'s' if count != 1 else ''}"
    cantidad_subcategorias.short_description = 'Subcategorías'


class FotosSubcategoriaInline(admin.TabularInline):
    model = FotosSubcategoria
    extra = 1
    fields = ('imagen', 'descripcion', 'orden', 'vista_previa')
    readonly_fields = ('vista_previa', 'fecha_subida')
    ordering = ('orden',)
    
    def vista_previa(self, obj):
        if obj.imagen:
            return format_html(
                '<img src="{}" style="max-width: 100px; max-height: 100px; border-radius: 5px;"/>',
                obj.imagen.url
            )
        return "Sin imagen"
    vista_previa.short_description = 'Vista previa'


@admin.register(Subcategoria)
class SubcategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'categoria', 'cantidad_fotos', 'fecha_ultima_foto')
    list_filter = ('categoria',)
    search_fields = ('nombre', 'categoria__nombre')
    ordering = ('categoria__nombre', 'nombre')
    inlines = [FotosSubcategoriaInline]
    
    def cantidad_fotos(self, obj):
        count = obj.fotossubcategoria_set.count()
        return f"{count} foto{'s' if count != 1 else ''}"
    cantidad_fotos.short_description = 'Fotos'
    
    def fecha_ultima_foto(self, obj):
        ultima_foto = obj.fotossubcategoria_set.order_by('-fecha_subida').first()
        if ultima_foto:
            return ultima_foto.fecha_subida.strftime('%d/%m/%Y %H:%M')
        return "Sin fotos"
    fecha_ultima_foto.short_description = 'Última foto'


@admin.register(FotosSubcategoria)
class FotosSubcategoriaAdmin(admin.ModelAdmin):
    list_display = ('vista_previa_mini', 'subcategoria', 'descripcion', 'orden', 'fecha_subida')
    list_filter = ('subcategoria__categoria', 'subcategoria', 'fecha_subida')
    search_fields = ('descripcion', 'subcategoria__nombre', 'subcategoria__categoria__nombre')
    ordering = ('subcategoria__categoria__nombre', 'subcategoria__nombre', 'orden')
    fields = ('subcategoria', 'imagen', 'vista_previa', 'descripcion', 'orden')
    readonly_fields = ('vista_previa', 'fecha_subida')
    
    def vista_previa_mini(self, obj):
        if obj.imagen:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"/>',
                obj.imagen.url
            )
        return "Sin imagen"
    vista_previa_mini.short_description = 'Imagen'
    
    def vista_previa(self, obj):
        if obj.imagen:
            return format_html(
                '<img src="{}" style="max-width: 300px; max-height: 300px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"/>',
                obj.imagen.url
            )
        return "Sin imagen"
    vista_previa.short_description = 'Vista previa'
    
    def save_model(self, request, obj, form, change):
        # Auto-completar descripción si está vacía
        if not obj.descripcion and obj.subcategoria:
            obj.descripcion = obj.subcategoria.nombre
        super().save_model(request, obj, form, change)


@admin.register(Contacto)
class ContactoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'email', 'telefono', 'categoria', 'fecha_contacto', 'email_enviado')
    list_filter = ('categoria', 'fecha_contacto', 'email_enviado')
    search_fields = ('nombre', 'email', 'telefono', 'categoria', 'mensaje')
    ordering = ('-fecha_contacto',)
    readonly_fields = ('fecha_contacto', 'mensaje')
    fields = ('nombre', 'email', 'telefono', 'categoria', 'mensaje', 'fecha_contacto', 'email_enviado')

    def mensaje(self, obj):
        # Mostrar el mensaje con formato de texto largo
        return format_html('<pre style="white-space: pre-wrap; max-width: 600px;">{}</pre>', obj.mensaje)
    mensaje.short_description = 'Mensaje'

    def has_add_permission(self, request):
        # No permitir agregar contactos manualmente desde admin
        return False

    def has_delete_permission(self, request, obj=None):
        # Permitir eliminar contactos
        return True


# Personalización del admin site
admin.site.site_header = "Administración VM Modulares"
admin.site.site_title = "VM Modulares Admin"
admin.site.index_title = "Panel de Administración"
