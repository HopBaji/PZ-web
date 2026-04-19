(function(){
    "use strict";

    // ==================== ПОЛНЫЙ МАССИВ ТОВАРОВ (12 штук) ====================
    const productsData = [
        { id: 1, name: "Винтовка Молот ВПО-215 'Горностай'", brand: "ВПО", category: "Оружие", price: 18500, priceStr: "18 500 ₽", imgLabel: "ВПО-215", imgFile: "VPO-215_View.webp", desc: "Болтовой карабин .366 ТКМ" },
        { id: 2, name: "Карабин Baikal MP-155", brand: "Baikal", category: "Оружие", price: 42900, priceStr: "42 900 ₽", imgLabel: "MP-155", desc: "Полуавтоматическое ружьё 12/76" },
        { id: 3, name: "Катушка Shimano Stradic 2500", brand: "Shimano", category: "Рыболовные снасти", price: 12490, priceStr: "12 490 ₽", imgLabel: "Stradic", desc: "Безынерционная катушка" },
        { id: 4, name: "Спиннинг Maximus High Energy 24M", brand: "Maximus", category: "Рыболовные снасти", price: 6300, priceStr: "6 300 ₽", imgLabel: "HighEnergy", desc: "Удилище для джига" },
        { id: 5, name: "Костюм охотничий 'Тайга'", brand: "Тайга", category: "Одежда", price: 8900, priceStr: "8 900 ₽", imgLabel: "Тайга", desc: "Мембранный костюм" },
        { id: 6, name: "Палатка Husky Flame 3", brand: "Husky", category: "Туризм", price: 15400, priceStr: "15 400 ₽", imgLabel: "Flame", desc: "Трехместная палатка" },
        { id: 7, name: "Патроны 12/70 'Главпатрон' дробь №5", brand: "Главпатрон", category: "Боеприпасы", price: 450, priceStr: "450 ₽", imgLabel: "12/70", desc: "25 шт в упаковке" },
        { id: 8, name: "Нож Morakniv Companion", brand: "Morakniv", category: "Ножи", price: 2100, priceStr: "2 100 ₽", imgLabel: "Companion", desc: "Нож с фиксированным клинком" },
        { id: 9, name: "Рюкзак тактический 45л", brand: "Stich Profi", category: "Снаряжение", price: 5400, priceStr: "5 400 ₽", imgLabel: "Рюкзак", desc: "Молле, влагозащита" },
        { id: 10, name: "Прицел Hawke Vantage 3-9x40", brand: "Hawke", category: "Оптика", price: 11900, priceStr: "11 900 ₽", imgLabel: "Hawke", desc: "Сетка Mil-Dot" },
        { id: 11, name: "Манок на утку Haydel's", brand: "Haydel's", category: "Аксессуары", price: 1900, priceStr: "1 900 ₽", imgLabel: "Манок", desc: "Деревянный манок" },
        { id: 12, name: "Вейдерсы для рыбалки", brand: "Aqua", category: "Одежда", price: 7200, priceStr: "7 200 ₽", imgLabel: "Вейдерсы", desc: "Полукомбинезон" }
    ];

    // ==================== КЛЮЧИ ДЛЯ LOCALSTORAGE ====================
    const COMPARE_STORAGE_KEY = 'huntfish_compare';
    const FAVORITE_STORAGE_KEY = 'huntfish_favorite';

    // ==================== ГЛОБАЛЬНЫЕ СЧЁТЧИКИ ====================
    let compareCount = 0, favoriteCount = 0, cartCount = 0;

    // Инициализация счётчиков из localStorage
    try {
        const storedCompare = localStorage.getItem(COMPARE_STORAGE_KEY);
        if (storedCompare) compareCount = JSON.parse(storedCompare).length;
        const storedFavorite = localStorage.getItem(FAVORITE_STORAGE_KEY);
        if (storedFavorite) favoriteCount = JSON.parse(storedFavorite).length;
    } catch(e) {}

    // ==================== ОПРЕДЕЛЕНИЕ ТИПА СТРАНИЦЫ ====================
    const isIndexPage      = !!document.querySelector('.promo-news');
    const isCatalogPage    = !!document.querySelector('.catalog-section');
    const isAboutPage      = !!document.querySelector('.about-hero');
    const isDeliveryPage   = !!document.querySelector('.delivery-hero');
    const isContactsPage   = !!document.querySelector('.contacts-hero');
    const isComparePage    = !!document.querySelector('.compare-hero');
    const isFavoritesPage  = !!document.querySelector('.favorites-hero');

    // ==================== ОБЩИЕ DOM ЭЛЕМЕНТЫ ====================
    const toastEl = document.getElementById('toast');
    const compareCountSpan = document.getElementById('compareCount');
    const favoriteCountSpan = document.getElementById('favoriteCount');
    const cartCountSpan = document.getElementById('cartCount');
    const logoBtn = document.getElementById('logoBtn');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    // ==================== УТИЛИТЫ ====================
    function showToast(text, duration = 2500) {
        if (!toastEl) return;
        toastEl.textContent = text;
        toastEl.classList.add('show');
        setTimeout(() => toastEl.classList.remove('show'), duration);
    }

    function updateCountersUI() {
        if (compareCountSpan) compareCountSpan.textContent = compareCount;
        if (favoriteCountSpan) favoriteCountSpan.textContent = favoriteCount;
        if (cartCountSpan) cartCountSpan.textContent = cartCount;
    }

    // Обработчик кнопок на карточках товаров
    function handleCardAction(action, productId, productName, productDesc) {
        switch (action) {
            case 'info':
                showToast(`📋 ${productName}: ${productDesc}`, 4000);
                break;

            case 'compare': {
    console.log('[COMPARE] Нажата кнопка "Сравнить", productId =', productId);
    let ids = [];
    try {
        const stored = localStorage.getItem(COMPARE_STORAGE_KEY);
        console.log('[COMPARE] Текущее содержимое localStorage:', stored);
        ids = stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('[COMPARE] Ошибка чтения localStorage:', e);
        ids = [];
    }
    console.log('[COMPARE] Массив ID до добавления:', ids);

    if (!ids.includes(productId)) {
        if (ids.length < 4) {
            ids.push(productId);
            try {
                localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(ids));
                compareCount = ids.length;
                updateCountersUI();
                showToast(`⚖️ ${productName} добавлен в сравнение`);
                console.log('[COMPARE] ✅ Товар добавлен. Новый массив:', ids);
            } catch (e) {
                console.error('[COMPARE] ❌ Ошибка записи в localStorage:', e);
                showToast('❌ Не удалось сохранить товар', 2000);
            }
        } else {
            showToast(`⚠️ Можно сравнить не более 4 товаров`, 3000);
            console.log('[COMPARE] ⚠️ Превышен лимит (4 товара)');
        }
    } else {
        showToast(`ℹ️ ${productName} уже в сравнении`, 2000);
        console.log('[COMPARE] ℹ️ Товар уже есть в сравнении');
    }
    break;
}

            case 'favorite': {
                const favIds = JSON.parse(localStorage.getItem(FAVORITE_STORAGE_KEY) || '[]');
                if (!favIds.includes(productId)) {
                    favIds.push(productId);
                    localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(favIds));
                    favoriteCount = favIds.length;
                    showToast(`❤️ ${productName} добавлен в избранное`);
                } else {
                    showToast(`ℹ️ ${productName} уже в избранном`, 2000);
                    return;
                }
                break;
            }

            case 'cart':
                cartCount++;
                showToast(`🛒 ${productName} добавлен в корзину`);
                break;
        }
        updateCountersUI();
    }

    // Делегирование кликов по карточкам товаров
    function setupProductCardListeners(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (!card) return;

            const productId = parseInt(card.dataset.id);
            const productName = card.querySelector('.product-title')?.textContent || 'товар';
            const productDesc = card.dataset.desc || '';

            // Клик по названию — показать описание
            if (e.target.classList.contains('product-title')) {
                showToast(`📋 ${productName}: ${productDesc}`, 4000);
                return;
            }

            const btn = e.target.closest('button');
            if (!btn) return;
            const action = btn.dataset.action;
            if (action) handleCardAction(action, productId, productName, productDesc);
        });
    }

    // Блокируем переход по action-кнопкам, кроме compareBtn и favoriteBtn
    document.querySelectorAll('.action-btn').forEach(btn => {
        if (btn.id !== 'compareBtn' && btn.id !== 'favoriteBtn') {
            btn.addEventListener('click', (e) => e.preventDefault());
        }
    });

    // Логотип -> главная со сбросом localStorage (опционально)
    if (logoBtn) {
        logoBtn.addEventListener('click', () => {
            // Сброс счётчиков и localStorage (раскомментируйте при необходимости)
            // compareCount = favoriteCount = cartCount = 0;
            // localStorage.removeItem(COMPARE_STORAGE_KEY);
            // localStorage.removeItem(FAVORITE_STORAGE_KEY);
            // updateCountersUI();
            window.location.href = 'index.html';
        });
    }

    // Поиск на визитках перенаправляет в каталог
    function performGlobalSearch() {
        const query = searchInput ? searchInput.value.trim() : '';
        window.location.href = query ? `catalog.html?search=${encodeURIComponent(query)}` : 'catalog.html';
    }
    if (!isCatalogPage) {
        if (searchBtn) searchBtn.addEventListener('click', performGlobalSearch);
        if (searchInput) searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performGlobalSearch(); });
    }

    // Сброс всех счётчиков (если есть кнопка на странице)
    const clearCountersBtn = document.getElementById('clearCountersBtn');
    if (clearCountersBtn) {
        clearCountersBtn.addEventListener('click', () => {
            compareCount = favoriteCount = cartCount = 0;
            updateCountersUI();
            showToast('🧹 Счетчики сброшены');
        });
    }

    // ==================== ГЛАВНАЯ СТРАНИЦА ====================
    if (isIndexPage) {
        const productsContainer = document.getElementById('productsContainer');
        const brandListEl = document.getElementById('brandListContainer');
        const resetBrandFilterSpan = document.getElementById('resetBrandFilter');
        const showAllBtn = document.getElementById('showAllBtn');
        const resultCountSpan = document.getElementById('resultCount');

        // Карусель
        const slidesContainer = document.getElementById('carouselSlides');
        const slides = document.querySelectorAll('.carousel-slide');
        const prevBtn = document.getElementById('carouselPrev');
        const nextBtn = document.getElementById('carouselNext');
        const dotsContainer = document.getElementById('carouselDots');
        let currentSlide = 0, slideInterval;
        const totalSlides = slides.length;

        function updateCarousel() {
            if (slidesContainer) slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
            document.querySelectorAll('.carousel-dot').forEach((dot, idx) => dot.classList.toggle('active', idx === currentSlide));
        }
        function nextSlide() { currentSlide = (currentSlide + 1) % totalSlides; updateCarousel(); }
        function prevSlide() { currentSlide = (currentSlide - 1 + totalSlides) % totalSlides; updateCarousel(); }
        function goToSlide(idx) { currentSlide = idx; updateCarousel(); }
        function createDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('span');
                dot.className = 'carousel-dot';
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            }
        }
        function startAutoSlide() { slideInterval = setInterval(nextSlide, 5000); }
        function stopAutoSlide() { clearInterval(slideInterval); }

        if (slides.length) {
            createDots();
            startAutoSlide();
            const carousel = document.querySelector('.carousel-container');
            if (carousel) {
                carousel.addEventListener('mouseenter', stopAutoSlide);
                carousel.addEventListener('mouseleave', startAutoSlide);
            }
            if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); stopAutoSlide(); startAutoSlide(); });
            if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); stopAutoSlide(); startAutoSlide(); });
        }

        // Фильтр по бренду
        let currentFilterBrand = null;
        const allBrands = [...new Set(productsData.map(p => p.brand))];

        function renderBrandList() {
            if (!brandListEl) return;
            brandListEl.innerHTML = allBrands.map(brand => 
                `<div class="brand-item ${currentFilterBrand === brand ? 'active' : ''}" data-brand="${brand}">${brand}</div>`
            ).join('');
        }

        function getFilteredProductsIndex() {
            return productsData.filter(p => !currentFilterBrand || p.brand === currentFilterBrand);
        }

        function renderProductsIndex() {
            if (!productsContainer) return;
            const filtered = getFilteredProductsIndex();
            if (!filtered.length) {
                productsContainer.innerHTML = `<div class="no-products" style="grid-column:1/-1; padding:20px;">😕 Товары не найдены</div>`;
                if (resultCountSpan) resultCountSpan.textContent = '';
                return;
            }
            let html = '';
            filtered.forEach(prod => {
                const bg = prod.imgFile ? `background-image:url('imges/${prod.imgFile}');background-size:contain;background-repeat:no-repeat;background-position:center;` : '';
                html += `<div class="product-card" data-id="${prod.id}" data-desc="${prod.desc}">
                    <div class="product-image" style="${bg}">${!prod.imgFile ? prod.imgLabel || prod.brand : ''}</div>
                    <div class="product-title">${prod.name}</div><div class="product-brand">${prod.brand}</div>
                    <div class="product-price">${prod.priceStr}</div>
                    <div class="card-actions">
                        <button class="card-btn" data-action="info">ℹ️</button>
                        <button class="card-btn" data-action="compare">⚖️</button>
                        <button class="card-btn" data-action="favorite">❤️</button>
                        <button class="card-btn" data-action="cart">🛒</button>
                    </div>
                </div>`;
            });
            productsContainer.innerHTML = html;
            if (resultCountSpan) resultCountSpan.textContent = `найдено: ${filtered.length}`;
        }

        function refreshIndex() { renderBrandList(); renderProductsIndex(); }

        if (brandListEl) brandListEl.addEventListener('click', e => {
            const item = e.target.closest('.brand-item');
            if (!item) return;
            const brand = item.dataset.brand;
            currentFilterBrand = currentFilterBrand === brand ? null : brand;
            refreshIndex();
            showToast(currentFilterBrand ? `🎯 Бренд: ${currentFilterBrand}` : 'Все бренды');
        });
        if (resetBrandFilterSpan) resetBrandFilterSpan.addEventListener('click', () => { currentFilterBrand = null; refreshIndex(); showToast('Фильтр сброшен'); });
        if (showAllBtn) showAllBtn.addEventListener('click', () => { currentFilterBrand = null; if (searchInput) searchInput.value = ''; refreshIndex(); showToast('Все товары'); });

        refreshIndex();
        setupProductCardListeners('productsContainer');
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
        if (searchParam) { searchQuery = searchParam; if (searchInput) searchInput.value = searchParam; }

        function renderFilters() {
            if (brandFiltersDiv) {
                brandFiltersDiv.innerHTML = allBrands.map(b => `<label class="filter-checkbox"><input type="checkbox" value="${b}" ${selectedBrands.has(b)?'checked':''}><span>${b}</span></label>`).join('');
                brandFiltersDiv.querySelectorAll('input').forEach(cb => cb.addEventListener('change', e => {
                    e.target.checked ? selectedBrands.add(e.target.value) : selectedBrands.delete(e.target.value);
                    currentPage=1; renderCatalog();
                }));
            }
            if (categoryFiltersDiv) {
                categoryFiltersDiv.innerHTML = allCategories.map(c => `<label class="filter-checkbox"><input type="checkbox" value="${c}" ${selectedCategories.has(c)?'checked':''}><span>${c}</span></label>`).join('');
                categoryFiltersDiv.querySelectorAll('input').forEach(cb => cb.addEventListener('change', e => {
                    e.target.checked ? selectedCategories.add(e.target.value) : selectedCategories.delete(e.target.value);
                    currentPage=1; renderCatalog();
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
            renderFilters(); currentPage=1; renderCatalog();
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

        function performCatalogSearch() { searchQuery = searchInput?.value.trim() || ''; currentPage=1; renderCatalog(); }
        if (searchBtn) { searchBtn.removeEventListener('click', performGlobalSearch); searchBtn.addEventListener('click', performCatalogSearch); }
        if (searchInput) { searchInput.removeEventListener('keypress', performGlobalSearch); searchInput.addEventListener('keypress', e => { if(e.key==='Enter') performCatalogSearch(); }); }

        viewBtns.forEach(btn => btn.addEventListener('click', ()=>{
            viewBtns.forEach(b=>b.classList.remove('active')); btn.classList.add('active');
            gridColumns = btn.dataset.grid === '4' ? 4 : 3; renderCatalog();
        }));

        renderFilters();
        renderCatalog();
        setupProductCardListeners('productsContainer');
    }

    // ==================== ДОСТАВКА (FAQ) ====================
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

    // ==================== КОНТАКТЫ (форма) ====================
    if (isContactsPage) {
        const form = document.getElementById('contactForm');
        if (form) form.addEventListener('submit', e => { e.preventDefault(); alert('Спасибо! Мы свяжемся с вами.'); form.reset(); });
    }

    // ==================== СРАВНЕНИЕ (compare.html) ====================
if (isComparePage) {
    console.log('[COMPARE] Страница сравнения загружена.');

    const container = document.getElementById('compareContent');
    if (!container) {
        console.error('[COMPARE] ❌ Контейнер #compareContent не найден в DOM!');
        return;
    }
    console.log('[COMPARE] Контейнер найден.');

    function getIds() {
        const s = localStorage.getItem(COMPARE_STORAGE_KEY);
        console.log('[COMPARE] Данные из localStorage:', s);
        return s ? JSON.parse(s) : [];
    }

    function saveIds(ids) {
        localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(ids));
        compareCount = ids.length;
        updateCountersUI();
        console.log('[COMPARE] Сохранены ID:', ids);
    }

    function remove(id) {
        let ids = getIds();
        ids = ids.filter(i => i !== id);
        saveIds(ids);
        render();
    }

    function render() {
        console.log('[COMPARE] Начало рендеринга...');
        const ids = getIds();
        const prods = productsData.filter(p => ids.includes(p.id));
        console.log('[COMPARE] Товары для сравнения:', prods);

        if (!prods.length) {
            container.innerHTML = `<div class="empty-compare"><p>😕 Нет товаров для сравнения</p><a href="catalog.html">В каталог</a></div>`;
            console.log('[COMPARE] Отображена заглушка (нет товаров).');
            return;
        }

        let html = `<table class="compare-table"><thead><tr><th>Характеристика</th>`;
        prods.forEach(p => html += `<th>${p.name}</th>`);
        html += `</tr></thead><tbody>`;

        // Изображение
        html += `<tr><td><strong>Изображение</strong></td>`;
        prods.forEach(p => {
            const style = p.imgFile ? `background-image:url('imges/${p.imgFile}');background-size:contain;background-repeat:no-repeat;background-position:center;` : `background:#b8aa92;`;
            html += `<td><div class="compare-product-image" style="${style}">${!p.imgFile ? p.imgLabel || p.brand : ''}</div></td>`;
        });
        html += `</tr>`;

        // Бренд
        html += `<tr><td><strong>Бренд</strong></td>`;
        prods.forEach(p => html += `<td>${p.brand}</td>`);
        html += `</tr>`;

        // Категория
        html += `<tr><td><strong>Категория</strong></td>`;
        prods.forEach(p => html += `<td>${p.category}</td>`);
        html += `</tr>`;

        // Цена
        html += `<tr><td><strong>Цена</strong></td>`;
        prods.forEach(p => html += `<td class="compare-product-price">${p.price.toLocaleString()} ₽</td>`);
        html += `</tr>`;

        // Описание
        html += `<tr><td><strong>Описание</strong></td>`;
        prods.forEach(p => html += `<td>${p.desc}</td>`);
        html += `</tr>`;

        // Действия
        html += `<tr><td><strong>Действия</strong></td>`;
        prods.forEach(p => {
            html += `<td>
                <button class="remove-from-compare" data-id="${p.id}">❌ Удалить</button>
                <button class="add-to-cart-btn" data-id="${p.id}">🛒 В корзину</button>
            </td>`;
        });
        html += `</tr></tbody></table>`;

        container.innerHTML = html;
        console.log('[COMPARE] Таблица вставлена в DOM.');

        container.querySelectorAll('.remove-from-compare').forEach(b => {
            b.addEventListener('click', e => {
                remove(parseInt(b.dataset.id));
                showToast('Удалено из сравнения');
            });
        });

        container.querySelectorAll('.add-to-cart-btn').forEach(b => {
            b.addEventListener('click', e => {
                const id = parseInt(b.dataset.id);
                const p = productsData.find(x => x.id === id);
                if (p) {
                    cartCount++;
                    updateCountersUI();
                    showToast(`🛒 ${p.name} в корзине`);
                }
            });
        });
    }

    render();
}

    // ==================== ИЗБРАННОЕ ====================
    if (isFavoritesPage) {
        const container = document.getElementById('favoritesContent');
        if (!container) return;

        function getIds() { const s = localStorage.getItem(FAVORITE_STORAGE_KEY); return s ? JSON.parse(s) : []; }
        function saveIds(ids) { localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(ids)); favoriteCount = ids.length; updateCountersUI(); }
        function remove(id) { let ids = getIds(); ids = ids.filter(i => i !== id); saveIds(ids); render(); }

        function render() {
            const ids = getIds();
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

            container.querySelectorAll('.remove-from-favorites').forEach(b => b.addEventListener('click', e => { remove(parseInt(b.dataset.id)); showToast('Удалено из избранного'); }));
            container.querySelectorAll('[data-action="cart"]').forEach(b => b.addEventListener('click', e => {
                const card = b.closest('.product-card'); const id = parseInt(card.dataset.id); const p = productsData.find(x => x.id === id);
                if (p) { cartCount++; updateCountersUI(); showToast(`🛒 ${p.name} в корзине`); }
            }));
        }
        render();
    }

    // ==================== ФИНАЛЬНОЕ ОБНОВЛЕНИЕ UI ====================
    updateCountersUI();

})();