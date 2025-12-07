// LCP优化脚本
// 检测并优化LCP元素

function optimizeLCP() {
  // 使用PerformanceObserver检测LCP
  if ('PerformanceObserver' in window && 'largestcontentfulpaint' in PerformanceObserver.supportedEntryTypes) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1]; // Use the latest LCP candidate
      
      // 检查LCP元素是否是图片
      if (lastEntry.element && lastEntry.element.tagName === 'IMG') {
        const img = lastEntry.element;
        
        // 为LCP图片添加高优先级获取属性
        if (!img.hasAttribute('fetchpriority')) {
          img.setAttribute('fetchpriority', 'high');
        }
        
        // 如果图片使用了懒加载，移除懒加载属性使其立即加载
        if (img.hasAttribute('loading') && img.getAttribute('loading') === 'lazy') {
          img.removeAttribute('loading');
        }
        
        // 如果图片使用了data-src，则立即加载
        if (img.hasAttribute('data-src')) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        
        console.log('LCP image optimized:', img);
      }
    });
    
    observer.observe({ entryTypes: ['largestcontentfulpaint'] });
  }
}

// 页面加载完成后执行
if ('requestIdleCallback' in window) {
  requestIdleCallback(optimizeLCP, { timeout: 3000 });
} else {
  setTimeout(optimizeLCP, 100);
}

// 如果支持Performance API，尽早检测
if ('performance' in window) {
  window.addEventListener('load', function() {
    if (performance.getEntriesByType('navigation').length > 0) {
      const navEntry = performance.getEntriesByType('navigation')[0];
      // 如果页面加载很快，立即执行优化
      if (navEntry.loadEventEnd - navEntry.fetchStart < 1000) {
        optimizeLCP();
      }
    }
  });
}