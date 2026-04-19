(function(){
    "use strict";

    // ---------- ЕДИНЫЙ МАССИВ ТОВАРОВ ----------
    const productsData = [
        { id: 1, name: "Винтовка Молот ВПО-215 'Горностай'", brand: "ВПО", category: "Оружие", price: 18500, priceStr: "18 500 ₽", imgLabel: "ВПО-215", imgFile: "VPO-215_View.webp", desc: "Болтовой карабин .366 ТКМ" },
    ];

    // ---------- ОБЩИЕ ПЕРЕМЕННЫЕ ----------
    let compareCount = 0, favoriteCount = 0, cartCount = 0;

    // DOM элементы, общие для обеих страниц
    const toastEl = document.getElementById('toast');
    const compareCountSpan = document.getElementById('compareCount');
    const favoriteCountSpan = document.getElementById('favoriteCount');
    const cartCountSpan = document.getElementById('cartCount');
    const logoBtn = document.getElementById('logoBtn');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    // Определяем, какая страница загружена, по наличию специфичных элементов
    const isIndexPage = !!document.querySelector('.promo-news');
    const isCatalogPage = !!document.querySelector('.catalog-section');

    // ---------- УТИЛИТЫ ----------
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

    // Обработчик кнопок карточек (общий)
    function handleCardAction(action, productName, productDesc) {
        switch (action) {
            case 'info':
                showToast(`📋 ${productName}: ${productDesc}`, 4000);
                break;
            case 'compare':
                compareCount++;
                showToast(`⚖️ ${productName} добавлен в сравнение`);
                break;
            case 'favorite':
                favoriteCount++;
                showToast(`❤️ ${productName} в избранном`);
                break;
            case 'cart':
                cartCount++;
                showToast(`🛒 ${productName} в корзине`);
                break;
        }
        updateCountersUI();
    }

    // Навешиваем делегирование событий на контейнеры товаров
    function setupProductCardListeners(containerId, renderCallback) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (!card) return;

            // Клик по названию товара -> показать описание
            if (e.target.classList.contains('product-title')) {
                const name = card.querySelector('.product-title')?.textContent || 'товар';
                const desc = card.dataset.desc || '';
                showToast(`📋 ${name}: ${desc}`, 4000);
                return;
            }

            const btn = e.target.closest('button');
            if (!btn) return;
            const action = btn.dataset.action;
            const prodName = card.querySelector('.product-title')?.textContent || 'товар';
            const desc = card.dataset.desc || '';
            handleCardAction(action, prodName, desc);

            // Если на странице каталога, после изменения счётчиков перерисовка не требуется,
            // но если вдруг нужно обновить UI (счётчики уже обновлены)
        });
    }

    // Блокируем переход по action-кнопкам (сравнить, избранное, корзина)
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => e.preventDefault());
    });

    // Логотип ведёт на главную
    if (logoBtn) {
        logoBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // ---------- ЛОГИКА ГЛАВНОЙ СТРАНИЦЫ (index.html) ----------
    if (isIndexPage) {
        // DOM элементы главной
        const productsContainer = document.getElementById('productsContainer');
        const brandListEl = document.getElementById('brandListContainer');
        const resetBrandFilterSpan = document.getElementById('resetBrandFilter');
        const showAllBtn = document.getElementById('showAllBtn');
        const clearCountersBtn = document.getElementById('clearCountersBtn');
        const resultCountSpan = document.getElementById('resultCount');

        // Карусель
        const slidesContainer = document.getElementById('carouselSlides');
        const slides = document.querySelectorAll('.carousel-slide');
        const prevBtn = document.getElementById('carouselPrev');
        const nextBtn = document.getElementById('carouselNext');
        const dotsContainer = document.getElementById('carouselDots');

        let currentSlide = 0;
        let slideInterval;
        const totalSlides = slides.length;

        function updateCarousel() {
            if (slidesContainer) {
                slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
            }
            document.querySelectorAll('.carousel-dot').forEach((dot, idx) => {
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
            if (!dotsContainer) return;
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

        if (slides.length > 0) {
            createDots();
            startAutoSlide();
            const carouselContainer = document.querySelector('.carousel-container');
            if (carouselContainer) {
                carouselContainer.addEventListener('mouseenter', stopAutoSlide);
                carouselContainer.addEventListener('mouseleave', startAutoSlide);
            }
            if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); stopAutoSlide(); startAutoSlide(); });
            if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); stopAutoSlide(); startAutoSlide(); });
        }

        // Фильтрация на главной
        let currentFilterBrand = null;
        let searchQuery = '';

        const allBrands = [...new Set(productsData.map(p => p.brand))];

        function renderBrandList() {
            if (!brandListEl) return;
            brandListEl.innerHTML = allBrands.map(brand => 
                `<div class="brand-item ${currentFilterBrand === brand ? 'active' : ''}" data-brand="${brand}">${brand}</div>`
            ).join('');
        }

        function getFilteredProductsIndex() {
            return productsData.filter(p => {
                if (currentFilterBrand && p.brand !== currentFilterBrand) return false;
                if (searchQuery.trim()) {
                    const q = searchQuery.trim().toLowerCase();
                    return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
                }
                return true;
            });
        }

        function renderProductsIndex() {
            if (!productsContainer) return;
            const filtered = getFilteredProductsIndex();
            if (filtered.length === 0) {
                productsContainer.innerHTML = `<div class="no-products" style="grid-column:1/-1; padding:20px;">😕 Товары не найдены</div>`;
                if (resultCountSpan) resultCountSpan.textContent = '';
                return;
            }

            let html = '';
            filtered.forEach(prod => {
                const imageStyle = prod.imgFile 
                    ? `background-image: url('imges/${prod.imgFile}'); background-size: contain; background-repeat: no-repeat; background-position: center;` 
                    : '';
                html += `
                    <div class="product-card" data-id="${prod.id}" data-desc="${prod.desc}">
                        <div class="product-image" style="${imageStyle}">${!prod.imgFile ? prod.imgLabel || prod.brand : ''}</div>
                        <div class="product-title" title="Нажмите для описания">${prod.name}</div>
                        <div class="product-brand">${prod.brand}</div>
                        <div class="product-price">${prod.priceStr}</div>
                        <div class="card-actions">
                            <button class="card-btn" data-action="info">ℹ️</button>
                            <button class="card-btn" data-action="compare">⚖️</button>
                            <button class="card-btn" data-action="favorite">❤️</button>
                            <button class="card-btn" data-action="cart">🛒</button>
                        </div>
                    </div>
                `;
            });
            productsContainer.innerHTML = html;
            if (resultCountSpan) resultCountSpan.textContent = `найдено: ${filtered.length}`;
        }

        function refreshIndex() {
            renderBrandList();
            renderProductsIndex();
        }

        // Слушатели событий главной
        if (brandListEl) {
            brandListEl.addEventListener('click', (e) => {
                const item = e.target.closest('.brand-item');
                if (!item) return;
                const brand = item.dataset.brand;
                currentFilterBrand = currentFilterBrand === brand ? null : brand;
                refreshIndex();
                showToast(currentFilterBrand ? `🎯 Бренд: ${currentFilterBrand}` : 'Все бренды');
            });
        }

        if (resetBrandFilterSpan) {
            resetBrandFilterSpan.addEventListener('click', () => {
                currentFilterBrand = null;
                refreshIndex();
                showToast('Фильтр бренда сброшен');
            });
        }

        if (showAllBtn) {
            showAllBtn.addEventListener('click', () => {
                currentFilterBrand = null;
                searchQuery = '';
                if (searchInput) searchInput.value = '';
                refreshIndex();
                showToast('🔍 Показаны все товары');
            });
        }

        if (clearCountersBtn) {
            clearCountersBtn.addEventListener('click', () => {
                compareCount = favoriteCount = cartCount = 0;
                updateCountersUI();
                showToast('🧹 Счетчики сброшены');
            });
        }

        // Поиск
        function performSearchIndex() {
            if (!searchInput) return;
            searchQuery = searchInput.value.trim();
            refreshIndex();
        }
        if (searchBtn) searchBtn.addEventListener('click', performSearchIndex);
        if (searchInput) searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearchIndex(); });

        // Инициализация
        refreshIndex();
        setupProductCardListeners('productsContainer');

    } // конец isIndexPage

    // ---------- ЛОГИКА СТРАНИЦЫ КАТАЛОГА (catalog.html) ----------
    if (isCatalogPage) {
        // DOM элементы каталога
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

        // Состояние фильтров каталога
        let selectedBrands = new Set();
        let selectedCategories = new Set();
        let priceMin = 0;
        let priceMax = 50000;
        let searchQuery = '';
        let currentSort = 'default';
        let currentPage = 1;
        const itemsPerPage = 6;
        let gridColumns = 4;

        function renderFilters() {
            if (brandFiltersDiv) {
                brandFiltersDiv.innerHTML = allBrands.map(brand => `
                    <label class="filter-checkbox">
                        <input type="checkbox" value="${brand}" ${selectedBrands.has(brand) ? 'checked' : ''}>
                        <span>${brand}</span>
                    </label>
                `).join('');
                brandFiltersDiv.querySelectorAll('input').forEach(cb => {
                    cb.addEventListener('change', (e) => {
                        if (e.target.checked) selectedBrands.add(e.target.value);
                        else selectedBrands.delete(e.target.value);
                        currentPage = 1;
                        renderCatalog();
                    });
                });
            }

            if (categoryFiltersDiv) {
                categoryFiltersDiv.innerHTML = allCategories.map(cat => `
                    <label class="filter-checkbox">
                        <input type="checkbox" value="${cat}" ${selectedCategories.has(cat) ? 'checked' : ''}>
                        <span>${cat}</span>
                    </label>
                `).join('');
                categoryFiltersDiv.querySelectorAll('input').forEach(cb => {
                    cb.addEventListener('change', (e) => {
                        if (e.target.checked) selectedCategories.add(e.target.value);
                        else selectedCategories.delete(e.target.value);
                        currentPage = 1;
                        renderCatalog();
                    });
                });
            }
        }

        function getFilteredProductsCatalog() {
            let filtered = productsData.filter(p => {
                if (p.price < priceMin || p.price > priceMax) return false;
                if (selectedBrands.size > 0 && !selectedBrands.has(p.brand)) return false;
                if (selectedCategories.size > 0 && !selectedCategories.has(p.category)) return false;
                if (searchQuery.trim()) {
                    const q = searchQuery.trim().toLowerCase();
                    return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
                }
                return true;
            });

            switch (currentSort) {
                case 'priceAsc': filtered.sort((a,b) => a.price - b.price); break;
                case 'priceDesc': filtered.sort((a,b) => b.price - a.price); break;
                case 'name': filtered.sort((a,b) => a.name.localeCompare(b.name)); break;
            }
            return filtered;
        }

        function paginate(array) {
            const start = (currentPage - 1) * itemsPerPage;
            return array.slice(start, start + itemsPerPage);
        }

        function renderPagination(totalPages) {
            if (!paginationDiv) return;
            if (totalPages <= 1) {
                paginationDiv.innerHTML = '';
                return;
            }
            let html = '';
            for (let i = 1; i <= totalPages; i++) {
                html += `<div class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</div>`;
            }
            paginationDiv.innerHTML = html;
            paginationDiv.querySelectorAll('.page-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    currentPage = parseInt(btn.dataset.page);
                    renderCatalog();
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                });
            });
        }

        function renderCatalog() {
            if (!productsContainer) return;
            const filtered = getFilteredProductsCatalog();
            const paginated = paginate(filtered);
            const totalPages = Math.ceil(filtered.length / itemsPerPage);

            if (paginated.length === 0) {
                productsContainer.innerHTML = `<div class="no-products" style="grid-column:1/-1; padding:30px;">😕 Товары не найдены. Измените фильтры.</div>`;
            } else {
                let cards = '';
                paginated.forEach(prod => {
                    const imageStyle = prod.imgFile 
                        ? `background-image: url('imges/${prod.imgFile}'); background-size: contain; background-repeat: no-repeat; background-position: center; background-color: #d9d2c0;` 
                        : `background: linear-gradient(145deg, #b9aa92, #9b8e7a);`;
                    cards += `
                        <div class="product-card" data-id="${prod.id}" data-desc="${prod.desc}">
                            <div class="product-image" style="${imageStyle}">${!prod.imgFile ? prod.imgLabel || prod.brand : ''}</div>
                            <div class="product-category">${prod.category}</div>
                            <div class="product-title" title="Описание">${prod.name}</div>
                            <div class="product-brand">${prod.brand}</div>
                            <div class="product-price">${prod.price.toLocaleString()} ₽</div>
                            <div class="card-actions">
                                <button class="card-btn" data-action="info">ℹ️</button>
                                <button class="card-btn" data-action="compare">⚖️</button>
                                <button class="card-btn" data-action="favorite">❤️</button>
                                <button class="card-btn" data-action="cart">🛒</button>
                            </div>
                        </div>
                    `;
                });
                productsContainer.innerHTML = cards;
            }

            if (resultInfo) resultInfo.textContent = `Найдено: ${filtered.length} товаров`;
            renderPagination(totalPages);
            const grid = document.querySelector('.product-grid');
            if (grid) grid.style.gridTemplateColumns = `repeat(auto-fill, minmax(${gridColumns === 4 ? 200 : 240}px, 1fr))`;
        }

        function resetAllFilters() {
            selectedBrands.clear();
            selectedCategories.clear();
            priceMin = 0; priceMax = 50000;
            if (priceMinInput) priceMinInput.value = 0;
            if (priceMaxInput) priceMaxInput.value = 50000;
            searchQuery = '';
            if (searchInput) searchInput.value = '';
            currentSort = 'default';
            if (sortSelect) sortSelect.value = 'default';
            renderFilters();
            currentPage = 1;
            renderCatalog();
            showToast('🔍 Все фильтры сброшены');
        }

        // Слушатели каталога
        if (resetBrandsSpan) resetBrandsSpan.addEventListener('click', () => { selectedBrands.clear(); renderFilters(); currentPage=1; renderCatalog(); });
        if (resetCategoriesSpan) resetCategoriesSpan.addEventListener('click', () => { selectedCategories.clear(); renderFilters(); currentPage=1; renderCatalog(); });
        if (resetAllBtn) resetAllBtn.addEventListener('click', resetAllFilters);
        if (applyPriceBtn) {
            applyPriceBtn.addEventListener('click', () => {
                priceMin = parseInt(priceMinInput.value) || 0;
                priceMax = parseInt(priceMaxInput.value) || 50000;
                currentPage = 1;
                renderCatalog();
            });
        }
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                currentSort = e.target.value;
                currentPage = 1;
                renderCatalog();
            });
        }
        function performSearchCatalog() {
            if (!searchInput) return;
            searchQuery = searchInput.value.trim();
            currentPage = 1;
            renderCatalog();
        }
        if (searchBtn) searchBtn.addEventListener('click', performSearchCatalog);
        if (searchInput) searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearchCatalog(); });

        if (viewBtns.length > 0) {
            viewBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    viewBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    gridColumns = btn.dataset.grid === '4' ? 4 : 3;
                    renderCatalog();
                });
            });
        }

        // Инициализация каталога
        renderFilters();
        renderCatalog();
        setupProductCardListeners('productsContainer');

        // Кнопка сброса всех счётчиков (если есть на странице каталога)
        const clearCountersBtn = document.getElementById('clearCountersBtn');
        if (clearCountersBtn) {
            clearCountersBtn.addEventListener('click', () => {
                compareCount = favoriteCount = cartCount = 0;
                updateCountersUI();
                showToast('🧹 Счетчики сброшены');
            });
        }

    } // конец isCatalogPage

    // Обновляем счётчики при загрузке
    updateCountersUI();

})();