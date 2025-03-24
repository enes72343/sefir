document.addEventListener('DOMContentLoaded', function() {
    // Adım geçişleri
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    
    nextButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Ekstra koruma
            const nextStep = this.getAttribute('data-next');
            goToStep(nextStep);
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Ekstra koruma
            const prevStep = this.getAttribute('data-prev');
            goToStep(prevStep);
        });
    });
    
    // Şifre güçlülük kontrolü
    const passwordInput = document.getElementById('password');
    const passwordStrengthBar = document.getElementById('passwordStrength');
    
    if (passwordInput && passwordStrengthBar) {
        passwordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
    }
    
    // Form gönderimi
    const finalizeForm = document.getElementById('finalizeForm');
    if (finalizeForm) {
        finalizeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Ekstra koruma
            
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
                showAlert('Bu e-posta adresi zaten kayıtlı!', 'danger');
                goToStep(1);
                return false; // İşlemi durdur
            }
            
            // Kullanıcı adı kontrolü
            const usernameExists = users.some(user => user.username === userData.username);
            if(usernameExists) {
                showAlert('Bu kullanıcı adı zaten alınmış!', 'danger');
                goToStep(2);
                return false; // İşlemi durdur
            }
            
            // Kullanıcıyı kaydet
            users.push(userData);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Otomatik giriş yap
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            // Başarı mesajı ve yönlendirme
            showAlert(`Hoş geldiniz ${userData.firstName}! Hesabınız başarıyla oluşturuldu.`, 'success');
            
            // 2 saniye sonra yönlendirme
            setTimeout(() => {
                window.location.href = 'hesabim.html';
            }, 2000);
            
            return false; // Ekstra koruma
        });
    }
    
    // Sepet sayacını güncelle
    updateCartCount();
});

// Alert gösterme fonksiyonu
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} fixed-top mx-auto mt-3`;
    alertDiv.style.maxWidth = '500px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.left = '0';
    alertDiv.style.right = '0';
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Kalan fonksiyonlar aynı şekilde kalabilir...
function updatePasswordStrength(password) {
    let strength = 0;
    const strengthBar = document.getElementById('passwordStrength');
    
    if (!strengthBar) return;
    
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
            if (sectionElement) sectionElement.classList.add('active');
        }
    }
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
}

// Kullanıcı hesap yönetimi
if (window.location.pathname.includes('hesabim.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // Giriş kontrolü
        if(!currentUser) {
            window.location.href = 'giris.html';
            return;
        }
        
        // Kullanıcı bilgilerini yükle
        loadUserProfile(currentUser);
        
        // Satın alımları yükle
        loadUserPurchases(currentUser);
        
        // Çıkış butonu
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logoutUser();
            });
        }
    });
}

// Kullanıcı profilini yükle
function loadUserProfile(user) {
    if (!user) return;
    
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const userPhone = document.getElementById('user-phone');
    const userJoinDate = document.getElementById('user-join-date');
    const userAvatar = document.getElementById('user-avatar');
    
    if (userName) userName.textContent = `${user.firstName} ${user.lastName}`;
    if (userEmail) userEmail.textContent = user.email;
    if (userPhone) userPhone.textContent = user.phone || 'Belirtilmemiş';
    if (userJoinDate) userJoinDate.textContent = new Date(user.createdAt).toLocaleDateString('tr-TR');
    
    // Profil resmi (isim baş harfleri)
    if (userAvatar) {
        const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
        userAvatar.textContent = initials;
    }
}

// Satın alımları yükle
function loadUserPurchases(user) {
    if (!user) return;
    
    const purchasesContainer = document.getElementById('purchases-container');
    if (!purchasesContainer) return;
    
    if(user.purchases && user.purchases.length > 0) {
        // Satın alınan ürünleri göster
        purchasesContainer.innerHTML = user.purchases.map(purchase => `
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${purchase.name}</h5>
                        <p class="card-text">${purchase.description || ''}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-success">${purchase.status || 'Tamamlandı'}</span>
                            <small class="text-muted">${purchase.date || new Date().toLocaleDateString('tr-TR')}</small>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent">
                        <button class="btn btn-sm btn-outline-primary download-btn" data-id="${purchase.id}">
                            <i class="fas fa-download me-1"></i> İndir
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        // Satın alım yoksa mesaj göster
        purchasesContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-box-open fa-4x text-muted mb-3"></i>
                <h4>Henüz satın alım yapmamışsınız</h4>
                <p class="text-muted">Eğitim paketlerimizi keşfetmek için mağazamızı ziyaret edin</p>
                <a href="index.html" class="btn btn-primary">Mağazaya Git</a>
            </div>
        `;
    }
}

// Çıkış yap
function logoutUser() {
    localStorage.removeItem('currentUser');
    
    // Çerezi sil
    document.cookie = "rememberedUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Giriş sayfasına yönlendir
    window.location.href = 'giris.html';
}
