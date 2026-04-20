(function(){
    "use strict";

    // ==================== ПОЛУЧЕНИЕ ДАННЫХ ИЗ АДМИН‑ПАНЕЛИ ====================
    const shop = window.shopContent || {};
    const productsData = shop.weaponsCatalog || [];
    window.productsData = productsData;   // для обратной совместимости (если где-то ещё используется)

    // ==================== КЛЮЧИ LOCALSTORAGE ====================
    const STORAGE_KEYS = {
        COMPARE: 'huntfish_compare',
        FAVORITE: 'huntfish_favorite',
        CART: 'huntfish_cart'
    };

    // ==================== УТИЛИТЫ ДЛЯ LOCALSTORAGE ====================
    function getStorageArray(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error(`Ошибка чтения ${key}:`, e);
            return [];
        }
    }

    function setStorageArray(key, arr) {
        try {
            localStorage.setItem(key, JSON.stringify(arr));
            syncCountersFromStorage();
            return true;
        } catch (e) {
            console.error(`Ошибка записи ${key}:`, e);
            return false;
        }
    }

    // ==================== ОЧИСТКА НЕВАЛИДНЫХ ID ====================
    function cleanupStorage() {
    if (!productsData.length) {
        // Каталог пуст – полностью очищаем все связанные хранилища
        console.warn('Каталог товаров пуст. Очищаем сравнение, избранное и корзину.');
        [STORAGE_KEYS.COMPARE, STORAGE_KEYS.FAVORITE, STORAGE_KEYS.CART].forEach(key => {
            localStorage.removeItem(key);
        });
        return;
    }
    const validIds = new Set(productsData.map(p => p.id));
    [STORAGE_KEYS.COMPARE, STORAGE_KEYS.FAVORITE, STORAGE_KEYS.CART].forEach(key => {
        const ids = getStorageArray(key);
        const filtered = ids.filter(id => validIds.has(id));
        if (filtered.length !== ids.length) {
            setStorageArray(key, filtered);
            console.log(`🧹 ${key}: удалено ${ids.length - filtered.length} несуществующих товаров`);
        }
    });
}

    // Выполняем очистку один раз при загрузке скрипта
    cleanupStorage();

    // ==================== ГЛОБАЛЬНЫЕ СЧЁТЧИКИ ====================
    let compareCount = 0,
        favoriteCount = 0,
        cartCount = 0;

    // DOM-элементы счётчиков
    let compareCountSpan, favoriteCountSpan, cartCountSpan;

    function syncCountersFromStorage() {
        compareCount = getStorageArray(STORAGE_KEYS.COMPARE).length;
        favoriteCount = getStorageArray(STORAGE_KEYS.FAVORITE).length;
        cartCount = getStorageArray(STORAGE_KEYS.CART).length;

        if (compareCountSpan) compareCountSpan.textContent = compareCount;
        if (favoriteCountSpan) favoriteCountSpan.textContent = favoriteCount;
        if (cartCountSpan) cartCountSpan.textContent = cartCount;
    }

    // Принудительное обновление извне
    window.shopForceUpdate = function() {
        syncCountersFromStorage();
        if (isComparePage && typeof renderComparePage === 'function') renderComparePage();
        if (isFavoritesPage && typeof renderFavoritesPage === 'function') renderFavoritesPage();
        if (isCatalogPage && typeof renderCatalog === 'function') renderCatalog();
    };

    // ==================== ОПРЕДЕЛЕНИЕ СТРАНИЦ ====================
    const isCatalogPage    = !!document.querySelector('.catalog-section');
    const isAboutPage      = !!document.querySelector('.about-hero');
    const isDeliveryPage   = !!document.querySelector('.delivery-hero');
    const isContactsPage   = !!document.querySelector('.contacts-hero');
    const isComparePage    = !!document.querySelector('.compare-hero');
    const isFavoritesPage  = !!document.querySelector('.favorites-hero');

    // ==================== ОБЩИЕ DOM-ЭЛЕМЕНТЫ ====================
    const toastEl = document.getElementById('toast');
    const logoBtn = document.getElementById('logoBtn');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    // Поиск элементов счётчиков
    compareCountSpan = document.getElementById('compareCount') || document.querySelector('[data-counter="compare"] .count');
    favoriteCountSpan = document.getElementById('favoriteCount') || document.querySelector('[data-counter="favorites"] .count');
    cartCountSpan = document.getElementById('cartCount') || document.querySelector('[data-counter="cart"] .count');

    // ==================== TOAST-УВЕДОМЛЕНИЯ ====================
    function showToast(text, duration = 2500) {
        if (!toastEl) return;
        toastEl.textContent = text;
        toastEl.classList.add('show');
        setTimeout(() => toastEl.classList.remove('show'), duration);
    }

    // ==================== ОБРАБОТКА ДЕЙСТВИЙ С ТОВАРАМИ ====================
    function addToCompare(productId, productName) {
        let ids = getStorageArray(STORAGE_KEYS.COMPARE);
        if (ids.includes(productId)) {
            showToast(`ℹ️ ${productName} уже в сравнении`, 2000);
            return false;
        }
        if (ids.length >= 4) {
            showToast(`⚠️ Можно сравнить не более 4 товаров`, 3000);
            return false;
        }
        ids.push(productId);
        setStorageArray(STORAGE_KEYS.COMPARE, ids);
        showToast(`⚖️ ${productName} добавлен в сравнение`);
        return true;
    }

    function addToFavorite(productId, productName) {
        let ids = getStorageArray(STORAGE_KEYS.FAVORITE);
        if (ids.includes(productId)) {
            showToast(`ℹ️ ${productName} уже в избранном`, 2000);
            return false;
        }
        ids.push(productId);
        setStorageArray(STORAGE_KEYS.FAVORITE, ids);
        showToast(`❤️ ${productName} добавлен в избранное`);
        return true;
    }

    function addToCart(productId, productName) {
        let ids = getStorageArray(STORAGE_KEYS.CART);
        ids.push(productId);
        setStorageArray(STORAGE_KEYS.CART, ids);
        cartCount = ids.length;
        syncCountersFromStorage();
        showToast(`🛒 ${productName} добавлен в корзину`);
    }

    // Удаление из сравнения / избранного
    function removeFromCompare(productId) {
        let ids = getStorageArray(STORAGE_KEYS.COMPARE);
        ids = ids.filter(id => id !== productId);
        setStorageArray(STORAGE_KEYS.COMPARE, ids);
    }

    function removeFromFavorite(productId) {
        let ids = getStorageArray(STORAGE_KEYS.FAVORITE);
        ids = ids.filter(id => id !== productId);
        setStorageArray(STORAGE_KEYS.FAVORITE, ids);
    }

    // ==================== ДЕЛЕГИРОВАНИЕ КЛИКОВ НА КАРТОЧКАХ ====================
    function handleProductCardClick(e) {
        const card = e.target.closest('.product-card');
        if (!card) return;

        const productId = parseInt(card.dataset.id);
        const product = productsData.find(p => p.id === productId);
        if (!product) return;
        const productName = product.name;
        const productDesc = product.desc || '';

        if (e.target.classList.contains('product-title')) {
            showToast(`📋 ${productName}: ${productDesc}`, 4000);
            return;
        }

        const btn = e.target.closest('button');
        if (!btn) return;

        const action = btn.dataset.action;
        if (!action) return;

        switch (action) {
            case 'info':
                showToast(`📋 ${productName}: ${productDesc}`, 4000);
                break;
            case 'compare':
                addToCompare(productId, productName);
                break;
            case 'favorite':
                addToFavorite(productId, productName);
                break;
            case 'cart':
                addToCart(productId, productName);
                break;
            default: break;
        }
    }

    document.addEventListener('click', handleProductCardClick);

    // ==================== ЛОГОТИП ====================
    if (logoBtn) {
        logoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }

    // ==================== ПОИСК (ГЛОБАЛЬНЫЙ И В КАТАЛОГЕ) ====================
    function performSearchRedirect() {
        const query = searchInput ? searchInput.value.trim() : '';
        if (isCatalogPage) {
            const url = new URL(window.location);
            url.searchParams.set('search', query);
            window.history.pushState({}, '', url);
            if (typeof renderCatalog === 'function') renderCatalog();
        } else {
            window.location.href = query ? `catalog.html?search=${encodeURIComponent(query)}` : 'catalog.html';
        }
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', performSearchRedirect);
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearchRedirect();
        });
    }

    // ==================== КНОПКА КОРЗИНЫ (ПЕРЕХОД) ====================
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', (e) => {
            const href = cartBtn.getAttribute('href');
            if (!href || href === '#') {
                e.preventDefault();
                window.location.href = 'cart.html';
            }
        });
    }

    // ==================== СБРОС СЧЁТЧИКОВ ====================
    const clearCountersBtn = document.getElementById('clearCountersBtn');
    if (clearCountersBtn) {
        clearCountersBtn.addEventListener('click', () => {
            setStorageArray(STORAGE_KEYS.COMPARE, []);
            setStorageArray(STORAGE_KEYS.FAVORITE, []);
            setStorageArray(STORAGE_KEYS.CART, []);
            syncCountersFromStorage();
            showToast('🧹 Счетчики сброшены');
        });
    }

    // ==================== КАТАЛОГ ====================
    if (isCatalogPage) {
        const productsContainer = document.getElementById('productsContainer');
        const brandFiltersDiv = document.getElementById('brandFilters');
        const categoryFiltersDiv = document.getElementById('categoryFilters');
        const priceMinInput = document.getElementById('priceMin');
        const priceMaxInput = document.getElementById('priceMax');
        const applyPriceBtn = document.getElementById('applyPrice');
        const resetBrandsSpan = document.getElementById('resetBrands');
        const resetCategoriesSpan = document.getElementById('resetCategories');
        const resetAllBtn = document.getElementById('resetAllFilters');
        const sortSelect = document.getElementById('sortSelect');
        const paginationDiv = document.getElementById('pagination');
        const resultInfo = document.getElementById('resultInfo');
        const viewBtns = document.querySelectorAll('.view-btn');

        const allBrands = [...new Set(productsData.map(p => p.brand))];
        const allCategories = [...new Set(productsData.map(p => p.category))];

        let selectedBrands = new Set();
        let selectedCategories = new Set();
        let priceMin = 0, priceMax = 50000;
        let searchQuery = '';
        let currentSort = 'default';
        let currentPage = 1;
        const itemsPerPage = 6;
        let gridColumns = 4;

        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('search');
        if (searchParam) {
            searchQuery = searchParam;
            if (searchInput) searchInput.value = searchParam;
        }

        function renderFilters() {
            if (brandFiltersDiv) {
                brandFiltersDiv.innerHTML = allBrands.map(b => `<label class="filter-checkbox"><input type="checkbox" value="${b}" ${selectedBrands.has(b)?'checked':''}><span>${b}</span></label>`).join('');
                brandFiltersDiv.querySelectorAll('input').forEach(cb => cb.addEventListener('change', e => {
                    e.target.checked ? selectedBrands.add(e.target.value) : selectedBrands.delete(e.target.value);
                    currentPage = 1;
                    renderCatalog();
                }));
            }
            if (categoryFiltersDiv) {
                categoryFiltersDiv.innerHTML = allCategories.map(c => `<label class="filter-checkbox"><input type="checkbox" value="${c}" ${selectedCategories.has(c)?'checked':''}><span>${c}</span></label>`).join('');
                categoryFiltersDiv.querySelectorAll('input').forEach(cb => cb.addEventListener('change', e => {
                    e.target.checked ? selectedCategories.add(e.target.value) : selectedCategories.delete(e.target.value);
                    currentPage = 1;
                    renderCatalog();
                }));
            }
        }

        function getFilteredProductsCatalog() {
            let filtered = productsData.filter(p => {
                if (p.price < priceMin || p.price > priceMax) return false;
                if (selectedBrands.size && !selectedBrands.has(p.brand)) return false;
                if (selectedCategories.size && !selectedCategories.has(p.category)) return false;
                if (searchQuery.trim()) {
                    const q = searchQuery.trim().toLowerCase();
                    return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
                }
                return true;
            });
            if (currentSort === 'priceAsc') filtered.sort((a,b) => a.price - b.price);
            else if (currentSort === 'priceDesc') filtered.sort((a,b) => b.price - a.price);
            else if (currentSort === 'name') filtered.sort((a,b) => a.name.localeCompare(b.name));
            return filtered;
        }

        function paginate(arr) {
            const start = (currentPage-1)*itemsPerPage;
            return arr.slice(start, start+itemsPerPage);
        }

        function renderPagination(total) {
            if (!paginationDiv) return;
            if (total <= 1) { paginationDiv.innerHTML = ''; return; }
            let html = '';
            for (let i=1; i<=total; i++) html += `<div class="page-btn ${i===currentPage?'active':''}" data-page="${i}">${i}</div>`;
            paginationDiv.innerHTML = html;
            paginationDiv.querySelectorAll('.page-btn').forEach(btn => btn.addEventListener('click', () => {
                currentPage = parseInt(btn.dataset.page);
                renderCatalog();
                window.scrollTo({top:300, behavior:'smooth'});
            }));
        }

        function renderCatalog() {
            if (!productsContainer) return;
            const filtered = getFilteredProductsCatalog();
            const paginated = paginate(filtered);
            const totalPages = Math.ceil(filtered.length / itemsPerPage);
            if (!paginated.length) {
                productsContainer.innerHTML = `<div class="no-products" style="grid-column:1/-1; padding:30px;">😕 Товары не найдены</div>`;
            } else {
                let cards = '';
                paginated.forEach(prod => {
                    const bg = prod.imgFile ? `background-image:url('imges/${prod.imgFile}');background-size:contain;background-repeat:no-repeat;background-position:center;` : `background:#b8aa92;`;
                    cards += `<div class="product-card" data-id="${prod.id}" data-desc="${prod.desc}">
                        <div class="product-image" style="${bg}">${!prod.imgFile ? prod.imgLabel || prod.brand : ''}</div>
                        <div class="product-category">${prod.category}</div><div class="product-title">${prod.name}</div>
                        <div class="product-brand">${prod.brand}</div><div class="product-price">${prod.price.toLocaleString()} ₽</div>
                        <div class="card-actions">
                            <button class="card-btn" data-action="info">ℹ️</button>
                            <button class="card-btn" data-action="compare">⚖️</button>
                            <button class="card-btn" data-action="favorite">❤️</button>
                            <button class="card-btn" data-action="cart">🛒</button>
                        </div>
                    </div>`;
                });
                productsContainer.innerHTML = cards;
            }
            if (resultInfo) resultInfo.textContent = `Найдено: ${filtered.length} товаров`;
            renderPagination(totalPages);
            const grid = document.querySelector('.product-grid');
            if (grid) grid.style.gridTemplateColumns = `repeat(auto-fill, minmax(${gridColumns===4?200:240}px, 1fr))`;
        }

        function resetAllFilters() {
            selectedBrands.clear(); selectedCategories.clear();
            priceMin = 0; priceMax = 50000;
            if (priceMinInput) priceMinInput.value = 0;
            if (priceMaxInput) priceMaxInput.value = 50000;
            searchQuery = ''; if (searchInput) searchInput.value = '';
            currentSort = 'default'; if (sortSelect) sortSelect.value = 'default';
            renderFilters(); currentPage = 1; renderCatalog();
            showToast('🔍 Все фильтры сброшены');
        }

        if (resetBrandsSpan) resetBrandsSpan.addEventListener('click', ()=>{ selectedBrands.clear(); renderFilters(); currentPage=1; renderCatalog(); });
        if (resetCategoriesSpan) resetCategoriesSpan.addEventListener('click', ()=>{ selectedCategories.clear(); renderFilters(); currentPage=1; renderCatalog(); });
        if (resetAllBtn) resetAllBtn.addEventListener('click', resetAllFilters);
        if (applyPriceBtn) applyPriceBtn.addEventListener('click', ()=>{
            priceMin = parseInt(priceMinInput.value) || 0;
            priceMax = parseInt(priceMaxInput.value) || 50000;
            currentPage=1; renderCatalog();
        });
        if (sortSelect) sortSelect.addEventListener('change', e => { currentSort = e.target.value; currentPage=1; renderCatalog(); });

        viewBtns.forEach(btn => btn.addEventListener('click', ()=>{
            viewBtns.forEach(b=>b.classList.remove('active')); btn.classList.add('active');
            gridColumns = btn.dataset.grid === '4' ? 4 : 3;
            renderCatalog();
        }));

        renderFilters();
        renderCatalog();
    }

    // ==================== СТРАНИЦА СРАВНЕНИЯ ====================
    if (isComparePage) {
        const container = document.getElementById('compareContent');
        function renderComparePage() {
            if (!container) return;
            const ids = getStorageArray(STORAGE_KEYS.COMPARE);
            const prods = productsData.filter(p => ids.includes(p.id));
            if (!prods.length) {
                container.innerHTML = `<div class="empty-compare"><p>😕 Нет товаров для сравнения</p><a href="catalog.html">В каталог</a></div>`;
                return;
            }

            let html = `<table class="compare-table"><thead><tr><th>Характеристика</th>`;
            prods.forEach(p => html += `<th>${p.name}</th>`);
            html += `</tr></thead><tbody>`;

            html += `<tr><td><strong>Изображение</strong></td>`;
            prods.forEach(p => {
                const style = p.imgFile ? `background-image:url('imges/${p.imgFile}');background-size:contain;background-repeat:no-repeat;background-position:center;` : `background:#b8aa92;`;
                html += `<td><div class="compare-product-image" style="${style}">${!p.imgFile ? p.imgLabel || p.brand : ''}</div></td>`;
            });
            html += `</tr>`;

            html += `<tr><td><strong>Бренд</strong></td>`;
            prods.forEach(p => html += `<td>${p.brand}</td>`);
            html += `</tr><tr><td><strong>Категория</strong></td>`;
            prods.forEach(p => html += `<td>${p.category}</td>`);
            html += `</tr><tr><td><strong>Цена</strong></td>`;
            prods.forEach(p => html += `<td class="compare-product-price">${p.price.toLocaleString()} ₽</td>`);
            html += `</tr><tr><td><strong>Описание</strong></td>`;
            prods.forEach(p => html += `<td>${p.desc}</td>`);
            html += `</tr>`;

            html += `<tr><td><strong>Действия</strong></td>`;
            prods.forEach(p => {
                html += `<td>
                    <button class="remove-from-compare" data-id="${p.id}">❌ Удалить</button>
                    <button class="add-to-cart-btn" data-id="${p.id}">🛒 В корзину</button>
                </td>`;
            });
            html += `</tr></tbody></table>`;
            container.innerHTML = html;

            container.querySelectorAll('.remove-from-compare').forEach(b => {
                b.addEventListener('click', e => {
                    removeFromCompare(parseInt(b.dataset.id));
                    renderComparePage();
                    showToast('Удалено из сравнения');
                });
            });

            container.querySelectorAll('.add-to-cart-btn').forEach(b => {
                b.addEventListener('click', e => {
                    const id = parseInt(b.dataset.id);
                    const p = productsData.find(x => x.id === id);
                    if (p) addToCart(id, p.name);
                });
            });
        }
        renderComparePage();
    }

    // ==================== СТРАНИЦА ИЗБРАННОГО ====================
    if (isFavoritesPage) {
        const container = document.getElementById('favoritesContent');
        function renderFavoritesPage() {
            if (!container) return;
            const ids = getStorageArray(STORAGE_KEYS.FAVORITE);
            const prods = productsData.filter(p => ids.includes(p.id));
            if (!prods.length) {
                container.innerHTML = `<div class="empty-favorites"><p>❤️ У вас нет избранных товаров</p><a href="catalog.html">В каталог</a></div>`;
                return;
            }
            let html = `<div class="favorites-grid">`;
            prods.forEach(p => {
                const bg = p.imgFile ? `background-image:url('imges/${p.imgFile}');background-size:contain;background-repeat:no-repeat;background-position:center;` : `background:#b8aa92;`;
                html += `<div class="product-card" data-id="${p.id}">
                    <div class="product-image" style="${bg}">${!p.imgFile?p.imgLabel||p.brand:''}</div>
                    <div class="product-title">${p.name}</div><div class="product-brand">${p.brand}</div>
                    <div class="product-price">${p.price.toLocaleString()} ₽</div>
                    <div class="card-actions">
                        <button class="remove-from-favorites" data-id="${p.id}">❤️ Убрать</button>
                        <button class="card-btn" data-action="cart">🛒 В корзину</button>
                    </div>
                </div>`;
            });
            html += `</div>`;
            container.innerHTML = html;

            container.querySelectorAll('.remove-from-favorites').forEach(b => b.addEventListener('click', e => {
                removeFromFavorite(parseInt(b.dataset.id));
                renderFavoritesPage();
                showToast('Удалено из избранного');
            }));
        }
        renderFavoritesPage();
    }

    // ==================== FAQ (ДОСТАВКА) ====================
    if (isDeliveryPage) {
        document.querySelectorAll('.faq-item').forEach(item => {
            const q = item.querySelector('.faq-question');
            const t = item.querySelector('.faq-toggle');
            if (q) q.addEventListener('click', ()=>{
                item.classList.toggle('active');
                if (t) t.textContent = item.classList.contains('active') ? '➖' : '➕';
            });
        });
    }

    // ==================== ФОРМА КОНТАКТОВ ====================
    if (isContactsPage) {
        const form = document.getElementById('contactForm');
        if (form) form.addEventListener('submit', e => {
            e.preventDefault();
            alert('Спасибо! Мы свяжемся с вами.');
            form.reset();
        });
    }

    // ==================== ИНИЦИАЛИЗАЦИЯ СЧЁТЧИКОВ ====================
    syncCountersFromStorage();
})();