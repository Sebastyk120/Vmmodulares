from django import template

register = template.Library()

@register.filter
def get_item(dictionary, key):
    """
    Filtro personalizado para obtener un elemento de un diccionario usando una clave.
    Uso en template: {{ diccionario|get_item:clave }}
    """
    if dictionary is None:
        return None
    
    try:
        return dictionary.get(key)
    except (AttributeError, TypeError):
        return None

@register.filter
def get_attr(obj, attr_name):
    """
    Filtro personalizado para obtener un atributo de un objeto dinámicamente.
    Uso en template: {{ objeto|get_attr:"nombre_atributo" }}
    """
    try:
        return getattr(obj, attr_name, None)
    except (AttributeError, TypeError):
        return None