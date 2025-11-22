// Authentication System using Firebase Auth + Firestore
// Users can log in from any browser and see their orders

const Auth = {
    currentUser: null,
    
    // Check if user is logged in
    isLoggedIn() {
        // First check if we have a cached currentUser
        if (this.currentUser) {
            // Verify it still exists in sessionStorage
            const stored = sessionStorage.getItem('trawish_current_user');
            if (stored) {
                return this.currentUser;
            } else {
                // SessionStorage was cleared, clear cache too
                this.currentUser = null;
            }
        }
        
        // Check sessionStorage (primary method for username/password auth)
        const userData = sessionStorage.getItem('trawish_current_user');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                return this.currentUser;
            } catch (e) {
                console.error('Error parsing user data:', e);
                sessionStorage.removeItem('trawish_current_user');
                this.currentUser = null;
                return null;
            }
        }
        
        // Optional: Check Firebase Auth (if using Firebase Auth)
        const auth = getAuth();
        if (auth && auth.currentUser) {
            // If Firebase Auth user exists, sync with sessionStorage
            // This is for future Firebase Auth integration
        }
        
        return null;
    },

    // Login user (username/password for admin compatibility)
    async login(username, password) {
        try {
            // First try Firebase Auth (if email is used)
            if (username.includes('@')) {
                const auth = getAuth();
                if (auth) {
                    try {
                        await auth.signInWithEmailAndPassword(username, password);
                        const user = auth.currentUser;
                        if (user) {
                            // Get user data from Firestore
                            const db = getFirestore();
                            const userSnapshot = await db.collection('users')
                                .where('email', '==', username)
                                .limit(1)
                                .get();
                            
                            if (!userSnapshot.empty) {
                                const userData = { id: userSnapshot.docs[0].id, ...userSnapshot.docs[0].data() };
                                this.currentUser = {
                                    id: userData.id,
                                    username: userData.username,
                                    email: userData.email,
                                    isAdmin: userData.isAdmin || false
                                };
                                sessionStorage.setItem('trawish_current_user', JSON.stringify(this.currentUser));
                                return { success: true, user: this.currentUser };
                            }
                        }
                    } catch (error) {
                        // Fall through to username/password auth
                    }
                }
            }
            
            // Username/password auth (for admin and existing users)
            const user = await DB.getUserByUsername(username);
            
            if (!user) {
                return { success: false, message: 'Invalid username or password' };
            }

            if (user.password !== password) {
                return { success: false, message: 'Invalid username or password' };
            }

            // Store current user in sessionStorage
            const userData = {
                id: user.id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin || false
            };
            
            this.currentUser = userData;
            sessionStorage.setItem('trawish_current_user', JSON.stringify(userData));
            
            return { success: true, user: userData };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.message || 'Login failed' };
        }
    },

    // Logout user
    logout() {
        const auth = getAuth();
        if (auth && auth.currentUser) {
            auth.signOut();
        }
        
        sessionStorage.removeItem('trawish_current_user');
        this.currentUser = null;
        window.location.href = 'index.html';
    },

    // Register new user
    async register(userData) {
        if (userData.password !== userData.confirmPassword) {
            return { success: false, message: 'Passwords do not match' };
        }

        if (userData.password.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters' };
        }

        const result = await DB.createUser({
            username: userData.username,
            email: userData.email,
            password: userData.password
        });

        if (result.success) {
            // Auto login after registration
            return await this.login(userData.username, userData.password);
        }

        return result;
    },

    // Request password reset
    async requestPasswordReset(email) {
        try {
            const user = await DB.getUsers();
            const foundUser = user.find(u => u.email === email);
            
            if (!foundUser) {
                // Don't reveal if email exists for security
                return { success: true, message: 'If the email exists, a reset link has been sent' };
            }

            const token = await DB.createResetToken(email);
            if (!token) {
                return { success: false, message: 'Failed to create reset token' };
            }
            
            const resetLink = `${window.location.origin}/forgot-password.html?token=${token}`;

            // Send email with reset link
            if (typeof TrawishEmailService !== 'undefined') {
                const emailResult = await TrawishEmailService.sendPasswordResetEmail(email, foundUser.username, resetLink);
                if (!emailResult.success) {
                    console.error('❌ Failed to send password reset email:', emailResult.message);
                    return { success: false, message: 'Failed to send reset email. Please try again later.' };
                }
            } else {
                console.error('❌ TrawishEmailService not available');
                return { success: false, message: 'Email service not available. Please contact support.' };
            }

            return { success: true, message: 'Password reset link has been sent to your email' };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, message: error.message || 'Failed to send reset email' };
        }
    },

    // Reset password
    async resetPassword(token, newPassword, confirmPassword) {
        if (newPassword !== confirmPassword) {
            return { success: false, message: 'Passwords do not match' };
        }

        if (newPassword.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters' };
        }

        const tokenValidation = await DB.validateResetToken(token);
        
        if (!tokenValidation.valid) {
            return { success: false, message: tokenValidation.message };
        }

        const users = await DB.getUsers();
        const user = users.find(u => u.email === tokenValidation.email);
        
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        const result = await DB.updateUserPassword(user.id, newPassword);
        
        if (result.success) {
            // Mark token as used
            if (tokenValidation.tokenId) {
                await DB.markTokenUsed(tokenValidation.tokenId);
            }
            
            return { success: true, message: 'Password reset successfully' };
        }

        return result;
    }
};

// Initialize auth state listener when Firebase is ready
// NOTE: We use username/password auth, not Firebase Auth, so we preserve sessionStorage
// Only sync Firebase Auth if a user is actually logged in via Firebase Auth
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            // Restore user from sessionStorage first
            const storedUser = sessionStorage.getItem('trawish_current_user');
            if (storedUser) {
                try {
                    Auth.currentUser = JSON.parse(storedUser);
                    console.log('✅ User session restored from sessionStorage');
                } catch (e) {
                    console.error('Error parsing stored user:', e);
                }
            }
            
            // Set up Firebase Auth listener (optional, for future Firebase Auth integration)
            const auth = getAuth();
            if (auth) {
                auth.onAuthStateChanged((user) => {
                    if (user) {
                        // User signed in via Firebase Auth - sync with Firestore
                        DB.getUsers().then(users => {
                            const userData = users.find(u => u.email === user.email);
                            if (userData) {
                                Auth.currentUser = {
                                    id: userData.id,
                                    username: userData.username,
                                    email: userData.email,
                                    isAdmin: userData.isAdmin || false
                                };
                                sessionStorage.setItem('trawish_current_user', JSON.stringify(Auth.currentUser));
                            }
                        });
                    }
                    // Don't clear sessionStorage when Firebase Auth is null
                    // We're using username/password auth, not Firebase Auth
                    // Only clear if user explicitly signs out via Firebase Auth
                });
            }
        }, 500);
    });
} else {
    setTimeout(() => {
        // Restore user from sessionStorage first
        const storedUser = sessionStorage.getItem('trawish_current_user');
        if (storedUser) {
            try {
                Auth.currentUser = JSON.parse(storedUser);
                console.log('✅ User session restored from sessionStorage');
            } catch (e) {
                console.error('Error parsing stored user:', e);
            }
        }
        
        // Set up Firebase Auth listener (optional)
        const auth = getAuth();
        if (auth) {
            auth.onAuthStateChanged((user) => {
                if (user) {
                    DB.getUsers().then(users => {
                        const userData = users.find(u => u.email === user.email);
                        if (userData) {
                            Auth.currentUser = {
                                id: userData.id,
                                username: userData.username,
                                email: userData.email,
                                isAdmin: userData.isAdmin || false
                            };
                            sessionStorage.setItem('trawish_current_user', JSON.stringify(Auth.currentUser));
                        }
                    });
                }
                // Don't clear sessionStorage - we use username/password auth
            });
        }
    }, 500);
}
