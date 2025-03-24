// Sepet işlemleri için global değişken
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Sepet sayacını güncelleme fonksiyonu
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
}

// Sepet verilerini localStorage'a kaydetme
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Sepeti render etme fonksiyonu (optimize edilmiş)
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-shopping-cart fa-4x mb-3 text-muted"></i>
                <h4>Sepetiniz boş</h4>
                <p>Hemen bir eğitim paketi keşfedin!</p>
                <a href="index.html" class="btn btn-primary">Ürünlere Gözat</a>
            </div>
        `;
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item row mb-3 align-items-center" data-id="${item.id}">
            <div class="col-md-2">
                <img src="${item.image || 'default-product.png'}" alt="${item.name}" class="img-fluid rounded">
            </div>
            <div class="col-md-5">
                <h5>${item.name}</h5>
                <p class="text-muted mb-0">${item.price.toFixed(2)} ₺</p>
            </div>
            <div class="col-md-3">
                <div class="input-group">
                    <button class="btn btn-outline-secondary minus-btn">-</button>
                    <input type="text" class="form-control text-center quantity-input" value="${item.quantity}" readonly>
                    <button class="btn btn-outline-secondary plus-btn">+</button>
                </div>
            </div>
            <div class="col-md-2 text-end">
                <h5>${(item.price * item.quantity).toFixed(2)} ₺</h5>
                <button class="btn btn-sm btn-outline-danger remove-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    // Event delegation kullanarak buton eventleri
    cartItemsContainer.addEventListener('click', handleCartActions);
    updateCartSummary();
}

// Sepet aksiyonlarını yönetme (event delegation)
function handleCartActions(e) {
    const cartItem = e.target.closest('.cart-item');
    if (!cartItem) return;

    const productId = parseInt(cartItem.dataset.id);
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    if (e.target.classList.contains('plus-btn')) {
        item.quantity += 1;
    } else if (e.target.classList.contains('minus-btn')) {
        item.quantity = item.quantity > 1 ? item.quantity - 1 : 0;
        if (item.quantity === 0) {
            cart = cart.filter(i => i.id !== productId);
        }
    } else if (e.target.classList.contains('remove-btn')) {
        cart = cart.filter(i => i.id !== productId);
    }

    saveCartToStorage();
    renderCart();
}

// Sepet özetini güncelleme
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    const cartTotalEl = document.getElementById('cart-total');
    const cartTaxEl = document.getElementById('cart-tax');
    const cartGrandTotalEl = document.getElementById('cart-grand-total');

    if (cartTotalEl) cartTotalEl.textContent = subtotal.toFixed(2) + ' ₺';
    if (cartTaxEl) cartTaxEl.textContent = tax.toFixed(2) + ' ₺';
    if (cartGrandTotalEl) cartGrandTotalEl.textContent = total.toFixed(2) + ' ₺';
}

// Discord Webhook'a sipariş gönderme (optimize edilmiş)
async function sendOrderToDiscord(orderData) {
    const WEBHOOK_URL = 'https://discord.com/api/webhooks/1353848010735616032/V_lGzTIkpX2fvQLs7v20h2ubd_M6dSXcKta6gac1JelX3fiCm816PkWgvSwXy26-NOTI';

    try {
        const itemsList = orderData.items.map(item => 
            `- ${item.name} (${item.quantity} x ${item.price.toFixed(2)} ₺) = ${(item.quantity * item.price).toFixed(2)} ₺`
        ).join('\n');

        const embed = {
            title: "🛒 Yeni Sipariş!",
            color: 0x0099ff,
            fields: [
                {
                    name: "👤 Müşteri Bilgileri",
                    value: `**Ad:** ${orderData.user.name}\n**E-posta:** ${orderData.user.email}\n**Kullanıcı Adı:** ${orderData.user.username}`,
                    inline: false
                },
                {
                    name: "📦 Sipariş Detayları",
                    value: itemsList,
                    inline: false
                },
                {
                    name: "💰 Özet",
                    value: `**Ara Toplam:** ${orderData.subtotal.toFixed(2)} ₺\n**KDV (%18):** ${orderData.tax.toFixed(2)} ₺\n**Toplam:** ${orderData.total.toFixed(2)} ₺`,
                    inline: false
                }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: `Sipariş ID: ${orderData.id}`
            }
        };

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: "Eğitim Market Sipariş Botu",
                avatar_url: "https://i.imgur.com/abcdefg.png",
                embeds: [embed],
                content: `@here Yeni sipariş geldi! 🎉`
            }),
        });

        return response.ok;
    } catch (error) {
        console.error('Discord webhook error:', error);
        return false;
    }
}

// Ödeme işlemi (yeniden düzenlenmiş)
async function processCheckout() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        showAlert('Ödeme yapabilmek için giriş yapmalısınız!', 'danger');
        setTimeout(() => window.location.href = 'giris.html', 1500);
        return false;
    }
    
    if (cart.length === 0) {
        showAlert('Sepetiniz boş!', 'warning');
        return false;
    }

    const orderId = Date.now();
    const orderData = {
        id: orderId,
        user: {
            id: currentUser.id,
            name: `${currentUser.firstName} ${currentUser.lastName}`,
            email: currentUser.email,
            username: currentUser.username
        },
        items: [...cart],
        subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        tax: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.18,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.18,
        date: new Date().toISOString(),
        status: "Bekliyor"
    };

    // Kullanıcı geçmişini güncelle
    currentUser.purchases = currentUser.purchases || [];
    currentUser.purchases.push({
        id: orderId,
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
        })),
        total: orderData.total,
        date: orderData.date,
        status: "Bekliyor"
    });

    // Kullanıcı verilerini güncelle
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.map(user => user.id === currentUser.id ? currentUser : user);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Discord'a gönder
    const discordSuccess = await sendOrderToDiscord(orderData);
    
    if (discordSuccess) {
        // Sepeti temizle
        cart = [];
        saveCartToStorage();
        
        showAlert('Siparişiniz alındı! Discord sunucumuza bekleriz.', 'success');
        setTimeout(() => window.location.href = 'hesabim.html', 2000);
    } else {
        showAlert('Sipariş oluşturuldu ancak bildirim gönderilemedi!', 'warning');
    }
    
    return discordSuccess;
}

// Sipariş arama sistemi (optimize edilmiş)
async function searchOrder(orderId) {
    if (!orderId) {
        showAlert('Lütfen bir sipariş numarası girin!', 'warning');
        return false;
    }

    showAlert('Sipariş aranıyor...', 'info');

    // Önce localStorage'da ara
    const allUsers = JSON.parse(localStorage.getItem('users')) || [];
    for (const user of allUsers) {
        if (user.purchases) {
            const order = user.purchases.find(p => p.id == orderId);
            if (order) {
                displayOrderDetails(order, user);
                await searchOrderInDiscord(orderId); // Discord'ta da ara
                return true;
            }
        }
    }

    // Local'de bulunamadı, Discord'ta ara
    const discordResult = await searchOrderInDiscord(orderId);
    if (discordResult) {
        document.getElementById('order-search-results').innerHTML = `
            <div class="alert alert-info">
                Sipariş #${orderId} bulunamadı. Discord üzerinden arandı, sonuçlar kanalda görüntülenecek.
            </div>
        `;
    } else {
        showAlert('Sipariş bulunamadı ve Discord bağlantısı kurulamadı!', 'danger');
    }
    
    return discordResult;
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    
    // Ödeme butonu eventi
    document.getElementById('checkout-btn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        await processCheckout();
    });

    // Sipariş arama formu
    document.getElementById('order-search-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const orderId = document.getElementById('order-search-input').value.trim();
        await searchOrder(orderId);
    });
});
