// 只导出 shuffleThings，不自动执行，所有打乱操作交由 React useEffect 和页面切换后调用
function shuffleThingsWithRetry(retry = 20) {
  var container = document.querySelector('.things');
  if (!container) {
    if (retry > 0) setTimeout(() => shuffleThingsWithRetry(retry - 1), 50);
    return;
  }
  var items = Array.from(container.querySelectorAll('.things-item'));
  if (items.length < 2) {
    requestAnimationFrame(() => container.classList.remove('things-hidden'));
    return;
  }
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  container.innerHTML = '';
  items.forEach(item => container.appendChild(item));
  // 显示友链：在打乱结束后再淡入
  requestAnimationFrame(() => container.classList.remove('things-hidden'));
}
window.shuffleThings = shuffleThingsWithRetry;
