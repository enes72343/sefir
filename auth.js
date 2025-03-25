// Kullanıcı verilerini yükle
document.addEventListener('DOMContentLoaded', () => {
    // Giriş sayfası kontrolleri
    if (document.getElementById('loginForm')) {
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', handleLogin);
        
        // "Beni hatırla" çerezi kontrolü
        const rememberedUser = getCookie('rememberedUser');
        if (rememberedUser) {
            const userData = JSON.parse(rememberedUser);
            document.getElementById('email').value = userData.email;
            document.getElementById('password').value = userData.password;
            document.getElementById('rememberMe').checked = true;
        }
    }

    // Kayıt sayfası kontrolleri
    if (document.getElementById('registerForm')) {
        const registerForm = document.getElementById('registerForm');
        registerForm.addEventListener('submit', handleRegister);
        
        // Şifre güçlülük kontrolü
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                updatePasswordStrength(this.value);
            });
        }
    }

    // Profil sayfası kontrolleri
    if (window.location.pathname.includes('profile.html') || 
        window.location.pathname.includes('hesabim.html')) {
        loadUserProfile();
    }
});

// Giriş işlemi
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Giriş başarılı
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // "Beni hatırla" seçeneği
        if (rememberMe) {
            setCookie('rememberedUser', JSON.stringify({email, password}), 30);
        } else {
            deleteCookie('rememberedUser');
        }
        
        // Yönlendirme
        window.location.href = 'profile.html';
    } else {
        showAlert('Hatalı e-posta veya şifre!', 'danger');
    }
}

// Kayıt işlemi
function handleRegister(e) {
    e.preventDefault();
    
    const userData = {
        id: Date.now(),
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim().toLowerCase(),
        phone: document.getElementById('phone').value.trim(),
        username: document.getElementById('username').value.trim(),
        password: document.getElementById('password').value,
        createdAt: new Date().toISOString(),
        purchases: []
    };
    
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validasyonlar
    if (userData.password !== confirmPassword) {
        showAlert('Şifreler eşleşmiyor!', 'danger');
        return;
    }
    
    if (userData.password.length < 8) {
        showAlert('Şifre en az 8 karakter olmalıdır!', 'danger');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.some(u => u.email === userData.email)) {
        showAlert('Bu e-posta zaten kayıtlı!', 'danger');
        return;
    }
    
    if (users.some(u => u.username === userData.username)) {
        showAlert('Bu kullanıcı adı zaten alınmış!', 'danger');
        return;
    }
    
    // Kullanıcıyı kaydet
    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    showAlert('Kayıt başarılı! Yönlendiriliyorsunuz...', 'success');
    setTimeout(() => window.location.href = 'profile.html', 1500);
}

// Kullanıcı profilini yükle
function loadUserProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Profil bilgilerini göster
    if (document.getElementById('user-name')) {
        document.getElementById('user-name').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    }
    
    if (document.getElementById('user-email')) {
        document.getElementById('user-email').textContent = currentUser.email;
    }
    
    if (document.getElementById('user-phone')) {
        document.getElementById('user-phone').textContent = currentUser.phone || 'Belirtilmemiş';
    }
    
    if (document.getElementById('member-since')) {
        const joinDate = new Date(currentUser.createdAt);
        document.getElementById('member-since').textContent = joinDate.toLocaleDateString('tr-TR');
    }
    
    // Satın alımları yükle
    if (currentUser.purchases && currentUser.purchases.length > 0) {
        loadPurchases(currentUser.purchases);
    }
    
    // Çıkış butonu
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

// Çıkış işlemi
function logout() {
    localStorage.removeItem('currentUser');
    deleteCookie('rememberedUser');
    window.location.href = 'login.html';
}

// Diğer yardımcı fonksiyonlar...
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show fixed-top mx-auto mt-3`;
    alertDiv.style.maxWidth = '500px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.left = '0';
    alertDiv.style.right = '0';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

function updatePasswordStrength(password) {
    const strengthBar = document.getElementById('passwordStrength');
    if (!strengthBar) return;
    
    let strength = 0;
    
    // Uzunluk kontrolü
    strength += Math.min(password.length * 5, 30);
    
    // Çeşitlilik kontrolü
    if (/[A-Z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    
    // Tekrar kontrolü
    if (!/(.)\1{2,}/.test(password)) strength += 10;
    
    strength = Math.min(strength, 100);
    
    // Görsel güncelleme
    if (strength < 30) {
        strengthBar.style.backgroundColor = '#dc3545';
    } else if (strength < 70) {
        strengthBar.style.backgroundColor = '#ffc107';
    } else {
        strengthBar.style.backgroundColor = '#28a745';
    }
    strengthBar.style.width = strength + '%';
}
