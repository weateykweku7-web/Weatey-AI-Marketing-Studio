const WHATSAPP_NUMBER = "233553688108";

// Initialization & Check Session
document.addEventListener('DOMContentLoaded', () => {
    initDefaultUsers();
    checkAuthSession();
    updateTotalStats();
});

// Seed default Admin user if not present
function initDefaultUsers() {
    let users = JSON.parse(localStorage.getItem('weatey_users')) || [];
    if (!users.some(u => u.email === 'admin@weatey.com')) {
        users.push({
            name: 'System Admin',
            email: 'admin@weatey.com',
            password: 'admin123',
            role: 'admin',
            status: 'approved'
        });
        localStorage.setItem('weatey_users', JSON.stringify(users));
    }
}

// Authentication Tabs
function switchAuthTab(tab) {
    const signInBtn = document.querySelectorAll('.auth-tab-btn')[0];
    const signUpBtn = document.querySelectorAll('.auth-tab-btn')[1];
    const signInForm = document.getElementById('signin-form');
    const signUpForm = document.getElementById('signup-form');

    if (tab === 'signin') {
        signInBtn.classList.add('active');
        signUpBtn.classList.remove('active');
        signInForm.style.display = 'block';
        signUpForm.style.display = 'none';
    } else {
        signUpBtn.classList.add('active');
        signInBtn.classList.remove('active');
        signUpForm.style.display = 'block';
        signInForm.style.display = 'none';
    }
}

// Handle Sign In
function handleSignIn(e) {
    e.preventDefault();
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;

    let users = JSON.parse(localStorage.getItem('weatey_users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        alert('Invalid email or password!');
        return;
    }

    if (user.status !== 'approved' && user.role !== 'admin') {
        const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Admin,%20please%20approve%20my%20account:%20${encodeURIComponent(user.email)}`;
        alert('Your account is pending admin approval.');
        if (confirm('Would you like to contact the admin via WhatsApp for instant approval?')) {
            window.open(waLink, '_blank');
        }
        return;
    }

    localStorage.setItem('weatey_current_user', JSON.stringify(user));
    checkAuthSession();
}

// Handle Sign Up
function handleSignUp(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    let users = JSON.parse(localStorage.getItem('weatey_users')) || [];
    if (users.some(u => u.email === email)) {
        alert('An account with this email already exists!');
        return;
    }

    const newUser = {
        name,
        email,
        password,
        role: 'user',
        status: 'pending'
    };

    users.push(newUser);
    localStorage.setItem('weatey_users', JSON.stringify(users));

    const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Admin,%20I%20have%20registered%20on%20Weatey%20AI%20Studio.%20Please%20approve%20my%20account:%20${encodeURIComponent(email)}`;
    
    alert('Registration successful! Your account is pending admin approval.');
    if (confirm('Click OK to contact the Admin via WhatsApp (+233553688108) for instant account approval.')) {
        window.open(waLink, '_blank');
    }

    switchAuthTab('signin');
}

// Check Session state
function checkAuthSession() {
    const currentUser = JSON.parse(localStorage.getItem('weatey_current_user'));
    const authModal = document.getElementById('auth-modal');
    const appContainer = document.getElementById('app-container');

    if (currentUser) {
        authModal.style.display = 'none';
        appContainer.style.display = 'flex';

        // Configure UI based on role
        const roleBadge = document.getElementById('user-role-badge');
        const navAdmin = document.getElementById('nav-admin');
        const settingsEmail = document.getElementById('settings-user-email');

        if (currentUser.role === 'admin') {
            roleBadge.textContent = 'Admin';
            navAdmin.style.display = 'flex';
        } else {
            roleBadge.textContent = 'User';
            navAdmin.style.display = 'none';
        }

        if (settingsEmail) {
            settingsEmail.textContent = `Signed in as: ${currentUser.email}`;
        }
    } else {
        authModal.style.display = 'flex';
        appContainer.style.display = 'none';
    }
}

// Logout
function logoutUser() {
    localStorage.removeItem('weatey_current_user');
    checkAuthSession();
}

// Delete Account
function deleteAccount() {
    const currentUser = JSON.parse(localStorage.getItem('weatey_current_user'));
    if (!currentUser) return;

    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        let users = JSON.parse(localStorage.getItem('weatey_users')) || [];
        users = users.filter(u => u.email !== currentUser.email);
        localStorage.setItem('weatey_users', JSON.stringify(users));
        
        // Clear history & session
        localStorage.removeItem('weatey_current_user');
        alert('Your account has been deleted.');
        checkAuthSession();
    }
}

// Navigation & Tab Switching
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
const pageTitle = document.getElementById('page-title');

const titles = {
    dashboard: 'Dashboard Overview',
    adcopy: 'Ad Copy Generator',
    social: 'Social Media Captions',
    email: 'Email Campaign Generator',
    seo: 'SEO Blog & Outline',
    history: 'Saved Marketing History',
    admin: 'Admin Approval Management',
    settings: 'Settings & Account'
};

function switchTab(tabId) {
    navItems.forEach(item => {
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    tabContents.forEach(tab => {
        if (tab.id === tabId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    pageTitle.textContent = titles[tabId] || 'Marketing Studio';

    if (tabId === 'history') {
        renderHistory();
    } else if (tabId === 'admin') {
        renderAdminUserList();
    }
}

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const tabId = item.getAttribute('data-tab');
        switchTab(tabId);
    });
});

// Admin Approval Table Renderer
function renderAdminUserList() {
    const tbody = document.getElementById('admin-user-list');
    let users = JSON.parse(localStorage.getItem('weatey_users')) || [];

    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">No users found.</td></tr>`;
        return;
    }

    let html = '';
    users.forEach((user, index) => {
        if (user.role === 'admin') return; // Skip listing admin in regular approvals
        html += `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="status-badge ${user.status}">${user.status.toUpperCase()}</span></td>
                <td>
                    ${user.status === 'pending' ? `<button class="btn-sm btn-success" onclick="approveUser('${user.email}')">Approve</button>` : ''}
                    <button class="btn-sm btn-danger" onclick="deleteUserByAdmin('${user.email}')">Delete</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function approveUser(email) {
    let users = JSON.parse(localStorage.getItem('weatey_users')) || [];
    users = users.map(u => {
        if (u.email === email) u.status = 'approved';
        return u;
    });
    localStorage.setItem('weatey_users', JSON.stringify(users));
    renderAdminUserList();
}

function deleteUserByAdmin(email) {
    if (confirm(`Are you sure you want to delete user ${email}?`)) {
        let users = JSON.parse(localStorage.getItem('weatey_users')) || [];
        users = users.filter(u => u.email !== email);
        localStorage.setItem('weatey_users', JSON.stringify(users));
        renderAdminUserList();
    }
}

// AI Generation Logic
function generateContent(type) {
    let outputBoxId = '';
    let resultText = '';

    if (type === 'adcopy') {
        outputBoxId = 'ad-output';
        const product = document.getElementById('ad-product').value || 'Our Product';
        const features = document.getElementById('ad-features').value || 'High quality, fast results';
        const audience = document.getElementById('ad-audience').value || 'Professionals';
        const tone = document.getElementById('ad-tone').value;

        resultText = `🚀 [${tone.toUpperCase()} AD COPY] - Target: ${audience}\n\n` +
                     `Headline: Stop struggling with outdated tools. Meet ${product}!\n\n` +
                     `Primary Text:\n` +
                     `Are you tired of spending hours on manual tasks? ${product} is engineered specifically for ${audience} who want to scale faster.\n\n` +
                     `Key Highlights:\n` +
                     `- ${features}\n` +
                     `- Trusted by thousands of top creators & brands\n` +
                     `- Zero setup required\n\n` +
                     `👉 Click below to claim your free trial today!\n\n` +
                     `#${product.replace(/\s+/g, '')} #MarketingAI #GrowthHacking`;

    } else if (type === 'social') {
        outputBoxId = 'social-output';
        const topic = document.getElementById('social-topic').value || 'Exciting update';
        const platform = document.getElementById('social-platform').value;
        const tone = document.getElementById('social-tone').value;

        resultText = `✨ [${platform.toUpperCase()} - ${tone.toUpperCase()}] \n\n` +
                     `Big news! 🚀 ${topic}. We've been working hard behind the scenes to bring you something truly exceptional.\n\n` +
                     `What this means for you:\n` +
                     `1️⃣ Instant efficiency boost\n` +
                     `2️⃣ Seamless workflow integration\n` +
                     `3️⃣ Unmatched performance\n\n` +
                     `Drop a 💡 in the comments if you want early access!\n\n` +
                     `#Innovation #TechTrends #MarketingStrategy #BusinessGrowth #${platform}`;

    } else if (type === 'email') {
        outputBoxId = 'email-output';
        const objective = document.getElementById('email-objective').value || 'Special Offer';
        const details = document.getElementById('email-details').value || 'Limited time discount';
        const emailType = document.getElementById('email-type').value;

        resultText = `SUBJECT: ⚡ ${objective} - Don't Miss Out!\n\n` +
                     `Hi [First Name],\n\n` +
                     `We hope your week is off to a phenomenal start.\n\n` +
                     `We are thrilled to announce our latest ${emailType.toLowerCase()}: **${objective}**.\n\n` +
                     `Here is what you need to know:\n` +
                     `${details}\n\n` +
                     `This offer is strictly limited, so make sure to secure your spot before time runs out.\n\n` +
                     `[ CLAIM YOUR OFFER NOW ] (Button)\n\n` +
                     `Best regards,\nThe Weatey Team`;

    } else if (type === 'seo') {
        outputBoxId = 'seo-output';
        const keyword = document.getElementById('seo-keyword').value || 'AI Marketing';
        const audience = document.getElementById('seo-audience').value || 'Marketers';

        resultText = `🔍 SEO BLOG OUTLINE & META DATA\n\n` +
                     `Target Keyword: "${keyword}"\n` +
                     `Target Audience: ${audience}\n\n` +
                     `📌 Recommended Blog Titles:\n` +
                     `1. The Ultimate Guide to ${keyword} in 2026\n` +
                     `2. How ${keyword} is Transforming Modern Business\n` +
                     `3. 7 Proven Strategies for Mastering ${keyword}\n\n` +
                     `📝 Article Outline:\n` +
                     `I. Introduction\n` +
                     `   - The current state of marketing\n` +
                     `   - Why ${keyword} matters right now\n` +
                     `II. What is ${keyword}?\n` +
                     `   - Definition and core principles\n` +
                     `III. Top 5 Benefits for ${audience}\n` +
                     `IV. Step-by-Step Implementation Guide\n` +
                     `V. Conclusion & Next Steps\n\n` +
                     `🏷️ Meta Description:\n` +
                     `Discover everything you need to know about ${keyword}. Learn proven strategies, top benefits, and expert tips to scale your results today.`;
    }

    const outputBox = document.getElementById(outputBoxId);
    outputBox.classList.remove('placeholder');
    outputBox.textContent = resultText;

    saveToHistory(type, resultText);
    updateTotalStats();
}

// Copy to Clipboard
function copyResult(elementId) {
    const text = document.getElementById(elementId).textContent;
    if (!text || document.getElementById(elementId).classList.contains('placeholder')) {
        alert('No content to copy!');
        return;
    }
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard successfully!');
    });
}

// LocalStorage History Management
function saveToHistory(toolType, content) {
    let history = JSON.parse(localStorage.getItem('weatey_history')) || [];
    const newItem = {
        id: Date.now(),
        type: toolType.toUpperCase(),
        content: content,
        date: new Date().toLocaleString()
    };
    history.unshift(newItem);
    localStorage.setItem('weatey_history', JSON.stringify(history));
}

function renderHistory() {
    const historyList = document.getElementById('history-list');
    let history = JSON.parse(localStorage.getItem('weatey_history')) || [];

    if (history.length === 0) {
        historyList.innerHTML = `<div class="output-box placeholder">No saved marketing assets yet. Generate some content to see it here!</div>`;
        return;
    }

    let html = '';
    history.forEach(item => {
        html += `
            <div class="history-item">
                <div class="history-item-header">
                    <span>${item.type}</span>
                    <span>${item.date}</span>
                </div>
                <div class="history-item-content">${escapeHTML(item.content)}</div>
            </div>
        `;
    });
    historyList.innerHTML = html;
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all saved history?')) {
        localStorage.removeItem('weatey_history');
        renderHistory();
        updateTotalStats();
    }
}

function updateTotalStats() {
    let history = JSON.parse(localStorage.getItem('weatey_history')) || [];
    const statTotal = document.getElementById('stat-total');
    if (statTotal) {
        statTotal.textContent = history.length;
    }
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
