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
  function getCartTotalItems() {
    const cart = getArray(STORAGE_KEYS.CART);
    if (cart.length && typeof cart[0] === 'object' && cart[0].quantity !== undefined) {
      return cart.reduce((sum, item) => sum + item.quantity, 0);
    } else {
      // старая версия (массив ID) – совместимость
      return cart.length;
    }
  }

  function syncCounters() {
    const compareSpan = document.getElementById('compareCount');
    const favoriteSpan = document.getElementById('favoriteCount');
    const cartSpan = document.getElementById('cartCount');
    if (compareSpan) compareSpan.textContent = getArray(STORAGE_KEYS.COMPARE).length;
    if (favoriteSpan) favoriteSpan.textContent = getArray(STORAGE_KEYS.FAVORITE).length;
    if (cartSpan) cartSpan.textContent = getCartTotalItems();
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

  // ---------- ДОБАВЛЕНИЕ / УДАЛЕНИЕ В СПИСКИ (переключение) ----------
  function addToCompare(id, name) {
    let arr = getArray(STORAGE_KEYS.COMPARE);
    if (arr.includes(id)) {
      arr = arr.filter(item => item !== id);
      setArray(STORAGE_KEYS.COMPARE, arr);
      showToast(`⚖️ ${name} удалён из сравнения`);
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
      arr = arr.filter(item => item !== id);
      setArray(STORAGE_KEYS.FAVORITE, arr);
      showToast(`❤️ ${name} удалён из избранного`);
      return false;
    }
    arr.push(id);
    setArray(STORAGE_KEYS.FAVORITE, arr);
    showToast(`❤️ ${name} добавлен в избранное`);
    return true;
  }

  function addToCart(id, name) {
    let cart = getArray(STORAGE_KEYS.CART);
    // если корзина хранит ID (старый формат) – конвертируем
    if (cart.length > 0 && typeof cart[0] === 'number') {
      cart = cart.map(id => ({ id, quantity: 1 }));
    }
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id, quantity: 1 });
    }
    setArray(STORAGE_KEYS.CART, cart);
    showToast(`🛒 ${name} добавлен в корзину (теперь ${existing ? existing.quantity : 1} шт.)`);
  }

  function updateCartQuantity(id, delta) {
    let cart = getArray(STORAGE_KEYS.CART);
    if (!cart.length || typeof cart[0] === 'number') return;
    const idx = cart.findIndex(item => item.id === id);
    if (idx === -1) return;
    const newQty = cart[idx].quantity + delta;
    if (newQty <= 0) {
      cart.splice(idx, 1);
    } else {
      cart[idx].quantity = newQty;
    }
    setArray(STORAGE_KEYS.CART, cart);
    syncCounters();
  }

  function clearCart() {
    setArray(STORAGE_KEYS.CART, []);
    showToast('🧹 Корзина полностью очищена');
  }

  // ---------- УДАЛЕНИЕ ИЗ СПИСКОВ (по ID) ----------
  function removeFromCompare(id) {
    let arr = getArray(STORAGE_KEYS.COMPARE).filter(item => item !== id);
    setArray(STORAGE_KEYS.COMPARE, arr);
  }

  function removeFromFavorite(id) {
    let arr = getArray(STORAGE_KEYS.FAVORITE).filter(item => item !== id);
    setArray(STORAGE_KEYS.FAVORITE, arr);
  }

  function removeFromCart(id) {
    let cart = getArray(STORAGE_KEYS.CART);
    if (cart.length && typeof cart[0] === 'object') {
      cart = cart.filter(item => item.id !== id);
    } else {
      cart = cart.filter(item => item !== id);
    }
    setArray(STORAGE_KEYS.CART, cart);
  }

  function clearAllCounters() {
    setArray(STORAGE_KEYS.COMPARE, []);
    setArray(STORAGE_KEYS.FAVORITE, []);
    setArray(STORAGE_KEYS.CART, []);
    showToast('🧹 Счётчики сброшены');
  }

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

  // ---------- ПОИСК ----------
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

  function initLogo() {
    const logo = document.getElementById('logoBtn');
    if (logo) {
      logo.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }
  }

  // ========== РЕНДЕРИНГ КАРТОЧЕК ==========
  function renderProductCard(product) {
    const bgStyle = product.imgFile
      ? `background-image:url('images/${product.imgFile}');background-size:contain;background-repeat:no-repeat;background-position:center;`
      : '';
    const symbol = !product.imgFile ? (escapeHtml(product.imgLabel) || escapeHtml(product.brand) || '🔫') : '';
    const priceDisplay = product.priceStr || (product.price ? product.price.toLocaleString('ru-RU') + ' ₽' : '');
    const favorites = getArray(STORAGE_KEYS.FAVORITE);
    const compare = getArray(STORAGE_KEYS.COMPARE);
    const isInFav = favorites.includes(product.id);
    const isInCompare = compare.includes(product.id);
    const favClass = isInFav ? 'active-fav' : '';
    const compareClass = isInCompare ? 'active-compare' : '';
    return `
      <div class="product-card" data-id="${product.id}">
        <div class="product-image" style="${bgStyle}">${symbol}</div>
        <div class="product-title">${escapeHtml(product.name)}</div>
        <div class="product-brand">${escapeHtml(product.brand || '')}</div>
        <div class="product-price">${escapeHtml(priceDisplay)}</div>
        <div class="card-actions">
          <button class="card-btn" data-action="info">ℹ️</button>
          <button class="card-btn ${compareClass}" data-action="compare">⚖️</button>
          <button class="card-btn ${favClass}" data-action="favorite">❤️</button>
          <button class="card-btn" data-action="cart">🛒</button>
        </div>
      </div>
    `;
  }

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
          const compareBtn = btn;
          const isNowInCompare = getArray(STORAGE_KEYS.COMPARE).includes(id);
          if (isNowInCompare) compareBtn.classList.add('active-compare');
          else compareBtn.classList.remove('active-compare');
        } else if (action === 'favorite') {
          addToFavorite(id, product.name);
          const favBtn = btn;
          const isNowInFav = getArray(STORAGE_KEYS.FAVORITE).includes(id);
          if (isNowInFav) favBtn.classList.add('active-fav');
          else favBtn.classList.remove('active-fav');
        } else if (action === 'cart') {
          addToCart(id, product.name);
        }
        e.stopPropagation();
        return;
      }
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
    updateCartQuantity,
    clearCart,
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