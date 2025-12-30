// 随机打乱 .things-item 顺序
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    var container = document.querySelector('.things');
    if (!container) return;
    var items = Array.from(container.querySelectorAll('.things-item'));
    if (items.length < 2) return;
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    container.innerHTML = '';
    items.forEach(item => container.appendChild(item));
  });
})();
