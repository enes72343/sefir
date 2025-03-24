// Ürün verileri
const products = [
    {
        id: 1,
        name: "Logo Tasarımı Paketi",
        price: 150,
        image: "https://i.pinimg.com/736x/65/54/30/6554309c98b3dd317671872e366bc9df.jpg",
        description: "Sıfırdan ileri seviyeye Logo Tasarımı",
        features: ["Kaliteli Hizmet", "Sıfırdan Çizim", "Sınırsız Rezive", "Sefir Güvencesiyle 7/24 Destek"],
        category: "programlama"
    },
    {
        id: 2,
        name: "Web Geliştirme Paketi",
        price: 900,
        image: "https://i.pinimg.com/736x/14/51/df/1451dfa4db17f452ce27bbe32209e054.jpg",
        description: "HTML, CSS, JavaScript ve React eğitimi",
        features: ["Kariyerinize Hızlı Başlangıç", "İş Garantili Beceriler Öğrenin", "Şirketlerin Aradığı Yetenekleri Kazanın"],
        category: "web"
    },
    {
        id: 3,
        name: "İnstagram Destek Hattı",
        price: 250,
        image: "https://support.quadlockcase.com/hc/article_attachments/10519544302479",
        description: "",
        features: ["Kaliteli Otomasyon", "Hızlı Yanıt", "7/24 Aktiflik", "Kesintisiz Destek"],
        category: "veri"
    }
];

// Sepet işlemleri
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Ürünleri listeleme
function renderProducts() {
    const productsContainer = document.getElementById('products');
    
    productsContainer.innerHTML = products.map(product => `
        <div class="col-md-4">
            <div class="card product-card mb-4">
                <img src="${product.image}" class="card-img-top product-img" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description}</p>
                    <ul class="mb-3">
                        ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                    <div class="d-flex justify-content-between align-items-center">
                        <h4 class="mb-0 text-primary">${product.price} ₺</h4>
                        <button class="btn btn-primary add-to-cart" data-id="${product.id}">
                            <i class="fas fa-cart-plus"></i> Sepete Ekle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Sepete ekle butonlarına event ekle
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

// Sepete ekleme fonksiyonu
function addToCart(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const product = products.find(p => p.id === productId);
    
    const existingItem = cart.find(item => item.id === productId);
    
    if(existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCart();
    alert(`${product.name} sepete eklendi!`);
}

// Sepeti güncelle
function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    document.getElementById('cart-count').textContent = cart.reduce((total, item) => total + item.quantity, 0);
}

// Sayfa yüklendiğinde çalışacaklar
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCart();
});
