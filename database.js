// Database System using Firebase Firestore
// All data is centralized - accessible from any browser

const DB = {
    // Initialize database
    async init() {
        // Wait for Firebase to initialize
        if (!isFirebaseAvailable()) {
            // Retry after a short delay
            setTimeout(() => this.init(), 200);
            return;
        }
        
        // Create admin user if doesn't exist
        await this.createAdminUser();
    },

    // Create admin user if doesn't exist
    async createAdminUser() {
        if (!isFirebaseAvailable()) return;
        
        try {
            const db = getFirestore();
            const usersRef = db.collection('users');
            const adminSnapshot = await usersRef.where('username', '==', 'kajal_tonu').limit(1).get();
            
            if (adminSnapshot.empty) {
                // Admin user doesn't exist, create it
                await usersRef.add({
                    username: 'kajal_tonu',
                    password: 'chicku_ishi', // In production, this should be hashed
                    email: 'trawishcakes@gmail.com',
                    isAdmin: true,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log('✅ Admin user created');
            }
        } catch (error) {
            console.error('Error creating admin user:', error);
        }
    },

    // User Management - Firebase Auth handles authentication, this is for user data
    async getUsers() {
        if (!isFirebaseAvailable()) return [];
        
        try {
            const db = getFirestore();
            const snapshot = await db.collection('users').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting users:', error);
            return [];
        }
    },

    async getUserByUsername(username) {
        if (!isFirebaseAvailable()) return null;
        
        try {
            const db = getFirestore();
            const snapshot = await db.collection('users').where('username', '==', username).limit(1).get();
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting user by username:', error);
            return null;
        }
    },

    async getUserById(id) {
        if (!isFirebaseAvailable()) return null;
        
        try {
            const db = getFirestore();
            const doc = await db.collection('users').doc(id).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting user by id:', error);
            return null;
        }
    },

    async createUser(userData) {
        if (!isFirebaseAvailable()) {
            return { success: false, message: 'Database not available' };
        }
        
        try {
            const db = getFirestore();
            
            // Check if user exists
            const existingSnapshot = await db.collection('users')
                .where('username', '==', userData.username)
                .limit(1)
                .get();
            
            if (!existingSnapshot.empty) {
                return { success: false, message: 'Username already exists' };
            }
            
            const emailSnapshot = await db.collection('users')
                .where('email', '==', userData.email)
                .limit(1)
                .get();
            
            if (!emailSnapshot.empty) {
                return { success: false, message: 'Email already exists' };
            }

            // Create user in Firestore
            const docRef = await db.collection('users').add({
                username: userData.username,
                password: userData.password, // In production, hash this
                email: userData.email,
                isAdmin: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true, user: { id: docRef.id, ...userData, isAdmin: false } };
        } catch (error) {
            console.error('Error creating user:', error);
            return { success: false, message: error.message };
        }
    },

    async updateUserPassword(userId, newPassword) {
        if (!isFirebaseAvailable()) {
            return { success: false, message: 'Database not available' };
        }
        
        try {
            const db = getFirestore();
            await db.collection('users').doc(userId).update({
                password: newPassword, // In production, hash this
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating password:', error);
            return { success: false, message: error.message };
        }
    },

    // Order Management - ALL ORDERS FROM ALL USERS
    async getOrders() {
        if (!isFirebaseAvailable()) return [];
        
        try {
            const db = getFirestore();
            
            // Try with orderBy first
            try {
                const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (indexError) {
                // Fall back to getting all orders and sorting client-side
                console.warn('Order index not found, using fallback:', indexError);
                const snapshot = await db.collection('orders').get();
                const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // Sort by createdAt (handle server timestamps)
                allOrders.sort((a, b) => {
                    const dateA = a.createdAt ? (a.createdAt.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime()) : 0;
                    const dateB = b.createdAt ? (b.createdAt.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime()) : 0;
                    return dateB - dateA; // Descending order (newest first)
                });
                
                return allOrders;
            }
        } catch (error) {
            console.error('❌ Error getting orders:', error);
            console.error('❌ Error details:', error.message, error.code);
            console.error('❌ Error stack:', error.stack);
            return [];
        }
    },

    async getOrderById(orderId) {
        if (!isFirebaseAvailable()) return null;
        
        try {
            const db = getFirestore();
            // Try to find by orderId field (for backward compatibility)
            const snapshot = await db.collection('orders').where('orderId', '==', orderId).limit(1).get();
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return { id: doc.id, ...doc.data() };
            }
            // Try by document ID
            const doc = await db.collection('orders').doc(orderId).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting order by id:', error);
            return null;
        }
    },

    async getOrdersByUserId(userId) {
        if (!isFirebaseAvailable()) return [];
        
        try {
            const db = getFirestore();
            
            // First, try the query with orderBy (requires composite index)
            // If it fails, fall back to getting all orders and filtering client-side
            try {
                const snapshot = await db.collection('orders')
                    .where('userId', '==', userId)
                    .orderBy('createdAt', 'desc')
                    .get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (indexError) {
                // Composite index might not exist - fall back to client-side filtering
                console.warn('Composite index not found, using fallback query:', indexError);
                
                // Get all orders and filter by userId, then sort by createdAt
                const allOrdersSnapshot = await db.collection('orders').get();
                const allOrders = allOrdersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // Filter by userId (convert both to string to ensure match)
                const userOrders = allOrders.filter(order => String(order.userId) === String(userId));
                
                // Sort by createdAt (handle server timestamps)
                userOrders.sort((a, b) => {
                    const dateA = a.createdAt ? (a.createdAt.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime()) : 0;
                    const dateB = b.createdAt ? (b.createdAt.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime()) : 0;
                    return dateB - dateA; // Descending order (newest first)
                });
                
                console.log(`✅ Found ${userOrders.length} orders for user ${userId} (using fallback)`);
                return userOrders;
            }
        } catch (error) {
            console.error('Error getting orders by user id:', error);
            return [];
        }
    },

    async createOrder(orderData) {
        if (!isFirebaseAvailable()) {
            console.error('❌ Firebase not available for order creation');
            return null;
        }
        
        try {
            const db = getFirestore();
            
            // Ensure userId is a string for consistency
            const userId = String(orderData.userId || '');
            
            if (!userId) {
                console.error('❌ userId is missing in orderData');
                return null;
            }
            
            const newOrder = {
                orderId: orderData.orderId || `ORDER-${Date.now()}`,
                userId: userId, // Ensure string format
                orderType: orderData.orderType || 'CAKE', // CAKE or COOKIE/BROWNIE
                customerName: orderData.customerName || '',
                customerEmail: orderData.customerEmail || '',
                customerPhone: orderData.customerPhone || '',
                cakeType: orderData.cakeType || '',
                cakeWeight: orderData.cakeWeight || '',
                cookieType: orderData.cookieType || '',
                cookieQuantity: orderData.cookieQuantity || '',
                deliveryDate: orderData.deliveryDate || '',
                customization: orderData.customization || '',
                specialRequests: orderData.specialRequests || '',
                customSizeInput: orderData.customSizeInput || '',
                customDesignInput: orderData.customDesignInput || '',
                otherCakeInput: orderData.otherCakeInput || '',
                otherCookieInput: orderData.otherCookieInput || '',
                customQuantityInput: orderData.customQuantityInput || '',
                sampleImage: orderData.sampleImage || null,
                status: 1, // Order Requested
                invoiceAmount: null,
                advanceAmount: null,
                advancePaymentProof: null,
                rejectionReason: null,
                rating: null,
                ratingComment: null,
                ratingSubmittedAt: null,
                archived: false, // Orders are not archived by default
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            console.log('📦 Creating order in Firebase...');
            console.log('📋 Order data:', JSON.stringify(newOrder, null, 2));
            console.log('👤 User ID (type):', typeof userId, 'Value:', userId);
            
            // Add order to Firestore
            const docRef = await db.collection('orders').add(newOrder);
            
            console.log('✅ Order document created with ID:', docRef.id);
            
            // Wait a moment for Firestore to write, then fetch the document
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Get the created document to verify it was saved
            const createdDoc = await docRef.get();
            
            if (!createdDoc.exists) {
                console.error('❌ Created document does not exist!');
                return null;
            }
            
            const createdOrder = { 
                id: createdDoc.id, 
                ...createdDoc.data() 
            };
            
            console.log('✅ Order created and verified successfully!');
            console.log('📦 Order Document ID:', createdOrder.id);
            console.log('📦 Order OrderID:', createdOrder.orderId);
            console.log('👤 Order UserID:', createdOrder.userId);
            console.log('👤 Order UserID Type:', typeof createdOrder.userId);
            console.log('📅 Order CreatedAt:', createdOrder.createdAt);
            
            // Verify the order was saved correctly
            if (createdOrder.userId !== userId) {
                console.warn('⚠️ userId mismatch! Expected:', userId, 'Got:', createdOrder.userId);
            }
            
            return createdOrder;
        } catch (error) {
            console.error('❌ Error creating order:', error);
            console.error('❌ Error name:', error.name);
            console.error('❌ Error message:', error.message);
            console.error('❌ Error code:', error.code);
            console.error('❌ Error stack:', error.stack);
            return null;
        }
    },

    async updateOrderArchivedStatus(orderId, archived) {
        if (!isFirebaseAvailable()) {
            return { success: false, message: 'Database not available' };
        }
        
        try {
            const db = getFirestore();
            const orderDoc = await this.getOrderById(orderId);
            
            if (!orderDoc || !orderDoc.id) {
                return { success: false, message: 'Order not found' };
            }

            const updateData = {
                archived: archived === true,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('orders').doc(orderDoc.id).update(updateData);
            
            // Fetch updated order
            const updatedOrder = await this.getOrderById(orderId);
            
            console.log(`✅ Order ${orderId} ${archived ? 'archived' : 'unarchived'} successfully`);
            return { 
                success: true, 
                message: `Order ${archived ? 'archived' : 'unarchived'} successfully`,
                order: updatedOrder
            };
        } catch (error) {
            console.error('Error updating order archived status:', error);
            return { success: false, message: error.message || 'Failed to update order archived status' };
        }
    },

    async updateOrderStatus(orderId, status, additionalData = {}) {
        if (!isFirebaseAvailable()) {
            return { success: false, message: 'Database not available' };
        }
        
        try {
            const db = getFirestore();
            const orderDoc = await this.getOrderById(orderId);
            
            if (!orderDoc || !orderDoc.id) {
                return { success: false, message: 'Order not found' };
            }

            const updateData = {
                status: status,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                ...additionalData
            };

            await db.collection('orders').doc(orderDoc.id).update(updateData);
            
            // Fetch updated order
            const updatedDoc = await db.collection('orders').doc(orderDoc.id).get();
            return { success: true, order: { id: updatedDoc.id, ...updatedDoc.data() } };
        } catch (error) {
            console.error('Error updating order status:', error);
            return { success: false, message: error.message };
        }
    },

    async updateOrderInvoice(orderId, invoiceAmount) {
        return this.updateOrderStatus(orderId, 2, { 
            invoiceAmount: invoiceAmount, 
            advanceAmount: invoiceAmount / 4 
        });
    },

    async uploadPaymentProof(orderId, proofImage) {
        return this.updateOrderStatus(orderId, 2, { advancePaymentProof: proofImage });
    },

    async confirmAdvancePayment(orderId) {
        return this.updateOrderStatus(orderId, 3, {});
    },

    async markOrderReady(orderId) {
        return this.updateOrderStatus(orderId, 4, {});
    },

    async markOrderDelivered(orderId) {
        return this.updateOrderStatus(orderId, 5, {});
    },

    async rejectOrder(orderId, rejectionReason) {
        return this.updateOrderStatus(orderId, 0, { rejectionReason });
    },

    // Reset Token Management
    async createResetToken(email) {
        if (!isFirebaseAvailable()) return null;
        
        try {
            const db = getFirestore();
            const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
            const expiresAt = new Date(Date.now() + 3600000); // 1 hour
            
            await db.collection('reset_tokens').add({
                email,
                token,
                expiresAt: firebase.firestore.Timestamp.fromDate(expiresAt),
                used: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return token;
        } catch (error) {
            console.error('Error creating reset token:', error);
            return null;
        }
    },

    async validateResetToken(token) {
        if (!isFirebaseAvailable()) {
            return { valid: false, message: 'Database not available' };
        }
        
        try {
            const db = getFirestore();
            const snapshot = await db.collection('reset_tokens')
                .where('token', '==', token)
                .where('used', '==', false)
                .limit(1)
                .get();
            
            if (snapshot.empty) {
                return { valid: false, message: 'Invalid or expired token' };
            }

            const tokenData = snapshot.docs[0].data();
            const expiresAt = tokenData.expiresAt.toDate();
            
            if (expiresAt < new Date()) {
                return { valid: false, message: 'Token expired' };
            }

            return { valid: true, email: tokenData.email, tokenId: snapshot.docs[0].id };
        } catch (error) {
            console.error('Error validating reset token:', error);
            return { valid: false, message: error.message };
        }
    },

    async markTokenUsed(tokenId) {
        if (!isFirebaseAvailable()) return;
        
        try {
            const db = getFirestore();
            await db.collection('reset_tokens').doc(tokenId).update({ used: true });
        } catch (error) {
            console.error('Error marking token as used:', error);
        }
    },

    // Rating Management
    async submitRating(orderId, rating, comment) {
        if (!isFirebaseAvailable()) {
            return { success: false, message: 'Database not available' };
        }
        
        try {
            const db = getFirestore();
            const orderDoc = await this.getOrderById(orderId);
            
            if (!orderDoc || !orderDoc.id) {
                return { success: false, message: 'Order not found' };
            }

            await db.collection('orders').doc(orderDoc.id).update({
                rating: rating,
                ratingComment: comment || '',
                ratingSubmittedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Also store in ratings collection
            await db.collection('ratings').add({
                orderId: orderId,
                customerName: orderDoc.customerName,
                customerEmail: orderDoc.customerEmail,
                rating: rating,
                comment: comment || '',
                submittedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            const updatedDoc = await db.collection('orders').doc(orderDoc.id).get();
            return { success: true, order: { id: updatedDoc.id, ...updatedDoc.data() } };
        } catch (error) {
            console.error('Error submitting rating:', error);
            return { success: false, message: error.message };
        }
    },

    async getRatings() {
        if (!isFirebaseAvailable()) return [];
        
        try {
            const db = getFirestore();
            const snapshot = await db.collection('ratings').orderBy('submittedAt', 'desc').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting ratings:', error);
            return [];
        }
    },

    async getAverageRating() {
        if (!isFirebaseAvailable()) return 0;
        
        try {
            const ratings = await this.getRatings();
            if (ratings.length === 0) return 0;
            const sum = ratings.reduce((acc, r) => acc + (r.rating || 0), 0);
            return (sum / ratings.length).toFixed(1);
        } catch (error) {
            console.error('Error calculating average rating:', error);
            return 0;
        }
    },

    // Real-time listeners
    onOrdersUpdate(callback) {
        if (!isFirebaseAvailable()) {
            console.warn('⚠️ Firebase not available for orders listener');
            return () => {};
        }
        
        const db = getFirestore();
        
        console.log('👂 Setting up real-time listener for ALL orders (admin dashboard)...');
        
        try {
            const unsubscribe = db.collection('orders')
                .orderBy('createdAt', 'desc')
                .onSnapshot(
                    (snapshot) => {
                        const orders = snapshot.docs.map(doc => {
                            const data = doc.data();
                            return { 
                                id: doc.id, 
                                ...data,
                                userId: String(data.userId || '') // Ensure userId is string
                            };
                        });
                        console.log('📬 Admin real-time update: Received', orders.length, 'orders');
                        console.log('📦 Order IDs:', orders.map(o => o.id));
                        callback(orders);
                    },
                    (error) => {
                        console.error('❌ Error in admin orders listener:', error);
                        console.error('❌ Error code:', error.code);
                        console.error('❌ Error message:', error.message);
                        
                        // Fallback: Get all orders without orderBy
                        if (error.code === 'failed-precondition') {
                            console.warn('⚠️ Index missing, using fallback (no orderBy)');
                            db.collection('orders')
                                .onSnapshot(
                                    (snapshot) => {
                                        const allOrders = snapshot.docs.map(doc => {
                                            const data = doc.data();
                                            return { 
                                                id: doc.id, 
                                                ...data,
                                                userId: String(data.userId || '')
                                            };
                                        });
                                        
                                        // Sort client-side
                                        allOrders.sort((a, b) => {
                                            const dateA = a.createdAt ? (a.createdAt.toMillis ? a.createdAt.toMillis() : (a.createdAt.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime())) : 0;
                                            const dateB = b.createdAt ? (b.createdAt.toMillis ? b.createdAt.toMillis() : (b.createdAt.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt).getTime())) : 0;
                                            return dateB - dateA;
                                        });
                                        
                                        console.log('📬 Fallback admin listener: Received', allOrders.length, 'orders');
                                        callback(allOrders);
                                    },
                                    (err) => console.error('❌ Fallback listener error:', err)
                                );
                        }
                    }
                );
            
            return unsubscribe;
        } catch (error) {
            console.error('❌ Error setting up admin listener:', error);
            return () => {};
        }
    },

    onUserOrdersUpdate(userId, callback) {
        if (!isFirebaseAvailable()) {
            console.warn('⚠️ Firebase not available for user orders listener');
            return () => {};
        }
        
        const db = getFirestore();
        const userIdStr = String(userId); // Ensure string
        
        console.log('👂 Setting up real-time listener for user orders...');
        console.log('👤 Listening for userId:', userIdStr, '(type:', typeof userIdStr, ')');
        
        // Try with composite index first
        try {
            const unsubscribe = db.collection('orders')
                .where('userId', '==', userIdStr)
                .orderBy('createdAt', 'desc')
                .onSnapshot(
                    (snapshot) => {
                        const orders = snapshot.docs.map(doc => {
                            const data = doc.data();
                            return { 
                                id: doc.id, 
                                ...data,
                                userId: String(data.userId || '') // Ensure userId is string
                            };
                        });
                        console.log('📬 Real-time update: Received', orders.length, 'orders for user', userIdStr);
                        console.log('📦 Order IDs:', orders.map(o => o.id));
                        console.log('👤 Order UserIDs:', orders.map(o => o.userId));
                        callback(orders);
                    },
                    (error) => {
                        console.error('❌ Error in user orders listener:', error);
                        console.error('❌ Error code:', error.code);
                        
                        // If composite index error, fall back to client-side filtering
                        if (error.code === 'failed-precondition') {
                            console.warn('⚠️ Composite index missing, using fallback listener');
                            return this.onUserOrdersUpdateFallback(userIdStr, callback);
                        }
                    }
                );
            
            return unsubscribe;
        } catch (error) {
            console.error('❌ Error setting up listener:', error);
            // Fallback to client-side filtering
            return this.onUserOrdersUpdateFallback(userIdStr, callback);
        }
    },
    
    // Fallback listener that gets all orders and filters client-side
    onUserOrdersUpdateFallback(userId, callback) {
        if (!isFirebaseAvailable()) return () => {};
        
        const db = getFirestore();
        const userIdStr = String(userId);
        
        console.log('🔄 Using fallback listener (client-side filtering) for userId:', userIdStr);
        
        return db.collection('orders')
            .orderBy('createdAt', 'desc')
            .onSnapshot(
                (snapshot) => {
                    const allOrders = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return { 
                            id: doc.id, 
                            ...data,
                            userId: String(data.userId || '')
                        };
                    });
                    
                    // Filter by userId on client side
                    const userOrders = allOrders.filter(order => String(order.userId) === userIdStr);
                    
                    // Sort by createdAt (handle timestamps)
                    userOrders.sort((a, b) => {
                        const dateA = a.createdAt ? (a.createdAt.toMillis ? a.createdAt.toMillis() : (a.createdAt.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime())) : 0;
                        const dateB = b.createdAt ? (b.createdAt.toMillis ? b.createdAt.toMillis() : (b.createdAt.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt).getTime())) : 0;
                        return dateB - dateA; // Descending order
                    });
                    
                    console.log('📬 Fallback listener: Found', userOrders.length, 'orders for user', userIdStr);
                    callback(userOrders);
                },
                (error) => {
                    console.error('❌ Error in fallback listener:', error);
                    // Last resort: get all orders without orderBy
                    db.collection('orders')
                        .onSnapshot(
                            (snapshot) => {
                                const allOrders = snapshot.docs.map(doc => {
                                    const data = doc.data();
                                    return { 
                                        id: doc.id, 
                                        ...data,
                                        userId: String(data.userId || '')
                                    };
                                });
                                
                                const userOrders = allOrders.filter(order => String(order.userId) === userIdStr);
                                userOrders.sort((a, b) => {
                                    const dateA = a.createdAt ? (a.createdAt.toMillis ? a.createdAt.toMillis() : (a.createdAt.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime())) : 0;
                                    const dateB = b.createdAt ? (b.createdAt.toMillis ? b.createdAt.toMillis() : (b.createdAt.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt).getTime())) : 0;
                                    return dateB - dateA;
                                });
                                console.log('📬 Last resort listener: Found', userOrders.length, 'orders');
                                callback(userOrders);
                            },
                            (err) => console.error('❌ Last resort listener error:', err)
                        );
                }
            );
    },
    
    // Cleanup functions for deployment
    async clearAllOrders() {
        if (!isFirebaseAvailable()) {
            console.error('❌ Firebase not available');
            return { success: false, message: 'Firebase not available' };
        }
        
        try {
            const db = getFirestore();
            const snapshot = await db.collection('orders').get();
            
            const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
            await Promise.all(deletePromises);
            
            console.log('✅ All orders deleted:', snapshot.docs.length);
            return { success: true, deleted: snapshot.docs.length };
        } catch (error) {
            console.error('❌ Error clearing orders:', error);
            return { success: false, message: error.message };
        }
    },
    
    async clearAllUsersExceptAdmin() {
        if (!isFirebaseAvailable()) {
            console.error('❌ Firebase not available');
            return { success: false, message: 'Firebase not available' };
        }
        
        try {
            const db = getFirestore();
            const snapshot = await db.collection('users').get();
            
            let deleted = 0;
            let preserved = 0;
            const deletePromises = [];
            
            snapshot.docs.forEach(doc => {
                const userData = doc.data();
                // PROTECT ADMIN: Keep admin user by username OR isAdmin flag
                const isAdminUser = userData.username === 'kajal_tonu' || userData.isAdmin === true;
                
                if (isAdminUser) {
                    preserved++;
                    console.log('🔒 Preserving admin user:', userData.username, userData.email);
                } else {
                    deletePromises.push(doc.ref.delete());
                    deleted++;
                }
            });
            
            await Promise.all(deletePromises);
            
            console.log('✅ All non-admin users deleted:', deleted);
            console.log('🔒 Admin users preserved:', preserved);
            return { success: true, deleted, preserved };
        } catch (error) {
            console.error('❌ Error clearing users:', error);
            return { success: false, message: error.message };
        }
    },
    
    async clearAllResetTokens() {
        if (!isFirebaseAvailable()) {
            console.error('❌ Firebase not available');
            return { success: false, message: 'Firebase not available' };
        }
        
        try {
            const db = getFirestore();
            const snapshot = await db.collection('reset_tokens').get();
            
            const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
            await Promise.all(deletePromises);
            
            console.log('✅ All reset tokens deleted:', snapshot.docs.length);
            return { success: true, deleted: snapshot.docs.length };
        } catch (error) {
            console.error('❌ Error clearing reset tokens:', error);
            return { success: false, message: error.message };
        }
    },
    
    async clearAllRatings() {
        if (!isFirebaseAvailable()) {
            console.error('❌ Firebase not available');
            return { success: false, message: 'Firebase not available' };
        }
        
        try {
            const db = getFirestore();
            const snapshot = await db.collection('ratings').get();
            
            const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
            await Promise.all(deletePromises);
            
            console.log('✅ All ratings deleted:', snapshot.docs.length);
            return { success: true, deleted: snapshot.docs.length };
        } catch (error) {
            console.error('❌ Error clearing ratings:', error);
            return { success: false, message: error.message };
        }
    },
    
    // Clear everything except admin user (for deployment)
    async clearAllDataForDeployment() {
        console.log('🧹 Starting deployment cleanup...');
        
        const results = {
            orders: await this.clearAllOrders(),
            users: await this.clearAllUsersExceptAdmin(),
            tokens: await this.clearAllResetTokens(),
            ratings: await this.clearAllRatings()
        };
        
        console.log('✅ Deployment cleanup complete:', results);
        return results;
    }
};

// Initialize database when Firebase is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => DB.init(), 500);
    });
} else {
    setTimeout(() => DB.init(), 500);
}
