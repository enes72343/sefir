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
        const password = this.value;
        const strength = calculatePasswordStrength(password);
        
        // Renk ve genişlik güncelleme
        if (strength < 30) {
            passwordStrengthBar.style.backgroundColor = '#dc3545';
            passwordStrengthBar.style.width = strength + '%';
        } else if (strength < 70) {
            passwordStrengthBar.style.backgroundColor = '#ffc107';
            passwordStrengthBar.style.width = strength + '%';
        } else {
            passwordStrengthBar.style.backgroundColor = '#28a745';
            passwordStrengthBar.style.width = strength + '%';
        }
    });
    
    // Form gönderimi
    document.getElementById('finalizeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Form verilerini topla
        const userData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            acceptNewsletter: document.getElementById('acceptNewsletter').checked
        };
        
        // LocalStorage'a kaydet (gerçek uygulamada sunucuya gönderilmeli)
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Başarı mesajı ve yönlendirme
        alert('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.');
        setTimeout(() => {
            window.location.href = 'giris.html';
        }, 2000);
    });
    
    // Sepet sayacını güncelle
    updateCartCount();
});

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

function calculatePasswordStrength(password) {
    let strength = 0;
    
    // Uzunluk kontrolü
    strength += Math.min(password.length * 5, 30);
    
    // Çeşitlilik kontrolü
    if (/[A-Z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    
    // Tekrar kontrolü
    if (!/(.)\1{2,}/.test(password)) strength += 10;
    
    return Math.min(strength, 100);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    document.getElementById('cart-count').textContent = cart.reduce((total, item) => total + item.quantity, 0);
}
