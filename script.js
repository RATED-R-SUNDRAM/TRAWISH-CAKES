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
const cakeImages = [
    '2023-06-08.jpg',
    '2023-06-11.jpg',
    '2023-07-08.jpg',
    '2023-09-29.jpg',
    '2024-03-27 (1).jpg',
    '2024-03-27.jpg',
    '2024-09-21.jpg',
    'IMG_20221221_223220.jpg',
    'IMG_20221221_223320.jpg'
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

// Setup event listeners
function setupEventListeners() {
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
            
            // User is logged in - open order modal
            orderModal.classList.add('show');
            document.body.style.overflow = 'hidden';
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
    
    const orderData = {
        orderId: '', // Will be generated after we have all data
        userId: user.id,
        customerName: formData.get('customerName'),
        customerEmail: formData.get('customerEmail'),
        customerPhone: formData.get('customerPhone').replace(/\D/g, ''), // Remove non-digits, keep only numbers
        cakeType: formData.get('cakeType'),
        cakeWeight: formData.get('cakeWeight'),
        deliveryDate: formData.get('deliveryDate'),
        customization: formData.get('customization'),
        specialRequests: formData.get('specialRequests'),
        sampleImage: sampleImageData
    };
    
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
                <div class="order-info-row">
                    <strong>Cake Type:</strong> ${order.cakeType}
                </div>
                <div class="order-info-row">
                    <strong>Weight:</strong> ${order.cakeWeight}
                </div>
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
                ${order.status === 2 && !order.advancePaymentProof ? `
                    <div class="payment-upload-section">
                        <label for="paymentProof_${order.orderId}" class="upload-button">
                            Upload Payment Proof
                        </label>
                        <input type="file" id="paymentProof_${order.orderId}" accept="image/*" style="display: none;" onchange="uploadPaymentProof('${order.orderId}', this)">
                        <p class="payment-note">Please pay ₹${order.advanceAmount} and upload the payment proof to proceed.</p>
                    </div>
                ` : ''}
                ${order.status === 5 && !order.rating ? `
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
                            ${'⭐'.repeat(order.rating)}${'☆'.repeat(5 - order.rating)} (${order.rating}/5)
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

// Rating functions
let currentRating = 0;

function setRating(orderId, rating) {
    currentRating = rating;
    const stars = document.querySelectorAll(`[data-order-id="${orderId}"] .star-rating`);
    stars.forEach((star, index) => {
        if (index < rating) {
            star.style.color = '#ffc107';
            star.textContent = '⭐';
        } else {
            star.style.color = '#ddd';
            star.textContent = '☆';
        }
    });
}

async function submitRating(orderId) {
    // Get rating from the clicked stars
    const ratingCard = document.querySelector(`[data-order-id="${orderId}"]`);
    if (!ratingCard) {
        if (typeof CustomModal !== 'undefined') {
            CustomModal.alert('Order not found');
        } else {
            alert('Order not found');
        }
        return;
    }
    
    // Find the selected rating
    const selectedStar = ratingCard.querySelector('.star-rating[style*="color: rgb(255, 193, 7)"]');
    if (!selectedStar) {
        if (typeof CustomModal !== 'undefined') {
            CustomModal.alert('Please select a rating by clicking on the stars');
        } else {
            alert('Please select a rating by clicking on the stars');
        }
        return;
    }
    
    const rating = parseInt(selectedStar.getAttribute('data-rating'));
    const comment = document.getElementById(`ratingComment_${orderId}`)?.value || '';
    const result = await DB.submitRating(orderId, rating, comment);
    
    if (result && result.success) {
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
        if (typeof CustomModal !== 'undefined') {
            CustomModal.alert('Error submitting rating: ' + (result ? result.message : 'Unknown error'));
        } else {
            alert('Error submitting rating: ' + (result ? result.message : 'Unknown error'));
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

