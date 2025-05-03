// cart.js - Funcionalidad del carrito de compras

document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountElement = document.querySelector('.cart-count');
    const offcanvasCart = document.getElementById('offcanvasCart');
    const cartItemsList = offcanvasCart.querySelector('.list-group');
    const cartTotalElement = offcanvasCart.querySelector('strong');
    const checkoutBtn = offcanvasCart.querySelector('.btn-primary');
    
    // Inicializar el carrito
    updateCartCount();
    renderCartItems();
    
    // Eventos para botones "Add to cart"
    document.addEventListener('click', function(e) {
        if (e.target.hasAttribute('data-after') && e.target.getAttribute('data-after') === 'Add to cart') {
            e.preventDefault();
            const productElement = e.target.closest('.product-content');
            const productName = productElement.querySelector('h5 a').textContent;
            const productPrice = parseFloat(e.target.querySelector('span').textContent.replace('$', ''));
            
            addToCart({
                name: productName,
                price: productPrice,
                quantity: 1
            });
        }
    });
    
    // Función para añadir productos al carrito
    function addToCart(product) {
        const existingProduct = cart.find(item => item.name === product.name);
        
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push(product);
        }
        
        saveCart();
        updateCartCount();
        renderCartItems();
        
        // Mostrar notificación
        showNotification(`${product.name} añadido al carrito`);
    }
    
    // Función para guardar el carrito en localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    // Función para actualizar el contador del carrito
    function updateCartCount() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        if (cartCountElement) {
            cartCountElement.textContent = `(${totalItems})`;
        }
    }
    
    // Función para renderizar los items del carrito
    function renderCartItems() {
        if (!cartItemsList) return;
        
        // Limpiar la lista
        cartItemsList.innerHTML = '';
        
        // Añadir cada producto
        cart.forEach(item => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between lh-sm';
            
            li.innerHTML = `
                <div>
                    <h6 class="my-0">${item.name}</h6>
                    <small class="text-body-secondary">Cantidad: ${item.quantity}</small>
                </div>
                <span class="text-body-secondary">$${(item.price * item.quantity).toFixed(2)}</span>
            `;
            
            cartItemsList.appendChild(li);
        });
        
        // Añadir el total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const totalLi = document.createElement('li');
        totalLi.className = 'list-group-item d-flex justify-content-between';
        totalLi.innerHTML = `
            <span>Total (USD)</span>
            <strong>$${total.toFixed(2)}</strong>
        `;
        
        cartItemsList.appendChild(totalLi);
        
        // Actualizar el total en el elemento del carrito
        if (cartTotalElement) {
            cartTotalElement.textContent = `$${total.toFixed(2)}`;
        }
    }
    
    // Función para mostrar notificaciones
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'alert alert-success position-fixed top-0 end-0 m-3';
        notification.style.zIndex = '9999';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Evento para el botón de checkout
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            alert('Redirigiendo al proceso de pago...');
            // Aquí iría la lógica para redirigir a la página de checkout
        });
    }
    
    // Opcional: Funcionalidad para eliminar items del carrito
    // Podrías añadir botones de eliminar junto a cada producto
});