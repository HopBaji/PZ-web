(function(){
  "use strict";

  // ---------- ДАННЫЕ ТОВАРОВ ----------
  const productsData = [
    { id: 1, name: "Ружьё ИЖ-27", brand: "ИЖМЕХ", price: "45 000 ₽", imgLabel: "ИЖ-27" },
    { id: 2, name: "Карабин Байкал 145", brand: "БАЙКАЛ", price: "62 500 ₽", imgLabel: "БАЙКАЛ" },
    { id: 3, name: "Патроны Federal 12/70", brand: "FEDERAL", price: "890 ₽", imgLabel: "FEDERAL" },
    { id: 4, name: "Катушка Shimano", brand: "SHIMANO", price: "4 200 ₽", imgLabel: "SHIMANO" },
    { id: 5, name: "Воблер Salmo Hornet", brand: "SALMO", price: "650 ₽", imgLabel: "SALMO" },
    { id: 6, name: "Спиннинг Spro", brand: "SPRO", price: "3 990 ₽", imgLabel: "SPRO" },
    { id: 7, name: "Тактические перчатки 5.11", brand: "5.11 TACTICAL", price: "2 350 ₽", imgLabel: "5.11" },
    { id: 8, name: "Наушники Peltor", brand: "PELTOR", price: "7 800 ₽", imgLabel: "PELTOR" },
    { id: 9, name: "Прицел ИЖМЕХ", brand: "ИЖМЕХ", price: "8 900 ₽", imgLabel: "ОПТИКА" },
    { id: 10, name: "Костюм Байкал", brand: "БАЙКАЛ", price: "11 200 ₽", imgLabel: "КОСТЮМ" }
  ];

  const allBrands = ["ИЖМЕХ", "БАЙКАЛ", "FEDERAL", "SPRO", "SALMO", "SHIMANO", "PELTOR", "5.11 TACTICAL"];

  // Состояние
  let currentFilterBrand = null;
  let searchQuery = '';
  let compareCount = 0, favoriteCount = 0, cartCount = 0;

  // DOM элементы
  const productsContainer = document.getElementById('productsContainer');
  const brandListEl = document.getElementById('brandListContainer');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const resetBrandFilterSpan = document.getElementById('resetBrandFilter');
  const showAllBtn = document.getElementById('showAllBtn');
  const clearCountersBtn = document.getElementById('clearCountersBtn');
  const resultCountSpan = document.getElementById('resultCount');
  const toastEl = document.getElementById('toast');
  const compareCountSpan = document.getElementById('compareCount');
  const favoriteCountSpan = document.getElementById('favoriteCount');
  const cartCountSpan = document.getElementById('cartCount');
  const logoBtn = document.getElementById('logoBtn');

  // ---------- КАРУСЕЛЬ (перелистывание) ----------
  const slidesContainer = document.getElementById('carouselSlides');
  const slides = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');
  let currentSlide = 0;
  let slideInterval;
  const totalSlides = slides.length;

  function updateCarousel() {
    slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    // Обновляем точки
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlide);
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
  }

  function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
  }

  function createDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('span');
      dot.classList.add('carousel-dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
  }

  function startAutoSlide() {
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoSlide() {
    clearInterval(slideInterval);
  }

  // Инициализация карусели
  createDots();
  startAutoSlide();

  // Остановка при наведении
  const carouselContainer = document.querySelector('.carousel-container');
  carouselContainer.addEventListener('mouseenter', stopAutoSlide);
  carouselContainer.addEventListener('mouseleave', startAutoSlide);

  prevBtn.addEventListener('click', () => {
    prevSlide();
    stopAutoSlide();
    startAutoSlide();
  });
  nextBtn.addEventListener('click', () => {
    nextSlide();
    stopAutoSlide();
    startAutoSlide();
  });

  // ---------- УТИЛИТЫ ----------
  function showToast(text) {
    toastEl.textContent = text;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 2000);
  }

  function updateCountersUI() {
    compareCountSpan.textContent = compareCount;
    favoriteCountSpan.textContent = favoriteCount;
    cartCountSpan.textContent = cartCount;
  }

  function renderBrandList() {
    let html = '';
    allBrands.forEach(brand => {
      const activeClass = (currentFilterBrand === brand) ? 'active' : '';
      html += `<div class="brand-item ${activeClass}" data-brand="${brand}">${brand}</div>`;
    });
    brandListEl.innerHTML = html;
  }

  function getFilteredProducts() {
    return productsData.filter(product => {
      if (currentFilterBrand && product.brand !== currentFilterBrand) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.trim().toLowerCase();
        return product.name.toLowerCase().includes(q) || product.brand.toLowerCase().includes(q);
      }
      return true;
    });
  }

  function renderProducts() {
    const filtered = getFilteredProducts();
    if (filtered.length === 0) {
      productsContainer.innerHTML = `<div class="no-products">😕 Товары не найдены. Попробуйте изменить фильтр.</div>`;
      resultCountSpan.textContent = '';
      return;
    }

    let cardsHtml = '';
    filtered.forEach(prod => {
      const bgStyle = `background: linear-gradient(145deg, #b9aa92, #9b8e7a);`;
      cardsHtml += `
        <div class="product-card" data-product-id="${prod.id}" data-brand="${prod.brand}">
          <div class="product-image" style="${bgStyle} display:flex; align-items:center; justify-content:center; color:#2d2d2d; font-weight:bold; text-transform:uppercase; font-size:14px;">
            ${prod.imgLabel || prod.brand}
          </div>
          <div class="product-title">${prod.name}</div>
          <div class="product-brand">${prod.brand}</div>
          <div class="product-price">${prod.price}</div>
          <div class="card-actions">
            <button class="card-btn compare-card-btn" data-action="compare">⚖️ Сравнить</button>
            <button class="card-btn favorite-card-btn" data-action="favorite">❤️</button>
            <button class="card-btn cart-card-btn" data-action="cart">🛒 В корзину</button>
          </div>
        </div>
      `;
    });
    productsContainer.innerHTML = cardsHtml;
    resultCountSpan.textContent = `найдено: ${filtered.length}`;
  }

  function refreshAll() {
    renderBrandList();
    renderProducts();
  }

  function handleProductClick(e) {
    const target = e.target.closest('button');
    if (!target) return;
    const action = target.dataset.action;
    const card = target.closest('.product-card');
    if (!card) return;
    
    const productName = card.querySelector('.product-title')?.textContent || 'товар';

    if (action === 'compare') {
      compareCount++;
      showToast(`➕ ${productName} добавлен в сравнение`);
    } else if (action === 'favorite') {
      favoriteCount++;
      showToast(`❤️ ${productName} в избранном`);
    } else if (action === 'cart') {
      cartCount++;
      showToast(`🛒 ${productName} в корзине`);
    }
    updateCountersUI();
  }

  function resetAllCounters() {
    compareCount = 0;
    favoriteCount = 0;
    cartCount = 0;
    updateCountersUI();
    showToast('🧹 Счетчики сброшены');
  }

  function resetFilters() {
    currentFilterBrand = null;
    searchQuery = '';
    searchInput.value = '';
    refreshAll();
    showToast('🔍 Показаны все товары');
  }

  function setBrandFilter(brand) {
    currentFilterBrand = (currentFilterBrand === brand) ? null : brand;
    refreshAll();
    showToast(currentFilterBrand ? `🎯 Бренд: ${currentFilterBrand}` : 'Все бренды');
  }

  function performSearch() {
    searchQuery = searchInput.value.trim();
    refreshAll();
    showToast(searchQuery ? `🔎 Поиск: "${searchQuery}"` : 'Поиск сброшен');
  }

  // ---------- ИНИЦИАЛИЗАЦИЯ ----------
  function init() {
    renderBrandList();
    renderProducts();
    updateCountersUI();

    productsContainer.addEventListener('click', handleProductClick);

    brandListEl.addEventListener('click', (e) => {
      const brandItem = e.target.closest('.brand-item');
      if (!brandItem) return;
      setBrandFilter(brandItem.dataset.brand);
    });

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearch();
    });

    resetBrandFilterSpan.addEventListener('click', () => {
      currentFilterBrand = null;
      refreshAll();
      showToast('Фильтр бренда сброшен');
    });

    showAllBtn.addEventListener('click', resetFilters);
    clearCountersBtn.addEventListener('click', resetAllCounters);

    logoBtn.addEventListener('click', () => {
      resetFilters();
      resetAllCounters();
      showToast('🏠 Главная · всё сброшено');
    });

    document.querySelectorAll('.action-btn, .main-nav a').forEach(link => {
      link.addEventListener('click', (e) => e.preventDefault());
    });
  }

  init();
})();