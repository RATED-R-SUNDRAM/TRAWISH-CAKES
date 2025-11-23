// Admin Dashboard Functionality

let currentFilter = 'all';
let ordersUnsubscribe = null; // For real-time listener

document.addEventListener('DOMContentLoaded', async () => {
    // Wait for Firebase to initialize (longer delay to ensure Firebase is ready)
    setTimeout(async () => {
        console.log('🚀 Admin: Starting admin dashboard initialization...');
        console.log('🔍 Admin: Checking Firebase availability...');
        console.log('🔍 Admin: DB available?', typeof DB !== 'undefined');
        console.log('🔍 Admin: isFirebaseAvailable?', typeof isFirebaseAvailable !== 'undefined' ? isFirebaseAvailable() : 'function not defined');
        
        await loadOrders();
        await loadRatings();
    }, 1000); // Increased delay to ensure Firebase is fully initialized
});

function filterOrders(status) {
    currentFilter = status;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-status="${status}"]`)?.classList.add('active');
    
    // Reload orders with filter (real-time listener will handle updates)
    if (ordersUnsubscribe) {
        // Unsubscribe old listener
        ordersUnsubscribe();
    }
    loadOrders();
}

async function loadOrders() {
    const container = document.getElementById('ordersContainer');
    if (!container) {
        console.error('❌ ordersContainer not found in admin dashboard');
        return;
    }
    
    // Show loading state
    container.innerHTML = '<div class="no-orders">Loading orders... 🔄</div>';
    
    try {
        // First, try to load orders immediately (fallback)
        console.log('📋 Admin: Loading orders immediately...');
        console.log('🔍 Admin: DB available?', typeof DB !== 'undefined');
        console.log('🔍 Admin: DB.getOrders available?', typeof DB !== 'undefined' && typeof DB.getOrders === 'function');
        console.log('🔍 Admin: isFirebaseAvailable?', typeof isFirebaseAvailable !== 'undefined' ? isFirebaseAvailable() : 'function not defined');
        
        if (DB && DB.getOrders) {
            try {
                console.log('🔄 Admin: Calling DB.getOrders()...');
                const initialOrders = await DB.getOrders();
                console.log('✅ Admin: Initial load - Found', initialOrders.length, 'orders');
                console.log('📦 Admin: Order details:', initialOrders);
                
                // Check if initialOrders is valid
                if (!initialOrders || !Array.isArray(initialOrders)) {
                    console.warn('⚠️ Admin: Invalid orders data from initial load');
                    container.innerHTML = '<div class="no-orders">Error loading orders. Please refresh the page.</div>';
                    return;
                }
                
                console.log('📋 Admin: Initial orders loaded:', initialOrders.length);
                // Always call displayOrders - it will handle empty array correctly
                displayOrders(initialOrders);
            } catch (loadError) {
                console.error('❌ Error loading orders initially:', loadError);
                console.error('❌ Error name:', loadError.name);
                console.error('❌ Error message:', loadError.message);
                console.error('❌ Error stack:', loadError.stack);
                container.innerHTML = '<div class="no-orders">Error loading orders. Please check console for details.<br><button onclick="location.reload()" style="margin-top: 10px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">Refresh Page</button></div>';
            }
        } else {
            console.error('❌ Admin: DB or DB.getOrders not available!');
            console.error('❌ Admin: DB =', typeof DB);
            console.error('❌ Admin: DB.getOrders =', typeof DB !== 'undefined' ? typeof DB.getOrders : 'N/A');
            container.innerHTML = '<div class="no-orders">Database not available. Please refresh the page.<br><button onclick="location.reload()" style="margin-top: 10px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">Refresh Page</button></div>';
        }
        
        // Then set up real-time listener for future updates
        if (DB && DB.onOrdersUpdate && isFirebaseAvailable()) {
            // Unsubscribe previous listener if exists
            if (ordersUnsubscribe) {
                console.log('🔄 Admin: Unsubscribing old listener...');
                ordersUnsubscribe();
                ordersUnsubscribe = null;
            }
            
            // Set up real-time listener
            console.log('👂 Admin: Setting up real-time listener for all orders...');
            try {
                ordersUnsubscribe = DB.onOrdersUpdate((orders) => {
                    console.log('📬 Admin: Real-time update received', orders ? orders.length : 0, 'orders');
                    console.log('📦 Admin: Orders array:', orders);
                    
                    // Check if orders is valid array
                    if (!orders || !Array.isArray(orders)) {
                        console.warn('⚠️ Admin: Invalid orders data received');
                        container.innerHTML = '<div class="no-orders">Error loading orders. Please refresh the page.</div>';
                        return;
                    }
                    
                    // Only update if user is not currently typing in an input field
                    const activeElement = document.activeElement;
                    const isTypingInInvoiceInput = activeElement && 
                        activeElement.tagName === 'INPUT' && 
                        activeElement.id && 
                        activeElement.id.startsWith('invoiceAmount_') &&
                        activeElement === document.activeElement;
                    
                    if (isTypingInInvoiceInput) {
                        console.log('⏸️ Admin: Skipping update - user is typing in invoice input');
                        // Store orders for later update
                        window.pendingOrdersUpdate = orders;
                        return;
                    }
                    
                    // Always call displayOrders - it will handle empty array
                    displayOrders(orders);
                });
                
                // Also set up a periodic refresh as backup (every 5 seconds, less frequent to avoid interrupting typing)
                if (!window.adminOrdersRefreshInterval) {
                    window.adminOrdersRefreshInterval = setInterval(async () => {
                        // Only refresh if user is not typing
                        const activeElement = document.activeElement;
                        const isTypingInInvoiceInput = activeElement && 
                            activeElement.tagName === 'INPUT' && 
                            activeElement.id && 
                            activeElement.id.startsWith('invoiceAmount_');
                        
                        if (isTypingInInvoiceInput) {
                            console.log('⏸️ Admin: Skipping periodic refresh - user is typing');
                            return;
                        }
                        
                        console.log('🔄 Admin: Periodic refresh of orders...');
                        try {
                            if (DB && DB.getOrders) {
                                const refreshedOrders = await DB.getOrders();
                                console.log('📋 Admin: Periodic refresh - Found', refreshedOrders ? refreshedOrders.length : 0, 'orders');
                                // Always call displayOrders - it will handle empty array
                                if (refreshedOrders && Array.isArray(refreshedOrders)) {
                                    displayOrders(refreshedOrders);
                                }
                            }
                        } catch (refreshError) {
                            console.error('❌ Error in periodic refresh:', refreshError);
                        }
                    }, 5000); // Refresh every 5 seconds (less frequent to avoid interrupting typing)
                }
            } catch (listenerError) {
                console.error('❌ Error setting up real-time listener:', listenerError);
                // Continue with periodic refresh only
            }
        } else {
            console.warn('⚠️ Admin: Real-time listener not available, using periodic refresh only');
            // Set up periodic refresh only
            if (!window.adminOrdersRefreshInterval) {
                window.adminOrdersRefreshInterval = setInterval(async () => {
                    console.log('🔄 Admin: Periodic refresh (no listener)...');
                    try {
                        if (DB && DB.getOrders) {
                            const refreshedOrders = await DB.getOrders();
                            console.log('📋 Admin: Periodic refresh (fallback) - Found', refreshedOrders ? refreshedOrders.length : 0, 'orders');
                            // Always call displayOrders - it will handle empty array
                            if (refreshedOrders && Array.isArray(refreshedOrders)) {
                                displayOrders(refreshedOrders);
                            }
                        }
                    } catch (refreshError) {
                        console.error('❌ Error in periodic refresh:', refreshError);
                    }
                }, 2000); // Refresh every 2 seconds (more frequent without listener)
            }
        }
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        console.error('❌ Error stack:', error.stack);
        container.innerHTML = '<div class="no-orders">Error loading orders. Please refresh the page.<br><button onclick="location.reload()" style="margin-top: 10px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">Refresh Page</button></div>';
    }
}

function displayOrders(orders) {
    const container = document.getElementById('ordersContainer');
    if (!container) {
        console.error('❌ ordersContainer not found when trying to display orders');
        return;
    }
    
    // Validate orders array first
    if (!orders || !Array.isArray(orders)) {
        console.error('❌ Admin: Invalid orders data:', orders);
        container.innerHTML = '<div class="no-orders">Error loading orders. Please refresh the page.</div>';
        return;
    }
    
    console.log('📋 Admin: Displaying', orders.length, 'orders');
    
    // Check if orders array is empty BEFORE processing
    if (orders.length === 0) {
        console.log('📭 Admin: Orders array is empty');
        container.innerHTML = '<div class="no-orders">No orders found. Orders will appear here when customers place orders.</div>';
        return;
    }
    
    // Preserve input values before re-rendering
    const inputValues = {};
    const allInputs = container.querySelectorAll('input[type="number"][id^="invoiceAmount_"]');
    allInputs.forEach(input => {
        if (input.value && !input.disabled) {
            const orderId = input.id.replace('invoiceAmount_', '');
            inputValues[orderId] = input.value;
        }
    });
    
    // Apply filter
    let filteredOrders = orders;
    
    if (currentFilter === 'archived') {
        // Show only archived orders
        filteredOrders = orders.filter(order => order.archived === true);
        console.log('📦 Admin: Showing archived orders:', filteredOrders.length);
    } else if (currentFilter !== 'all') {
        // Filter by status AND exclude archived orders (unless viewing archived)
        const filterStatus = parseInt(currentFilter);
        filteredOrders = orders.filter(order => order.status === filterStatus && !order.archived);
        console.log('📊 Admin: After filter (' + currentFilter + '):', filteredOrders.length, 'orders');
    } else {
        // Show all non-archived orders
        filteredOrders = orders.filter(order => !order.archived);
        console.log('📊 Admin: Showing all non-archived orders:', filteredOrders.length);
    }
    
    // Convert Firebase timestamps to dates for sorting
    filteredOrders = filteredOrders.map(order => {
        if (order.createdAt && order.createdAt.toDate) {
            order.createdAt = order.createdAt.toDate().toISOString();
        } else if (order.createdAt && typeof order.createdAt === 'object') {
            // Firestore timestamp
            order.createdAt = order.createdAt.seconds ? new Date(order.createdAt.seconds * 1000).toISOString() : order.createdAt;
        }
        return order;
    });
    
    // Double-check filtered orders (after filter might have removed all)
    if (!filteredOrders || !Array.isArray(filteredOrders) || filteredOrders.length === 0) {
        console.log('📭 Admin: No orders after filtering');
        container.innerHTML = '<div class="no-orders">No orders found' + (currentFilter !== 'all' ? ' with the selected filter' : '') + '. Orders will appear here when customers place orders.</div>';
        return;
    }

    // Sort orders by creation date (newest first)
    const sortedOrders = filteredOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
    });

    container.innerHTML = sortedOrders.map(order => createOrderCard(order)).join('');
    
    // Restore input values after re-rendering
    Object.keys(inputValues).forEach(orderId => {
        const input = document.getElementById(`invoiceAmount_${orderId}`);
        if (input && !input.disabled) {
            input.value = inputValues[orderId];
            // Restore focus if this was the active element
            if (document.activeElement && document.activeElement.id === `invoiceAmount_${orderId}`) {
                setTimeout(() => input.focus(), 0);
            }
        }
    });
    
    // Attach event listeners
    attachEventListeners();
}

// Reload ratings when orders are reloaded (in case new rating was submitted)
function reloadRatings() {
    loadRatings();
}

function createOrderCard(order) {
    const statusText = getStatusText(order.status);
    const statusClass = `status-${order.status}`;
    
    return `
        <div class="order-card" data-order-id="${order.orderId}">
            <div class="order-header">
                <div class="order-id">Order: ${order.orderId}</div>
                <div class="order-status ${statusClass}">${statusText}</div>
            </div>
            
            <div class="order-details">
                <div class="detail-item">
                    <strong>Customer Name</strong>
                    ${order.customerName}
                </div>
                <div class="detail-item">
                    <strong>Email</strong>
                    ${order.customerEmail}
                </div>
                <div class="detail-item">
                    <strong>Phone</strong>
                    ${order.customerPhone}
                </div>
                <div class="detail-item">
                    <strong>${order.orderType === 'CAKE' ? 'Cake Type' : 'Cookie/Brownie Type'}</strong>
                    ${order.orderType === 'CAKE' ? (order.cakeType || 'N/A') : (order.cookieType || 'N/A')}
                    ${order.orderType === 'COOKIE/BROWNIE' && order.otherCookieInput ? `<br><small style="color: #666;">Custom: ${order.otherCookieInput}</small>` : ''}
                </div>
                <div class="detail-item">
                    <strong>${order.orderType === 'CAKE' ? 'Cake Weight' : 'Quantity'}</strong>
                    ${order.orderType === 'CAKE' ? (order.cakeWeight || 'N/A') : (order.cookieQuantity || 'N/A')}
                    ${order.orderType === 'CAKE' && order.customSizeInput ? `<br><small style="color: #666;">Custom: ${order.customSizeInput}</small>` : ''}
                    ${order.orderType === 'COOKIE/BROWNIE' && order.customQuantityInput ? `<br><small style="color: #666;">Custom: ${order.customQuantityInput}</small>` : ''}
                </div>
                ${order.orderType === 'COOKIE/BROWNIE' && order.otherCookieInput ? `
                <div class="detail-item">
                    <strong>Custom Cookie/Brownie Type</strong>
                    ${order.otherCookieInput}
                </div>
                ` : ''}
                <div class="detail-item">
                    <strong>Delivery Date</strong>
                    ${order.deliveryDate}
                </div>
            </div>
            
            ${order.customization ? `
                <div class="detail-item" style="margin-top: 15px;">
                    <strong>Customization</strong>
                    ${order.customization}
                </div>
            ` : ''}
            
            ${order.specialRequests ? `
                <div class="detail-item" style="margin-top: 15px;">
                    <strong>Special Requests</strong>
                    ${order.specialRequests}
                </div>
            ` : ''}
            
            ${order.sampleImage ? `
                <div class="detail-item" style="margin-top: 15px;">
                    <strong>Sample Image</strong>
                    <div style="margin-top: 10px;">
                        <img src="${order.sampleImage}" alt="Sample Image" style="max-width: 300px; max-height: 300px; border-radius: 10px; border: 2px solid #ddd; cursor: pointer;" onclick="window.open('${order.sampleImage}', '_blank')">
                    </div>
                </div>
            ` : ''}
            
            ${order.rating ? `
                <div class="detail-item" style="margin-top: 15px; background: #d1e7dd; padding: 15px; border-radius: 10px; border-left: 4px solid #198754;">
                    <strong style="color: #0f5132;">Customer Rating</strong>
                    <div style="color: #0f5132; margin-top: 5px;">
                        ${(() => {
                            const ratingValue = parseInt(order.rating) || 0;
                            console.log('⭐ Admin display - Order rating:', order.rating, 'Parsed:', ratingValue);
                            return '⭐'.repeat(ratingValue) + '☆'.repeat(5 - ratingValue) + ' (' + ratingValue + '/5)';
                        })()}
                    </div>
                    ${order.ratingComment ? `
                        <p style="color: #0f5132; margin: 10px 0 0 0; font-style: italic;">"${order.ratingComment}"</p>
                    ` : ''}
                </div>
            ` : ''}
            
            <div class="admin-actions">
                ${getAdminActions(order)}
            </div>
        </div>
    `;
}

function getStatusText(status) {
    const statuses = {
        0: 'Rejected',
        1: 'Order Requested',
        2: 'Invoice Generated',
        3: 'Advance Payment Received',
        4: 'Order Ready',
        5: 'Order Delivered'
    };
    return statuses[status] || 'Unknown';
}

function getAdminActions(order) {
    let html = '';
    
    // Archive/Unarchive button (available for all orders, shown at the top)
    if (order.archived) {
        html += `
            <div class="action-group" style="margin-bottom: 15px; padding: 15px; background: #f0f0f0; border-radius: 10px;">
                <button class="admin-btn" onclick="unarchiveOrder('${order.orderId}')" style="background: linear-gradient(135deg, #17a2b8, #138496); width: 100%;">
                    📤 Unarchive Order
                </button>
            </div>
        `;
    } else {
        html += `
            <div class="action-group" style="margin-bottom: 15px; padding: 15px; background: #f0f0f0; border-radius: 10px;">
                <button class="admin-btn" onclick="archiveOrder('${order.orderId}')" style="background: linear-gradient(135deg, #6c757d, #5a6268); width: 100%;">
                    📦 Archive Order
                </button>
            </div>
        `;
    }
    
    // If order is archived, don't show other actions (just archive button)
    if (order.archived) {
        return html;
    }
    
    // Show rejection reason if order is rejected
    if (order.status === 0) {
        html += `
            <div class="detail-item" style="background: #ffe5e5; border-left: 4px solid #dc3545;">
                <strong style="color: #dc3545;">Rejection Reason:</strong>
                <p>${order.rejectionReason || 'No reason provided'}</p>
            </div>
        `;
        return html;
    }
    
    if (order.status === 1) {
        // Order requested - generate invoice or reject
        // Check if invoice was already generated (status is 2 or higher)
        const isInvoiceGenerated = order.status >= 2 && order.invoiceAmount;
        
        html += `
            <div class="action-group">
                <label for="invoiceAmount_${order.orderId}">Generate Invoice (Amount in ₹)</label>
                <input type="number" id="invoiceAmount_${order.orderId}" placeholder="Enter total amount" min="0" step="0.01" required ${isInvoiceGenerated ? 'disabled style="opacity: 0.6; cursor: not-allowed;"' : ''}>
                <button class="admin-btn btn-generate-invoice" onclick="generateInvoice('${order.orderId}')" ${isInvoiceGenerated ? 'disabled style="opacity: 0.6; cursor: not-allowed;"' : ''}>
                    ${isInvoiceGenerated ? 'Invoice Already Generated' : 'Generate Invoice & Send Email'}
                </button>
                <button class="admin-btn" onclick="showRejectOrderModal('${order.orderId}')" style="background: linear-gradient(135deg, #dc3545, #c82333); margin-top: 10px;">
                    Reject Order
                </button>
            </div>
        `;
    }
    
    // Always show payment information if invoice is generated (status 2+)
    if (order.status >= 2 && order.invoiceAmount) {
        html += `
            <div class="detail-item" style="background: #fff3cd; border-left: 4px solid #ffc107;">
                <strong style="color: #856404;">💰 Payment Information</strong>
                <p style="color: #856404; margin: 5px 0;"><strong>Invoice Amount:</strong> ₹${order.invoiceAmount}</p>
                <p style="color: #856404; margin: 5px 0;"><strong>Advance Amount:</strong> ₹${order.advanceAmount || (order.invoiceAmount / 4).toFixed(2)}</p>
            </div>
        `;
    }
    
    if (order.status === 2) {
        // Invoice generated - wait for payment proof
        if (order.advancePaymentProof) {
            // Payment proof uploaded - verify and confirm
            html += `
                <div class="payment-proof" style="margin-top: 15px;">
                    <strong>Payment Proof Uploaded:</strong>
                    <div style="position: relative; display: inline-block; margin: 15px 0;">
                        <img src="${order.advancePaymentProof}" alt="Payment Proof" style="max-width: 300px; max-height: 300px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);" onerror="this.style.display='none'">
                        <a href="${order.advancePaymentProof}" download="payment-proof-${order.orderId}.png" class="admin-btn" style="position: absolute; bottom: 10px; right: 10px; background: linear-gradient(135deg, #17a2b8, #138496); color: white; padding: 10px 20px; text-decoration: none; border-radius: 15px; font-size: 0.9rem;">
                            📥 Download
                        </a>
                    </div>
                    <button class="admin-btn btn-confirm-payment" onclick="confirmAdvancePayment('${order.orderId}')" style="margin-top: 15px;">
                        Verify & Confirm Payment
                    </button>
                </div>
            `;
        } else {
            html += `
                <div class="detail-item">
                    <strong>Waiting for customer to upload payment proof...</strong>
                </div>
            `;
        }
    }
    
    // Always show payment proof if it exists (for status 3+)
    if (order.status >= 3 && order.advancePaymentProof) {
        html += `
            <div class="payment-proof" style="margin-top: 15px;">
                <strong>Payment Proof:</strong>
                <div style="position: relative; display: inline-block; margin: 15px 0;">
                    <img src="${order.advancePaymentProof}" alt="Payment Proof" style="max-width: 300px; max-height: 300px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);" onerror="this.style.display='none'">
                    <a href="${order.advancePaymentProof}" download="payment-proof-${order.orderId}.png" class="admin-btn" style="position: absolute; bottom: 10px; right: 10px; background: linear-gradient(135deg, #17a2b8, #138496); color: white; padding: 10px 20px; text-decoration: none; border-radius: 15px; font-size: 0.9rem;">
                        📥 Download
                    </a>
                </div>
            </div>
        `;
    }
    
    if (order.status === 3) {
        // Payment confirmed - mark order ready
        html += `
            <button class="admin-btn btn-order-ready" onclick="markOrderReady('${order.orderId}')">
                Mark Order as Ready
            </button>
        `;
    }
    
    if (order.status === 4) {
        // Order ready - mark as delivered
        html += `
            <button class="admin-btn btn-order-delivered" onclick="markOrderDelivered('${order.orderId}')">
                Mark Order as Delivered
            </button>
        `;
    }
    
    return html;
}

function attachEventListeners() {
    // Event listeners are attached via onclick handlers in the HTML
}

async function generateInvoice(orderId) {
    // If there's a pending update, apply it now before processing
    if (window.pendingOrdersUpdate) {
        console.log('📬 Admin: Applying pending orders update...');
        displayOrders(window.pendingOrdersUpdate);
        window.pendingOrdersUpdate = null;
    }
    
    const order = await DB.getOrderById(orderId);
    if (!order) {
        if (typeof CustomModal !== 'undefined') {
            CustomModal.alert('Order not found');
        } else {
            alert('Order not found');
        }
        return;
    }
    
    const invoiceInput = document.getElementById(`invoiceAmount_${orderId}`);
    const button = invoiceInput?.nextElementSibling;
    
    // Check if already submitted
    if (invoiceInput && invoiceInput.disabled) {
        if (typeof CustomModal !== 'undefined') {
            CustomModal.alert('Invoice has already been generated for this order.');
        } else {
            alert('Invoice has already been generated for this order.');
        }
        return;
    }
    
    const amount = parseFloat(invoiceInput.value);
    
    if (!amount || amount <= 0) {
        if (typeof CustomModal !== 'undefined') {
            CustomModal.alert('Please enter a valid amount');
        } else {
            alert('Please enter a valid amount');
        }
        return;
    }
    
    const advanceAmount = amount / 4;
    
    // Use custom modal instead of browser confirm
    if (typeof CustomModal !== 'undefined') {
        CustomModal.confirm(
            `Generate invoice for ₹${amount}? Advance payment will be ₹${advanceAmount}.`,
            async () => {
                // Disable input and button
                if (invoiceInput) {
                    invoiceInput.disabled = true;
                    invoiceInput.style.opacity = '0.6';
                    invoiceInput.style.cursor = 'not-allowed';
                }
                if (button) {
                    button.disabled = true;
                    button.style.opacity = '0.6';
                    button.style.cursor = 'not-allowed';
                    button.textContent = 'Invoice Generated';
                }
                
                const result = await DB.updateOrderInvoice(orderId, amount);
                
                if (result.success) {
                    // Send email to customer using Trawish Email Service
                    if (typeof TrawishEmailService !== 'undefined') {
                        await TrawishEmailService.sendInvoiceEmail(result.order);
                    } else if (typeof EmailService !== 'undefined') {
                        EmailService.sendOrderStatusEmail(result.order, 2);
                    }
                    
                    // Show success message
                    CustomModal.alert('Invoice generated and email sent to customer!', () => {
                        loadOrders();
                    });
                } else {
                    // Re-enable on error
                    if (invoiceInput) invoiceInput.disabled = false;
                    if (button) button.disabled = false;
                    
                    CustomModal.alert('Error generating invoice: ' + result.message);
                }
            },
            () => {
                // Cancelled - do nothing
            }
        );
    } else {
        // Fallback to browser confirm
        if (typeof CustomModal !== 'undefined') {
            CustomModal.confirm(
                `Generate invoice for ₹${amount}? Advance payment will be ₹${advanceAmount}.`,
                async () => {
                    if (invoiceInput) invoiceInput.disabled = true;
                    if (button) button.disabled = true;
                    
                    const result = await DB.updateOrderInvoice(orderId, amount);
                    
                    if (result.success) {
                        if (typeof TrawishEmailService !== 'undefined') {
                            TrawishEmailService.sendInvoiceEmail(result.order);
                        } else if (typeof EmailService !== 'undefined') {
                            EmailService.sendOrderStatusEmail(result.order, 2);
                        }
                        CustomModal.alert('Invoice generated and email sent to customer!', () => {
                            loadOrders();
                        });
                    } else {
                        if (invoiceInput) invoiceInput.disabled = false;
                        if (button) button.disabled = false;
                        CustomModal.alert('Error generating invoice: ' + result.message);
                    }
                },
                () => {}
            );
        } else {
            if (!confirm(`Generate invoice for ₹${amount}? Advance payment will be ₹${advanceAmount}.`)) {
                return;
            }
            
            if (invoiceInput) invoiceInput.disabled = true;
            if (button) button.disabled = true;
            
            const result = DB.updateOrderInvoice(orderId, amount);
            
            if (result.success) {
                if (typeof TrawishEmailService !== 'undefined') {
                    TrawishEmailService.sendInvoiceEmail(result.order);
                } else if (typeof EmailService !== 'undefined') {
                    EmailService.sendOrderStatusEmail(result.order, 2);
                }
                alert('Invoice generated and email sent to customer!');
                loadOrders();
            } else {
                if (invoiceInput) invoiceInput.disabled = false;
                if (button) button.disabled = false;
                alert('Error generating invoice: ' + result.message);
            }
        }
    }
}

async function confirmAdvancePayment(orderId) {
    const order = await DB.getOrderById(orderId);
    if (!order) {
        if (typeof CustomModal !== 'undefined') {
            CustomModal.alert('Order not found');
        } else {
            alert('Order not found');
        }
        return;
    }
    
    if (typeof CustomModal !== 'undefined') {
        CustomModal.confirm(
            'Confirm that the advance payment has been verified and received?',
            async () => {
                const result = await DB.confirmAdvancePayment(orderId);
                
                if (result.success) {
                    // Send email to customer using Trawish Email Service
                    if (typeof TrawishEmailService !== 'undefined') {
                        await TrawishEmailService.sendStatusUpdate(result.order, 3);
                        // Send notification to admin about payment received
                        await TrawishEmailService.sendPaymentReceivedNotification(result.order);
                    } else if (typeof EmailService !== 'undefined') {
                        EmailService.sendOrderStatusEmail(result.order, 3);
                    }
                    
                    CustomModal.alert('Payment confirmed! Customer and admin notified!', () => {
                        loadOrders();
                    });
                } else {
                    CustomModal.alert('Error confirming payment: ' + result.message);
                }
            }
        );
    } else {
        if (typeof CustomModal !== 'undefined') {
            CustomModal.confirm(
                'Confirm that the advance payment has been verified and received?',
                async () => {
                    const result = await DB.confirmAdvancePayment(orderId);
                    
                    if (result.success) {
                        if (typeof TrawishEmailService !== 'undefined') {
                            TrawishEmailService.sendStatusUpdate(result.order, 3);
                        } else if (typeof EmailService !== 'undefined') {
                            EmailService.sendOrderStatusEmail(result.order, 3);
                        }
                        CustomModal.alert('Payment confirmed and customer notified!', () => {
                            loadOrders();
                        });
                    } else {
                        CustomModal.alert('Error confirming payment: ' + result.message);
                    }
                },
                () => {}
            );
        } else {
            if (!confirm('Confirm that the advance payment has been verified and received?')) {
                return;
            }
            
            const result = DB.confirmAdvancePayment(orderId);
            
            if (result.success) {
                if (typeof TrawishEmailService !== 'undefined') {
                    TrawishEmailService.sendStatusUpdate(result.order, 3);
                } else if (typeof EmailService !== 'undefined') {
                    EmailService.sendOrderStatusEmail(result.order, 3);
                }
                alert('Payment confirmed and customer notified!');
                loadOrders();
            } else {
                alert('Error confirming payment: ' + result.message);
            }
        }
    }
}

async function markOrderReady(orderId) {
    const order = await DB.getOrderById(orderId);
    if (!order) {
        if (typeof CustomModal !== 'undefined') {
            CustomModal.alert('Order not found');
        } else {
            alert('Order not found');
        }
        return;
    }
    
    if (typeof CustomModal !== 'undefined') {
        CustomModal.confirm(
            'Mark this order as ready for pickup?',
            async () => {
                const result = await DB.markOrderReady(orderId);
                
                if (result.success) {
                    // Send email to customer using Trawish Email Service
                    if (typeof TrawishEmailService !== 'undefined') {
                        await TrawishEmailService.sendStatusUpdate(result.order, 4);
                    } else if (typeof EmailService !== 'undefined') {
                        EmailService.sendOrderStatusEmail(result.order, 4);
                    }
                    
                    CustomModal.alert('Order marked as ready and customer notified!', () => {
                        loadOrders();
                    });
                } else {
                    CustomModal.alert('Error marking order ready: ' + result.message);
                }
            }
        );
    } else {
        if (typeof CustomModal !== 'undefined') {
            CustomModal.confirm(
                'Mark this order as ready for pickup?',
                async () => {
                    const result = await DB.markOrderReady(orderId);
                    
                    if (result.success) {
                        if (typeof TrawishEmailService !== 'undefined') {
                            TrawishEmailService.sendStatusUpdate(result.order, 4);
                        } else if (typeof EmailService !== 'undefined') {
                            EmailService.sendOrderStatusEmail(result.order, 4);
                        }
                        CustomModal.alert('Order marked as ready and customer notified!', () => {
                            loadOrders();
                        });
                    } else {
                        CustomModal.alert('Error marking order ready: ' + result.message);
                    }
                },
                () => {}
            );
        } else {
            if (!confirm('Mark this order as ready for pickup?')) {
                return;
            }
            
            const result = DB.markOrderReady(orderId);
            
            if (result.success) {
                if (typeof TrawishEmailService !== 'undefined') {
                    TrawishEmailService.sendStatusUpdate(result.order, 4);
                } else if (typeof EmailService !== 'undefined') {
                    EmailService.sendOrderStatusEmail(result.order, 4);
                }
                alert('Order marked as ready and customer notified!');
                loadOrders();
            } else {
                alert('Error marking order ready: ' + result.message);
            }
        }
    }
}

async function markOrderDelivered(orderId) {
    const order = await DB.getOrderById(orderId);
    if (!order) {
        if (typeof CustomModal !== 'undefined') {
            CustomModal.alert('Order not found');
        } else {
            alert('Order not found');
        }
        return;
    }
    
    if (typeof CustomModal !== 'undefined') {
        CustomModal.confirm(
            'Mark this order as delivered?',
            async () => {
                const result = await DB.markOrderDelivered(orderId);
                
                if (result.success) {
                    // Send email to customer using Trawish Email Service
                    if (typeof TrawishEmailService !== 'undefined') {
                        await TrawishEmailService.sendStatusUpdate(result.order, 5);
                    } else if (typeof EmailService !== 'undefined') {
                        EmailService.sendOrderStatusEmail(result.order, 5);
                    }
                    
                    CustomModal.alert('Order marked as delivered and customer notified!', () => {
                        loadOrders();
                    });
                } else {
                    CustomModal.alert('Error marking order delivered: ' + result.message);
                }
            }
        );
    } else {
        if (typeof CustomModal !== 'undefined') {
            CustomModal.confirm(
                'Mark this order as delivered?',
                async () => {
                    const result = await DB.markOrderDelivered(orderId);
                    
                    if (result.success) {
                        if (typeof TrawishEmailService !== 'undefined') {
                            TrawishEmailService.sendStatusUpdate(result.order, 5);
                        } else if (typeof EmailService !== 'undefined') {
                            EmailService.sendOrderStatusEmail(result.order, 5);
                        }
                        CustomModal.alert('Order marked as delivered and customer notified!', () => {
                            loadOrders();
                        });
                    } else {
                        CustomModal.alert('Error marking order delivered: ' + result.message);
                    }
                },
                () => {}
            );
        } else {
            if (!confirm('Mark this order as delivered?')) {
                return;
            }
            
            const result = DB.markOrderDelivered(orderId);
            
            if (result.success) {
                if (typeof TrawishEmailService !== 'undefined') {
                    TrawishEmailService.sendStatusUpdate(result.order, 5);
                } else if (typeof EmailService !== 'undefined') {
                    EmailService.sendOrderStatusEmail(result.order, 5);
                }
                alert('Order marked as delivered and customer notified!');
                loadOrders();
            } else {
                alert('Error marking order delivered: ' + result.message);
            }
        }
    }
}

async function archiveOrder(orderId) {
    const order = await DB.getOrderById(orderId);
    if (!order) {
        if (typeof CustomModal !== 'undefined') {
            CustomModal.alert('Order not found');
        } else {
            alert('Order not found');
        }
        return;
    }
    
    if (typeof CustomModal !== 'undefined') {
        CustomModal.confirm(
            'Archive this order? It will be hidden from the main view but can be accessed from the Archived section.',
            async () => {
                try {
                    const result = await DB.updateOrderArchivedStatus(orderId, true);
                    
                    if (result.success) {
                        CustomModal.alert('Order archived successfully!', () => {
                            loadOrders();
                        });
                    } else {
                        CustomModal.alert('Error archiving order: ' + result.message);
                    }
                } catch (error) {
                    console.error('Error archiving order:', error);
                    CustomModal.alert('Error archiving order. Please try again.');
                }
            }
        );
    } else {
        if (!confirm('Archive this order? It will be hidden from the main view but can be accessed from the Archived section.')) {
            return;
        }
        
        const result = await DB.updateOrderArchivedStatus(orderId, true);
        
        if (result.success) {
            alert('Order archived successfully!');
            loadOrders();
        } else {
            alert('Error archiving order: ' + result.message);
        }
    }
}

async function unarchiveOrder(orderId) {
    const order = await DB.getOrderById(orderId);
    if (!order) {
        if (typeof CustomModal !== 'undefined') {
            CustomModal.alert('Order not found');
        } else {
            alert('Order not found');
        }
        return;
    }
    
    if (typeof CustomModal !== 'undefined') {
        CustomModal.confirm(
            'Unarchive this order? It will be visible in the main view again.',
            async () => {
                try {
                    const result = await DB.updateOrderArchivedStatus(orderId, false);
                    
                    if (result.success) {
                        CustomModal.alert('Order unarchived successfully!', () => {
                            loadOrders();
                        });
                    } else {
                        CustomModal.alert('Error unarchiving order: ' + result.message);
                    }
                } catch (error) {
                    console.error('Error unarchiving order:', error);
                    CustomModal.alert('Error unarchiving order. Please try again.');
                }
            }
        );
    } else {
        if (!confirm('Unarchive this order? It will be visible in the main view again.')) {
            return;
        }
        
        const result = await DB.updateOrderArchivedStatus(orderId, false);
        
        if (result.success) {
            alert('Order unarchived successfully!');
            loadOrders();
        } else {
            alert('Error unarchiving order: ' + result.message);
        }
    }
}

async function showRejectOrderModal(orderId) {
    const order = await DB.getOrderById(orderId);
    if (!order) {
        if (typeof CustomModal !== 'undefined') {
            CustomModal.alert('Order not found');
        } else {
            alert('Order not found');
        }
        return;
    }
    
    // Create modal for rejection reason
    const modal = document.createElement('div');
    modal.className = 'custom-modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(5px);
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        border-radius: 30px;
        padding: 40px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;
    
    modalContent.innerHTML = `
        <h2 style="color: #dc3545; margin-bottom: 20px;">Reject Order</h2>
        <p style="margin-bottom: 15px;">Please provide a reason for rejecting this order:</p>
        <textarea id="rejectionReason" placeholder="Enter rejection reason..." style="width: 100%; min-height: 100px; padding: 15px; border: 2px solid #e0e0e0; border-radius: 10px; font-family: inherit; font-size: 1rem; resize: vertical;" required></textarea>
        <div style="display: flex; gap: 15px; margin-top: 20px; justify-content: flex-end;">
            <button id="cancelReject" style="padding: 12px 30px; background: #e0e0e0; color: #333; border: none; border-radius: 25px; font-weight: 600; cursor: pointer;">Cancel</button>
            <button id="confirmReject" style="padding: 12px 30px; background: linear-gradient(135deg, #dc3545, #c82333); color: white; border: none; border-radius: 25px; font-weight: 600; cursor: pointer;">Reject Order</button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    const closeModal = () => {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    };
    
    document.getElementById('cancelReject').onclick = closeModal;
    document.getElementById('confirmReject').onclick = async () => {
        const reason = document.getElementById('rejectionReason').value.trim();
        if (!reason) {
            if (typeof CustomModal !== 'undefined') {
                CustomModal.alert('Please provide a rejection reason');
            } else {
                alert('Please provide a rejection reason');
            }
            return;
        }
        
        const result = await DB.rejectOrder(orderId, reason);
        if (result.success) {
            // Send rejection email
            if (typeof TrawishEmailService !== 'undefined') {
                await TrawishEmailService.sendRejectionEmail(result.order);
            }
            
            closeModal();
            if (typeof CustomModal !== 'undefined') {
                CustomModal.alert('Order rejected and customer notified!', () => {
                    loadOrders();
                });
            } else {
                alert('Order rejected and customer notified!');
                loadOrders();
            }
        } else {
            if (typeof CustomModal !== 'undefined') {
                CustomModal.alert('Error rejecting order: ' + result.message);
            } else {
                alert('Error rejecting order: ' + result.message);
            }
        }
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
}

// Load and display ratings
async function loadRatings() {
    const ratings = await DB.getRatings();
    const container = document.getElementById('ratingsContainer');
    
    if (!container) return;
    
    if (ratings.length === 0) {
        container.innerHTML = '<div class="no-ratings">No ratings yet. Ratings will appear here when customers rate their orders.</div>';
        return;
    }
    
    // Sort by most recent first
    const sortedRatings = ratings.map(rating => {
        // Convert Firestore timestamp if needed
        if (rating.submittedAt && rating.submittedAt.toDate) {
            rating.submittedAt = rating.submittedAt.toDate().toISOString();
        } else if (rating.submittedAt && typeof rating.submittedAt === 'object') {
            rating.submittedAt = rating.submittedAt.seconds ? new Date(rating.submittedAt.seconds * 1000).toISOString() : rating.submittedAt;
        }
        return rating;
    }).sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
    
    // Calculate average rating
    const avgRating = await DB.getAverageRating();
    
    // Get order data for each rating (non-blocking)
    const ratingCards = await Promise.all(sortedRatings.map(async rating => {
        const order = await DB.getOrderById(rating.orderId);
        return createRatingCard(rating, order);
    }));
    
    container.innerHTML = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
            <h3 style="margin: 0 0 10px 0;">Average Rating</h3>
            <div style="font-size: 48px; font-weight: bold;">${avgRating}</div>
            <div style="font-size: 24px; margin-top: 5px;">${'⭐'.repeat(Math.round(parseFloat(avgRating)))}</div>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Based on ${ratings.length} ${ratings.length === 1 ? 'rating' : 'ratings'}</p>
        </div>
        <div style="display: grid; gap: 20px;">
            ${ratingCards.join('')}
        </div>
    `;
}

function createRatingCard(rating, order = null) {
    const date = new Date(rating.submittedAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    return `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #667eea;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                <div>
                    <h4 style="margin: 0 0 5px 0; color: #333;">${rating.customerName}</h4>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">Order: ${rating.orderId}</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 24px; color: #ffc107;">${'⭐'.repeat(parseInt(rating.rating) || 0)}${'☆'.repeat(5 - (parseInt(rating.rating) || 0))}</div>
                    <p style="margin: 5px 0 0 0; color: #666; font-size: 0.85rem;">${date}</p>
                </div>
            </div>
            ${rating.comment ? `
                <div style="background: white; padding: 15px; border-radius: 5px; margin-top: 10px;">
                    <p style="margin: 0; color: #555; font-style: italic;">"${rating.comment}"</p>
                </div>
            ` : ''}
            ${order ? `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
                    <p style="margin: 5px 0; color: #666; font-size: 0.9rem;">
                        <strong>${order.orderType === 'CAKE' ? 'Cake:' : 'Cookie/Brownie:'}</strong> 
                        ${order.orderType === 'CAKE' ? `${order.cakeType || 'N/A'} - ${order.cakeWeight || 'N/A'}` : `${order.cookieType || 'N/A'} - ${order.cookieQuantity || 'N/A'}`}
                    </p>
                </div>
            ` : ''}
        </div>
    `;
}

