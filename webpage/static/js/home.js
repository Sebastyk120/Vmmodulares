/**
 * VM Modulares - Landing Page JavaScript
 * Funcionalidad para interactividad, animaciones y formulario de contacto
 */

// ===== CONFIGURACIÓN GLOBAL =====
const CONFIG = {
    whatsapp: {
        number: '573107598740',
        message: 'Hola, me interesa conocer más sobre sus muebles modulares'
    },
    animations: {
        duration: 300,
        easing: 'ease-in-out'
    },
    form: {
        submitUrl: '/contacto/',
        successMessage: '¡Gracias por contactarnos! Te responderemos pronto.',
        errorMessage: 'Hubo un error al enviar tu mensaje. Por favor, intenta nuevamente.'
    }
};

// ===== UTILIDADES =====
class Utils {
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    static smoothScrollTo(target, duration = 1000) {
        const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
        if (!targetElement) return;

        const targetPosition = targetElement.offsetTop - 80; // Offset para header fijo
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    }
}

// ===== NAVEGACIÓN =====
class Navigation {
    constructor() {
        this.header = document.querySelector('.header');
        this.navToggle = document.querySelector('.mobile-nav-toggle');
        this.navMenu = document.querySelector('.nav-links');
        this.navLinks = document.querySelectorAll('.nav-links a');
        this.dropdowns = document.querySelectorAll('.dropdown');
        
        this.init();
    }

    init() {
        this.setupScrollEffect();
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupDropdowns();
        this.setupActiveSection();
    }

    setupScrollEffect() {
        const handleScroll = Utils.throttle(() => {
            if (window.scrollY > 100) {
                this.header.style.background = 'rgba(255, 255, 255, 0.98)';
                this.header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            } else {
                this.header.style.background = 'rgba(255, 255, 255, 0.95)';
                this.header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            }
        }, 10);

        window.addEventListener('scroll', handleScroll);
    }

    setupMobileMenu() {
        if (!this.navToggle || !this.navMenu) return;

        // Variables para controlar el estado del menú
        this.isMenuOpen = false;
        this.isMobile = window.innerWidth <= 768;

        // Toggle del menú móvil
        this.navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMobileMenu();
        });

        // Manejo de enlaces en móvil
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Si es un enlace de dropdown en móvil, manejar diferente
                if (this.isMobile && link.closest('.dropdown')) {
                    e.preventDefault();
                    this.toggleMobileDropdown(link.closest('.dropdown'));
                } else if (link.getAttribute('href')?.startsWith('#')) {
                    // Cerrar menú solo para enlaces de navegación
                    this.closeMobileMenu();
                }
            });
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !this.navMenu.contains(e.target) && !this.navToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Cerrar menú con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Manejar cambios de tamaño de ventana
        window.addEventListener('resize', Utils.debounce(() => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;
            
            if (wasMobile && !this.isMobile) {
                // Cambió de móvil a desktop
                this.closeMobileMenu();
                this.resetDropdowns();
            }
        }, 250));
    }

    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        this.navMenu.classList.toggle('mobile-active', this.isMenuOpen);
        this.navToggle.classList.toggle('active', this.isMenuOpen);
        
        // Cambiar icono del botón con animación
        const icon = this.navToggle.querySelector('i');
        icon.style.transform = 'rotate(180deg)';
        
        setTimeout(() => {
            icon.className = this.isMenuOpen ? 'fas fa-times' : 'fas fa-bars';
            icon.style.transform = 'rotate(0deg)';
        }, 150);

        // Prevenir scroll del body cuando el menú está abierto
        document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';

        // Agregar clase al header para estilos adicionales
        this.header.classList.toggle('menu-open', this.isMenuOpen);
    }

    closeMobileMenu() {
        if (!this.isMenuOpen) return;
        
        this.isMenuOpen = false;
        this.navMenu.classList.remove('mobile-active');
        this.navToggle.classList.remove('active');
        this.header.classList.remove('menu-open');
        
        const icon = this.navToggle.querySelector('i');
        icon.className = 'fas fa-bars';
        
        document.body.style.overflow = '';
        this.resetDropdowns();
    }

    toggleMobileDropdown(dropdown) {
        const menu = dropdown.querySelector('.dropdown-menu');
        const isOpen = dropdown.classList.contains('mobile-dropdown-open');
        
        // Cerrar otros dropdowns abiertos
        this.dropdowns.forEach(d => {
            if (d !== dropdown) {
                d.classList.remove('mobile-dropdown-open');
            }
        });
        
        // Toggle del dropdown actual
        dropdown.classList.toggle('mobile-dropdown-open', !isOpen);
        
        if (menu) {
            menu.style.maxHeight = isOpen ? '0' : menu.scrollHeight + 'px';
        }
    }

    resetDropdowns() {
        this.dropdowns.forEach(dropdown => {
            dropdown.classList.remove('mobile-dropdown-open');
            const menu = dropdown.querySelector('.dropdown-menu');
            if (menu) {
                menu.style.maxHeight = '';
            }
        });
    }

    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    Utils.smoothScrollTo(href);
                }
            });
        });
    }

    setupDropdowns() {
        this.dropdowns.forEach(dropdown => {
            const menu = dropdown.querySelector('.dropdown-menu');
            if (!menu) return;

            let timeout;

            dropdown.addEventListener('mouseenter', () => {
                clearTimeout(timeout);
                menu.style.display = 'grid';
                setTimeout(() => {
                    menu.style.opacity = '1';
                    menu.style.visibility = 'visible';
                    menu.style.transform = 'translateX(-50%) translateY(10px)';
                }, 10);
            });

            dropdown.addEventListener('mouseleave', () => {
                timeout = setTimeout(() => {
                    menu.style.opacity = '0';
                    menu.style.visibility = 'hidden';
                    menu.style.transform = 'translateX(-50%) translateY(0)';
                    setTimeout(() => {
                        menu.style.display = 'none';
                    }, 300);
                }, 100);
            });
        });
    }

    setupActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const navItems = document.querySelectorAll('.nav-link[href^="#"]');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    
                    // Remover clase activa de todos los enlaces
                    navItems.forEach(item => item.classList.remove('active'));
                    
                    // Agregar clase activa al enlace correspondiente
                    const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-80px 0px -50% 0px'
        });

        sections.forEach(section => observer.observe(section));
    }
}

// ===== ANIMACIONES =====
class Animations {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupCounterAnimations();
        this.setupParallaxEffect();
        this.setupHoverEffects();
    }

    setupScrollAnimations() {
        const animatedElements = document.querySelectorAll(
            '.section-header, .product-card, .contact-item, .stat-item, .about-text'
        );

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.classList.add('animated');
                }
            });
        }, CONFIG.animations.observerOptions);

        animatedElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            observer.observe(el);
        });
    }

    setupCounterAnimations() {
        const counters = document.querySelectorAll('.stat-number');
        
        const animateCounter = (counter) => {
            const target = parseInt(counter.textContent.replace(/[^0-9]/g, ''));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += step;
                if (current < target) {
                    counter.textContent = Math.floor(current) + '+';
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target + '+';
                }
            };

            updateCounter();
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    animateCounter(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }

    setupParallaxEffect() {
        const heroBackground = document.querySelector('.hero-background');
        if (!heroBackground) return;

        const handleScroll = Utils.throttle(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroBackground.style.transform = `translateY(${rate}px)`;
        }, 10);

        window.addEventListener('scroll', handleScroll);
    }

    setupHoverEffects() {
        // Efecto hover para tarjetas de productos
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Efecto hover para botones
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px)';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
            });
        });
    }
}

// ===== FORMULARIO DE CONTACTO =====
class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.nameField = document.getElementById('nombre');
        this.emailField = document.getElementById('email');
        this.phoneField = document.getElementById('telefono');
        this.categoryField = document.getElementById('categoria');
        this.messageField = document.getElementById('mensaje');
        this.termsCheckbox = document.getElementById('acepto-terminos');
        this.submitButton = this.form?.querySelector('button[type="submit"]');
        
        if (this.form) {
            this.init();
        }
    }

    init() {
        if (!this.form) return;
        
        this.setupFormValidation();
        this.setupFormSubmission();
        this.setupFieldInteractions();
    }

    setupFormValidation() {
        const fields = this.form.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => this.clearFieldError(field));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Limpiar errores previos
        this.clearFieldError(field);

        // Validaciones específicas
        switch (fieldName) {
            case 'nombre':
                if (!value) {
                    isValid = false;
                    errorMessage = 'El nombre es requerido';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'El nombre debe tener al menos 2 caracteres';
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value) {
                    isValid = false;
                    errorMessage = 'El email es requerido';
                } else if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Ingresa un email válido';
                }
                break;

            case 'telefono':
                const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,}$/;
                if (!value) {
                    isValid = false;
                    errorMessage = 'El teléfono es requerido';
                } else if (!phoneRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Ingresa un teléfono válido';
                }
                break;

            case 'mensaje':
                if (!value) {
                    isValid = false;
                    errorMessage = 'El mensaje es requerido';
                } else if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'El mensaje debe tener al menos 10 caracteres';
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        // Remover mensaje de error previo
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Crear nuevo mensaje de error
        const errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = '#e74c3c';
        errorElement.style.fontSize = '14px';
        errorElement.style.marginTop = '5px';
        errorElement.style.display = 'block';
        
        field.parentNode.appendChild(errorElement);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    setupFormSubmission() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validar todos los campos
            const fields = this.form.querySelectorAll('input[required], select[required], textarea[required]');
            let isFormValid = true;

            fields.forEach(field => {
                if (!this.validateField(field)) {
                    isFormValid = false;
                }
            });

            // Validar captcha
            const captchaField = this.form.querySelector('input[name="captcha_1"]');
            if (captchaField && !captchaField.value.trim()) {
                isFormValid = false;
                this.showNotification('El código de verificación es requerido', 'error');
                return;
            }

            if (!isFormValid) {
                this.showNotification('Por favor, corrige los errores en el formulario', 'error');
                return;
            }

            // Enviar formulario
            await this.submitForm();
        });
    }

    async submitForm() {
        const formData = new FormData(this.form);
        
        // Mostrar estado de carga
        this.setLoadingState(true);

        try {
            const response = await fetch(CONFIG.form.submitUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': this.getCSRFToken()
                }
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                this.showNotification(result.message || CONFIG.form.successMessage, 'success');
                this.form.reset();
                this.showWhatsAppOption(formData);
            } else {
                this.showNotification(result.message || CONFIG.form.errorMessage, 'error');
            }
        } catch (error) {
            console.error('Error al enviar formulario:', error);
            this.showNotification(CONFIG.form.errorMessage, 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    setLoadingState(loading) {
        if (!this.submitButton) return;

        const btnText = this.submitButton.querySelector('.btn-text');
        const btnLoading = this.submitButton.querySelector('.btn-loading');

        if (loading) {
            this.submitButton.disabled = true;
            this.submitButton.classList.add('loading');
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'inline';
        } else {
            this.submitButton.disabled = false;
            this.submitButton.classList.remove('loading');
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    }

    getCSRFToken() {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        return csrfToken ? csrfToken.value : '';
    }

    showWhatsAppOption(formData) {
        const nombre = formData.get('nombre');
        const email = formData.get('email');
        const telefono = formData.get('telefono');
        const categoria = formData.get('categoria');
        const mensaje = formData.get('mensaje');

        const whatsappMessage = `Hola, soy ${nombre}. Me interesa conocer más sobre sus productos.\n\n` +
            `📧 Email: ${email}\n` +
            `📱 Teléfono: ${telefono}\n` +
            `🏠 Categoría de interés: ${categoria}\n\n` +
            `💬 Mensaje: ${mensaje}`;

        const whatsappUrl = `https://wa.me/${CONFIG.whatsapp.number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
        
        // Mostrar notificación con opción de WhatsApp
        this.showWhatsAppNotification(whatsappUrl);
    }

    showWhatsAppNotification(whatsappUrl) {
        // Remover notificación existente
        const existingNotification = document.querySelector('.whatsapp-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Crear notificación de WhatsApp
        const notification = document.createElement('div');
        notification.className = 'whatsapp-notification';
        notification.innerHTML = `
            <div class="whatsapp-notification-content">
                <div class="whatsapp-notification-text">
                    <i class="fab fa-whatsapp"></i>
                    <span>¿Quieres continuar la conversación por WhatsApp?</span>
                </div>
                <div class="whatsapp-notification-buttons">
                    <button class="whatsapp-btn-yes">Sí, abrir WhatsApp</button>
                    <button class="whatsapp-btn-no">No, gracias</button>
                </div>
            </div>
        `;

        // Estilos de la notificación
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '10001',
            padding: '20px',
            borderRadius: '12px',
            backgroundColor: '#25D366',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '350px',
            boxShadow: '0 4px 20px rgba(37, 211, 102, 0.3)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Configurar botones
        const yesBtn = notification.querySelector('.whatsapp-btn-yes');
        const noBtn = notification.querySelector('.whatsapp-btn-no');

        // Estilos de botones
        [yesBtn, noBtn].forEach(btn => {
            Object.assign(btn.style, {
                padding: '8px 16px',
                margin: '5px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
            });
        });

        Object.assign(yesBtn.style, {
            backgroundColor: 'white',
            color: '#25D366'
        });

        Object.assign(noBtn.style, {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white'
        });

        const closeNotification = () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        };

        yesBtn.addEventListener('click', () => {
            window.open(whatsappUrl, '_blank');
            closeNotification();
        });

        noBtn.addEventListener('click', closeNotification);

        // Auto-cerrar después de 10 segundos
        setTimeout(closeNotification, 10000);
    }

    setupFieldInteractions() {
        // Auto-formatear teléfono
        const phoneField = this.form.querySelector('input[name="telefono"]');
        if (phoneField) {
            phoneField.addEventListener('input', (e) => {
                let value = e.target.value.replace(/[^0-9+\-\s\(\)]/g, '');
                e.target.value = value;
            });
        }

        // Capitalizar nombre
        const nameField = this.form.querySelector('input[name="nombre"]');
        if (nameField) {
            nameField.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\b\w/g, l => l.toUpperCase());
            });
        }
    }

    showNotification(message, type = 'info') {
        // Remover notificación existente
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Crear nueva notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Estilos de la notificación
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '10000',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '400px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            backgroundColor: type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'
        });

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Configurar cierre
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.color = 'white';
        closeBtn.style.fontSize = '18px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.marginLeft = '10px';

        const closeNotification = () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        };

        closeBtn.addEventListener('click', closeNotification);

        // Auto-cerrar después de 5 segundos
        setTimeout(closeNotification, 5000);
    }
}

// ===== WHATSAPP INTEGRATION =====
class WhatsAppIntegration {
    constructor() {
        this.init();
    }

    init() {
        this.setupWhatsAppButton();
        this.setupProductInquiry();
    }

    setupWhatsAppButton() {
        const whatsappBtn = document.querySelector('.whatsapp-link');
        if (!whatsappBtn) return;

        whatsappBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const message = CONFIG.whatsapp.message;
            const url = `https://wa.me/${CONFIG.whatsapp.number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
            
            window.open(url, '_blank');
        });
    }

    setupProductInquiry() {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const inquiryBtn = document.createElement('button');
            inquiryBtn.className = 'btn btn-primary btn-inquiry';
            inquiryBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Consultar';
            inquiryBtn.style.cssText = `
                opacity: 0;
                transition: opacity 0.3s ease;
            `;

            const overlayButtons = card.querySelector('.overlay-buttons');
            if (overlayButtons) {
                overlayButtons.appendChild(inquiryBtn);
            }

            const verFotosBtn = card.querySelector('.btn-ver-fotos');
            
            card.addEventListener('mouseenter', () => {
                inquiryBtn.style.opacity = '1';
                if (verFotosBtn) {
                    verFotosBtn.style.opacity = '1';
                }
            });

            card.addEventListener('mouseleave', () => {
                inquiryBtn.style.opacity = '0';
                if (verFotosBtn) {
                    verFotosBtn.style.opacity = '0';
                }
            });

            inquiryBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const productName = card.querySelector('h4').textContent;
                const message = `Hola, me interesa conocer más sobre: ${productName}`;
                const url = `https://wa.me/${CONFIG.whatsapp.number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
                
                window.open(url, '_blank');
            });
        });
    }
}

// ===== BACK TO TOP =====
class BackToTop {
    constructor() {
        this.button = document.querySelector('.back-to-top');
        this.init();
    }

    init() {
        if (!this.button) return;

        this.setupScrollVisibility();
        this.setupClickHandler();
    }

    setupScrollVisibility() {
        const handleScroll = Utils.throttle(() => {
            if (window.scrollY > 300) {
                this.button.classList.add('show');
            } else {
                this.button.classList.remove('show');
            }
        }, 100);

        window.addEventListener('scroll', handleScroll);
    }

    setupClickHandler() {
        this.button.addEventListener('click', () => {
            Utils.smoothScrollTo('body', 800);
        });
    }
}

// ===== PERFORMANCE OPTIMIZATION =====
class PerformanceOptimizer {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.isSlowDevice = this.detectSlowDevice();
        this.init();
    }

    init() {
        this.lazyLoadImages();
        this.preloadCriticalResources();
        this.optimizeForMobile();
        this.setupPerformanceMonitoring();
    }

    detectSlowDevice() {
        // Detectar dispositivos lentos basado en hardware
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const slowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
        const lowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
        const oldDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
        
        return slowConnection || lowMemory || oldDevice;
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const observerOptions = {
            rootMargin: this.isMobile ? '50px' : '100px',
            threshold: 0.1
        };
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImageOptimized(img);
                    imageObserver.unobserve(img);
                }
            });
        }, observerOptions);

        images.forEach(img => {
            img.classList.add('lazy');
            imageObserver.observe(img);
        });
    }

    loadImageOptimized(img) {
        const src = img.dataset.src;
        if (!src) return;
        
        // Crear imagen temporal para precargar
        const tempImg = new Image();
        
        tempImg.onload = () => {
            img.src = src;
            img.classList.remove('lazy');
            img.classList.add('loaded');
        };
        
        tempImg.onerror = () => {
            img.classList.add('error');
        };
        
        // Para móviles, usar versiones más pequeñas si están disponibles
        if (this.isMobile && img.dataset.srcMobile) {
            tempImg.src = img.dataset.srcMobile;
        } else {
            tempImg.src = src;
        }
    }

    optimizeForMobile() {
        if (!this.isMobile) return;
        
        // Reducir animaciones en dispositivos lentos
        if (this.isSlowDevice) {
            document.documentElement.style.setProperty('--animation-duration', '0.1s');
            document.documentElement.classList.add('reduce-motion');
        }
        
        // Optimizar scroll en móviles
        this.optimizeScrollPerformance();
        
        // Reducir calidad de imágenes en conexiones lentas
        this.optimizeImageQuality();
    }

    optimizeScrollPerformance() {
        let ticking = false;
        
        const optimizedScrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    // Lógica de scroll optimizada
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        // Usar scroll pasivo para mejor rendimiento
        window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
    }

    optimizeImageQuality() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
            // Reducir calidad de imágenes para conexiones lentas
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                if (img.dataset.srcLowQuality) {
                    img.dataset.src = img.dataset.srcLowQuality;
                }
            });
        }
    }

    setupPerformanceMonitoring() {
        // Monitorear métricas de rendimiento
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'largest-contentful-paint') {
                        // Optimizar si LCP es muy alto
                        if (entry.startTime > 2500) {
                            this.enableAggressiveOptimizations();
                        }
                    }
                    if (entry.entryType === 'first-input') {
                        // Monitorear First Input Delay
                        if (entry.processingStart - entry.startTime > 100) {
                            this.enableAggressiveOptimizations();
                        }
                    }
                });
            });
            
            // Observar métricas de rendimiento por separado para mejor compatibilidad
            try {
                observer.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.warn('LCP observation not supported:', e);
            }
            
            try {
                observer.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.warn('First Input observation not supported:', e);
            }
        }
    }

    enableAggressiveOptimizations() {
        // Activar optimizaciones agresivas para dispositivos muy lentos
        document.documentElement.classList.add('aggressive-optimizations');
        
        // Deshabilitar animaciones no críticas
        const nonCriticalAnimations = document.querySelectorAll('.animate-on-scroll:not(.critical)');
        nonCriticalAnimations.forEach(el => {
            el.classList.remove('animate-on-scroll');
        });
    }

    preloadCriticalResources() {
        // Precargar fuentes críticas solo si no es un dispositivo lento
        if (!this.isSlowDevice) {
            const fontLinks = [
                'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
                'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap'
            ];

            fontLinks.forEach(href => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'style';
                link.href = href;
                document.head.appendChild(link);
            });
        }
    }

    // Método para optimizar imágenes dinámicamente
    optimizeImageLoading() {
        const images = document.querySelectorAll('img:not([data-optimized])');
        
        images.forEach(img => {
            // Añadir loading="lazy" nativo del navegador
            img.loading = 'lazy';
            
            // Añadir decode="async" para mejor rendimiento
            img.decoding = 'async';
            
            // Marcar como optimizada
            img.dataset.optimized = 'true';
        });
    }
}



// ===== MODAL FOTOS =====
class FotosModal {
    constructor() {
        this.modal = document.getElementById('fotosModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.fotosContainer = document.getElementById('fotosContainer');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.errorMessage = document.getElementById('errorMessage');
        this.closeBtn = document.querySelector('.modal-close');
        
        // Nuevas propiedades para navegación
        this.currentFotos = [];
        this.currentIndex = 0;
        this.currentLightbox = null;
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Event listeners for "Ver fotos" buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-ver-fotos')) {
                const subcategoriaId = e.target.getAttribute('data-subcategoria-id');
                this.loadSubcategoriaFotos(subcategoriaId);
            }
        });
        
        // Event listeners for navbar product links
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('navbar-producto-link')) {
                e.preventDefault(); // Prevent default anchor behavior
                const subcategoriaId = e.target.getAttribute('data-subcategoria-id');
                if (subcategoriaId) {
                    this.loadSubcategoriaFotos(subcategoriaId);
                }
            }
        });
        
        // Close modal events
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        // Close modal when clicking outside
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });
    }
    
    async loadSubcategoriaFotos(subcategoriaId) {
        if (!this.modal) return;
        
        this.openModal();
        this.showLoading();
        
        try {
            const response = await fetch(`/api/subcategoria/${subcategoriaId}/fotos/`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.displayFotos(data.subcategoria, data.fotos);
            } else {
                throw new Error(data.message || 'Error al cargar las fotos');
            }
        } catch (error) {
            console.error('Error loading subcategoria fotos:', error);
            this.showError();
        }
    }
    
    displayFotos(subcategoria, fotos) {
        this.hideLoading();
        this.hideError();
        
        // Guardar fotos para navegación
        this.currentFotos = fotos;
        
        // Update modal title
        if (this.modalTitle) {
            this.modalTitle.textContent = `Fotos de ${subcategoria.nombre}`;
        }
        
        // Clear previous content
        if (this.fotosContainer) {
            this.fotosContainer.innerHTML = '';
        }
        
        if (fotos.length === 0) {
            this.fotosContainer.innerHTML = `
                <div class="no-photos">
                    <p>No hay fotos disponibles para esta subcategoría.</p>
                </div>
            `;
            return;
        }
        
        // Create photo grid
        fotos.forEach((foto, index) => {
            const fotoElement = this.createFotoElement(foto, index);
            this.fotosContainer.appendChild(fotoElement);
        });
    }
    
    createFotoElement(foto, index) {
        const fotoDiv = document.createElement('div');
        fotoDiv.className = 'foto-item';
        
        fotoDiv.innerHTML = `
            <img src="${foto.imagen_url}" alt="${foto.descripcion || 'Foto de producto'}" loading="lazy">
            ${foto.descripcion ? `
                <div class="foto-info">
                    <p>${foto.descripcion}</p>
                </div>
            ` : ''}
        `;
        
        // Add click event to view full image with navigation
        fotoDiv.addEventListener('click', () => {
            this.viewFullImageWithNavigation(index);
        });
        
        return fotoDiv;
    }
    
    viewFullImageWithNavigation(startIndex) {
        this.currentIndex = startIndex;
        this.createLightboxWithNavigation();
    }
    
    createLightboxWithNavigation() {
        // Remove existing lightbox if any
        if (this.currentLightbox) {
            document.body.removeChild(this.currentLightbox);
        }
        
        const foto = this.currentFotos[this.currentIndex];
        
        // Create lightbox container
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox-navigation';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close">&times;</button>
                <button class="lightbox-prev" ${this.currentFotos.length <= 1 ? 'style="display: none;"' : ''}>
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="lightbox-image-container">
                    <img src="${foto.imagen_url}" alt="${foto.descripcion || 'Foto de producto'}" class="lightbox-image">
                    ${foto.descripcion ? `<div class="lightbox-description">${foto.descripcion}</div>` : ''}
                </div>
                <button class="lightbox-next" ${this.currentFotos.length <= 1 ? 'style="display: none;"' : ''}>
                    <i class="fas fa-chevron-right"></i>
                </button>
                <div class="lightbox-counter">${this.currentIndex + 1} / ${this.currentFotos.length}</div>
            </div>
        `;
        
        this.currentLightbox = lightbox;
        
        // Add event listeners
        this.setupLightboxEvents(lightbox);
        
        document.body.appendChild(lightbox);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    setupLightboxEvents(lightbox) {
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');
        
        // Close lightbox
        const closeLightbox = () => {
            if (this.currentLightbox) {
                document.body.removeChild(this.currentLightbox);
                this.currentLightbox = null;
                document.body.style.overflow = 'auto';
            }
        };
        
        closeBtn.addEventListener('click', closeLightbox);
        
        // Close on background click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Navigation
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.navigatePrevious();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.navigateNext();
            });
        }
        
        // Keyboard navigation
        const handleKeydown = (e) => {
            switch(e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    this.navigatePrevious();
                    break;
                case 'ArrowRight':
                    this.navigateNext();
                    break;
            }
        };
        
        document.addEventListener('keydown', handleKeydown);
        
        // Remove keydown listener when lightbox is closed
        const originalClose = closeLightbox;
        const newClose = () => {
            document.removeEventListener('keydown', handleKeydown);
            originalClose();
        };
        
        closeBtn.removeEventListener('click', closeLightbox);
        closeBtn.addEventListener('click', newClose);
        
        lightbox.removeEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                newClose();
            }
        });
    }
    
    navigatePrevious() {
        if (this.currentFotos.length <= 1) return;
        
        this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.currentFotos.length - 1;
        this.updateLightboxImage();
    }
    
    navigateNext() {
        if (this.currentFotos.length <= 1) return;
        
        this.currentIndex = this.currentIndex < this.currentFotos.length - 1 ? this.currentIndex + 1 : 0;
        this.updateLightboxImage();
    }
    
    updateLightboxImage() {
        if (!this.currentLightbox) return;
        
        const foto = this.currentFotos[this.currentIndex];
        const img = this.currentLightbox.querySelector('.lightbox-image');
        const description = this.currentLightbox.querySelector('.lightbox-description');
        const counter = this.currentLightbox.querySelector('.lightbox-counter');
        
        // Update image with fade effect
        img.style.opacity = '0';
        
        setTimeout(() => {
            img.src = foto.imagen_url;
            img.alt = foto.descripcion || 'Foto de producto';
            
            // Update description
            if (description) {
                if (foto.descripcion) {
                    description.textContent = foto.descripcion;
                    description.style.display = 'block';
                } else {
                    description.style.display = 'none';
                }
            } else if (foto.descripcion) {
                // Create description if it doesn't exist
                const newDescription = document.createElement('div');
                newDescription.className = 'lightbox-description';
                newDescription.textContent = foto.descripcion;
                img.parentNode.appendChild(newDescription);
            }
            
            // Update counter
            if (counter) {
                counter.textContent = `${this.currentIndex + 1} / ${this.currentFotos.length}`;
            }
            
            img.style.opacity = '1';
        }, 150);
    }
    
    openModal() {
        if (this.modal) {
            this.modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    }
    
    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
        }
    }
    
    showLoading() {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'flex';
        }
        if (this.fotosContainer) {
            this.fotosContainer.style.display = 'none';
        }
        if (this.errorMessage) {
            this.errorMessage.style.display = 'none';
        }
    }
    
    hideLoading() {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'none';
        }
        if (this.fotosContainer) {
            this.fotosContainer.style.display = 'grid';
        }
    }
    
    showError() {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'none';
        }
        if (this.fotosContainer) {
            this.fotosContainer.style.display = 'none';
        }
        if (this.errorMessage) {
            this.errorMessage.style.display = 'block';
        }
    }
    
    hideError() {
        if (this.errorMessage) {
            this.errorMessage.style.display = 'none';
        }
    }
}

// ===== PRODUCTOS MÓVILES =====
class MobileProducts {
    constructor() {
        this.init();
    }

    init() {
        this.setupCategoryFilter();
        this.setupCategoryToggles();
        this.setupSubcategoryTabs();
        this.setupProductFiltering();
    }

    setupCategoryFilter() {
        const filterButtons = document.querySelectorAll('.category-filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                
                const category = button.dataset.category;
                this.filterByCategory(category);
                
                // Smooth scroll to products section only when user clicks
                const productsSection = document.querySelector('.products');
                if (productsSection) {
                    Utils.smoothScrollTo(productsSection, 800);
                }
            });
        });
    }

    setupCategoryToggles() {
        const toggleButtons = document.querySelectorAll('.mobile-category-toggle');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const categorySection = button.closest('.category-section');
                const content = categorySection.querySelector('.category-content');
                const isCollapsed = content.classList.contains('collapsed');
                
                if (isCollapsed) {
                    content.classList.remove('collapsed');
                    button.classList.add('active');
                } else {
                    content.classList.add('collapsed');
                    button.classList.remove('active');
                }
            });
        });
    }

    setupSubcategoryTabs() {
        const tabContainers = document.querySelectorAll('.subcategory-tabs');
        
        tabContainers.forEach(container => {
            const tabs = container.querySelectorAll('.subcategory-tab');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Remove active class from all tabs in this container
                    tabs.forEach(t => t.classList.remove('active'));
                    // Add active class to clicked tab
                    tab.classList.add('active');
                    
                    const subcategory = tab.dataset.subcategory;
                    const categorySection = container.closest('.category-section');
                    this.filterBySubcategory(categorySection, subcategory);
                });
            });
        });
    }

    setupProductFiltering() {
        // Initialize with first category active if exists
        const firstFilterBtn = document.querySelector('.category-filter-btn');
        if (firstFilterBtn) {
            firstFilterBtn.classList.add('active');
            this.filterByCategory(firstFilterBtn.dataset.category);
        }
        
        // Initialize subcategory tabs
        const firstTabs = document.querySelectorAll('.subcategory-tabs .subcategory-tab:first-child');
        firstTabs.forEach(tab => {
            tab.classList.add('active');
            const subcategory = tab.dataset.subcategory;
            const categorySection = tab.closest('.category-section');
            this.filterBySubcategory(categorySection, subcategory);
        });
    }

    filterByCategory(category) {
        const categorySection = document.querySelector(`[data-category="${category}"]`);
        const allSections = document.querySelectorAll('.category-section');
        
        if (category === 'all') {
            allSections.forEach(section => {
                section.style.display = 'block';
            });
        } else {
            allSections.forEach(section => {
                if (section.dataset.category === category) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        }
    }

    filterBySubcategory(categorySection, subcategory) {
        const productCards = categorySection.querySelectorAll('.product-card');
        
        if (subcategory === 'all') {
            productCards.forEach(card => {
                card.classList.remove('hidden');
            });
        } else {
            productCards.forEach(card => {
                if (card.dataset.subcategory === subcategory) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        }
        
        // Update no products message
        this.updateNoProductsMessage(categorySection);
    }

    updateNoProductsMessage(categorySection) {
        const visibleCards = categorySection.querySelectorAll('.product-card:not(.hidden)');
        const noProductsMsg = categorySection.querySelector('.no-products');
        
        if (visibleCards.length === 0) {
            if (!noProductsMsg) {
                const message = document.createElement('div');
                message.className = 'no-products';
                message.innerHTML = `
                    <div class="no-products-content">
                        <i class="fas fa-search"></i>
                        <h4>No hay productos disponibles</h4>
                        <p>No se encontraron productos en esta subcategoría.</p>
                    </div>
                `;
                const grid = categorySection.querySelector('.products-grid');
                grid.appendChild(message);
            } else {
                noProductsMsg.style.display = 'block';
            }
        } else {
            if (noProductsMsg) {
                noProductsMsg.style.display = 'none';
            }
        }
    }
}

// ===== INICIALIZACIÓN =====
class App {
    constructor() {
        this.components = {};
        this.init();
    }

    init() {
        // Esperar a que el DOM esté completamente cargado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            // Inicializar AOS (Animate On Scroll)
            if (typeof AOS !== 'undefined') {
                AOS.init({
                    duration: 1000,
                    easing: 'ease-in-out',
                    once: true,
                    mirror: false,
                    offset: 100,
                    delay: 0,
                    anchorPlacement: 'top-bottom'
                });
                console.log('AOS inicializado correctamente');
            }

            // Inicializar componentes principales
            this.components.navigation = new Navigation();
            this.components.animations = new Animations();
            this.components.contactForm = new ContactForm();
            this.components.whatsapp = new WhatsAppIntegration();
            this.components.backToTop = new BackToTop();
            this.components.performance = new PerformanceOptimizer();
            this.components.fotosModal = new FotosModal();
            this.components.mobileProducts = new MobileProducts();

            // Configurar eventos globales
            this.setupGlobalEvents();

            // FAQ Accordion
            const faqItems = document.querySelectorAll('.faq-item');
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question');
                question.addEventListener('click', () => {
                    const currentlyActive = document.querySelector('.faq-item.active');
                    if (currentlyActive && currentlyActive !== item) {
                        currentlyActive.classList.remove('active');
                    }
                    item.classList.toggle('active');
                });
            });
            
            console.log('VM Modulares - Landing page inicializada correctamente');
        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
        }
    }

    setupGlobalEvents() {
        // Manejar redimensionamiento de ventana
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleResize();
        }, 250));

        window.addEventListener('load', () => {
            document.body.classList.add('loaded');
        });

        // Manejo de errores globales
        window.addEventListener('error', (e) => {
            console.error('Error global:', e.error);
        });

        // Manejo de promesas rechazadas
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promesa rechazada:', e.reason);
        });

        // Manejar cambios de orientación en móviles
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 100);
        });

        // Prevenir zoom en inputs en iOS
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            const inputs = document.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('focus', () => {
                    input.style.fontSize = '16px';
                });
            });
        }
    }

    handleResize() {
        // Lógica de redimensionamiento si es necesaria
        if (this.components.navigation) {
            this.components.navigation.setupMobileMenu();
        }
        
        // Recalcular posiciones y tamaños si es necesario
        const dropdowns = document.querySelectorAll('.dropdown-menu');
        dropdowns.forEach(dropdown => {
            dropdown.style.display = 'none';
            setTimeout(() => {
                dropdown.style.display = '';
            }, 100);
        });
    }
}

// ===== FUNCIONES GLOBALES PARA CAPTCHA =====
function refreshCaptcha() {
    fetch('/captcha/refresh/', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        // Actualizar la imagen del captcha
        const captchaImage = document.getElementById('captcha-image');
        const captchaKeyInput = document.querySelector('input[name="captcha_0"]');
        const captchaValueInput = document.querySelector('input[name="captcha_1"]');
        
        if (captchaImage && data.image_url) {
            captchaImage.src = data.image_url;
        }
        
        if (captchaKeyInput && data.key) {
            captchaKeyInput.value = data.key;
        }
        
        if (captchaValueInput) {
            captchaValueInput.value = '';
            captchaValueInput.focus();
        }
    })
    .catch(error => {
        console.error('Error al refrescar captcha:', error);
    });
}

// ===== INICIAR APLICACIÓN =====
new App();

// ===== EXPORTAR PARA USO GLOBAL =====
window.VMModulares = {
    Utils,
    Navigation,
    Animations,
    ContactForm,
    WhatsAppIntegration,
    BackToTop,
    PerformanceOptimizer,
    FotosModal,
    CONFIG
};

// Exponer función de captcha globalmente
window.refreshCaptcha = refreshCaptcha;