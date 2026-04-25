// js/main.js
// Модуль-заглушка: подключает глобальные функции Shop для обратной совместимости
(function() {
  if (window.Shop) {
    document.addEventListener('DOMContentLoaded', () => {
      Shop.initHeaderSearch();
      Shop.initLogo();
      Shop.syncCounters();
    });

    // Проксируем старые глобальные вызовы (если где-то используются)
    window.addToCompare = Shop.addToCompare;
    window.addToFavorite = Shop.addToFavorite;
    window.addToCart = Shop.addToCart;
    window.showToast = Shop.showToast;
    window.syncCounters = Shop.syncCounters;
  } else {
    console.warn('Shop не найден. Убедитесь, что common.js загружен перед main.js');
  }
})();