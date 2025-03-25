// Kullanıcı verileri (gerçek uygulamada bu veriler sunucudan gelmeli)
const users = [
    {
        id: 1,
        email: "demo@bilgikupu.com",
        password: "demo123",
        name: "Demo Kullanıcı",
        purchases: [1, 3] // Satın alınan ürün ID'leri
    }
];

// Giriş formu işlemleri
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Kullanıcı doğrulama
    const user = users.find(u => u.email === email && u.password === password);
    
    if(user) {
        // Giriş başarılı
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        if(rememberMe) {
            // 30 gün süreyle hatırla
            const date = new Date();
            date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
            document.cookie = `rememberedUser=${user.id}; expires=${date.toUTCString()}; path=/`;
        }
        
        // Başarı mesajı
        showAlert('success', 'Giriş başarılı! Yönlendiriliyorsunuz...');
        
        // 2 saniye sonra yönlendirme
        setTimeout(() => {
            window.location.href = 'hesabim.html';
        }, 2000);
    } else {
        // Hata mesajı
        showAlert('danger', 'E-posta veya şifre hatalı!');
    }
});

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

// Sayfa yüklendiğinde çerez kontrolü
document.addEventListener('DOMContentLoaded', () => {
    const cookies = document.cookie.split('; ');
    const rememberedCookie = cookies.find(c => c.startsWith('rememberedUser='));
    
    if(rememberedCookie) {
        const userId = rememberedCookie.split('=')[1];
        const user = users.find(u => u.id == userId);
        
        if(user) {
            document.getElementById('email').value = user.email;
            document.getElementById('rememberMe').checked = true;
        }
    }
    
    // Sepet sayacını güncelle
    updateCartCount();
});

// Sepet sayacını güncelle
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    document.getElementById('cart-count').textContent = cart.reduce((total, item) => total + item.quantity, 0);
}
