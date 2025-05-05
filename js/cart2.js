// Carrito de compras
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar el carrito
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let cartCount = document.querySelector('.cart-count');
  
  // Actualizar contador del carrito
  function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = `(${totalItems})`;
    cartCount.setAttribute('data-count', totalItems);
    
    // Mostrar/ocultar mensaje de carrito vacío
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const cartContent = document.getElementById('cartContent');
    
    if (cart.length === 0) {
      emptyCartMessage.style.display = 'block';
      cartContent.style.display = 'none';
    } else {
      emptyCartMessage.style.display = 'none';
      cartContent.style.display = 'block';
    }
  }
  
  // Renderizar items del carrito
  function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    cartItemsContainer.innerHTML = '';
    
    cart.forEach((item, index) => {
      const cartItem = document.createElement('li');
      cartItem.className = 'list-group-item';
      cartItem.innerHTML = `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-image">
          <div class="cart-item-details">
            <h6 class="cart-item-title">${item.name}</h6>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            <div class="cart-item-actions">
              <div class="quantity-control">
                <button class="quantity-btn minus" data-index="${index}">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-index="${index}">
                <button class="quantity-btn plus" data-index="${index}">+</button>
              </div>
              <button class="remove-item" data-index="${index}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      `;
      cartItemsContainer.appendChild(cartItem);
    });
    
    // Actualizar totales
    updateCartTotals();
  }
  
  // Actualizar totales del carrito
  function updateCartTotals() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 1000 ? 0 : 150; // Envío gratis para compras mayores a $1000
    const total = subtotal + shipping;
    
    document.getElementById('cartSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cartShipping').textContent = shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`;
    document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
  }
  
  // Agregar producto al carrito
  function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }
    
    // Guardar en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Actualizar UI
    updateCartCount();
    renderCartItems();
  }
  
  // Eliminar producto del carrito
  function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
  }
  
  // Actualizar cantidad de un producto
  function updateQuantity(index, newQuantity) {
    if (newQuantity < 1) newQuantity = 1;
    cart[index].quantity = parseInt(newQuantity);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartTotals();
  }
  
  // Manejadores de eventos
  document.addEventListener('click', function(e) {
    // Botón "Agregar al carrito"
    if (e.target.classList.contains('add-to-cart-btn')) {
      const productCard = e.target.closest('.banner-item, .product-item');
      const product = {
        id: productCard.querySelector('a').getAttribute('href').split('/').pop().split('.').shift(),
        name: productCard.querySelector('.element-title, h5').textContent.trim(),
        price: parseFloat(productCard.querySelector('.product-price').textContent.replace('$', '')),
        image: productCard.querySelector('img').src
      };
      
      addToCart(product);
      
      // Animación fly to cart
      const buttonRect = e.target.getBoundingClientRect();
      const cartButton = document.querySelector('[data-bs-target="#offcanvasCart"]');
      const cartButtonRect = cartButton.getBoundingClientRect();
      
      const flyElement = document.createElement('div');
      flyElement.className = 'fly-to-cart';
      flyElement.innerHTML = `
        <div style="width: 40px; height: 40px; background: #fff; border-radius: 50%; 
                    display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(0,0,0,0.2);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#8C907E">
            <use xlink:href="#cart"></use>
          </svg>
        </div>
      `;
      
      flyElement.style.left = `${buttonRect.left + buttonRect.width/2 - 20}px`;
      flyElement.style.top = `${buttonRect.top}px`;
      document.body.appendChild(flyElement);
      
      setTimeout(() => {
        document.body.removeChild(flyElement);
      }, 1000);
    }
    
    // Botones de cantidad en el carrito
    if (e.target.classList.contains('quantity-btn')) {
      const index = parseInt(e.target.getAttribute('data-index'));
      const input = e.target.closest('.quantity-control').querySelector('.quantity-input');
      
      if (e.target.classList.contains('plus')) {
        input.value = parseInt(input.value) + 1;
      } else if (e.target.classList.contains('minus')) {
        input.value = parseInt(input.value) - 1;
      }
      
      updateQuantity(index, input.value);
    }
    
    // Eliminar item del carrito
    if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
      const button = e.target.classList.contains('remove-item') ? e.target : e.target.closest('.remove-item');
      const index = parseInt(button.getAttribute('data-index'));
      removeFromCart(index);
    }
  });
  
  // Cambio en input de cantidad
  document.addEventListener('change', function(e) {
    if (e.target.classList.contains('quantity-input')) {
      const index = parseInt(e.target.getAttribute('data-index'));
      updateQuantity(index, e.target.value);
    }
  });
  
  // Botón de checkout
  document.getElementById('checkoutBtn').addEventListener('click', function() {
    alert('Redirigiendo al proceso de pago...');
    // Aquí iría la lógica para redirigir al checkout
  });
  
  // Inicializar carrito al cargar la página
  updateCartCount();
  renderCartItems();
  
  // Abrir carrito cuando se agrega un producto (para móviles)
  if (window.innerWidth < 992) {
    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('add-to-cart-btn')) {
        const offcanvasCart = new bootstrap.Offcanvas(document.getElementById('offcanvasCart'));
        setTimeout(() => {
          offcanvasCart.show();
        }, 1000);
      }
    });
  }
});

// Función para mostrar notificación
function showNotification(message) {
    const notification = document.getElementById('cartNotification');
    const messageElement = document.getElementById('notificationMessage');
    
    messageElement.textContent = message;
    notification.classList.add('show');
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }
  
  // Manejador del botón "Agregar al carrito"
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('add-to-cart-btn')) {
      const productCard = e.target.closest('.banner-item, .product-item');
      const productName = productCard.querySelector('.element-title, h5').textContent.trim();
      
      // Aquí iría tu lógica para agregar al carrito
      // addToCart(product);
      
      // Mostrar notificación
      showNotification(`"${productName}" agregado al carrito`);
      
      // Actualizar contador del carrito
      updateCartCount();
    }
  });