// Admin Dashboard Functionality

let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    loadRatings();
});

function filterOrders(status) {
    currentFilter = status;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-status="${status}"]`)?.classList.add('active');
    
    // Reload orders with filter
    loadOrders();
}

function loadOrders() {
    let orders = DB.getOrders();
    const container = document.getElementById('ordersContainer');
    
    // Apply filter
    if (currentFilter !== 'all') {
        const filterStatus = parseInt(currentFilter);
        orders = orders.filter(order => order.status === filterStatus);
    }
    
    if (orders.length === 0) {
        container.innerHTML = '<div class="no-orders">No orders found' + (currentFilter !== 'all' ? ' with the selected filter' : '') + '. Orders will appear here when customers place them.</div>';
        return;
    }

    // Sort orders by creation date (newest first)
    const sortedOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    container.innerHTML = sortedOrders.map(order => createOrderCard(order)).join('');
    
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
                    <strong>Cake Type</strong>
                    ${order.cakeType}
                </div>
                <div class="detail-item">
                    <strong>Cake Weight</strong>
                    ${order.cakeWeight}
                </div>
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
                        ${'⭐'.repeat(order.rating)}${'☆'.repeat(5 - order.rating)} (${order.rating}/5)
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
    
    if (order.status === 2) {
        // Invoice generated - wait for payment proof
        html += `
            <div class="detail-item">
                <strong>Invoice Amount:</strong> ₹${order.invoiceAmount}
            </div>
            <div class="detail-item">
                <strong>Advance Amount:</strong> ₹${order.advanceAmount}
            </div>
        `;
        
        if (order.advancePaymentProof) {
            // Payment proof uploaded - verify and confirm
            html += `
                <div class="payment-proof">
                    <strong>Payment Proof Uploaded:</strong>
                    <div style="position: relative; display: inline-block; margin: 15px 0;">
                        <img src="${order.advancePaymentProof}" alt="Payment Proof" style="max-width: 100%; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);" onerror="this.style.display='none'">
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

function generateInvoice(orderId) {
    const order = DB.getOrderById(orderId);
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
                
                const result = DB.updateOrderInvoice(orderId, amount);
                
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
                () => {
                    if (invoiceInput) invoiceInput.disabled = true;
                    if (button) button.disabled = true;
                    
                    const result = DB.updateOrderInvoice(orderId, amount);
                    
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

function confirmAdvancePayment(orderId) {
    const order = DB.getOrderById(orderId);
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
                const result = DB.confirmAdvancePayment(orderId);
                
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
                () => {
                    const result = DB.confirmAdvancePayment(orderId);
                    
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

function markOrderReady(orderId) {
    const order = DB.getOrderById(orderId);
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
                const result = DB.markOrderReady(orderId);
                
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
                () => {
                    const result = DB.markOrderReady(orderId);
                    
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

function markOrderDelivered(orderId) {
    const order = DB.getOrderById(orderId);
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
                const result = DB.markOrderDelivered(orderId);
                
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
                () => {
                    const result = DB.markOrderDelivered(orderId);
                    
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

function showRejectOrderModal(orderId) {
    const order = DB.getOrderById(orderId);
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
        
        const result = DB.rejectOrder(orderId, reason);
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
function loadRatings() {
    const ratings = DB.getRatings();
    const container = document.getElementById('ratingsContainer');
    
    if (!container) return;
    
    if (ratings.length === 0) {
        container.innerHTML = '<div class="no-ratings">No ratings yet. Ratings will appear here when customers rate their orders.</div>';
        return;
    }
    
    // Sort by most recent first
    const sortedRatings = ratings.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    // Calculate average rating
    const avgRating = DB.getAverageRating();
    
    container.innerHTML = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
            <h3 style="margin: 0 0 10px 0;">Average Rating</h3>
            <div style="font-size: 48px; font-weight: bold;">${avgRating}</div>
            <div style="font-size: 24px; margin-top: 5px;">${'⭐'.repeat(Math.round(parseFloat(avgRating)))}</div>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Based on ${ratings.length} ${ratings.length === 1 ? 'rating' : 'ratings'}</p>
        </div>
        <div style="display: grid; gap: 20px;">
            ${sortedRatings.map(rating => createRatingCard(rating)).join('')}
        </div>
    `;
}

function createRatingCard(rating) {
    const order = DB.getOrderById(rating.orderId);
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
                    <div style="font-size: 24px; color: #ffc107;">${'⭐'.repeat(rating.rating)}${'☆'.repeat(5 - rating.rating)}</div>
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
                    <p style="margin: 5px 0; color: #666; font-size: 0.9rem;"><strong>Cake:</strong> ${order.cakeType} - ${order.cakeWeight}</p>
                </div>
            ` : ''}
        </div>
    `;
}

