async function loadProducts() {
    const response = await fetch('data/products.json');
    products = await response.json();
    renderProducts();
  }
  
  function renderProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = products.map(product => `
      <div class="swiper-slide">
        <div class="banner-item image-zoom-effect">
          <div class="image-holder">
            <a href="#">
              <img src="${product.image}" alt="${product.name}" class="img-fluid product-image">
            </a>
          </div>
          <div class="banner-content py-4">
            <h5 class="element-title text-uppercase">
              <a href="index.html" class="item-anchor">${product.name}</a>
            </h5>
            <p>Descripción breve aquí...</p> <!-- Opcional: Añade un campo "description" en tu JSON -->
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <button class="add-to-cart-btn" onclick="addToCart('${product.id}')">Añadir al carrito</button>
          </div>
        </div>
      </div>
    `).join('');
  
    // Re-inicializa Swiper (si lo usas para el slider)
    if (typeof Swiper !== 'undefined') {
      new Swiper('.main-swiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        breakpoints: {
          768: {
            slidesPerView: 2,
          },
          992: {
            slidesPerView: 3,
          }
        }
      });
    }
  }
  
  // Inicializar
  document.addEventListener('DOMContentLoaded', loadProducts);