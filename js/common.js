// js/common.js
// Централизованные функции для работы с localStorage, toast, счётчиками и данными

(function(global) {
  'use strict';

  // ---------- КЛЮЧИ ----------
  const STORAGE_KEYS = {
    CART: 'huntfish_cart',
    FAVORITE: 'huntfish_favorite',
    COMPARE: 'huntfish_compare',
    WEAPONS: 'weapons_catalog',
    PROMOS: 'admin_promos',
    NEWS: 'admin_news',
    SLIDES: 'admin_carousel',
    POPULAR: 'admin_popular'
  };

  // ---------- РАБОТА С ДАННЫМИ ----------
function loadProducts() {
  let products = [];
  const stored = localStorage.getItem(STORAGE_KEYS.WEAPONS);
  if (stored) {
    try {
      products = JSON.parse(stored);
      if (Array.isArray(products) && products.length) {
        return products;
      }
    } catch(e) { console.warn('Ошибка парсинга каталога', e); }
  }

  if (global.shopContent && global.shopContent.weaponsCatalog && global.shopContent.weaponsCatalog.length) {
    products = global.shopContent.weaponsCatalog;
    localStorage.setItem(STORAGE_KEYS.WEAPONS, JSON.stringify(products));
    return products;
  }

  console.error('Не удалось загрузить каталог товаров');
  return [];
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.WEAPONS, JSON.stringify(products));
}

// ДОБАВИТЬ ЭТУ ФУНКЦИЮ:
function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.WEAPONS, JSON.stringify(products));
}
  // ---------- LOCALSTORAGE УТИЛИТЫ ----------
  function getArray(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch(e) {
      return [];
    }
  }

  function setArray(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
    syncCounters();
  }

  // ---------- СЧЁТЧИКИ ----------
  function syncCounters() {
    const compareSpan = document.getElementById('compareCount');
    const favoriteSpan = document.getElementById('favoriteCount');
    const cartSpan = document.getElementById('cartCount');
    if (compareSpan) compareSpan.textContent = getArray(STORAGE_KEYS.COMPARE).length;
    if (favoriteSpan) favoriteSpan.textContent = getArray(STORAGE_KEYS.FAVORITE).length;
    if (cartSpan) cartSpan.textContent = getArray(STORAGE_KEYS.CART).length;
  }

  // ---------- TOAST ----------
  function showToast(msg, duration = 2500) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast-message';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  }

  // ---------- ДОБАВЛЕНИЕ В СПИСКИ ----------
  function addToCompare(id, name) {
    let arr = getArray(STORAGE_KEYS.COMPARE);
    if (arr.includes(id)) {
      showToast(`ℹ️ ${name} уже в сравнении`);
      return false;
    }
    if (arr.length >= 4) {
      showToast(`⚠️ Можно сравнить не более 4 товаров`);
      return false;
    }
    arr.push(id);
    setArray(STORAGE_KEYS.COMPARE, arr);
    showToast(`⚖️ ${name} добавлен в сравнение`);
    return true;
  }

  function addToFavorite(id, name) {
    let arr = getArray(STORAGE_KEYS.FAVORITE);
    if (arr.includes(id)) {
      showToast(`ℹ️ ${name} уже в избранном`);
      return false;
    }
    arr.push(id);
    setArray(STORAGE_KEYS.FAVORITE, arr);
    showToast(`❤️ ${name} добавлен в избранное`);
    return true;
  }

  function addToCart(id, name) {
    let arr = getArray(STORAGE_KEYS.CART);
    arr.push(id);
    setArray(STORAGE_KEYS.CART, arr);
    showToast(`🛒 ${name} добавлен в корзину`);
  }

  // ---------- УДАЛЕНИЕ ИЗ СПИСКОВ (ПО ID) ----------
  function removeFromCompare(id) {
    let arr = getArray(STORAGE_KEYS.COMPARE).filter(item => item !== id);
    setArray(STORAGE_KEYS.COMPARE, arr);
  }

  function removeFromFavorite(id) {
    let arr = getArray(STORAGE_KEYS.FAVORITE).filter(item => item !== id);
    setArray(STORAGE_KEYS.FAVORITE, arr);
  }

  function removeFromCart(id) {
    let arr = getArray(STORAGE_KEYS.CART).filter(item => item !== id);
    setArray(STORAGE_KEYS.CART, arr);
  }

  // ---------- ОЧИСТКА ВСЕХ СЧЁТЧИКОВ ----------
  function clearAllCounters() {
    setArray(STORAGE_KEYS.COMPARE, []);
    setArray(STORAGE_KEYS.FAVORITE, []);
    setArray(STORAGE_KEYS.CART, []);
    showToast('🧹 Счётчики сброшены');
  }

  // ---------- УДАЛЕНИЕ ТОВАРА ИЗ ВСЕХ СВЯЗАННЫХ СПИСКОВ (при удалении из каталога) ----------
  function removeProductFromAllStorages(productId) {
    removeFromCompare(productId);
    removeFromFavorite(productId);
    removeFromCart(productId);
  }

  // ---------- ЭКРАНИРОВАНИЕ HTML ----------
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- ПОИСК ИЗ ШАПКИ ----------
  function initHeaderSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    if (!searchInput || !searchBtn) return;

    function performSearch() {
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
      } else {
        window.location.href = 'catalog.html';
      }
    }

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearch();
    });
  }

  // ---------- ЛОГОТИП ----------
  function initLogo() {
    const logo = document.getElementById('logoBtn');
    if (logo) {
      logo.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }
  }

  // ========== ЦЕНТРАЛИЗОВАННЫЙ РЕНДЕРИНГ КАРТОЧЕК ТОВАРА ==========
  function renderProductCard(product) {
    const bgStyle = product.imgFile
      ? `background-image:url('images/${product.imgFile}');background-size:contain;background-repeat:no-repeat;background-position:center;`
      : '';
    const symbol = !product.imgFile ? (escapeHtml(product.imgLabel) || escapeHtml(product.brand) || '🔫') : '';
    const priceDisplay = product.priceStr || (product.price ? product.price.toLocaleString('ru-RU') + ' ₽' : '');
    return `
      <div class="product-card" data-id="${product.id}">
        <div class="product-image" style="${bgStyle}">${symbol}</div>
        <div class="product-title">${escapeHtml(product.name)}</div>
        <div class="product-brand">${escapeHtml(product.brand || '')}</div>
        <div class="product-price">${escapeHtml(priceDisplay)}</div>
        <div class="card-actions">
          <button class="card-btn" data-action="info">ℹ️</button>
          <button class="card-btn" data-action="compare">⚖️</button>
          <button class="card-btn" data-action="favorite">❤️</button>
          <button class="card-btn" data-action="cart">🛒</button>
        </div>
      </div>
    `;
  }

  // ========== ЦЕНТРАЛИЗОВАННЫЙ ОБРАБОТЧИК КЛИКОВ НА КАРТОЧКАХ ==========
  function attachProductCardListeners(container, productsData) {
    if (!container) return;
    container.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      if (!card) return;
      const id = parseInt(card.dataset.id);
      const product = productsData.find(p => p.id === id);
      if (!product) return;

      const btn = e.target.closest('.card-btn');
      if (btn) {
        const action = btn.dataset.action;
        if (action === 'info') {
          window.location.href = `product.html?id=${id}`;
        } else if (action === 'compare') {
          addToCompare(id, product.name);
        } else if (action === 'favorite') {
          addToFavorite(id, product.name);
        } else if (action === 'cart') {
          addToCart(id, product.name);
        }
        e.stopPropagation();
        return;
      }

      // Клик по изображению или названию → переход на детальную
      if (e.target.closest('.product-image') || e.target.closest('.product-title')) {
        window.location.href = `product.html?id=${id}`;
      }
    });
  }

  // ---------- ЭКСПОРТ ГЛОБАЛЬНЫХ ФУНКЦИЙ ----------
  global.Shop = {
    STORAGE_KEYS,
    loadProducts,
    saveProducts,
    getArray,
    setArray,
    syncCounters,
    showToast,
    addToCompare,
    addToFavorite,
    addToCart,
    removeFromCompare,
    removeFromFavorite,
    removeFromCart,
    clearAllCounters,
    removeProductFromAllStorages,
    escapeHtml,
    initHeaderSearch,
    initLogo,
    renderProductCard,
    attachProductCardListeners
  };

})(window);