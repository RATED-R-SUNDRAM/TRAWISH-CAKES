// Authentication System
const Auth = {
    // Check if user is logged in
    isLoggedIn() {
        const userData = localStorage.getItem('trawish_current_user');
        return userData ? JSON.parse(userData) : null;
    },

    // Login user
    login(username, password) {
        const user = DB.getUserByUsername(username);
        
        if (!user) {
            return { success: false, message: 'Invalid username or password' };
        }

        if (user.password !== password) {
            return { success: false, message: 'Invalid username or password' };
        }

        // Store current user
        const userData = {
            id: user.id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin
        };
        localStorage.setItem('trawish_current_user', JSON.stringify(userData));
        
        return { success: true, user: userData };
    },

    // Logout user
    logout() {
        localStorage.removeItem('trawish_current_user');
        window.location.href = 'index.html';
    },

    // Register new user
    register(userData) {
        if (userData.password !== userData.confirmPassword) {
            return { success: false, message: 'Passwords do not match' };
        }

        if (userData.password.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters' };
        }

        const result = DB.createUser({
            username: userData.username,
            email: userData.email,
            password: userData.password
        });

        if (result.success) {
            // Auto login after registration
            return this.login(userData.username, userData.password);
        }

        return result;
    },

    // Request password reset
    requestPasswordReset(email) {
        const user = DB.getUsers().find(u => u.email === email);
        
        if (!user) {
            // Don't reveal if email exists for security
            return { success: true, message: 'If the email exists, a reset link has been sent' };
        }

        const token = DB.createResetToken(email);
        const resetLink = `${window.location.origin}/reset-password.html?token=${token}`;

        // Send email with reset link (using EmailJS or mailto)
        EmailService.sendPasswordResetEmail(email, user.username, resetLink);

        return { success: true, message: 'Password reset link has been sent to your email' };
    },

    // Reset password
    resetPassword(token, newPassword, confirmPassword) {
        if (newPassword !== confirmPassword) {
            return { success: false, message: 'Passwords do not match' };
        }

        if (newPassword.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters' };
        }

        const tokenValidation = DB.validateResetToken(token);
        
        if (!tokenValidation.valid) {
            return { success: false, message: tokenValidation.message };
        }

        const user = DB.getUsers().find(u => u.email === tokenValidation.email);
        
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        DB.updateUserPassword(user.id, newPassword);
        DB.markTokenUsed(token);

        return { success: true, message: 'Password reset successfully' };
    },

    // Require login - redirect if not logged in
    requireLogin() {
        const user = this.isLoggedIn();
        if (!user) {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
            return false;
        }
        return user;
    }
};

// Email Service
const EmailService = {
    init() {
        try {
            emailjs.init("YOUR_PUBLIC_KEY"); // Will be set up by user
        } catch (e) {
            console.log('EmailJS not configured');
        }
    },

    // Send password reset email
    sendPasswordResetEmail(email, username, resetLink) {
        const subject = encodeURIComponent('Trawish Cakes - Password Reset Request');
        const body = encodeURIComponent(`
Dear ${username},

You have requested to reset your password for your Trawish Cakes account.

Click the link below to reset your password:
${resetLink}

This link will expire in 1 hour.

If you did not request this, please ignore this email.

Best regards,
Trawish Cakes Team
        `);
        
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    },

    // Send order status email
    sendOrderStatusEmail(order, status) {
        const statusMessages = {
            1: 'Your order has been received and is being processed.',
            2: `Your invoice has been generated. Amount: ₹${order.invoiceAmount}. Please pay advance of ₹${order.advanceAmount} to proceed.`,
            3: 'Your advance payment has been received and your order is confirmed!',
            4: 'Your order is ready for pickup! 🎂',
            5: 'Your order has been delivered. Thank you for choosing Trawish Cakes!'
        };

        const subject = encodeURIComponent(`Trawish Cakes - Order ${order.orderId} Update`);
        const body = encodeURIComponent(`
Dear ${order.customerName},

${statusMessages[status]}

Order Details:
- Order ID: ${order.orderId}
- Cake Type: ${order.cakeType}
- Cake Weight: ${order.cakeWeight}
- Delivery Date: ${order.deliveryDate}

Thank you for choosing Trawish Cakes!

Best regards,
Trawish Cakes Team
        `);

        window.location.href = `mailto:${order.customerEmail}?subject=${subject}&body=${body}`;
    }
};

// Initialize email service
EmailService.init();

// Handle login page
document.addEventListener('DOMContentLoaded', function() {
    // Ensure DB is initialized
    if (typeof DB !== 'undefined' && DB.init) {
        DB.init();
    }
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (typeof Auth === 'undefined' || typeof DB === 'undefined') {
                if (typeof CustomModal !== 'undefined') {
                    CustomModal.alert('Error: Authentication system not loaded. Please refresh the page.');
                } else {
                    alert('Error: Authentication system not loaded. Please refresh the page.');
                }
                return;
            }
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('errorMessage');

            if (!username || !password) {
                errorMessage.textContent = 'Please fill in all fields';
                errorMessage.style.display = 'block';
                return;
            }

            try {
                const result = Auth.login(username, password);
                
                if (result.success) {
                    // Show success message
                    if (typeof showSuccessMessage === 'function') {
                        showSuccessMessage('🎉 Login successful! Redirecting...');
                    } else if (typeof CustomModal !== 'undefined') {
                        CustomModal.alert('🎉 Login successful! Redirecting...');
                    } else {
                        alert('🎉 Login successful! Redirecting...');
                    }
                    
                    // Redirect after short delay
                    setTimeout(function() {
                        const user = result.user;
                        if (user && user.isAdmin && user.username === 'kajal_tonu') {
                            const redirect = new URLSearchParams(window.location.search).get('redirect');
                            if (redirect && redirect.includes('admin.html')) {
                                window.location.href = redirect;
                            } else {
                                window.location.href = 'admin.html';
                            }
                        } else {
                            const redirect = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
                            window.location.href = redirect;
                        }
                    }, 1000);
                } else {
                    errorMessage.textContent = result.message;
                    errorMessage.style.display = 'block';
                }
            } catch (error) {
                console.error('Login error:', error);
                errorMessage.textContent = 'An error occurred. Please try again.';
                errorMessage.style.display = 'block';
            }
        });
    }

    // Handle signup page
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (typeof Auth === 'undefined' || typeof DB === 'undefined') {
                if (typeof CustomModal !== 'undefined') {
                    CustomModal.alert('Error: Authentication system not loaded. Please refresh the page.');
                } else {
                    alert('Error: Authentication system not loaded. Please refresh the page.');
                }
                return;
            }
            
            const formData = new FormData(e.target);
            const errorMessage = document.getElementById('errorMessage');
            
            const username = formData.get('username').trim();
            const email = formData.get('email').trim();
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');

            if (!username || !email || !password || !confirmPassword) {
                errorMessage.textContent = 'Please fill in all fields';
                errorMessage.style.display = 'block';
                return;
            }

            try {
                const result = Auth.register({
                    username: username,
                    email: email,
                    password: password,
                    confirmPassword: confirmPassword
                });

                if (result.success) {
                    // Show success message
                    if (typeof showSuccessMessage === 'function') {
                        showSuccessMessage('🎉 Account created successfully! Redirecting...');
                    } else if (typeof CustomModal !== 'undefined') {
                        CustomModal.alert('🎉 Account created successfully! Redirecting...');
                    } else {
                        alert('🎉 Account created successfully! Redirecting...');
                    }
                    
                    setTimeout(function() {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    errorMessage.textContent = result.message;
                    errorMessage.style.display = 'block';
                }
            } catch (error) {
                console.error('Signup error:', error);
                errorMessage.textContent = 'An error occurred. Please try again.';
                errorMessage.style.display = 'block';
            }
        });
    }
});

// Handle forgot password page
document.addEventListener('DOMContentLoaded', function() {
    // Ensure DB is initialized
    if (typeof DB !== 'undefined' && DB.init) {
        DB.init();
    }
    
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (typeof Auth === 'undefined' || typeof DB === 'undefined') {
                if (typeof CustomModal !== 'undefined') {
                    CustomModal.alert('Error: Authentication system not loaded. Please refresh the page.');
                } else {
                    alert('Error: Authentication system not loaded. Please refresh the page.');
                }
                return;
            }
            
            const email = document.getElementById('email').value.trim();
            const errorMessage = document.getElementById('errorMessage');
            const successMessage = document.getElementById('successMessage');

            if (!email) {
                errorMessage.textContent = 'Please enter your email address';
                errorMessage.style.display = 'block';
                return;
            }

            try {
                const result = Auth.requestPasswordReset(email);
                
                if (result.success) {
                    if (successMessage) {
                        successMessage.textContent = result.message;
                        successMessage.style.display = 'block';
                    }
                    if (errorMessage) {
                        errorMessage.style.display = 'none';
                    }
                } else {
                    if (errorMessage) {
                        errorMessage.textContent = result.message;
                        errorMessage.style.display = 'block';
                    }
                    if (successMessage) {
                        successMessage.style.display = 'none';
                    }
                }
            } catch (error) {
                console.error('Forgot password error:', error);
                if (errorMessage) {
                    errorMessage.textContent = 'An error occurred. Please try again.';
                    errorMessage.style.display = 'block';
                }
            }
        });
    }

    // Handle reset password page
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    if (resetPasswordForm) {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
            const errorMsg = document.getElementById('errorMessage');
            if (errorMsg) {
                errorMsg.textContent = 'Invalid reset link';
                errorMsg.style.display = 'block';
            }
        }

        resetPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (typeof Auth === 'undefined' || typeof DB === 'undefined') {
                if (typeof CustomModal !== 'undefined') {
                    CustomModal.alert('Error: Authentication system not loaded. Please refresh the page.');
                } else {
                    alert('Error: Authentication system not loaded. Please refresh the page.');
                }
                return;
            }
            
            const formData = new FormData(e.target);
            const errorMessage = document.getElementById('errorMessage');
            const successMessage = document.getElementById('successMessage');
            
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');

            if (!password || !confirmPassword) {
                if (errorMessage) {
                    errorMessage.textContent = 'Please fill in all fields';
                    errorMessage.style.display = 'block';
                }
                return;
            }

            try {
                const result = Auth.resetPassword(
                    token,
                    password,
                    confirmPassword
                );

                if (result.success) {
                    if (successMessage) {
                        successMessage.textContent = result.message + ' Redirecting to login...';
                        successMessage.style.display = 'block';
                    }
                    if (errorMessage) {
                        errorMessage.style.display = 'none';
                    }
                    setTimeout(function() {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    if (errorMessage) {
                        errorMessage.textContent = result.message;
                        errorMessage.style.display = 'block';
                    }
                    if (successMessage) {
                        successMessage.style.display = 'none';
                    }
                }
            } catch (error) {
                console.error('Reset password error:', error);
                if (errorMessage) {
                    errorMessage.textContent = 'An error occurred. Please try again.';
                    errorMessage.style.display = 'block';
                }
            }
        });
    }
});

// Check if user should be redirected (for admin access)
if (window.location.pathname.includes('admin.html')) {
    const user = Auth.isLoggedIn();
    if (!user || !user.isAdmin) {
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
    }
}

// Auto-redirect admin user to admin dashboard after login
if (window.location.pathname.includes('login.html') || window.location.pathname.includes('index.html')) {
    const user = Auth.isLoggedIn();
    if (user && user.isAdmin && window.location.pathname.includes('index.html')) {
        // Show admin link or redirect based on preference
        // For now, we'll let them stay on the site but can add a banner
    }
}

// Redirect admin user to admin page if they login with admin credentials
if (window.location.pathname.includes('login.html')) {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            // This is handled in the form submit above, but we add admin redirect here
            setTimeout(() => {
                const user = Auth.isLoggedIn();
                if (user && user.isAdmin && user.username === 'kajal_tonu') {
                    const redirect = new URLSearchParams(window.location.search).get('redirect');
                    if (!redirect || redirect.includes('admin.html')) {
                        window.location.href = 'admin.html';
                    }
                }
            }, 100);
        });
    }
}

