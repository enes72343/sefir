document.addEventListener('DOMContentLoaded', function() {
    // Adım geçişleri
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const nextStep = this.getAttribute('data-next');
            goToStep(nextStep);
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const prevStep = this.getAttribute('data-prev');
            goToStep(prevStep);
        });
    });
    
    // Şifre güçlülük kontrolü
    const passwordInput = document.getElementById('password');
    const passwordStrengthBar = document.getElementById('passwordStrength');
    
    passwordInput.addEventListener('input', function() {
        updatePasswordStrength(this.value);
    });
    
    // Form gönderimi
    document.getElementById('finalizeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Form verilerini topla
        const userData = {
            id: Date.now(), // Benzersiz ID
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim().toLowerCase(),
            phone: document.getElementById('phone').value.trim(),
            username: document.getElementById('username').value.trim(),
            password: document.getElementById('password').value,
            acceptNewsletter: document.getElementById('acceptNewsletter').checked,
            createdAt: new Date().toISOString(),
            purchases: [] // Satın alımlar için boş array
        };
        
        // Kullanıcıları LocalStorage'dan al
        let users = JSON.parse(localStorage.getItem('users')) || [];
        
        // E-posta kontrolü
        const emailExists = users.some(user => user.email === userData.email);
        if(emailExists) {
            alert('Bu e-posta adresi zaten kayıtlı!');
            goToStep(1);
            return;
        }
        
        // Kullanıcı adı kontrolü
        const usernameExists = users.some(user => user.username === userData.username);
        if(usernameExists) {
            alert('Bu kullanıcı adı zaten alınmış!');
            goToStep(2);
            return;
        }
        
        // Kullanıcıyı kaydet
        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Otomatik giriş yap
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Başarı mesajı ve yönlendirme
        alert(`Hoş geldiniz ${userData.firstName}! Hesabınız başarıyla oluşturuldu.`);
        window.location.href = 'hesabim.html';
    });
    
    // Sepet sayacını güncelle
    updateCartCount();
});

function updatePasswordStrength(password) {
    let strength = 0;
    const strengthBar = document.getElementById('passwordStrength');
    
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

function goToStep(stepNumber) {
    // Tüm adımları ve bölümleri gizle
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active', 'completed');
    });
    
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Aktif adımı işaretle
    for (let i = 1; i <= stepNumber; i++) {
        const stepElement = document.getElementById('step' + i);
        const sectionElement = document.getElementById('section' + i);
        
        if (i < stepNumber) {
            stepElement.classList.add('completed');
        } else if (i == stepNumber) {
            stepElement.classList.add('active');
            sectionElement.classList.add('active');
        }
    }
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    document.getElementById('cart-count').textContent = cart.reduce((total, item) => total + item.quantity, 0);
}
