// Initialize EmailJS - Only if available
(function() {
    if (typeof emailjs !== 'undefined') {
        try {
            emailjs.init("gk25DG3678o3wd9yM");
        } catch (e) {
            console.log('EmailJS initialization skipped:', e);
        }
    }
})();

// Cake Images - Dynamically loaded from CAKE IMAGES folder
const CAKE_IMAGES_PATH = 'CAKE IMAGES/';
// List all actual image files from the folder (updated with current filenames)
const cakeImages = [
    'WhatsApp Image 2025-11-23 at 22.53.21_bedecbff.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.22_03924ac5.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.23_7059e7ca.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.23_9f7f4464.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.24_14069ec9.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.25_2fdca294.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.25_4240a05d.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.25_88c61a4c.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.26_5175f11b.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.26_9d1d2f00.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.26_cee27010.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.27_198b8727.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.27_625a9ab4.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.27_eee989c2.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.28_2290336c.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.28_29a4b13e.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.28_3ae34efd.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.28_9c9ed16c.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.29_7d3cb5b9.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.29_9d555305.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.29_c751187e.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.29_da13a4be.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.29_e1f6dea6.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.30_533477bd.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.30_9674ab0b.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.31_91545276.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.31_d515cfd3.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.31_d62210a3.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.32_7c4e042b.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.32_9ebef45c.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.32_e65f607b.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.33_878a5485.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.33_dd15bd3c.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.35_177be4a8.jpg',
    'WhatsApp Image 2025-11-23 at 22.53.36_c691c532.jpg',
    'WhatsApp Image 2025-11-23 at 22.54.08_8d7a1cdc.jpg',
    'WhatsApp Image 2025-11-23 at 22.54.30_0c2ba875.jpg'
];

// Global Variables
let currentGalleryIndex = 0;
let galleryImages = [];
let backgroundCakeImages = [];

// Real-time listener unsubscribe functions
let userOrdersUnsubscribe = null; // For user orders listener

// DOM Elements - Will be initialized after DOM loads
let cakeAnimation, orderButton, orderModal, modalClose, cancelOrder, orderForm;
let successMessage, galleryImagesContainer, galleryIndicators;
let galleryPrev, galleryNext, backgroundCakes, starsContainer;
let navMenu, mobileMenuToggle, navLinks;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM element references
    cakeAnimation = document.getElementById('cakeAnimation');
    orderButton = document.getElementById('orderButton');
    orderModal = document.getElementById('orderModal');
    modalClose = document.getElementById('modalClose');
    cancelOrder = document.getElementById('cancelOrder');
    orderForm = document.getElementById('orderForm');
    successMessage = document.getElementById('successMessage');
    galleryImagesContainer = document.getElementById('galleryImages');
    galleryIndicators = document.getElementById('galleryIndicators');
    galleryPrev = document.getElementById('galleryPrev');
    galleryNext = document.getElementById('galleryNext');
    backgroundCakes = document.getElementById('backgroundCakes');
    starsContainer = document.getElementById('starsContainer');
    navMenu = document.getElementById('navMenu');
    mobileMenuToggle = document.getElementById('mobileMenuToggle');
    navLinks = document.querySelectorAll('.nav-link');
    
    // Initialize functions
    initializeAnimations();
    loadGalleryImages();
    loadBackgroundCakes();
    createStars();
    setupEventListeners();
    setupSmoothScrolling();
    setupMobileMenu();
    setupFormDefaults();
    setupPhoneNumberFormatting();
    setupImagePreview();
    
    // Wait for scripts to load before checking auth
    setTimeout(() => {
        checkAuthentication();
    }, 300);
    
    // Hide animation after it completes
    setTimeout(() => {
        if (cakeAnimation) {
            cakeAnimation.style.display = 'none';
        }
    }, 3000);
});

// Setup form defaults
function setupFormDefaults() {
    const deliveryDateInput = document.getElementById('deliveryDate');
    if (deliveryDateInput) {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        deliveryDateInput.setAttribute('min', today);
    }
}

// Setup phone number formatting for Indian format
function setupPhoneNumberFormatting() {
    const phoneInput = document.getElementById('customerPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Remove all non-digits
            let value = e.target.value.replace(/\D/g, '');
            // Limit to 10 digits
            if (value.length > 10) {
                value = value.substring(0, 10);
            }
            e.target.value = value;
        });
        
        phoneInput.addEventListener('paste', function(e) {
            e.preventDefault();
            let pasted = (e.clipboardData || window.clipboardData).getData('text');
            pasted = pasted.replace(/\D/g, '');
            if (pasted.length > 10) {
                pasted = pasted.substring(0, 10);
            }
            e.target.value = pasted;
        });
    }
}

// Compress image to reduce file size (especially for mobile uploads)
function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Calculate new dimensions
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    } else {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }
                
                // Create canvas and compress
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to base64 with compression
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataUrl);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Setup image preview for sample image upload
function setupImagePreview() {
    const imageInput = document.getElementById('sampleImage');
    const previewDiv = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    
    if (imageInput && previewDiv && previewImg) {
        imageInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (file) {
                // Check file size (10MB limit before compression)
                if (file.size > 10 * 1024 * 1024) {
                    if (typeof CustomModal !== 'undefined') {
                        CustomModal.alert('Image size should be less than 10MB. Please choose a smaller image.');
                    } else {
                        alert('Image size should be less than 10MB. Please choose a smaller image.');
                    }
                    imageInput.value = '';
                    return;
                }
                
                try {
                    // Compress image for preview and upload
                    const compressedDataUrl = await compressImage(file, 1200, 1200, 0.7);
                    previewImg.src = compressedDataUrl;
                    previewDiv.style.display = 'block';
                } catch (error) {
                    console.error('Error processing image:', error);
                    if (typeof CustomModal !== 'undefined') {
                        CustomModal.alert('Error processing image. Please try a different image.');
                    } else {
                        alert('Error processing image. Please try a different image.');
                    }
                    imageInput.value = '';
                }
            }
        });
    }
}

// Remove image preview
function removeImagePreview() {
    const imageInput = document.getElementById('sampleImage');
    const previewDiv = document.getElementById('imagePreview');
    if (imageInput) imageInput.value = '';
    if (previewDiv) previewDiv.style.display = 'none';
}

// Initialize animations
function initializeAnimations() {
    // Add fade-in animation to sections when they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// Load gallery images dynamically
async function loadGalleryImages() {
    const validImages = [];
    
    // Check which images exist - try all known images
    const imagePromises = cakeImages.map(image => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = CAKE_IMAGES_PATH + image;
            
            img.onload = () => {
                validImages.push({
                    name: image,
                    path: CAKE_IMAGES_PATH + image
                });
                resolve();
            };
            img.onerror = () => {
                // Image doesn't exist, skip it
                resolve();
            };
        });
    });
    
    await Promise.all(imagePromises);
    
    // If no images found, try common image extensions
    if (validImages.length === 0) {
        const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
        const baseImages = [
            '2023-06-08', '2023-06-11', '2023-07-08', '2023-09-29',
            '2024-03-27 (1)', '2024-03-27', '2024-09-21',
            'IMG_20221221_223220', 'IMG_20221221_223320'
        ];
        
        for (const base of baseImages) {
            for (const ext of extensions) {
                const imageName = base + ext;
                const testPromise = new Promise((resolve) => {
                    const img = new Image();
                    img.src = CAKE_IMAGES_PATH + imageName;
                    
                    img.onload = () => {
                        validImages.push({
                            name: imageName,
                            path: CAKE_IMAGES_PATH + imageName
                        });
                        resolve();
                    };
                    img.onerror = () => resolve();
                });
                await testPromise;
            }
        }
    }
    
    galleryImages = validImages;
    displayGalleryImages();
}

// Display gallery images
function displayGalleryImages() {
    if (!galleryImagesContainer || !galleryIndicators) return;
    
    if (galleryImages.length === 0) {
        galleryImagesContainer.innerHTML = '<p style="text-align: center; padding: 50px;">No images found</p>';
        return;
    }
    
    galleryImagesContainer.innerHTML = '';
    galleryIndicators.innerHTML = '';
    
    galleryImages.forEach((img, index) => {
        // Create wrapper for cake-themed frame
        const wrapper = document.createElement('div');
        wrapper.className = 'gallery-image-wrapper';
        if (index === 0) wrapper.classList.add('active-wrapper');
        // Let CSS handle all positioning - only set display for visibility
        wrapper.style.display = index === 0 ? 'flex' : 'none';
        
        const imgElement = document.createElement('img');
        imgElement.src = img.path;
        imgElement.alt = `Cake ${index + 1}`;
        imgElement.className = 'gallery-image';
        // Let CSS handle sizing - only set opacity
        imgElement.style.opacity = index === 0 ? '1' : '0';
        if (index === 0) imgElement.classList.add('active');
        
        wrapper.appendChild(imgElement);
        galleryImagesContainer.appendChild(wrapper);
        
        const indicator = document.createElement('button');
        indicator.className = 'gallery-indicator';
        if (index === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => goToGallerySlide(index));
        galleryIndicators.appendChild(indicator);
    });
    
    // Auto-rotate gallery
    if (galleryImages.length > 1) {
        setInterval(() => {
            nextGallerySlide();
        }, 5000);
    }
}

// Gallery navigation
function goToGallerySlide(index) {
    if (!galleryImagesContainer || index < 0 || index >= galleryImages.length) return;
    
    currentGalleryIndex = index;
    const wrappers = document.querySelectorAll('.gallery-image-wrapper');
    const images = document.querySelectorAll('.gallery-image');
    const indicators = document.querySelectorAll('.gallery-indicator');
    
    wrappers.forEach((wrapper, i) => {
        if (i === index) {
            wrapper.style.display = 'flex';
            wrapper.classList.add('active-wrapper');
            wrapper.style.zIndex = '1';
        } else {
            wrapper.style.display = 'none';
            wrapper.classList.remove('active-wrapper');
            wrapper.style.zIndex = '0';
        }
    });
    
    images.forEach((img, i) => {
        img.classList.toggle('active', i === index);
        img.style.opacity = i === index ? '1' : '0';
    });
    
    indicators.forEach((ind, i) => {
        ind.classList.toggle('active', i === index);
    });
}

function nextGallerySlide() {
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
    goToGallerySlide(currentGalleryIndex);
}

function prevGallerySlide() {
    currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
    goToGallerySlide(currentGalleryIndex);
}

// Load background cake images
async function loadBackgroundCakes() {
    if (!backgroundCakes) return;
    
    if (galleryImages.length === 0) {
        await loadGalleryImages();
    }
    
    if (galleryImages.length === 0) {
        return; // No images to display
    }
    
    // Select 2-3 random images for background
    const shuffled = [...galleryImages].sort(() => 0.5 - Math.random());
    const selectedImages = shuffled.slice(0, Math.min(3, shuffled.length));
    
    selectedImages.forEach((img, index) => {
        const bgImg = document.createElement('img');
        bgImg.src = img.path;
        bgImg.className = 'background-cake-image';
        bgImg.style.left = `${(index * 33)}%`;
        bgImg.style.top = `${20 + (index * 30)}%`;
        bgImg.style.animationDelay = `${index * 2}s`;
        backgroundCakes.appendChild(bgImg);
    });
    
    // Periodically change background images every 30 seconds
    if (backgroundCakeInterval) {
        clearInterval(backgroundCakeInterval);
    }
    backgroundCakeInterval = setInterval(() => {
        changeBackgroundCakes();
    }, 30000);
}

let backgroundCakeInterval = null;

function changeBackgroundCakes() {
    if (!backgroundCakes) return;
    
    const existingImages = document.querySelectorAll('.background-cake-image');
    existingImages.forEach(img => img.remove());
    
    const shuffled = [...galleryImages].sort(() => 0.5 - Math.random());
    const selectedImages = shuffled.slice(0, Math.min(3, shuffled.length));
    
    selectedImages.forEach((img, index) => {
        const bgImg = document.createElement('img');
        bgImg.src = img.path;
        bgImg.className = 'background-cake-image';
        bgImg.style.left = `${(index * 33)}%`;
        bgImg.style.top = `${20 + (index * 30)}%`;
        bgImg.style.animationDelay = `${index * 2}s`;
        bgImg.style.opacity = '0';
        bgImg.style.transition = 'opacity 1s ease';
        backgroundCakes.appendChild(bgImg);
        
        setTimeout(() => {
            bgImg.style.opacity = '0.4';
        }, 100);
    });
}

// Create glittery stars
function createStars() {
    if (!starsContainer) return;
    
    const starCount = 50;
    const emojis = ['✨', '⭐', '🌟', '💫'];
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        star.style.fontSize = `${15 + Math.random() * 15}px`;
        starsContainer.appendChild(star);
    }
}

// Check authentication status
function checkAuthentication() {
    // Wait for Auth to be available
    if (typeof Auth === 'undefined') {
        setTimeout(checkAuthentication, 100);
        return;
    }
    
    // Check sessionStorage directly as well for immediate feedback
    let user = Auth.isLoggedIn();
    
    // If Auth.isLoggedIn() returns null but sessionStorage has data, restore it
    if (!user) {
        const storedUser = sessionStorage.getItem('trawish_current_user');
        if (storedUser) {
            try {
                user = JSON.parse(storedUser);
                Auth.currentUser = user;
                console.log('✅ User restored from sessionStorage');
            } catch (e) {
                console.error('Error restoring user:', e);
            }
        }
    }
    
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');
    const accountsLink = document.getElementById('accountsLink');
    
    if (user) {
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) {
            logoutLink.style.display = 'block';
            // Remove existing listeners to avoid duplicates
            const existingLogout = document.getElementById('logoutLink');
            if (existingLogout) {
                const newLogout = existingLogout.cloneNode(true);
                existingLogout.parentNode.replaceChild(newLogout, existingLogout);
            }
            document.getElementById('logoutLink').addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof Auth !== 'undefined') {
                    Auth.logout();
                }
            });
        }
        if (accountsLink) accountsLink.style.display = 'block';
        // Load orders after authentication check
        setTimeout(() => loadUserOrders(), 200);
    } else {
        if (loginLink) {
            loginLink.style.display = 'block';
            const existingLogin = document.getElementById('loginLink');
            if (existingLogin) {
                const newLogin = existingLogin.cloneNode(true);
                existingLogin.parentNode.replaceChild(newLogin, existingLogin);
            }
            document.getElementById('loginLink').addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'login.html';
            });
        }
        if (logoutLink) logoutLink.style.display = 'none';
        if (accountsLink) accountsLink.style.display = 'none';
    }
}

// Function to handle cake type change
function handleCakeTypeChange() {
    const cakeTypeSelect = document.getElementById('cakeType');
    const customDesignGroup = document.getElementById('customDesignGroup');
    const otherCakeGroup = document.getElementById('otherCakeGroup');
    const customDesignInput = document.getElementById('customDesignInput');
    const otherCakeInput = document.getElementById('otherCakeInput');
    
    if (!cakeTypeSelect) return;
    
    const value = cakeTypeSelect.value;
    
    // Hide both groups first
    if (customDesignGroup) {
        customDesignGroup.style.display = 'none';
        if (customDesignInput) {
            customDesignInput.required = false;
            customDesignInput.value = '';
        }
    }
    if (otherCakeGroup) {
        otherCakeGroup.style.display = 'none';
        if (otherCakeInput) {
            otherCakeInput.required = false;
            otherCakeInput.value = '';
        }
    }
    
    // Show appropriate group based on selection (inline next to dropdown)
    if (value === 'Custom Design') {
        if (customDesignGroup) {
            customDesignGroup.style.display = 'block';
            if (customDesignInput) {
                customDesignInput.required = true;
            }
        }
    } else if (value === 'Other') {
        if (otherCakeGroup) {
            otherCakeGroup.style.display = 'block';
            if (otherCakeInput) {
                otherCakeInput.required = true;
            }
        }
    }
}

// Function to handle cake weight change
function handleCakeWeightChange() {
    const cakeWeightSelect = document.getElementById('cakeWeight');
    const customSizeGroup = document.getElementById('customSizeGroup');
    const customSizeInput = document.getElementById('customSizeInput');
    
    if (!cakeWeightSelect) return;
    
    const value = cakeWeightSelect.value;
    if (value === 'Custom Size') {
        if (customSizeGroup) {
            customSizeGroup.style.display = 'block';
            if (customSizeInput) {
                customSizeInput.required = true;
            }
        }
    } else {
        if (customSizeGroup) {
            customSizeGroup.style.display = 'none';
            if (customSizeInput) {
                customSizeInput.required = false;
                customSizeInput.value = '';
            }
        }
    }
}

// Setup custom cake/size textarea visibility
function setupCustomFieldsHandlers() {
    const cakeTypeSelect = document.getElementById('cakeType');
    const cakeWeightSelect = document.getElementById('cakeWeight');
    
    if (cakeTypeSelect) {
        // Remove any existing change listeners by cloning (prevents duplicates)
        const currentValue = cakeTypeSelect.value;
        const newCakeTypeSelect = cakeTypeSelect.cloneNode(true);
        newCakeTypeSelect.value = currentValue; // Preserve current selection
        cakeTypeSelect.parentNode.replaceChild(newCakeTypeSelect, cakeTypeSelect);
        
        newCakeTypeSelect.addEventListener('change', handleCakeTypeChange);
        // Check current value on setup (in case something is already selected)
        if (newCakeTypeSelect.value) {
            handleCakeTypeChange();
        }
    }
    
    if (cakeWeightSelect) {
        // Remove any existing change listeners by cloning (prevents duplicates)
        const currentValue = cakeWeightSelect.value;
        const newCakeWeightSelect = cakeWeightSelect.cloneNode(true);
        newCakeWeightSelect.value = currentValue; // Preserve current selection
        cakeWeightSelect.parentNode.replaceChild(newCakeWeightSelect, cakeWeightSelect);
        
        newCakeWeightSelect.addEventListener('change', handleCakeWeightChange);
        // Check current value on setup (in case something is already selected)
        if (newCakeWeightSelect.value) {
            handleCakeWeightChange();
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Setup custom fields handlers
    setupCustomFieldsHandlers();
    
    // Order button - check if user is logged in
    if (orderButton) {
        orderButton.addEventListener('click', () => {
            // Check authentication with retry logic
            let user = Auth ? Auth.isLoggedIn() : null;
            
            // Double-check sessionStorage if Auth.isLoggedIn() returns null
            if (!user) {
                const storedUser = sessionStorage.getItem('trawish_current_user');
                if (storedUser) {
                    try {
                        user = JSON.parse(storedUser);
                        Auth.currentUser = user;
                        console.log('✅ User session restored for order button');
                    } catch (e) {
                        console.error('Error parsing stored user:', e);
                    }
                }
            }
            
            if (!user) {
                if (typeof CustomModal !== 'undefined') {
                    CustomModal.confirm(
                        'Please login to place an order. Would you like to login now?',
                        () => {
                            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
                        },
                        () => {}
                    );
                } else {
                    if (confirm('Please login to place an order. Would you like to login now?')) {
                        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
                    }
                }
                return;
            }
            
            // User is logged in - show order type selection popup first
            showOrderTypeSelection();
        });
    }
    
    // Modal close
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (cancelOrder) {
        cancelOrder.addEventListener('click', closeModal);
    }
    
    // Close modal on outside click
    if (orderModal) {
        orderModal.addEventListener('click', (e) => {
            if (e.target === orderModal) {
                closeModal();
            }
        });
    }
    
    // Form submission
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmit);
    }
    
    // Gallery navigation
    if (galleryPrev) {
        galleryPrev.addEventListener('click', prevGallerySlide);
    }
    
    if (galleryNext) {
        galleryNext.addEventListener('click', nextGallerySlide);
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
        if (e.key === 'ArrowLeft' && orderModal.classList.contains('show')) {
            prevGallerySlide();
        }
        if (e.key === 'ArrowRight' && orderModal.classList.contains('show')) {
            nextGallerySlide();
        }
    });
}

function closeModal() {
    if (!orderModal) return;
    orderModal.classList.remove('show');
    document.body.style.overflow = 'auto';
    if (orderForm) {
        orderForm.reset();
        removeImagePreview(); // Clear image preview when modal closes
    }
}

// Handle order form submission
async function handleOrderSubmit(e) {
    e.preventDefault();
    
    const user = Auth ? Auth.isLoggedIn() : null;
    if (!user) {
        if (typeof CustomModal !== 'undefined') {
            CustomModal.alert('Please login to place an order.', () => {
                window.location.href = 'login.html';
            });
        } else {
            alert('Please login to place an order.');
            window.location.href = 'login.html';
        }
        return;
    }
    
    // Get order type and validate required fields
    const orderTypeInput = document.getElementById('orderType');
    let orderType = orderTypeInput?.value || 'CAKE';
    
    console.log('🔍 Order Type:', orderType);
    
    // Validate based on order type
    if (orderType === 'CAKE') {
        const cakeType = document.getElementById('cakeType')?.value;
        const cakeWeight = document.getElementById('cakeWeight')?.value;
        
        console.log('🔍 Cake Type:', cakeType, 'Cake Weight:', cakeWeight);
        
        if (!cakeType || !cakeWeight) {
            const submitButton = orderForm.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            if (typeof CustomModal !== 'undefined') {
                CustomModal.alert('Please fill in all required cake fields (Cake Type and Weight).');
            } else {
                alert('Please fill in all required cake fields (Cake Type and Weight).');
            }
            return;
        }
    } else if (orderType === 'COOKIE/BROWNIE') {
        const cookieType = document.getElementById('cookieType')?.value;
        const cookieQuantity = document.getElementById('cookieQuantity')?.value;
        
        console.log('🔍 Cookie Type:', cookieType, 'Cookie Quantity:', cookieQuantity);
        
        if (!cookieType || !cookieQuantity) {
            const submitButton = orderForm.querySelector('button[type="submit"]');
            if (submitButton) submitButton.disabled = false;
            if (typeof CustomModal !== 'undefined') {
                CustomModal.alert('Please fill in all required cookie/brownie fields (Type and Quantity).');
            } else {
                alert('Please fill in all required cookie/brownie fields (Type and Quantity).');
            }
            return;
        }
        
        // Check if "Other" is selected and custom input is filled
        if (cookieType === 'Other') {
            const otherCookieInput = document.getElementById('otherCookieInput')?.value;
            if (!otherCookieInput || otherCookieInput.trim() === '') {
                const submitButton = orderForm.querySelector('button[type="submit"]');
                if (submitButton) submitButton.disabled = false;
                if (typeof CustomModal !== 'undefined') {
                    CustomModal.alert('Please specify your cookie/brownie type in the custom field.');
                } else {
                    alert('Please specify your cookie/brownie type in the custom field.');
                }
                return;
            }
        }
        
        // Check if "Custom Quantity" is selected and custom input is filled
        if (cookieQuantity === 'Custom Quantity') {
            const customQuantityInput = document.getElementById('customQuantityInput')?.value;
            if (!customQuantityInput || customQuantityInput.trim() === '') {
                const submitButton = orderForm.querySelector('button[type="submit"]');
                if (submitButton) submitButton.disabled = false;
                if (typeof CustomModal !== 'undefined') {
                    CustomModal.alert('Please specify your custom quantity.');
                } else {
                    alert('Please specify your custom quantity.');
                }
                return;
            }
        }
    }
    
    const formData = new FormData(orderForm);
    
    // Handle sample image upload with compression
    let sampleImageData = null;
    const sampleImageFile = formData.get('sampleImage');
    if (sampleImageFile && sampleImageFile.size > 0) {
        try {
            // Compress image to reduce size (max 1200px, quality 0.7)
            // This ensures images are small enough for Firebase and mobile devices
            sampleImageData = await compressImage(sampleImageFile, 1200, 1200, 0.7);
            console.log('✅ Image compressed successfully');
            console.log('📏 Original size:', (sampleImageFile.size / 1024).toFixed(2), 'KB');
            console.log('📏 Compressed size:', (sampleImageData.length * 3 / 4 / 1024).toFixed(2), 'KB (base64)');
        } catch (error) {
            console.error('❌ Error compressing image:', error);
            // Fallback to original if compression fails
            sampleImageData = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(sampleImageFile);
            });
        }
    }
    
    // Get order type from formData (use already validated value or fallback to formData)
    orderType = formData.get('orderType') || orderType || 'CAKE';
    
    const orderData = {
        orderId: '', // Will be generated after we have all data
        userId: user.id,
        orderType: orderType, // CAKE or COOKIE/BROWNIE
        customerName: formData.get('customerName'),
        customerEmail: formData.get('customerEmail'),
        customerPhone: formData.get('customerPhone').replace(/\D/g, ''), // Remove non-digits, keep only numbers
        deliveryDate: formData.get('deliveryDate'),
        customization: formData.get('customization'),
        specialRequests: formData.get('specialRequests'),
        sampleImage: sampleImageData
    };
    
    // Only include relevant fields based on order type
    if (orderType === 'CAKE') {
        orderData.cakeType = formData.get('cakeType') || '';
        orderData.cakeWeight = formData.get('cakeWeight') || '';
        orderData.customSizeInput = formData.get('customSizeInput') || '';
        orderData.customDesignInput = formData.get('customDesignInput') || '';
        orderData.otherCakeInput = formData.get('otherCakeInput') || '';
        // Clear cookie fields
        orderData.cookieType = '';
        orderData.cookieQuantity = '';
        orderData.otherCookieInput = '';
        orderData.customQuantityInput = '';
    } else if (orderType === 'COOKIE/BROWNIE') {
        orderData.cookieType = formData.get('cookieType') || '';
        orderData.cookieQuantity = formData.get('cookieQuantity') || '';
        orderData.otherCookieInput = formData.get('otherCookieInput') || '';
        orderData.customQuantityInput = formData.get('customQuantityInput') || '';
        // Clear cake fields
        orderData.cakeType = '';
        orderData.cakeWeight = '';
        orderData.customSizeInput = '';
        orderData.customDesignInput = '';
        orderData.otherCakeInput = '';
    }
    
    // Generate order ID with order data
    orderData.orderId = generateOrderId(orderData);
    
    // Ensure userId is a string for consistency with Firebase
    orderData.userId = String(user.id);
    
    console.log('📦 Preparing to create order:', orderData);
    console.log('👤 User ID:', user.id, '(type:', typeof user.id, ')');
    
    // Show loading state
    const submitButton = orderForm.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = 'Sending...';
    submitButton.disabled = true;
    
    try {
        // Show take-in service notification BEFORE saving order
        const proceedWithOrder = await new Promise((resolve) => {
            if (typeof CustomModal !== 'undefined') {
                CustomModal.confirm(
                    '📢 Important Notice: This is a take-in service only! Once your order is ready, you will need to pick it up from our location at:\n\n1103 Solacia Phase 1 Solacia Internal Road, RMC Garden, Wagholi, Wagholi, Pune, Maharashtra 412207, India\n\nWe will notify you when your order is ready for pickup! 🎂\n\nDo you wish to proceed with your order?',
                    () => {
                        // User clicked Proceed
                        resolve(true);
                    },
                    () => {
                        // User clicked Cancel
                        resolve(false);
                    }
                );
            } else {
                const confirmed = confirm('📢 Important Notice: This is a take-in service only! Once your order is ready, you will need to pick it up from: 1103 Solacia Phase 1 Solacia Internal Road, RMC Garden, Wagholi, Wagholi, Pune, Maharashtra 412207, India\n\nDo you wish to proceed with your order?');
                resolve(confirmed);
            }
        });
        
        // If user cancelled, stop the order submission
        if (!proceedWithOrder) {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            return;
        }
        
        // Save order to database (only if user proceeded)
        if (DB) {
            console.log('💾 Saving order to Firebase...');
            const savedOrder = await DB.createOrder(orderData);
            if (savedOrder) {
                console.log('✅ Order saved successfully to Firebase!');
                console.log('📦 Order ID:', savedOrder.id || savedOrder.orderId);
                console.log('👤 Order userId:', savedOrder.userId);
                console.log('👤 Current user id:', user.id);
                console.log('📋 Full order data:', savedOrder);
            } else {
                console.error('❌ Failed to save order - DB.createOrder returned null');
                throw new Error('Failed to save order to database. Please try again.');
            }
        } else {
            console.error('❌ DB is not available');
            throw new Error('Database not available. Please refresh the page and try again.');
        }
        
        // Send email using EmailJS
        await sendOrderEmail(orderData);
        
        closeModal();
        showSuccessMessage();
        
        // Reset form and clear image preview
        orderForm.reset();
        removeImagePreview(); // Clear image preview
        
        // Force reload user orders after a short delay to ensure DB is updated
        // Also manually trigger a refresh to ensure the listener picks up the new order
        console.log('🔄 Will reload user orders in 1 second...');
        
        setTimeout(() => {
            console.log('🔄 Reloading user orders after order creation...');
            console.log('👤 Current user:', user);
            console.log('👤 User ID:', user.id, '(type:', typeof user.id, ')');
            
            // Unsubscribe current listener
            if (userOrdersUnsubscribe) {
                console.log('🔄 Unsubscribing old listener...');
                userOrdersUnsubscribe();
                userOrdersUnsubscribe = null;
            }
            
            // Reload orders (this will set up a new listener)
            loadUserOrders();
            
            // Also manually fetch once to ensure we get the order
            setTimeout(async () => {
                console.log('🔄 Manual fetch of user orders...');
                if (DB && DB.getOrdersByUserId) {
                    const orders = await DB.getOrdersByUserId(String(user.id));
                    console.log('📋 Manually fetched orders:', orders.length);
                    if (orders.length > 0) {
                        displayUserOrders(orders);
                    }
                }
            }, 500);
            
            // Show accounts section if hidden and scroll to it
            const accountsSection = document.getElementById('accounts');
            if (accountsSection) {
                accountsSection.style.display = 'block';
                setTimeout(() => {
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
                    const targetPosition = accountsSection.offsetTop - headerHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }, 500);
            }
        }, 300);
    } catch (error) {
        console.error('Error sending order:', error);
        if (typeof CustomModal !== 'undefined') {
            CustomModal.alert('There was an error submitting your order. Please try again or contact us directly at trawishcakes@gmail.com');
        } else {
            alert('There was an error submitting your order. Please try again or contact us directly at trawishcakes@gmail.com');
        }
    } finally {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

// Generate unique order ID - Format: TC-YYYYMMDD-HHMMSS-NAME-TYPE-XXXX
function generateOrderId(orderData = null) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const dateStr = `${year}${month}${day}`;
    const timeStr = `${hours}${minutes}${seconds}`;
    
    // Get name initials (first 3 characters, uppercase)
    let nameCode = 'XXX';
    if (orderData && orderData.customerName) {
        nameCode = orderData.customerName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
        if (nameCode.length < 3) nameCode = nameCode.padEnd(3, 'X');
    }
    
    // Get cake type code (first 3 characters)
    let typeCode = 'CAK';
    if (orderData && orderData.cakeType) {
        const typeMap = {
            'Birthday': 'BDY',
            'Wedding': 'WDG',
            'Anniversary': 'ANN',
            'Chocolate': 'CHC',
            'Red Velvet': 'RV',
            'Vanilla': 'VAN',
            'Custom': 'CUS',
            'Other': 'OTH'
        };
        
        for (const [key, code] of Object.entries(typeMap)) {
            if (orderData.cakeType.includes(key)) {
                typeCode = code;
                break;
            }
        }
    }
    
    // Random alphanumeric suffix (4 characters)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomSuffix = '';
    for (let i = 0; i < 4; i++) {
        randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return `TC-${dateStr}-${timeStr}-${nameCode}-${typeCode}-${randomSuffix}`;
}

// Send order email using Trawish Email Service
async function sendOrderEmail(orderData) {
    try {
        // Use Trawish Email Service
        if (typeof TrawishEmailService !== 'undefined') {
            const result = await TrawishEmailService.sendOrderNotification(orderData);
            if (result.success) {
                console.log('Order notification email sent successfully via Trawish Email Service');
            } else {
                console.log('Order notification email could not be sent:', result.message);
            }
        } else {
            console.log('Email service not loaded - order saved but email not sent');
        }
    } catch (error) {
        console.error('Error sending order email:', error);
        // Email sending failed but order is saved, so we continue
    }
}

// Show success message
function showSuccessMessage() {
    if (!successMessage) return;
    successMessage.classList.add('show');
    setTimeout(() => {
        if (successMessage) successMessage.classList.remove('show');
    }, 5000);
}

// Setup smooth scrolling for navigation
function setupSmoothScrolling() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    // Show accounts section if hidden
                    if (targetId === 'accounts') {
                        targetSection.style.display = 'block';
                    }
                    
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update active nav link
                    navLinks.forEach(nav => nav.classList.remove('active'));
                    link.classList.add('active');
                    
                    // Close mobile menu if open
                    navMenu.classList.remove('active');
                    
                    // Reload orders when navigating to accounts
                    if (targetId === 'accounts') {
                        setTimeout(() => {
                            loadUserOrders();
                        }, 300);
                    }
                }
            }
        });
    });
    
    // Update active nav link on scroll
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY + 150;
        
        document.querySelectorAll('.section').forEach(section => {
            if (section.style.display === 'none') return;
            
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

// Setup mobile menu
function setupMobileMenu() {
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        }
    });
}

// Auto-refresh gallery when images change
function refreshGallery() {
    loadGalleryImages();
    setTimeout(refreshGallery, 60000); // Check every minute
}

// Start auto-refresh
setTimeout(refreshGallery, 60000);

// Load user orders for accounts section (with real-time updates from Firebase)
async function loadUserOrders() {
    // Check if Auth and DB are available
    if (typeof Auth === 'undefined' || typeof DB === 'undefined') {
        console.log('Auth or DB not loaded yet');
        setTimeout(() => loadUserOrders(), 200);
        return;
    }
    
    const user = Auth.isLoggedIn();
    if (!user) {
        // User not logged in - hide orders section
        const ordersList = document.getElementById('ordersList');
        if (ordersList) {
            ordersList.innerHTML = '<p class="no-orders">Please <a href="login.html" class="order-link">login</a> to view your orders! 🎂</p>';
        }
        return;
    }
    
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) {
        console.log('ordersList element not found');
        return;
    }
    
    try {
        // Set up real-time listener for user orders (updates automatically when status changes)
        if (DB && DB.onUserOrdersUpdate && isFirebaseAvailable()) {
            // Unsubscribe previous listener if exists
            if (userOrdersUnsubscribe) {
                userOrdersUnsubscribe();
            }
            
            // Set up real-time listener - orders update automatically when admin changes status
            console.log('👂 Setting up real-time listener for user orders...');
            console.log('👤 User ID for listener:', user.id);
            userOrdersUnsubscribe = DB.onUserOrdersUpdate(String(user.id), (orders) => {
                console.log('📬 Real-time update: Received', orders.length, 'orders');
                displayUserOrders(orders);
            });
        } else {
            // Fallback: Load once
            const orders = await DB.getOrdersByUserId(user.id);
            displayUserOrders(orders);
        }
    } catch (error) {
        console.error('Error loading user orders:', error);
        ordersList.innerHTML = '<p class="no-orders">Error loading orders. Please refresh the page.</p>';
    }
}

function displayUserOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    // Convert Firebase timestamps to dates
    orders = orders.map(order => {
        if (order.createdAt && order.createdAt.toDate) {
            order.createdAt = order.createdAt.toDate().toISOString();
        } else if (order.createdAt && typeof order.createdAt === 'object') {
            order.createdAt = order.createdAt.seconds ? new Date(order.createdAt.seconds * 1000).toISOString() : order.createdAt;
        }
        return order;
    });
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p class="no-orders">You don\'t have any orders yet. <a href="#home" class="order-link" onclick="event.preventDefault(); document.getElementById(\'orderButton\')?.click();">Click here to place your first order</a>! 🎂</p>';
        return;
    }
    
    // Sort by newest first
    orders.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
    });
    
    ordersList.innerHTML = orders.map(order => createOrderCardHTML(order)).join('');
    console.log('Orders displayed successfully:', orders.length);
}

// Create order card HTML for accounts section
function createOrderCardHTML(order) {
    const statusText = getOrderStatusText(order.status);
    const statusClass = `order-status-${order.status}`;
    
    return `
        <div class="user-order-card" data-order-id="${order.orderId}">
            <div class="order-card-header">
                <h3>Order #${order.orderId}</h3>
                <span class="order-status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="order-card-body">
                ${order.orderType === 'CAKE' ? `
                    <div class="order-info-row">
                        <strong>Cake Type:</strong> ${order.cakeType || 'N/A'}
                    </div>
                    <div class="order-info-row">
                        <strong>Weight:</strong> ${order.cakeWeight || 'N/A'}
                        ${order.customSizeInput ? `<br><small style="color: #666;">Custom: ${order.customSizeInput}</small>` : ''}
                    </div>
                ` : `
                    <div class="order-info-row">
                        <strong>Cookie/Brownie Type:</strong> ${order.cookieType || 'N/A'}
                        ${order.otherCookieInput ? `<br><small style="color: #666;">Custom: ${order.otherCookieInput}</small>` : ''}
                    </div>
                    <div class="order-info-row">
                        <strong>Quantity:</strong> ${order.cookieQuantity || 'N/A'}
                        ${order.customQuantityInput ? `<br><small style="color: #666;">Custom: ${order.customQuantityInput}</small>` : ''}
                    </div>
                `}
                <div class="order-info-row">
                    <strong>Delivery Date:</strong> ${order.deliveryDate}
                </div>
                ${order.invoiceAmount ? `
                    <div class="order-info-row">
                        <strong>Invoice Amount:</strong> ₹${order.invoiceAmount}
                    </div>
                ` : ''}
                ${order.advanceAmount ? `
                    <div class="order-info-row">
                        <strong>Advance Amount:</strong> ₹${order.advanceAmount}
                    </div>
                ` : ''}
            </div>
            ${order.sampleImage ? `
                <div class="order-info-row" style="margin-top: 15px;">
                    <strong>Sample Image:</strong>
                    <div style="margin-top: 10px;">
                        <img src="${order.sampleImage}" alt="Sample Image" style="max-width: 200px; max-height: 200px; border-radius: 10px; border: 2px solid #ddd; cursor: pointer;" onclick="window.open('${order.sampleImage}', '_blank')">
                    </div>
                </div>
            ` : ''}
            ${order.status === 0 ? `
                <div class="rejection-notice" style="background: #ffe5e5; border-left: 4px solid #dc3545; padding: 20px; border-radius: 10px; margin-top: 20px;">
                    <strong style="color: #dc3545; display: block; margin-bottom: 10px; font-size: 1.1rem;">❌ Order Rejected</strong>
                    <p style="color: #721c24; margin: 0;"><strong>Reason:</strong> ${order.rejectionReason || 'No reason provided'}</p>
                    <p style="color: #721c24; margin-top: 10px; font-size: 0.9rem;">If you have any questions, please contact us at trawishcakes@gmail.com</p>
                </div>
            ` : `
                <div class="order-status-timeline">
                    ${createOrderStatusTimeline(order.status)}
                </div>
                ${order.status === 2 ? `
                    <div class="payment-upload-section" style="background: linear-gradient(135deg, #fff9e6, #fff5e6); padding: 20px; border-radius: 15px; border: 2px dashed var(--secondary-color); margin-top: 20px;">
                        ${order.advanceAmount ? `
                            <div style="margin-bottom: 15px;">
                                <strong style="color: #856404; font-size: 1.1rem;">💰 Payment Information</strong>
                                <p style="color: #856404; margin: 5px 0;">Total Invoice: ₹${order.invoiceAmount}</p>
                                <p style="color: #856404; margin: 5px 0;">Advance Amount: ₹${order.advanceAmount}</p>
                            </div>
                            <div style="margin: 20px 0; text-align: center;">
                                <img src="QR/WhatsApp Image 2025-11-23 at 22.35.53_240a119c.jpg" alt="QR Code for Payment" class="qr-code-preview" onclick="showFullScreenQR('${order.orderId}', '${order.advanceAmount}')" style="max-width: 300px; max-height: 300px; border-radius: 10px; border: 3px solid #ffc107; cursor: pointer; transition: transform 0.3s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.2);" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                <p style="color: #856404; margin-top: 15px; font-size: 1rem; font-weight: 600;">Scan to pay ₹${order.advanceAmount}</p>
                                <p style="color: #856404; margin-top: 5px; font-size: 0.85rem; font-style: italic;">💡 Click on QR code to view full screen</p>
                            </div>
                        ` : ''}
                        ${!order.advancePaymentProof ? `
                            <label for="paymentProof_${order.orderId}" class="upload-button">
                                Upload Payment Proof
                            </label>
                            <input type="file" id="paymentProof_${order.orderId}" accept="image/*" style="display: none;" onchange="uploadPaymentProof('${order.orderId}', this)">
                            <p class="payment-note">Please pay ₹${order.advanceAmount || 'the advance amount'} and upload the payment proof to proceed.</p>
                        ` : `
                            <div style="margin-top: 15px; padding: 15px; background: #d4edda; border-radius: 10px;">
                                <strong style="color: #155724;">✅ Payment Proof Uploaded</strong>
                                <p style="color: #155724; margin: 5px 0; font-size: 0.9rem;">Waiting for admin verification...</p>
                            </div>
                        `}
                    </div>
                ` : ''}
                ${order.status === 5 && (order.rating === undefined || order.rating === null || order.rating === '' || order.rating === 0) ? `
                    <div class="rating-section" style="background: #fff3cd; padding: 20px; border-radius: 10px; margin-top: 20px; border-left: 4px solid #ffc107;">
                        <h4 style="color: #856404; margin-top: 0;">⭐ Rate Your Experience</h4>
                        <p style="color: #856404; margin-bottom: 15px;">We'd love to hear your feedback! Please rate your order.</p>
                        <div class="rating-stars" style="margin-bottom: 15px;">
                            ${[1, 2, 3, 4, 5].map(star => `
                                <span class="star-rating" data-rating="${star}" onclick="setRating('${order.orderId}', ${star})" style="font-size: 30px; cursor: pointer; color: #ddd; margin-right: 5px;">⭐</span>
                            `).join('')}
                        </div>
                        <textarea id="ratingComment_${order.orderId}" placeholder="Share your experience (optional)" style="width: 100%; min-height: 80px; padding: 10px; border: 2px solid #ddd; border-radius: 5px; margin-bottom: 10px; font-family: inherit;"></textarea>
                        <button onclick="submitRating('${order.orderId}')" style="background: #667eea; color: white; padding: 10px 20px; border: none; border-radius: 25px; cursor: pointer; font-weight: 600;">Submit Rating</button>
                    </div>
                ` : order.status === 5 && order.rating ? `
                    <div class="rating-display" style="background: #d1e7dd; padding: 20px; border-radius: 10px; margin-top: 20px; border-left: 4px solid #198754;">
                        <h4 style="color: #0f5132; margin-top: 0;">⭐ Your Rating</h4>
                        <div style="color: #0f5132; margin-bottom: 10px;">
                            ${(() => {
                                // Ensure rating is a number (1-5)
                                let ratingValue = order.rating;
                                if (ratingValue !== undefined && ratingValue !== null) {
                                    ratingValue = typeof ratingValue === 'number' ? ratingValue : parseInt(ratingValue);
                                    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
                                        ratingValue = 0;
                                    }
                                } else {
                                    ratingValue = 0;
                                }
                                console.log('⭐ Customer display - Order rating raw:', order.rating, 'Type:', typeof order.rating, 'Parsed:', ratingValue);
                                return '⭐'.repeat(ratingValue) + '☆'.repeat(5 - ratingValue) + ' (' + ratingValue + '/5)';
                            })()}
                        </div>
                        ${order.ratingComment ? `<p style="color: #0f5132; margin: 0; font-style: italic;">"${order.ratingComment}"</p>` : ''}
                        <p style="color: #0f5132; margin-top: 10px; font-size: 0.9rem;">Thank you for your feedback! 💝</p>
                    </div>
                ` : ''}
            `}
        </div>
    `;
}

function getOrderStatusText(status) {
    const statuses = {
        0: 'Order Rejected',
        1: 'Order Requested',
        2: 'Invoice Generated',
        3: 'Payment Confirmed',
        4: 'Order Ready',
        5: 'Order Delivered'
    };
    return statuses[status] || 'Unknown';
}

function createOrderStatusTimeline(currentStatus) {
    const steps = [
        { num: 1, text: 'Order Requested', icon: '📝' },
        { num: 2, text: 'Invoice Generated', icon: '💰' },
        { num: 3, text: 'Payment Confirmed', icon: '✅' },
        { num: 4, text: 'Order Ready', icon: '🎂' },
        { num: 5, text: 'Order Delivered', icon: '🎉' }
    ];
    
    return `
        <div class="timeline">
            ${steps.map(step => `
                <div class="timeline-step ${step.num <= currentStatus ? 'completed' : ''} ${step.num === currentStatus ? 'current' : ''}">
                    <div class="timeline-icon">${step.icon}</div>
                    <div class="timeline-text">${step.text}</div>
                </div>
            `).join('')}
        </div>
    `;
}

async function uploadPaymentProof(orderId, input) {
    const file = input.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        if (typeof CustomModal !== 'undefined') {
            CustomModal.alert('Please upload an image file');
        } else {
            alert('Please upload an image file');
        }
        return;
    }
    
    // Check file size (10MB limit before compression)
    if (file.size > 10 * 1024 * 1024) {
        if (typeof CustomModal !== 'undefined') {
            CustomModal.alert('Image size should be less than 10MB. Please choose a smaller image.');
        } else {
            alert('Image size should be less than 10MB. Please choose a smaller image.');
        }
        return;
    }
    
    try {
        // Compress image before uploading (max 1200px, quality 0.7)
        const imageData = await compressImage(file, 1200, 1200, 0.7);
        console.log('✅ Payment proof compressed successfully');
        console.log('📏 Original size:', (file.size / 1024).toFixed(2), 'KB');
        console.log('📏 Compressed size:', (imageData.length * 3 / 4 / 1024).toFixed(2), 'KB (base64)');
        
        const result = await DB.uploadPaymentProof(orderId, imageData);
        if (result && result.success) {
            if (typeof CustomModal !== 'undefined') {
                CustomModal.alert('Payment proof uploaded successfully! We will verify and confirm your payment soon.', () => {
                    loadUserOrders();
                });
            } else {
                alert('Payment proof uploaded successfully! We will verify and confirm your payment soon.');
                loadUserOrders();
            }
        } else {
            if (typeof CustomModal !== 'undefined') {
                CustomModal.alert('Error uploading payment proof. Please try again.');
            } else {
                alert('Error uploading payment proof. Please try again.');
            }
        }
    } catch (error) {
        console.error('❌ Error processing payment proof:', error);
        if (typeof CustomModal !== 'undefined') {
            CustomModal.alert('Error processing image. Please try a different image.');
        } else {
            alert('Error processing image. Please try a different image.');
        }
    }
}

// Show full-screen QR code modal
function showFullScreenQR(orderId, amount) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'qrFullScreenModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.3s ease;
        padding: 20px;
        box-sizing: border-box;
    `;
    
    // Create modal content - optimized for QR code display
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        border-radius: 20px;
        padding: 0;
        width: 100%;
        max-width: 450px;
        height: 100%;
        max-height: 85vh;
        text-align: center;
        position: relative;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: slideUp 0.3s ease;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    `;
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
        position: absolute;
        top: 15px;
        right: 15px;
        background: #ff6b9d;
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 28px;
        cursor: pointer;
        line-height: 1;
        transition: all 0.3s ease;
        z-index: 10001;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
    `;
    closeBtn.onmouseover = () => {
        closeBtn.style.transform = 'rotate(90deg) scale(1.1)';
        closeBtn.style.background = '#ffb347';
    };
    closeBtn.onmouseout = () => {
        closeBtn.style.transform = 'rotate(0deg) scale(1)';
        closeBtn.style.background = '#ff6b9d';
    };
    
    // Header section - compact
    const header = document.createElement('div');
    header.style.cssText = `
        padding: 25px 20px 20px;
        background: linear-gradient(135deg, #fff9e6, #fff5e6);
        border-bottom: 3px solid #ffc107;
        flex-shrink: 0;
    `;
    header.innerHTML = `
        <h2 style="color: #856404; margin: 0 0 8px 0; font-size: 1.5rem; font-weight: 700;">💰 Payment QR Code</h2>
        <p style="color: #856404; font-size: 1.2rem; margin: 0; font-weight: 600;">Amount: ₹${amount}</p>
    `;
    
    // QR Code container - takes all remaining space
    const qrContainer = document.createElement('div');
    qrContainer.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 20px;
        background: linear-gradient(135deg, #2d3436, #636e72);
        position: relative;
        overflow: hidden;
        min-height: 0;
    `;
    
    // QR Code image - fills entire container
    const qrImg = document.createElement('img');
    qrImg.src = 'QR/WhatsApp Image 2025-11-23 at 22.35.53_240a119c.jpg';
    qrImg.alt = 'QR Code for Payment';
    qrImg.style.cssText = `
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 10px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        display: block;
    `;
    
    // Instructions footer - compact
    const footer = document.createElement('div');
    footer.style.cssText = `
        padding: 15px 20px;
        background: white;
        border-top: 2px solid #ffc107;
        flex-shrink: 0;
    `;
    footer.innerHTML = `
        <p style="font-size: 1rem; margin: 5px 0; color: #856404; font-weight: 600;"><strong>📱 Scan to pay ₹${amount}</strong></p>
        <p style="font-size: 0.85rem; margin: 3px 0; color: #666;">Scan using any UPI app</p>
    `;
    
    // Assemble modal
    qrContainer.appendChild(qrImg);
    content.appendChild(closeBtn);
    content.appendChild(header);
    content.appendChild(qrContainer);
    content.appendChild(footer);
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Close handlers
    const closeModal = () => {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    };
    
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        closeModal();
    };
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };
    
    // Prevent clicks inside modal from closing it
    content.onclick = (e) => {
        e.stopPropagation();
    };
    
    // Close on Escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

// Order type selection (CAKE or COOKIE/BROWNIE)
let selectedOrderType = null;

function showOrderTypeSelection() {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'orderTypeSelectionModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.3s ease;
    `;
    
    // Create modal content
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        border-radius: 30px;
        padding: 50px 40px;
        max-width: 500px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: slideUp 0.3s ease;
    `;
    
    content.innerHTML = `
        <h2 style="color: var(--primary-color); margin: 0 0 20px 0; font-size: 2rem;">What would you like to order?</h2>
        <p style="color: #666; margin-bottom: 30px; font-size: 1.1rem;">Please select an option</p>
        <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
            <button id="selectCakeBtn" style="flex: 1; min-width: 180px; padding: 25px 20px; background: linear-gradient(135deg, #ff6b9d, #ffb347); color: white; border: none; border-radius: 20px; font-size: 1.3rem; font-weight: 700; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 5px 20px rgba(255, 107, 157, 0.4);">
                🎂 CAKE
            </button>
            <button id="selectCookieBtn" style="flex: 1; min-width: 180px; padding: 25px 15px; background: linear-gradient(135deg, #c44569, #f8b500); color: white; border: none; border-radius: 20px; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 5px 20px rgba(196, 69, 105, 0.4); line-height: 1.3; word-wrap: break-word; white-space: normal;">
                🍪<br>COOKIE/<br>BROWNIE
            </button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Button hover effects
    const cakeBtn = document.getElementById('selectCakeBtn');
    const cookieBtn = document.getElementById('selectCookieBtn');
    
    cakeBtn.onmouseover = () => {
        cakeBtn.style.transform = 'translateY(-5px) scale(1.05)';
        cakeBtn.style.boxShadow = '0 10px 30px rgba(255, 107, 157, 0.6)';
    };
    cakeBtn.onmouseout = () => {
        cakeBtn.style.transform = 'translateY(0) scale(1)';
        cakeBtn.style.boxShadow = '0 5px 20px rgba(255, 107, 157, 0.4)';
    };
    
    cookieBtn.onmouseover = () => {
        cookieBtn.style.transform = 'translateY(-5px) scale(1.05)';
        cookieBtn.style.boxShadow = '0 10px 30px rgba(196, 69, 105, 0.6)';
    };
    cookieBtn.onmouseout = () => {
        cookieBtn.style.transform = 'translateY(0) scale(1)';
        cookieBtn.style.boxShadow = '0 5px 20px rgba(196, 69, 105, 0.4)';
    };
    
    // Close modal
    const closeModal = () => {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    };
    
    // Event handlers
    cakeBtn.onclick = () => {
        selectedOrderType = 'CAKE';
        closeModal();
        setTimeout(() => {
            openOrderModal('CAKE');
        }, 300);
    };
    
    cookieBtn.onclick = () => {
        selectedOrderType = 'COOKIE/BROWNIE';
        closeModal();
        setTimeout(() => {
            openOrderModal('COOKIE/BROWNIE');
        }, 300);
    };
    
    // Close on outside click
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };
    
    // Close on Escape
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

function openOrderModal(orderType) {
    // Update modal header based on order type
    const modalHeader = document.querySelector('#orderModal .modal-header h2');
    if (modalHeader) {
        if (orderType === 'CAKE') {
            modalHeader.innerHTML = '🎂 Place Your Cake Order';
        } else {
            modalHeader.innerHTML = '🍪 Place Your Cookie/Brownie Order';
        }
    }
    
    // Get form field groups
    const cakeTypeGroup = document.getElementById('cakeType').closest('.form-group');
    const cakeWeightGroup = document.getElementById('cakeWeight').closest('.form-group');
    const cookieTypeGroup = document.getElementById('cookieTypeGroup');
    const cookieQuantityGroup = document.getElementById('cookieQuantityGroup');
    const cakeTypeSelect = document.getElementById('cakeType');
    const cakeWeightSelect = document.getElementById('cakeWeight');
    const cookieTypeSelect = document.getElementById('cookieType');
    const cookieQuantitySelect = document.getElementById('cookieQuantity');
    
    if (orderType === 'CAKE') {
        // Show cake fields, hide cookie fields
        if (cakeTypeGroup) cakeTypeGroup.style.display = 'block';
        if (cakeWeightGroup) cakeWeightGroup.style.display = 'block';
        if (cookieTypeGroup) cookieTypeGroup.style.display = 'none';
        if (cookieQuantityGroup) cookieQuantityGroup.style.display = 'none';
        
        // Make cake fields required, cookie fields not required
        if (cakeTypeSelect) {
            cakeTypeSelect.required = true;
            cakeTypeSelect.setAttribute('required', 'required');
        }
        if (cakeWeightSelect) {
            cakeWeightSelect.required = true;
            cakeWeightSelect.setAttribute('required', 'required');
        }
        if (cookieTypeSelect) {
            cookieTypeSelect.required = false;
            cookieTypeSelect.removeAttribute('required');
            cookieTypeSelect.value = '';
        }
        if (cookieQuantitySelect) {
            cookieQuantitySelect.required = false;
            cookieQuantitySelect.removeAttribute('required');
            cookieQuantitySelect.value = '';
        }
        
        // Clear cookie field values and custom inputs
        const otherCookieInput = document.getElementById('otherCookieInput');
        const customQuantityInput = document.getElementById('customQuantityInput');
        if (otherCookieInput) {
            otherCookieInput.value = '';
            otherCookieInput.required = false;
            otherCookieInput.removeAttribute('required');
        }
        if (customQuantityInput) {
            customQuantityInput.value = '';
            customQuantityInput.required = false;
            customQuantityInput.removeAttribute('required');
        }
    } else {
        // Show cookie fields, hide cake fields
        if (cakeTypeGroup) cakeTypeGroup.style.display = 'none';
        if (cakeWeightGroup) cakeWeightGroup.style.display = 'none';
        if (cookieTypeGroup) cookieTypeGroup.style.display = 'block';
        if (cookieQuantityGroup) cookieQuantityGroup.style.display = 'block';
        
        // Make cookie fields required, cake fields not required
        if (cakeTypeSelect) {
            cakeTypeSelect.required = false;
            cakeTypeSelect.removeAttribute('required');
            cakeTypeSelect.value = '';
        }
        if (cakeWeightSelect) {
            cakeWeightSelect.required = false;
            cakeWeightSelect.removeAttribute('required');
            cakeWeightSelect.value = '';
        }
        if (cookieTypeSelect) {
            cookieTypeSelect.required = true;
            cookieTypeSelect.setAttribute('required', 'required');
        }
        if (cookieQuantitySelect) {
            cookieQuantitySelect.required = true;
            cookieQuantitySelect.setAttribute('required', 'required');
        }
        
        // Clear cake field values and custom inputs
        const customSizeInput = document.getElementById('customSizeInput');
        const customDesignInput = document.getElementById('customDesignInput');
        const otherCakeInput = document.getElementById('otherCakeInput');
        if (customSizeInput) {
            customSizeInput.value = '';
            customSizeInput.required = false;
            customSizeInput.removeAttribute('required');
        }
        if (customDesignInput) {
            customDesignInput.value = '';
            customDesignInput.required = false;
            customDesignInput.removeAttribute('required');
        }
        if (otherCakeInput) {
            otherCakeInput.value = '';
            otherCakeInput.required = false;
            otherCakeInput.removeAttribute('required');
        }
    }
    
    // Store order type in a hidden field
    let orderTypeInput = document.getElementById('orderType');
    if (!orderTypeInput) {
        orderTypeInput = document.createElement('input');
        orderTypeInput.type = 'hidden';
        orderTypeInput.id = 'orderType';
        orderTypeInput.name = 'orderType';
        document.getElementById('orderForm').appendChild(orderTypeInput);
    }
    orderTypeInput.value = orderType;
    
    // Setup cookie/brownie custom field handlers
    setupCookieFieldHandlers();
    
    // Open modal
    orderModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Re-setup custom field handlers for cake fields
    setTimeout(() => {
        setupCustomFieldsHandlers();
    }, 50);
}

// Setup cookie/brownie field handlers (for "Other" type and "Custom Quantity")
function setupCookieFieldHandlers() {
    const cookieTypeSelect = document.getElementById('cookieType');
    const cookieQuantitySelect = document.getElementById('cookieQuantity');
    const otherCookieGroup = document.getElementById('otherCookieGroup');
    const otherCookieInput = document.getElementById('otherCookieInput');
    const customQuantityGroup = document.getElementById('customQuantityGroup');
    const customQuantityInput = document.getElementById('customQuantityInput');
    
    // Cookie type change handler
    if (cookieTypeSelect && otherCookieGroup) {
        // Remove existing listener by cloning
        const currentValue = cookieTypeSelect.value;
        const newCookieTypeSelect = cookieTypeSelect.cloneNode(true);
        newCookieTypeSelect.value = currentValue;
        cookieTypeSelect.parentNode.replaceChild(newCookieTypeSelect, cookieTypeSelect);
        
        newCookieTypeSelect.addEventListener('change', () => {
            if (newCookieTypeSelect.value === 'Other') {
                otherCookieGroup.style.display = 'block';
                if (otherCookieInput) otherCookieInput.required = true;
            } else {
                otherCookieGroup.style.display = 'none';
                if (otherCookieInput) {
                    otherCookieInput.required = false;
                    otherCookieInput.value = '';
                }
            }
        });
        
        // Check initial value
        if (newCookieTypeSelect.value === 'Other') {
            otherCookieGroup.style.display = 'block';
            if (otherCookieInput) otherCookieInput.required = true;
        }
    }
    
    // Cookie quantity change handler
    if (cookieQuantitySelect && customQuantityGroup) {
        // Remove existing listener by cloning
        const currentValue = cookieQuantitySelect.value;
        const newCookieQuantitySelect = cookieQuantitySelect.cloneNode(true);
        newCookieQuantitySelect.value = currentValue;
        cookieQuantitySelect.parentNode.replaceChild(newCookieQuantitySelect, cookieQuantitySelect);
        
        newCookieQuantitySelect.addEventListener('change', () => {
            if (newCookieQuantitySelect.value === 'Custom Quantity') {
                customQuantityGroup.style.display = 'block';
                if (customQuantityInput) customQuantityInput.required = true;
            } else {
                customQuantityGroup.style.display = 'none';
                if (customQuantityInput) {
                    customQuantityInput.required = false;
                    customQuantityInput.value = '';
                }
            }
        });
        
        // Check initial value
        if (newCookieQuantitySelect.value === 'Custom Quantity') {
            customQuantityGroup.style.display = 'block';
            if (customQuantityInput) customQuantityInput.required = true;
        }
    }
}

// Rating functions
let currentRating = {};
let selectedRating = {};

function setRating(orderId, rating) {
    // Store rating per order
    selectedRating[orderId] = rating;
    currentRating[orderId] = rating;
    
    console.log('⭐ Rating set for order', orderId, ':', rating);
    
    const stars = document.querySelectorAll(`[data-order-id="${orderId}"] .star-rating`);
    stars.forEach((star, index) => {
        const starRating = parseInt(star.getAttribute('data-rating'));
        if (starRating <= rating) {
            star.style.color = '#ffc107';
            star.textContent = '⭐';
        } else {
            star.style.color = '#ddd';
            star.textContent = '☆';
        }
    });
}

async function submitRating(orderId) {
    console.log('⭐ SubmitRating called for order:', orderId);
    console.log('⭐ Current selectedRating object:', selectedRating);
    console.log('⭐ Stored rating for this order:', selectedRating[orderId]);
    
    // Get rating from stored value first (most reliable)
    let rating = selectedRating[orderId] || currentRating[orderId];
    
    console.log('⭐ Rating from stored value:', rating);
    
    // If not in stored value, find from stars (fallback)
    if (!rating || rating === 0) {
        console.log('⭐ Rating not found in stored value, searching stars...');
        const ratingCard = document.querySelector(`[data-order-id="${orderId}"]`);
        if (!ratingCard) {
            console.error('⭐ Rating card not found for order:', orderId);
            if (typeof CustomModal !== 'undefined') {
                CustomModal.alert('Order not found');
            } else {
                alert('Order not found');
            }
            return;
        }
        
        // Find all selected stars and get the highest rating
        const allStars = ratingCard.querySelectorAll('.star-rating');
        let highestRating = 0;
        
        console.log('⭐ Found', allStars.length, 'stars');
        
        allStars.forEach((star, index) => {
            const starRating = parseInt(star.getAttribute('data-rating'));
            const starColor = star.style.color || window.getComputedStyle(star).color;
            console.log(`⭐ Star ${index + 1}: rating=${starRating}, color=${starColor}`);
            
            // Check if color is yellow (#ffc107 or rgb(255, 193, 7))
            if (starColor.includes('rgb(255, 193, 7)') || starColor.includes('#ffc107') || starColor.includes('255, 193, 7') || starColor === 'rgb(255, 193, 7)') {
                if (starRating > highestRating) {
                    highestRating = starRating;
                    console.log('⭐ Found highlighted star with rating:', highestRating);
                }
            }
        });
        
        if (highestRating === 0) {
            console.error('⭐ No highlighted stars found!');
            if (typeof CustomModal !== 'undefined') {
                CustomModal.alert('Please select a rating by clicking on the stars');
            } else {
                alert('Please select a rating by clicking on the stars');
            }
            return;
        }
        
        rating = highestRating;
        console.log('⭐ Using highest rating from stars:', rating);
    }
    
    // Ensure rating is a number between 1-5
    rating = parseInt(rating);
    console.log('⭐ Final rating value (parsed):', rating, '(type:', typeof rating, ')');
    
    if (isNaN(rating) || rating < 1 || rating > 5) {
        console.error('⭐ Invalid rating value:', rating);
        if (typeof CustomModal !== 'undefined') {
            CustomModal.alert('Please select a valid rating (1-5 stars). Current value: ' + rating);
        } else {
            alert('Please select a valid rating (1-5 stars). Current value: ' + rating);
        }
        return;
    }
    
    const comment = document.getElementById(`ratingComment_${orderId}`)?.value || '';
    console.log('⭐ FINAL: Submitting rating:', rating, '(as number:', typeof rating, ')', 'for order:', orderId);
    console.log('⭐ Comment:', comment);
    
    // Double-check rating is a valid number before submitting
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        console.error('❌ Invalid rating before submission:', rating, 'type:', typeof rating);
        if (typeof CustomModal !== 'undefined') {
            CustomModal.alert('Error: Invalid rating value. Please try selecting the stars again.');
        } else {
            alert('Error: Invalid rating value. Please try selecting the stars again.');
        }
        return;
    }
    
    const result = await DB.submitRating(orderId, rating, comment);
    
    console.log('⭐ Database result:', result);
    
    if (result && result.success) {
        // Clear the stored rating after successful submission
        delete selectedRating[orderId];
        delete currentRating[orderId];
        
        if (typeof CustomModal !== 'undefined') {
            CustomModal.alert('Thank you for your rating! 💝', () => {
                loadUserOrders();
                // Reload ratings in admin if on admin page
                if (typeof reloadRatings === 'function') {
                    reloadRatings();
                }
            });
        } else {
            alert('Thank you for your rating! 💝');
            loadUserOrders();
        }
    } else {
        const errorMsg = result ? result.message : 'Unknown error';
        console.error('❌ Error submitting rating:', errorMsg);
        if (typeof CustomModal !== 'undefined') {
            CustomModal.alert('Error submitting rating: ' + errorMsg);
        } else {
            alert('Error submitting rating: ' + errorMsg);
        }
    }
}

// Handle window resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Adjust layout on resize
        if (window.innerWidth > 768) {
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        }
    }, 250);
});

