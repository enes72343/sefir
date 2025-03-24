// Kullanıcı verilerini yükle
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if(!currentUser) {
        window.location.href = 'giris.html';
        return;
    }
    
    // Kullanıcı bilgilerini göster
    document.getElementById('user-name').textContent = currentUser.name;
    
    // Satın alımları yükle
    loadPurchases(currentUser.purchases);
    
    // Çıkış butonu
    document.getElementById('logout-btn').addEventListener('click', logout);
});

// Satın alımları yükle
function loadPurchases(purchaseIds) {
    const products = [
        {
            id: 1,
            name: "Python Programlama Paketi",
            price: 299,
            date: "2023-05-15",
            status: "Tamamlandı"
        },
        {
            id: 2,
            name: "Web Geliştirme Paketi",
            price: 900,
            date: "2023-06-20",
            status: "Devam Ediyor"
        },
        {
            id: 3,
            name: "Veri Bilimi Paketi",
            price: 499,
            date: "2023-07-10",
            status: "Tamamlandı"
        }
    ];
    
    const userPurchases = products.filter(p => purchaseIds.includes(p.id));
    const tableBody = document.getElementById('purchases-table');
    
    tableBody.innerHTML = userPurchases.map(purchase => `
        <tr>
            <td>${purchase.name}</td>
            <td>${purchase.date}</td>
            <td>${purchase.price} ₺</td>
            <td>
                <span class="badge ${purchase.status === 'Tamamlandı' ? 'bg-success' : 'bg-warning'}">
                    ${purchase.status}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-download"></i> İndir
                </button>
            </td>
        </tr>
    `).join('');
}

// Çıkış yap
function logout() {
    localStorage.removeItem('currentUser');
    
    // Çerez silme
    document.cookie = "rememberedUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    window.location.href = 'giris.html';
}
