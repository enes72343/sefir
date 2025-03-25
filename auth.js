// Kullanıcı giriş işlemleri
document.addEventListener('DOMContentLoaded', function() {
    // Giriş formu
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Kullanıcıları LocalStorage'dan al
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Kullanıcı doğrulama
        const user = users.find(u => u.email === email && u.password === password);
        
        if(user) {
            // Giriş başarılı
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // "Beni hatırla" seçeneği
            if(rememberMe) {
                const expiryDate = new Date();
                expiryDate.setMonth(expiryDate.getMonth() + 1);
                document.cookie = `rememberedUser=${user.id}; expires=${expiryDate.toUTCString()}; path=/`;
            }
            
            // Hoş geldin mesajı
            showAlert('success', `Hoş geldiniz ${user.firstName}! Yönlendiriliyorsunuz...`);
            
            // Yönlendirme
            setTimeout(() => {
                window.location.href = 'hesabim.html';
            }, 2000);
        } else {
            // Hata mesajı
            showAlert('danger', 'E-posta veya şifre hatalı!');
        }
    });
    
    // Çerez kontrolü (hatırlanan kullanıcı)
    checkRememberedUser();
    
    // Sepet sayacını güncelle
    updateCartCount();
});

// Hatırlanan kullanıcıyı kontrol et
function checkRememberedUser() {
    const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
        const [name, value] = cookie.split('=');
        acc[name] = value;
        return acc;
    }, {});
    
    if(cookies.rememberedUser) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.id == cookies.rememberedUser);
        
        if(user) {
            document.getElementById('email').value = user.email;
            document.getElementById('rememberMe').checked = true;
        }
    }
}

// Alert gösterme fonksiyonu
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // 5 saniye sonra otomatik kapanma
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 150);
    }, 5000);
}

// Sepet sayacını güncelle
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    document.getElementById('cart-count').textContent = cart.reduce((total, item) => total + item.quantity, 0);
}
