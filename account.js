// Kullanıcı verilerini yükle
document.addEventListener('DOMContentLoaded', function() {
    // Giriş kontrolü yap
    checkAuth();
    
    // Çıkış butonu eventi
    document.getElementById('logout-btn')?.addEventListener('click', logoutUser);
});

// Giriş kontrol fonksiyonu
function checkAuth() {
    const currentUser = getCurrentUser();
    
    if(!currentUser) {
        // Giriş yapılmamışsa yönlendir
        window.location.href = 'giris.html';
        return;
    }
    
    // Kullanıcı bilgilerini yükle
    loadUserProfile(currentUser);
    
    // Satın alımları yükle
    loadUserPurchases(currentUser);
}

// LocalStorage'dan kullanıcıyı al
function getCurrentUser() {
    try {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Kullanıcı verisi okunamadı:', error);
        return null;
    }
}

// Kullanıcı profilini yükle
function loadUserProfile(user) {
    if (!user) return;
    
    // Avatar (isim baş harfleri)
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const avatarElement = document.getElementById('user-avatar');
    if (avatarElement) avatarElement.textContent = initials;
    
    // Kullanıcı bilgileri
    if (document.getElementById('user-name')) {
        document.getElementById('user-name').textContent = user.name || 'Kullanıcı';
    }
    if (document.getElementById('user-email')) {
        document.getElementById('user-email').textContent = user.email || '';
    }
}

// Satın alımları yükle
function loadUserPurchases(user) {
    const container = document.getElementById('purchases-container');
    if (!container) return;
    
    if (!user.purchases || user.purchases.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-box-open fa-4x text-muted mb-3"></i>
                <h4>Henüz satın alım yapmamışsınız</h4>
                <a href="urunler.html" class="btn btn-primary">Ürünlere Gözat</a>
            </div>
        `;
        return;
    }
    
    // Satın alımları göster
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Ürün</th>
                        <th>Tarih</th>
                        <th>Fiyat</th>
                        <th>Durum</th>
                        <th>İşlem</th>
                    </tr>
                </thead>
                <tbody>
                    ${user.purchases.map(purchase => `
                        <tr>
                            <td>${purchase.name || 'Ürün'}</td>
                            <td>${purchase.date ? new Date(purchase.date).toLocaleDateString('tr-TR') : 'Bilgi yok'}</td>
                            <td>${purchase.price ? purchase.price.toFixed(2) + ' ₺' : 'Bilgi yok'}</td>
                            <td>
                                <span class="badge ${purchase.status === 'Tamamlandı' ? 'bg-success' : 'bg-warning'}">
                                    ${purchase.status || 'Beklemede'}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary download-btn" data-id="${purchase.id}">
                                    <i class="fas fa-download"></i> İndir
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    // İndir butonlarına event ekle
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            downloadProduct(productId);
        });
    });
}

// Ürün indirme fonksiyonu
function downloadProduct(productId) {
    alert(`${productId} numaralı ürün indirilecek`);
    // Burada gerçek indirme işlemi yapılacak
}

// Çıkış yap
function logoutUser() {
    // Kullanıcı verilerini temizle
    localStorage.removeItem('currentUser');
    
    // Çerezleri temizle
    document.cookie = "rememberedUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Giriş sayfasına yönlendir
    window.location.href = 'giris.html';
}
