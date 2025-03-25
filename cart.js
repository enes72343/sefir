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
