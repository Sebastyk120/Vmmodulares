/**
 * VM Modulares - Bootstrap Enhanced Landing Page JavaScript
 * Funcionalidad para interactividad, animaciones y formulario de contacto con Bootstrap 5
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

    static showToast(message, type = 'info') {
        // Crear toast usando Bootstrap
        const toastContainer = document.querySelector('.toast-container') || this.createToastContainer();
        
        const toastId = 'toast-' + Date.now();
        const bgClass = {
            'success': 'bg-success',
            'error': 'bg-danger',
            'warning': 'bg-warning',
            'info': 'bg-info'
        }[type] || 'bg-info';

        const toastHTML = `
            <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
        
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 5000
        });
        
        toast.show();
        
        // Limpiar el toast después de que se oculte
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }

    static createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '1055';
        document.body.appendChild(container);
        return container;
    }
}

// ===== NAVEGACIÓN BOOTSTRAP =====
class BootstrapNavigation {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.offcanvas = document.querySelector('#offcanvasNavbar');
        
        this.init();
    }

    init() {
        this.setupScrollEffect();
        this.setupSmoothScrolling();
        this.setupActiveSection();
        this.setupOffcanvasClose();
    }

    setupScrollEffect() {
        const handleScroll = Utils.throttle(() => {
            const scrollY = window.scrollY;
            
            if (scrollY > 50) {
                this.navbar.classList.add('scrolled');
                this.navbar.style.backdropFilter = 'blur(20px)';
                this.navbar.style.transform = 'translateY(0)';
                
                // Efecto de parallax suave
                const parallaxValue = scrollY * 0.1;
                this.navbar.style.transform = `translateY(${Math.min(parallaxValue, 10)}px)`;
                
            } else {
                this.navbar.classList.remove('scrolled');
                this.navbar.style.backdropFilter = 'blur(10px)';
                this.navbar.style.transform = 'translateY(0)';
            }
            
            // Efecto de opacidad progresiva
            const opacity = Math.min(scrollY / 100, 1);
            this.navbar.style.background = `rgba(255, 255, 255, ${0.95 + opacity * 0.03})`;
            
        }, 16); // 60fps

        // Inicializar estado
        handleScroll();
        
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);
    }

    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    Utils.smoothScrollTo(href);
                    
                    // Cerrar offcanvas si está abierto
                    if (this.offcanvas) {
                        const bsOffcanvas = bootstrap.Offcanvas.getInstance(this.offcanvas);
                        if (bsOffcanvas) {
                            bsOffcanvas.hide();
                        }
                    }
                }
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

    setupOffcanvasClose() {
        // Cerrar offcanvas al hacer clic en enlaces con data-bs-dismiss
        const dismissLinks = document.querySelectorAll('[data-bs-dismiss="offcanvas"]');
        dismissLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.offcanvas) {
                    const bsOffcanvas = bootstrap.Offcanvas.getInstance(this.offcanvas);
                    if (bsOffcanvas) {
                        bsOffcanvas.hide();
                    }
                }
            });
        });
    }
}

// ===== FORMULARIO DE CONTACTO BOOTSTRAP =====
class BootstrapContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.submitButton = this.form?.querySelector('button[type="submit"]');
        
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.setupBootstrapValidation();
        this.setupFormSubmission();
        this.setupFieldInteractions();
    }

    setupBootstrapValidation() {
        // Usar validación nativa de Bootstrap
        this.form.addEventListener('submit', (e) => {
            if (!this.form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
                Utils.showToast('Por favor, completa todos los campos requeridos correctamente.', 'error');
            }
            this.form.classList.add('was-validated');
        });

        // Validación en tiempo real
        const inputs = this.form.querySelectorAll('.form-control, .form-select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                if (input.classList.contains('is-invalid')) {
                    this.validateField(input);
                }
            });
        });
    }

    validateField(field) {
        const isValid = field.checkValidity();
        
        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
        }
        
        return isValid;
    }

    setupFormSubmission() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!this.form.checkValidity()) {
                return;
            }

            // Validar captcha
            const captchaField = this.form.querySelector('input[name="captcha_1"]');
            if (captchaField && !captchaField.value.trim()) {
                Utils.showToast('El código de verificación es requerido', 'error');
                return;
            }

            await this.submitForm();
        });
    }

    async submitForm() {
        const formData = new FormData(this.form);
        
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
                Utils.showToast(result.message || CONFIG.form.successMessage, 'success');
                this.form.reset();
                this.form.classList.remove('was-validated');
                this.showWhatsAppOption(formData);
            } else {
                Utils.showToast(result.message || CONFIG.form.errorMessage, 'error');
            }
        } catch (error) {
            console.error('Error al enviar formulario:', error);
            Utils.showToast(CONFIG.form.errorMessage, 'error');
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
            this.submitButton.classList.add('btn-loading');
            if (btnText) btnText.classList.add('d-none');
            if (btnLoading) btnLoading.classList.remove('d-none');
        } else {
            this.submitButton.disabled = false;
            this.submitButton.classList.remove('btn-loading');
            if (btnText) btnText.classList.remove('d-none');
            if (btnLoading) btnLoading.classList.add('d-none');
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
        
        // Mostrar modal de WhatsApp usando Bootstrap
        this.showWhatsAppModal(whatsappUrl);
    }

    showWhatsAppModal(whatsappUrl) {
        const modalHTML = `
            <div class="modal fade" id="whatsappModal" tabindex="-1" aria-labelledby="whatsappModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title" id="whatsappModalLabel">
                                <i class="fab fa-whatsapp me-2"></i>Continuar por WhatsApp
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body text-center">
                            <p class="mb-4">¿Te gustaría continuar la conversación por WhatsApp para recibir atención personalizada?</p>
                            <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                                <a href="${whatsappUrl}" target="_blank" class="btn btn-success btn-lg me-md-2">
                                    <i class="fab fa-whatsapp me-2"></i>Sí, abrir WhatsApp
                                </a>
                                <button type="button" class="btn btn-outline-secondary btn-lg" data-bs-dismiss="modal">No, gracias</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remover modal existente si existe
        const existingModal = document.getElementById('whatsappModal');
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = new bootstrap.Modal(document.getElementById('whatsappModal'));
        modal.show();

        // Limpiar modal después de cerrarlo
        document.getElementById('whatsappModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
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
}

// ===== MODAL FOTOS BOOTSTRAP =====
class BootstrapFotosModal {
    constructor() {
        this.modal = document.getElementById('fotosModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.fotosContainer = document.getElementById('fotosContainer');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.errorMessage = document.getElementById('errorMessage');
        
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
                e.preventDefault();
                const subcategoriaId = e.target.getAttribute('data-subcategoria-id');
                if (subcategoriaId) {
                    this.loadSubcategoriaFotos(subcategoriaId);
                }
            }
        });
    }
    
    async loadSubcategoriaFotos(subcategoriaId) {
        // Mostrar indicador de carga temporal
        this.showTemporaryLoader();
        
        try {
            const response = await fetch(`/api/subcategoria/${subcategoriaId}/fotos/`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                // Ir directamente a la galería lightbox
                this.openDirectGallery(data.subcategoria, data.fotos);
            } else {
                throw new Error(data.message || 'Error al cargar las fotos');
            }
        } catch (error) {
            console.error('Error loading subcategoria fotos:', error);
            Utils.showToast('Error al cargar las fotos. Por favor, intenta nuevamente.', 'error');
        } finally {
            this.hideTemporaryLoader();
        }
    }
    
    displayFotos(subcategoria, fotos) {
        this.hideLoading();
        this.hideError();
        
        this.currentFotos = fotos;
        
        if (this.modalTitle) {
            this.modalTitle.textContent = `Fotos de ${subcategoria.nombre}`;
        }
        
        if (this.fotosContainer) {
            this.fotosContainer.innerHTML = '';
        }
        
        if (fotos.length === 0) {
            this.fotosContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="text-muted">
                        <i class="fas fa-images fs-1 mb-3"></i>
                        <h4>No hay fotos disponibles</h4>
                        <p>No hay fotos disponibles para esta subcategoría.</p>
                    </div>
                </div>
            `;
            return;
        }
        
        fotos.forEach((foto, index) => {
            const fotoElement = this.createFotoElement(foto, index);
            this.fotosContainer.appendChild(fotoElement);
        });
    }
    
    createFotoElement(foto, index) {
        const fotoDiv = document.createElement('div');
        fotoDiv.className = 'col-lg-4 col-md-6 mb-3';
        
        fotoDiv.innerHTML = `
            <div class="card border-0 shadow-sm h-100 foto-item" style="cursor: pointer;">
                <img src="${foto.imagen_url}" alt="${foto.descripcion || 'Foto de producto'}" class="card-img-top" style="height: 200px; object-fit: cover;" loading="lazy">
                ${foto.descripcion ? `
                    <div class="card-body p-2">
                        <small class="text-muted">${foto.descripcion}</small>
                    </div>
                ` : ''}
            </div>
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
        if (this.currentLightbox) {
            document.body.removeChild(this.currentLightbox);
        }
        
        const foto = this.currentFotos[this.currentIndex];
        
        const lightbox = document.createElement('div');
        lightbox.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center lightbox-gallery';
        lightbox.style.cssText = 'z-index: 2000;';
        
        lightbox.innerHTML = `
            <button class="btn btn-outline-light rounded-circle position-absolute" style="top: 20px; right: 20px; width: 50px; height: 50px; z-index: 10;" onclick="this.closest('.position-fixed').remove(); document.body.style.overflow = 'auto';" title="Cerrar galería">
                <i class="fas fa-times"></i>
            </button>
            ${this.currentFotos.length > 1 ? `
                <button class="btn btn-outline-light rounded-circle position-absolute" style="top: 50%; left: 30px; transform: translateY(-50%); width: 60px; height: 60px; z-index: 10;" onclick="window.vmApp.fotosModal.navigatePrevious()" title="Imagen anterior">
                    <i class="fas fa-chevron-left fs-4"></i>
                </button>
                <button class="btn btn-outline-light rounded-circle position-absolute" style="top: 50%; right: 30px; transform: translateY(-50%); width: 60px; height: 60px; z-index: 10;" onclick="window.vmApp.fotosModal.navigateNext()" title="Siguiente imagen">
                    <i class="fas fa-chevron-right fs-4"></i>
                </button>
            ` : ''}
            <div class="text-center">
                <img src="${foto.imagen_url}" alt="${foto.descripcion || 'Foto de producto'}" class="img-fluid" style="max-height: 85vh; max-width: 90vw; cursor: pointer;" onclick="window.vmApp.fotosModal.navigateNext()">
                ${foto.descripcion ? `<div class="mt-3 text-white lightbox-description rounded px-3 py-2 d-inline-block">${foto.descripcion}</div>` : ''}
                ${this.currentFotos.length > 1 ? `<div class="mt-2 text-white lightbox-counter rounded px-2 py-1 d-inline-block small">${this.currentIndex + 1} / ${this.currentFotos.length}</div>` : ''}
            </div>
        `;
        
        this.currentLightbox = lightbox;
        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';
        
        // Keyboard navigation
        const handleKeydown = (e) => {
            switch(e.key) {
                case 'Escape':
                    lightbox.remove();
                    document.body.style.overflow = 'auto';
                    document.removeEventListener('keydown', handleKeydown);
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
        
        // Close on background click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.remove();
                document.body.style.overflow = 'auto';
                document.removeEventListener('keydown', handleKeydown);
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
        const img = this.currentLightbox.querySelector('img');
        const description = this.currentLightbox.querySelector('.bg-dark.bg-opacity-75');
        const counter = this.currentLightbox.querySelector('.small');
        
        img.style.opacity = '0';
        
        setTimeout(() => {
            img.src = foto.imagen_url;
            img.alt = foto.descripcion || 'Foto de producto';
            
            if (description && foto.descripcion) {
                description.textContent = foto.descripcion;
            }
            
            if (counter) {
                counter.textContent = `${this.currentIndex + 1} / ${this.currentFotos.length}`;
            }
            
            img.style.opacity = '1';
        }, 150);
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
            this.fotosContainer.style.display = 'block';
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
    
    openDirectGallery(subcategoria, fotos) {
        if (fotos.length === 0) {
            Utils.showToast(`No hay fotos disponibles para ${subcategoria.nombre}`, 'info');
            return;
        }
        
        // Guardar las fotos y abrir directamente el lightbox
        this.currentFotos = fotos;
        this.currentIndex = 0;
        this.createLightboxWithNavigation();
    }
    
    showTemporaryLoader() {
        // Crear un loader temporal que se superpone a la página
        if (document.getElementById('tempLoader')) return;
        
        const loader = document.createElement('div');
        loader.id = 'tempLoader';
        loader.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center temp-loader';
        loader.style.cssText = 'z-index: 1500;';
        
        loader.innerHTML = `
            <div class="text-center text-white">
                <div class="spinner-border text-light mb-3" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mb-0 fw-semibold">Cargando galería...</p>
                <small class="text-white-50">Preparando las imágenes</small>
            </div>
        `;
        
        document.body.appendChild(loader);
        document.body.style.overflow = 'hidden';
    }
    
    hideTemporaryLoader() {
        const loader = document.getElementById('tempLoader');
        if (loader) {
            loader.remove();
            document.body.style.overflow = 'auto';
        }
    }
}

// ===== PRODUCTOS BOOTSTRAP =====
class BootstrapProducts {
    constructor() {
        this.init();
    }

    init() {
        this.setupCategoryFilter();
        this.setupSubcategoryTabs();
        this.setupProductFiltering();
    }

    setupCategoryFilter() {
        const filterButtons = document.querySelectorAll('.category-filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => {
                    btn.classList.remove('active', 'btn-primary');
                    btn.classList.add('btn-outline-primary');
                });
                
                // Add active class to clicked button
                button.classList.remove('btn-outline-primary');
                button.classList.add('active', 'btn-primary');
                
                const category = button.dataset.category;
                this.filterByCategory(category);
                
                // Smooth scroll to products section
                const productsSection = document.querySelector('#productos');
                if (productsSection) {
                    Utils.smoothScrollTo(productsSection, 800);
                }
            });
        });
    }

    setupSubcategoryTabs() {
        const tabContainers = document.querySelectorAll('.d-flex.flex-wrap.justify-content-center.gap-2.mb-4');
        
        tabContainers.forEach(container => {
            const tabs = container.querySelectorAll('.subcategory-tab');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Remove active class from all tabs in this container
                    tabs.forEach(t => {
                        t.classList.remove('btn-primary');
                        t.classList.add('btn-outline-secondary');
                    });
                    
                    // Add active class to clicked tab
                    tab.classList.remove('btn-outline-secondary');
                    tab.classList.add('btn-primary');
                    
                    const subcategory = tab.dataset.subcategoria;
                    const categorySection = container.closest('.category-section');
                    this.filterBySubcategory(categorySection, subcategory);
                });
            });
        });
    }

    setupProductFiltering() {
        // Ensure no filter buttons are active initially
        const filterButtons = document.querySelectorAll('.category-filter-btn');
        filterButtons.forEach(btn => {
            btn.classList.remove('active', 'btn-primary');
            btn.classList.add('btn-outline-primary');
        });
        
        // Show all products by default - no filter selected initially
        this.filterByCategory('all');
        
        // Initialize subcategory tabs - show all products in each category by default
        const categoryContainers = document.querySelectorAll('.category-section');
        categoryContainers.forEach(categorySection => {
            this.filterBySubcategory(categorySection, 'all');
        });
    }

    filterByCategory(category) {
        const allSections = document.querySelectorAll('.category-section');
        
        if (category === 'all') {
            allSections.forEach(section => {
                section.style.display = 'block';
            });
        } else {
            allSections.forEach(section => {
                if (section.dataset.categoryName === category) {
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
                card.classList.remove('d-none');
            });
        } else {
            productCards.forEach(card => {
                if (card.dataset.subcategoria === subcategory) {
                    card.classList.remove('d-none');
                } else {
                    card.classList.add('d-none');
                }
            });
        }
    }
}

// ===== BACK TO TOP BOOTSTRAP =====
class BootstrapBackToTop {
    constructor() {
        this.button = document.querySelector('#back-to-top');
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
                this.button.style.opacity = '1';
                this.button.style.visibility = 'visible';
            } else {
                this.button.classList.remove('show');
                this.button.style.opacity = '0';
                this.button.style.visibility = 'hidden';
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

// ===== WHATSAPP INTEGRATION BOOTSTRAP =====
class BootstrapWhatsAppIntegration {
    constructor() {
        this.init();
    }

    init() {
        this.setupWhatsAppButton();
        this.setupProductInquiry();
    }

    setupWhatsAppButton() {
        const whatsappBtn = document.querySelector('#whatsapp-float a');
        if (!whatsappBtn) return;

        whatsappBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const message = CONFIG.whatsapp.message;
            const url = `https://wa.me/${CONFIG.whatsapp.number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
            
            window.open(url, '_blank');
        });
    }

    setupProductInquiry() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-cotizar')) {
                e.stopPropagation();
                
                const productName = e.target.dataset.subcategoria || 'producto';
                const message = `Hola, me interesa conocer más sobre: ${productName}`;
                const url = `https://wa.me/${CONFIG.whatsapp.number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
                
                window.open(url, '_blank');
            }
        });
    }
}

// ===== INICIALIZACIÓN BOOTSTRAP =====
class BootstrapApp {
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

            // Inicializar componentes Bootstrap
            this.components.navigation = new BootstrapNavigation();
            this.components.contactForm = new BootstrapContactForm();
            this.components.fotosModal = new BootstrapFotosModal();
            this.components.products = new BootstrapProducts();
            this.components.backToTop = new BootstrapBackToTop();
            this.components.whatsapp = new BootstrapWhatsAppIntegration();

            // Configurar eventos globales
            this.setupGlobalEvents();

            // Inicializar tooltips de Bootstrap
            this.initializeTooltips();

            // Inicializar popovers de Bootstrap
            this.initializePopovers();
            
            console.log('VM Modulares - Bootstrap Landing page inicializada correctamente');
        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
        }
    }

    initializeTooltips() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    initializePopovers() {
        const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl);
        });
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
    }

    handleResize() {
        // Recalcular tooltips y popovers
        const tooltips = document.querySelectorAll('.tooltip');
        tooltips.forEach(tooltip => {
            const instance = bootstrap.Tooltip.getInstance(tooltip);
            if (instance) {
                instance.update();
            }
        });

        const popovers = document.querySelectorAll('.popover');
        popovers.forEach(popover => {
            const instance = bootstrap.Popover.getInstance(popover);
            if (instance) {
                instance.update();
            }
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
        Utils.showToast('Error al refrescar el captcha', 'error');
    });
}

// ===== INICIAR APLICACIÓN =====
const vmApp = new BootstrapApp();

// ===== EXPORTAR PARA USO GLOBAL =====
window.vmApp = vmApp;
window.VMModulares = {
    Utils,
    BootstrapNavigation,
    BootstrapContactForm,
    BootstrapFotosModal,
    BootstrapProducts,
    BootstrapBackToTop,
    BootstrapWhatsAppIntegration,
    CONFIG
};

// Exponer función de captcha globalmente
window.refreshCaptcha = refreshCaptcha;