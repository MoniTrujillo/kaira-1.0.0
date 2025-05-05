document.addEventListener('DOMContentLoaded', function() {
  // Variables del carrito
  let cart = [];
  const cartItemsList = document.getElementById('cartItems');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartShipping = document.getElementById('cartShipping');
  const cartTotal = document.getElementById('cartTotal');
  const emptyCartMessage = document.getElementById('emptyCartMessage');
  const cartContent = document.getElementById('cartContent');
  const checkoutBtn = document.getElementById('checkoutBtn');

  // Crear elemento para el contador del carrito
  const cartCounter = document.createElement('span');
  cartCounter.className = 'cart-counter';
  cartCounter.textContent = '0';
  
  // Añadir el contador al icono del carrito
  const cartIcon = document.querySelector('.cart-icon');
  if (cartIcon) {
    cartIcon.appendChild(cartCounter);
  }

  // Escuchar clicks en botones "Añadir al carrito" y acciones del carrito
  document.addEventListener('click', function(e) {
    // Añadir producto al carrito
    if (e.target.classList.contains('add-to-cart-btn')) {
      const product = {
        id: e.target.dataset.productId,
        name: e.target.dataset.productName,
        price: parseFloat(e.target.dataset.productPrice),
        image: e.target.dataset.productImage,
        quantity: 1
      };
      addToCart(product);
    }
    
    // Incrementar cantidad
    if (e.target.classList.contains('quantity-increase')) {
      const productId = e.target.closest('.cart-item').dataset.productId;
      updateQuantity(productId, 1);
    }
    
    // Decrementar cantidad (con límite mínimo de 1)
    if (e.target.classList.contains('quantity-decrease')) {
      const productId = e.target.closest('.cart-item').dataset.productId;
      const item = cart.find(item => item.id === productId);
      
      // Solo disminuir si la cantidad es mayor que 1
      if (item && item.quantity > 1) {
        updateQuantity(productId, -1);
      }
    }
    
    // Eliminar item del carrito
    if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
      const cartItem = e.target.closest('.cart-item');
      const productId = cartItem.dataset.productId;
      
      // Mostrar animación de eliminación
      cartItem.style.transition = 'all 0.3s ease';
      cartItem.style.opacity = '0';
      cartItem.style.transform = 'translateX(-100px)';
      cartItem.style.height = '0';
      cartItem.style.margin = '0';
      cartItem.style.padding = '0';
      cartItem.style.overflow = 'hidden';
      
      // Esperar a que termine la animación antes de eliminar
      setTimeout(() => {
        removeFromCart(productId);
        showRemoveNotification();
      }, 300);
    }
  });

  // Función para añadir producto al carrito
  function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push(product);
    }
    
    updateCartUI();
    showAddNotification();
    updateCartCounter();
  }

  // Función para actualizar la cantidad de un producto
  function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    
    if (item) {
      item.quantity += change;
      
      // Asegurarse que la cantidad nunca sea menor que 1
      if (item.quantity < 1) {
        item.quantity = 1;
      }
      
      updateCartUI();
      updateCartCounter();
    }
  }

  // Función para eliminar producto del carrito
  function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    updateCartCounter();
  }

  // Función para actualizar el contador del carrito
  function updateCartCounter() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCounter.textContent = totalItems;
    
    // Mostrar u ocultar el contador según haya items
    cartCounter.style.display = totalItems > 0 ? 'flex' : 'none';
  }

  // Función para mostrar notificación al añadir producto
  function showAddNotification() {
    const notification = document.createElement('div');
    notification.className = 'cart-toast-notification add';
    
    notification.innerHTML = `
      <div class="toast-content">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>Producto añadido al carrito</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar notificación
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // Ocultar y eliminar después de 3 segundos
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  // Función para mostrar notificación al eliminar producto
  function showRemoveNotification() {
    const notification = document.createElement('div');
    notification.className = 'cart-toast-notification remove';
    
    notification.innerHTML = `
      <div class="toast-content">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>Producto eliminado del carrito</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar notificación
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // Ocultar y eliminar después de 3 segundos
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  // Función para actualizar la interfaz del carrito
  function updateCartUI() {
    // Mostrar/ocultar mensaje de carrito vacío
    if (cart.length === 0) {
      emptyCartMessage.style.display = 'block';
      cartContent.style.display = 'none';
      checkoutBtn.disabled = true;
    } else {
      emptyCartMessage.style.display = 'none';
      cartContent.style.display = 'block';
      checkoutBtn.disabled = false;
    }
    
    // Limpiar lista de items
    cartItemsList.innerHTML = '';
    
    // Calcular subtotal
    let subtotal = 0;
    
    // Añadir cada item al carrito
    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      
      const li = document.createElement('li');
      li.className = 'list-group-item cart-item';
      li.dataset.productId = item.id;
      
      li.innerHTML = `
        <div class="d-flex gap-3">
          <div class="flex-shrink-0">
            <img src="${item.image}" alt="${item.name}" width="80" height="80" class="rounded-2 object-fit-cover">
          </div>
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between">
              <h6 class="mb-1">${item.name}</h6>
              
            </div>
            <div style="display: flex; justify-content: space-between;">
  <span class="text-muted">$${item.price.toFixed(2)}</span>
  <strong>$${itemTotal.toFixed(2)}</strong>
</div>
            <div class="d-flex justify-content-between align-items-center mt-2 gap-3">
  <!-- Bloque izquierdo (controles de cantidad) -->
  <div class="input-group input-group-sm" style="width: fit-content;">
    <button class="btn btn-outline-secondary quantity-decrease ${item.quantity <= 1 ? 'disabled' : ''}" type="button" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
    <input type="text" class="form-control text-center quantity-input" style="width: 40px;" value="${item.quantity}" readonly>
    <button class="btn btn-outline-secondary quantity-increase" type="button">+</button>
  </div>
  
  <!-- Bloque derecho (botón eliminar) -->
  <button class="btn btn-sm btn-link text-danger remove-item p-0 d-flex align-items-center gap-1" aria-label="Eliminar producto">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
    <span>Eliminar</span>
  </button>
</div>

            </div>
          </div>
        </div>
      `;
      
      cartItemsList.appendChild(li);
    });
    
    // Calcular envío (ejemplo: $50 si subtotal < $1000, gratis si no)
    const shipping = subtotal >= 1000 ? 0 : 50;
    const total = subtotal + shipping;
    
    // Actualizar resumen
    cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    cartShipping.textContent = shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`;
    cartTotal.textContent = `$${total.toFixed(2)}`;
    
    // Ajustar el scroll del carrito
    adjustCartScroll();
  }

  // Función para ajustar el scroll del carrito
  function adjustCartScroll() {
  const offcanvasBody = document.querySelector('.offcanvas-body');
  const cartItemsContainer = document.querySelector('.cart-items-container');
  
  if (!offcanvasBody || !cartItemsContainer) return;
  
  // Calcula la altura disponible para los items
  const viewportHeight = window.innerHeight;
  const headerHeight = document.querySelector('.offcanvas-header').offsetHeight;
  const summaryHeight = document.querySelector('.order-summary').offsetHeight;
  
  // Establece la altura máxima para los items
  const maxItemsHeight = viewportHeight - headerHeight - summaryHeight - 20;
  
  // Aplica el estilo
  cartItemsContainer.style.maxHeight = `${maxItemsHeight}px`;
  cartItemsContainer.style.overflowY = 'auto';
}

  // Inicializar el carrito
  updateCartUI();
  updateCartCounter();
  
  // Ajustar scroll cuando se abre el carrito
  const offcanvasCart = document.getElementById('offcanvasCart');
  if (offcanvasCart) {
    offcanvasCart.addEventListener('shown.bs.offcanvas', adjustCartScroll);
  }
  window.addEventListener('resize', adjustCartScroll);
});