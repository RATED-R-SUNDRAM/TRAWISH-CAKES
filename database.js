// Database System using localStorage
// This simulates a database for users and orders

const DB = {
    // Initialize database
    init() {
        if (!localStorage.getItem('trawish_users')) {
            localStorage.setItem('trawish_users', JSON.stringify([]));
        }
        if (!localStorage.getItem('trawish_orders')) {
            localStorage.setItem('trawish_orders', JSON.stringify([]));
        }
        if (!localStorage.getItem('trawish_reset_tokens')) {
            localStorage.setItem('trawish_reset_tokens', JSON.stringify([]));
        }
        if (!localStorage.getItem('trawish_ratings')) {
            localStorage.setItem('trawish_ratings', JSON.stringify([]));
        }
        
        // Initialize admin user
        this.createAdminUser();
    },

    // Create admin user if doesn't exist
    createAdminUser() {
        const users = this.getUsers();
        const adminExists = users.some(u => u.username === 'kajal_tonu');
        
        if (!adminExists) {
            users.push({
                id: 'admin_' + Date.now(),
                username: 'kajal_tonu',
                password: 'chicku_ishi', // In production, this should be hashed
                email: 'ss6437p@gmail.com',
                isAdmin: true,
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('trawish_users', JSON.stringify(users));
        }
    },

    // User Management
    getUsers() {
        return JSON.parse(localStorage.getItem('trawish_users') || '[]');
    },

    getUserByUsername(username) {
        const users = this.getUsers();
        return users.find(u => u.username === username);
    },

    getUserById(id) {
        const users = this.getUsers();
        return users.find(u => u.id === id);
    },

    createUser(userData) {
        const users = this.getUsers();
        const userExists = users.some(u => u.username === userData.username || u.email === userData.email);
        
        if (userExists) {
            return { success: false, message: 'Username or email already exists' };
        }

        const newUser = {
            id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            username: userData.username,
            password: userData.password, // In production, hash this
            email: userData.email,
            isAdmin: false,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('trawish_users', JSON.stringify(users));
        return { success: true, user: newUser };
    },

    updateUserPassword(userId, newPassword) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return { success: false, message: 'User not found' };
        }

        users[userIndex].password = newPassword; // In production, hash this
        localStorage.setItem('trawish_users', JSON.stringify(users));
        return { success: true };
    },

    // Order Management
    getOrders() {
        return JSON.parse(localStorage.getItem('trawish_orders') || '[]');
    },

    getOrderById(orderId) {
        const orders = this.getOrders();
        return orders.find(o => o.orderId === orderId);
    },

    getOrdersByUserId(userId) {
        const orders = this.getOrders();
        // Ensure both are strings for comparison to avoid type mismatch
        const userIdStr = String(userId);
        return orders.filter(o => String(o.userId) === userIdStr).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    createOrder(orderData) {
        const orders = this.getOrders();
        const newOrder = {
            orderId: orderData.orderId,
            userId: orderData.userId,
            customerName: orderData.customerName,
            customerEmail: orderData.customerEmail,
            customerPhone: orderData.customerPhone,
            cakeType: orderData.cakeType,
            cakeWeight: orderData.cakeWeight,
            deliveryDate: orderData.deliveryDate,
            customization: orderData.customization || '',
            specialRequests: orderData.specialRequests || '',
            sampleImage: orderData.sampleImage || null,
            status: 1, // Order Requested
            invoiceAmount: null,
            advanceAmount: null,
            advancePaymentProof: null,
            rating: null,
            ratingComment: null,
            ratingSubmittedAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        orders.push(newOrder);
        localStorage.setItem('trawish_orders', JSON.stringify(orders));
        return newOrder;
    },

    updateOrderStatus(orderId, status, additionalData = {}) {
        const orders = this.getOrders();
        const orderIndex = orders.findIndex(o => o.orderId === orderId);
        
        if (orderIndex === -1) {
            return { success: false, message: 'Order not found' };
        }

        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = new Date().toISOString();
        
        // Update additional data
        Object.keys(additionalData).forEach(key => {
            orders[orderIndex][key] = additionalData[key];
        });

        localStorage.setItem('trawish_orders', JSON.stringify(orders));
        return { success: true, order: orders[orderIndex] };
    },

    updateOrderInvoice(orderId, invoiceAmount) {
        return this.updateOrderStatus(orderId, 2, { invoiceAmount, advanceAmount: invoiceAmount / 4 });
    },

    uploadPaymentProof(orderId, proofImage) {
        return this.updateOrderStatus(orderId, 2, { advancePaymentProof: proofImage });
    },

    confirmAdvancePayment(orderId) {
        return this.updateOrderStatus(orderId, 3, {});
    },

    markOrderReady(orderId) {
        return this.updateOrderStatus(orderId, 4, {});
    },

    markOrderDelivered(orderId) {
        return this.updateOrderStatus(orderId, 5, {});
    },

    rejectOrder(orderId, rejectionReason) {
        return this.updateOrderStatus(orderId, 0, { rejectionReason });
    },

    // Reset Token Management
    createResetToken(email) {
        const tokens = JSON.parse(localStorage.getItem('trawish_reset_tokens') || '[]');
        const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
        const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour
        
        tokens.push({
            email,
            token,
            expiresAt,
            used: false
        });
        
        localStorage.setItem('trawish_reset_tokens', JSON.stringify(tokens));
        return token;
    },

    validateResetToken(token) {
        const tokens = JSON.parse(localStorage.getItem('trawish_reset_tokens') || '[]');
        const tokenData = tokens.find(t => t.token === token && !t.used);
        
        if (!tokenData) {
            return { valid: false, message: 'Invalid or expired token' };
        }

        if (new Date(tokenData.expiresAt) < new Date()) {
            return { valid: false, message: 'Token expired' };
        }

        return { valid: true, email: tokenData.email };
    },

    markTokenUsed(token) {
        const tokens = JSON.parse(localStorage.getItem('trawish_reset_tokens') || '[]');
        const tokenIndex = tokens.findIndex(t => t.token === token);
        
        if (tokenIndex !== -1) {
            tokens[tokenIndex].used = true;
            localStorage.setItem('trawish_reset_tokens', JSON.stringify(tokens));
        }
    },

    // Rating Management
    submitRating(orderId, rating, comment) {
        const orders = this.getOrders();
        const orderIndex = orders.findIndex(o => o.orderId === orderId);
        
        if (orderIndex === -1) {
            return { success: false, message: 'Order not found' };
        }

        orders[orderIndex].rating = rating;
        orders[orderIndex].ratingComment = comment || '';
        orders[orderIndex].ratingSubmittedAt = new Date().toISOString();
        orders[orderIndex].updatedAt = new Date().toISOString();
        
        localStorage.setItem('trawish_orders', JSON.stringify(orders));
        
        // Also store in ratings collection
        const ratings = JSON.parse(localStorage.getItem('trawish_ratings') || '[]');
        ratings.push({
            orderId: orderId,
            customerName: orders[orderIndex].customerName,
            customerEmail: orders[orderIndex].customerEmail,
            rating: rating,
            comment: comment || '',
            submittedAt: new Date().toISOString()
        });
        localStorage.setItem('trawish_ratings', JSON.stringify(ratings));
        
        return { success: true, order: orders[orderIndex] };
    },

    getRatings() {
        return JSON.parse(localStorage.getItem('trawish_ratings') || '[]');
    },

    getAverageRating() {
        const ratings = this.getRatings();
        if (ratings.length === 0) return 0;
        const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
        return (sum / ratings.length).toFixed(1);
    }
};

// Initialize database on load
DB.init();

