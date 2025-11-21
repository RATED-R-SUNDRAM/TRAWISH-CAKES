// Custom Modal System for Trawish Cakes
// Replaces browser alerts/confirms with styled modals

const CustomModal = {
    // Create and show confirmation modal
    confirm(message, onConfirm, onCancel = null) {
        const modal = document.createElement('div');
        modal.className = 'custom-modal-overlay';
        modal.id = 'customModalOverlay';
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
            animation: fadeIn 0.3s ease;
        `;

        const modalContent = document.createElement('div');
        modalContent.className = 'custom-modal-content';
        modalContent.style.cssText = `
            background: white;
            border-radius: 30px;
            padding: 40px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease;
            text-align: center;
        `;

        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            font-size: 1.2rem;
            color: #333;
            margin-bottom: 30px;
            line-height: 1.6;
        `;
        messageDiv.textContent = message;

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 15px;
            justify-content: center;
        `;

        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = onCancel ? 'Proceed' : 'OK';
        confirmBtn.style.cssText = `
            padding: 12px 40px;
            background: linear-gradient(135deg, #ff6b9d, #ffb347);
            color: white;
            border: none;
            border-radius: 25px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            font-family: 'Fredoka', sans-serif;
            transition: all 0.3s ease;
        `;

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.cssText = `
            padding: 12px 40px;
            background: #e0e0e0;
            color: #333;
            border: none;
            border-radius: 25px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            font-family: 'Fredoka', sans-serif;
            transition: all 0.3s ease;
        `;

        confirmBtn.onmouseover = () => {
            confirmBtn.style.transform = 'translateY(-3px)';
            confirmBtn.style.boxShadow = '0 10px 30px rgba(255, 107, 157, 0.4)';
        };
        confirmBtn.onmouseout = () => {
            confirmBtn.style.transform = 'translateY(0)';
            confirmBtn.style.boxShadow = 'none';
        };

        cancelBtn.onmouseover = () => {
            cancelBtn.style.transform = 'translateY(-3px)';
            cancelBtn.style.background = '#d0d0d0';
        };
        cancelBtn.onmouseout = () => {
            cancelBtn.style.transform = 'translateY(0)';
            cancelBtn.style.background = '#e0e0e0';
        };

        const closeModal = () => {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        };

        confirmBtn.onclick = () => {
            closeModal();
            if (onConfirm) onConfirm();
        };

        cancelBtn.onclick = () => {
            closeModal();
            if (onCancel) onCancel();
        };

        // Close on overlay click
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeModal();
                if (onCancel) onCancel();
            }
        };

        buttonContainer.appendChild(confirmBtn);
        if (onCancel) {
            buttonContainer.appendChild(cancelBtn);
        }
        modalContent.appendChild(messageDiv);
        modalContent.appendChild(buttonContainer);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    },

    // Show alert modal
    alert(message, onOk = null) {
        const modal = document.createElement('div');
        modal.className = 'custom-modal-overlay';
        modal.id = 'customModalAlert';
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
            animation: fadeIn 0.3s ease;
        `;

        const modalContent = document.createElement('div');
        modalContent.className = 'custom-modal-content';
        modalContent.style.cssText = `
            background: white;
            border-radius: 30px;
            padding: 40px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease;
            text-align: center;
        `;

        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            font-size: 1.2rem;
            color: #333;
            margin-bottom: 30px;
            line-height: 1.6;
        `;
        messageDiv.textContent = message;

        const okBtn = document.createElement('button');
        okBtn.textContent = 'OK';
        okBtn.style.cssText = `
            padding: 12px 40px;
            background: linear-gradient(135deg, #ff6b9d, #ffb347);
            color: white;
            border: none;
            border-radius: 25px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            font-family: 'Fredoka', sans-serif;
            transition: all 0.3s ease;
        `;

        okBtn.onmouseover = () => {
            okBtn.style.transform = 'translateY(-3px)';
            okBtn.style.boxShadow = '0 10px 30px rgba(255, 107, 157, 0.4)';
        };
        okBtn.onmouseout = () => {
            okBtn.style.transform = 'translateY(0)';
            okBtn.style.boxShadow = 'none';
        };

        const closeModal = () => {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
                if (onOk) onOk();
            }, 300);
        };

        okBtn.onclick = closeModal;
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeModal();
            }
        };

        modalContent.appendChild(messageDiv);
        modalContent.appendChild(okBtn);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(50px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

