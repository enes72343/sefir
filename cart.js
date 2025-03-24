// Discord Webhook Integration - Fixed Version
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
            color: 0x00ff00, // Green color
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
                avatar_url: "https://i.imgur.com/LJ0lg4Z.png", // Replace with your logo
                embeds: [embed],
                content: "Yeni bir sipariş oluşturuldu! <@&ROLE_ID>" // Replace ROLE_ID with your role ID
            }),
            timeout: 5000 // 5 second timeout
        });

        // Check response
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

// Enhanced checkout process with better error handling
async function processCheckout() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // Validate user
        if (!currentUser) {
            showAlert('Ödeme yapabilmek için giriş yapmalısınız!', 'danger');
            setTimeout(() => window.location.href = 'giris.html', 1500);
            return false;
        }
        
        // Validate cart
        if (!cart || cart.length === 0) {
            showAlert('Sepetiniz boş!', 'warning');
            return false;
        }

        // Prepare order data
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

// Debugging function to test webhook
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
    return result;
}

// Add to DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // ... other code ...
    
    // Add test button for debugging (remove in production)
    const testBtn = document.createElement('button');
    testBtn.textContent = 'Test Discord Webhook';
    testBtn.className = 'btn btn-secondary mt-3';
    testBtn.onclick = testDiscordWebhook;
    document.body.appendChild(testBtn);
});
