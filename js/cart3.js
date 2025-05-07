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
  const orderSummary = document.querySelector('.order-summary');
  const paypalButtonsContainer = document.getElementById('paypal-button-container');

  // Ocultar botones de PayPal inicialmente
  paypalButtonsContainer.style.display = 'none';

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
      
      if (item && item.quantity > 1) {
        updateQuantity(productId, -1);
      }
    }
    
    // Eliminar item del carrito
    if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
      const cartItem = e.target.closest('.cart-item');
      const productId = cartItem.dataset.productId;
      
      cartItem.style.transition = 'all 0.3s ease';
      cartItem.style.opacity = '0';
      cartItem.style.transform = 'translateX(-100px)';
      cartItem.style.height = '0';
      cartItem.style.margin = '0';
      cartItem.style.padding = '0';
      cartItem.style.overflow = 'hidden';
      
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
    cartCounter.style.display = totalItems > 0 ? 'flex' : 'none';
  }

  // Función para actualizar solo los totales
  function updateCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 1000 ? 0 : 50;
    const total = subtotal + shipping;
    
    document.getElementById('cartSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cartShipping').textContent = shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`;
    document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
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
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
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
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  // Función para actualizar la interfaz del carrito
  function updateCartUI() {
    if (cart.length === 0) {
      emptyCartMessage.style.display = 'block';
      cartContent.style.display = 'none';
      checkoutBtn.disabled = true;
      
      // Si el carrito está vacío y estamos en modo pago, volver al resumen normal
      if (orderSummary.classList.contains('payment-mode')) {
        showOrderSummary();
      }
    } else {
      emptyCartMessage.style.display = 'none';
      cartContent.style.display = 'block';
      checkoutBtn.disabled = false;
    }
    
    cartItemsList.innerHTML = '';
    
    let subtotal = 0;
    
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
              <div class="input-group input-group-sm" style="width: fit-content;">
                <button class="btn btn-outline-secondary quantity-decrease ${item.quantity <= 1 ? 'disabled' : ''}" type="button" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                <input type="text" class="form-control text-center quantity-input" style="width: 40px;" value="${item.quantity}" readonly>
                <button class="btn btn-outline-secondary quantity-increase" type="button">+</button>
              </div>
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
      `;
      
      cartItemsList.appendChild(li);
    });
    
    // Actualizar los totales
    updateCartTotals();
    adjustCartScroll();
  }

  // Función para mostrar los métodos de pago
  function showPaymentMethods() {
    // Calcular total
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 1000 ? 0 : 50;
    const total = subtotal + shipping;
    
    // Cambiar el contenido del resumen
    orderSummary.classList.add('payment-mode');
    orderSummary.innerHTML = `
      <h5 class="mb-3">MÉTODOS DE PAGO</h5>
      <div class="payment-methods-container">
        <div class="mb-3">
          <p class="text-muted mb-2">Total a pagar: <strong>$${total.toFixed(2)}</strong></p>
          <div id="paypal-button-container"></div>
        </div>
        <button id="backToSummary" class="btn btn-outline-secondary btn-payment">
          <i class="bi bi-arrow-left"></i> Volver al resumen
        </button>
      </div>
    `;
    
    // Ocultar el contenedor global de PayPal y crear uno local
    paypalButtonsContainer.style.display = 'none';
    const localPaypalContainer = orderSummary.querySelector('#paypal-button-container');
    
    // Inicializar botones de PayPal
    paypal.Buttons({
      style: {
        color: 'blue',
        label: 'pay',
        height: 45,
        layout: 'vertical'
      },
      createOrder: function(data, actions) {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: total.toFixed(2),
              currency_code: 'USD'
            },
            description: `Compra de ${cart.length} producto(s)`
          }]
        });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
          console.log(details);
          alert("Pago completado con éxito");
          cart = [];
          updateCartUI();
          updateCartCounter();
          showOrderSummary();
        });
      },
      onCancel: function(data) {
        alert("Has cancelado el pago");
      },
      onError: function(err) {
        console.error(err);
        alert("Error al procesar el pago");
      }
    }).render(localPaypalContainer);
    
    // Evento para el botón "Volver al resumen"
    document.getElementById('backToSummary').addEventListener('click', function() {
      showOrderSummary();
    });
}

  // Función para volver al resumen normal
  function showOrderSummary() {
    orderSummary.classList.remove('payment-mode');
    orderSummary.innerHTML = `

      <ul class="list-group list-group-flush">
        <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0">
          Subtotal
          <span id="cartSubtotal">$0.00</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center px-0">
          Envío
          <span id="cartShipping">$0.00</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 mb-3">
          <div>
            <strong>Total</strong>
          </div>
          <span id="cartTotal"><strong>$0.00</strong></span>
        </li>
      </ul>
      <button class="w-100 btn btn-primary btn-lg mb-3" id="checkoutBtn">Proceder al pago</button>
      <button class="w-100 btn btn-outline-primary btn-lg" data-bs-dismiss="offcanvas">Seguir comprando</button>
    `;
    
    // Ocultar botones de PayPal
    paypalButtonsContainer.style.display = 'none';
    
    // Reasignar el evento al botón de checkout
    const newCheckoutBtn = document.getElementById('checkoutBtn');
    if (newCheckoutBtn) {
      newCheckoutBtn.addEventListener('click', showPaymentMethods);
    }
    
    // Actualizar los valores del resumen con los datos actuales
    updateCartTotals();
  }

  // Función para ajustar el scroll del carrito
  function adjustCartScroll() {
    const offcanvasBody = document.querySelector('.offcanvas-body');
    const cartItemsContainer = document.querySelector('.cart-items-container');
    
    if (!offcanvasBody || !cartItemsContainer) return;
    
    const viewportHeight = window.innerHeight;
    const headerHeight = document.querySelector('.offcanvas-header').offsetHeight;
    const summaryHeight = document.querySelector('.order-summary').offsetHeight;
    const maxItemsHeight = viewportHeight - headerHeight - summaryHeight - 20;
    
    cartItemsContainer.style.maxHeight = `${maxItemsHeight}px`;
    cartItemsContainer.style.overflowY = 'auto';
  }

  // Inicializar el carrito
  updateCartUI();
  updateCartCounter();
  
  // Evento para el botón de checkout
  checkoutBtn.addEventListener('click', showPaymentMethods);
  
  // Ajustar scroll cuando se abre el carrito
  const offcanvasCart = document.getElementById('offcanvasCart');
  if (offcanvasCart) {
    offcanvasCart.addEventListener('shown.bs.offcanvas', adjustCartScroll);
  }
  window.addEventListener('resize', adjustCartScroll);
});