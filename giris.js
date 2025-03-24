document.addEventListener('DOMContentLoaded', function() {
    // Şifre göster/gizle butonu
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });

    // Form submit işlemi
    const loginForm = document.getElementById('login-form');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        // LocalStorage'dan kullanıcıları al
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Kullanıcıyı bul
        const user = users.find(u => u.email === email && u.password === password);
        
        if(user) {
            // Giriş başarılı
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // "Beni hatırla" seçeneği
            if(remember) {
                // 30 gün geçerli çerez
                const date = new Date();
                date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
                const expires = "expires=" + date.toUTCString();
                document.cookie = `rememberedUser=${JSON.stringify({email, password})}; ${expires}; path=/`;
            } else {
                // Çerezi sil
                document.cookie = "rememberedUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            }
            
            // Yönlendirme
            window.location.href = 'profil.html';
        } else {
            // Hata mesajı
            alert('Hatalı e-posta veya şifre! Lütfen tekrar deneyin.');
        }
    });

    // "Beni hatırla" çerezi kontrolü
    const rememberedUser = getCookie('rememberedUser');
    if(rememberedUser) {
        try {
            const userData = JSON.parse(rememberedUser);
            document.getElementById('email').value = userData.email || '';
            document.getElementById('password').value = userData.password || '';
            document.getElementById('remember').checked = true;
        } catch(e) {
            console.error('Çerez okunamadı:', e);
        }
    }
});

// Çerez okuma fonksiyonu
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while(c.charAt(0) === ' ') c = c.substring(1);
        if(c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
