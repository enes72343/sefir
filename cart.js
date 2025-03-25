// Global cart variable
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOMContentLoaded event handler
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart
    renderCart();
    updateCartCount();

    // Checkout button event
    document.getElementById('checkout-btn')?.addEventListener('click', processCheckout);

    // Add test button for debugging
    const testBtn = document.createElement('button');
    testBtn.textContent = 'Test Discord Webhook';
    testBtn.className = 'btn btn-secondary mt-3';
    testBtn.onclick = testDiscordWebhook;
    document.body.appendChild(testBtn);
});

// Cart functions
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
}

function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

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

    // Event delegation for cart actions
    cartItemsContainer.addEventListener('click', handleCartActions);
    updateCartSummary();
}

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

// Discord Webhook Integration
async function sendOrderToDiscord(orderData) {
    const WEBHOOK_URL = 'https://discord.com/api/webhooks/1353848010735616032/V_lGzTIkpX2fvQLs7v20h2ubd_M6dSXcKta6gac1JelX3fiCm816PkWgvSwXy26-NOTI';

    try {
        // Validate order data
        if (!orderData || !orderData.user || !orderData.items) {
            console.error('Invalid order data structure');
            return false;
        }

        // Create Discord embed message
        const embed = {
            title: "🛒 Yeni Sipariş Bildirimi",
            color: 0x00ff00,
            fields: [
                {
                    name: "👤 Müşteri Bilgileri",
                    value: `**Ad:** ${orderData.user.name || 'Bilgi Yok'}\n` +
                           `**E-posta:** ${orderData.user.email || 'Bilgi Yok'}\n` +
                           `**Kullanıcı Adı:** ${orderData.user.username || 'Bilgi Yok'}`,
                    inline: false
                },
                {
                    name: "📦 Sipariş Detayları",
                    value: orderData.items.map(item => 
                        `- ${item.name || 'Ürün'} (${item.quantity || 0} x ${(item.price || 0).toFixed(2)}₺)`
                    ).join('\n') || 'Ürün bilgisi yok',
                    inline: false
                },
                {
                    name: "💰 Ödeme Bilgileri",
                    value: `**Ara Toplam:** ${(orderData.subtotal || 0).toFixed(2)}₺\n` +
                           `**KDV (%18):** ${(orderData.tax || 0).toFixed(2)}₺\n` +
                           `**Toplam:** ${(orderData.total || 0).toFixed(2)}₺`,
                    inline: false
                }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: `Sipariş ID: ${orderData.id || 'Bilgi Yok'} | ${new Date().toLocaleString('tr-TR')}`
            }
        };

        // Send to Discord
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: "Eğitim Market Sipariş Sistemi",
                avatar_url: "https://i.imgur.com/LJ0lg4Z.png",
                embeds: [embed],
                content: "Yeni bir sipariş oluşturuldu! <@&ROLE_ID>"
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Discord API Error:', response.status, errorText);
            return false;
        }

        console.log('Discord notification sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending to Discord:', error);
        return false;
    }
}

// Checkout process
async function processCheckout() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) {
            showAlert('Ödeme yapabilmek için giriş yapmalısınız!', 'danger');
            setTimeout(() => window.location.href = 'giris.html', 1500);
            return false;
        }
        
        if (!cart || cart.length === 0) {
            showAlert('Sepetiniz boş!', 'warning');
            return false;
        }

        const orderId = 'ORD-' + Date.now();
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.18;
        const total = subtotal + tax;

        const orderData = {
            id: orderId,
            user: {
                id: currentUser.id,
                name: `${currentUser.firstName} ${currentUser.lastName}`,
                email: currentUser.email,
                username: currentUser.username
            },
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            })),
            subtotal,
            tax,
            total,
            date: new Date().toISOString(),
            status: "Ödeme Bekliyor"
        };

        // Update user data
        currentUser.purchases = currentUser.purchases || [];
        currentUser.purchases.push(orderData);
        
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users = users.map(user => user.id === currentUser.id ? currentUser : user);
        
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Send to Discord
        const discordSuccess = await sendOrderToDiscord(orderData);
        
        if (discordSuccess) {
            // Clear cart
            cart = [];
            saveCartToStorage();
            
            showAlert('Siparişiniz alındı! Yönlendiriliyorsunuz...', 'success');
            setTimeout(() => {
                window.location.href = 'hesabim.html?order=' + orderId;
            }, 2000);
        } else {
            showAlert('Sipariş oluşturuldu ancak bildirim gönderilemedi!', 'warning');
        }
        
        return discordSuccess;
    } catch (error) {
        console.error('Checkout error:', error);
        showAlert('Sipariş işlemi sırasında bir hata oluştu!', 'danger');
        return false;
    }
}

// Test function
async function testDiscordWebhook() {
    console.log('Testing Discord webhook...');
    const testData = {
        id: 'TEST-' + Date.now(),
        user: {
            name: "Test Kullanıcı",
            email: "test@example.com",
            username: "testuser123"
        },
        items: [
            { name: "Test Ürün 1", price: 100, quantity: 2 },
            { name: "Test Ürün 2", price: 50, quantity: 1 }
        ],
        subtotal: 250,
        tax: 45,
        total: 295,
        date: new Date().toISOString(),
        status: "Test Siparişi"
    };
    
    const result = await sendOrderToDiscord(testData);
    console.log('Webhook test result:', result);
    alert(result ? 'Test başarılı! Discord kanalını kontrol edin.' : 'Test başarısız! Konsolu kontrol edin.');
    return result;
}

// Helper function
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} fixed-top mx-auto mt-3`;
    alertDiv.style.maxWidth = '500px';
    alertDiv.style.zIndex = '9999';
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Sepeti render et
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    
    if(cart.length === 0) {
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
        <div class="cart-item row mb-3 align-items-center">
            <div class="col-md-2">
                <img src="${item.image}" alt="${item.name}" class="img-fluid rounded">
            </div>
            <div class="col-md-5">
                <h5>${item.name}</h5>
                <p class="text-muted mb-0">${item.price} ₺</p>
            </div>
            <div class="col-md-3">
                <div class="input-group">
                    <button class="btn btn-outline-secondary minus-btn" data-id="${item.id}">-</button>
                    <input type="text" class="form-control text-center quantity-input" value="${item.quantity}" readonly>
                    <button class="btn btn-outline-secondary plus-btn" data-id="${item.id}">+</button>
                </div>
            </div>
            <div class="col-md-2 text-end">
                <h5>${(item.price * item.quantity).toFixed(2)} ₺</h5>
                <button class="btn btn-sm btn-outline-danger remove-btn" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Buton eventleri
    document.querySelectorAll('.plus-btn').forEach(btn => {
        btn.addEventListener('click', increaseQuantity);
    });
    
    document.querySelectorAll('.minus-btn').forEach(btn => {
        btn.addEventListener('click', decreaseQuantity);
    });
    
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', removeItem);
    });
    
    updateCartSummary();
}

// Miktar artırma
function increaseQuantity(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const item = cart.find(item => item.id === productId);
    item.quantity += 1;
    updateCart();
    renderCart();
}

// Miktar azaltma
function decreaseQuantity(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const item = cart.find(item => item.id === productId);
    
    if(item.quantity > 1) {
        item.quantity -= 1;
    } else {
        cart = cart.filter(item => item.id !== productId);
    }
    
    updateCart();
    renderCart();
}

// Ürün silme
function removeItem(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    renderCart();
}

// Sepet özetini güncelle
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    
    document.getElementById('cart-total').textContent = subtotal.toFixed(2) + ' ₺';
    document.getElementById('cart-tax').textContent = tax.toFixed(2) + ' ₺';
    document.getElementById('cart-grand-total').textContent = total.toFixed(2) + ' ₺';
    
    // Navbar'daki sepet sayacını güncelle
    document.getElementById('cart-count').textContent = cart.reduce((total, item) => total + item.quantity, 0);
}

// Ödemeye geç butonu
document.getElementById('checkout-btn').addEventListener('click', () => {
    const orderData = {
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        date: new Date().toISOString()
    };
    
    // Discord Webhook'a gönderim (örnek)
    alert('Siparişiniz alındı! Discord sunucumuza katılarak ödeme bilgilerini alabilirsiniz.');
    
    // Sepeti temizle
    cart = [];
    updateCart();
    renderCart();
});

// Sepeti güncelle
function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    document.getElementById('cart-count').textContent = cart.reduce((total, item) => total + item.quantity, 0);
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});
