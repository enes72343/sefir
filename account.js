document.addEventListener('DOMContentLoaded', function() {
    checkAuthAndLoadContent();
});

function checkAuthAndLoadContent() {
    const accountContent = document.getElementById('account-content');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) {
        // Kullanıcı GİRİŞ YAPMAMIŞSA
        accountContent.innerHTML = `
            <div class="auth-card text-center">
                <i class="fas fa-user-lock fa-4x text-primary mb-4"></i>
                <h3 class="mb-3">Giriş Yapmamışsınız</h3>
                <p class="mb-4">Hesap bilgilerinizi görüntülemek için giriş yapmalısınız.</p>
                
                <div class="d-grid gap-2">
                    <a href="giris.html" class="btn btn-primary btn-lg">
                        <i class="fas fa-sign-in-alt me-2"></i> Giriş Yap
                    </a>
                    <a href="kayit.html" class="btn btn-outline-primary btn-lg">
                        <i class="fas fa-user-plus me-2"></i> Kayıt Ol
                    </a>
                </div>
                
                <div class="mt-4 text-muted">
                    <small>Zaten hesabınız var mı? Hemen giriş yapın!</small>
                </div>
            </div>
        `;
    } else {
        // Kullanıcı GİRİŞ YAPMIŞSA
        loadPurchases(currentUser);
    }
}

function loadPurchases(user) {
    const accountContent = document.getElementById('account-content');
    const purchases = user.purchases || [];

    if (purchases.length === 0) {
        accountContent.innerHTML = `
            <div class="auth-card text-center">
                <i class="fas fa-shopping-basket fa-4x text-primary mb-4"></i>
                <h3 class="mb-3">Satın Alım Bulunamadı</h3>
                <p class="mb-4">Henüz hiç sipariş vermemişsiniz.</p>
                <a href="urunler.html" class="btn btn-primary btn-lg">
                    <i class="fas fa-arrow-right me-2"></i> Ürünlere Gözat
                </a>
            </div>
        `;
        return;
    }

    // Satın alımları göster
    accountContent.innerHTML = `
        <div class="card shadow-sm">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <h4 class="mb-0">
                    <i class="fas fa-shopping-bag me-2"></i>
                    Satın Alımlarım
                </h4>
                <small class="text-muted">Toplam ${purchases.length} sipariş</small>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table purchase-table">
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
                            ${purchases.map(purchase => `
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <img src="${purchase.image || 'default-product.png'}" 
                                                 class="rounded me-3" width="40" height="40" alt="${purchase.name}">
                                            <div>
                                                <h6 class="mb-0">${purchase.name || 'Ürün'}</h6>
                                                <small class="text-muted">#${purchase.id || ''}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${formatDate(purchase.date)}</td>
                                    <td>${(purchase.price || 0).toFixed(2)} ₺</td>
                                    <td>
                                        <span class="badge ${getStatusClass(purchase.status)}">
                                            ${purchase.status || 'Bekliyor'}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-primary">
                                            <i class="fas fa-download me-1"></i> İndir
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function getStatusClass(status) {
    const statusLower = (status || '').toLowerCase();
    if (statusLower.includes('tamamlandı')) return 'bg-success';
    if (statusLower.includes('iptal')) return 'bg-danger';
    if (statusLower.includes('işleme')) return 'bg-info';
    if (statusLower.includes('kargoda')) return 'bg-primary';
    return 'bg-warning text-dark';
}
