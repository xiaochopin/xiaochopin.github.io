function initImageLoader() {
  const images = document.querySelectorAll('.article-main img:not(.things-avatar img), .page-main img:not(.things-avatar img)');
  
  images.forEach(img => {
    // 跳过已经处理过的图片
    if (img.dataset.imageLoaderInit) {
      return;
    }
    img.dataset.imageLoaderInit = 'true';
    
    // 创建 wrapper 容器
    const wrapper = document.createElement('div');
    wrapper.className = 'img-wrapper';
    wrapper.style.aspectRatio = '16 / 9';
    
    // 将 img 外包一层 wrapper
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);

    let aspectRatioApplied = false;

    const applyNaturalAspectRatio = () => {
      if (aspectRatioApplied) {
        return;
      }

      const { naturalWidth, naturalHeight } = img;
      if (!naturalWidth || !naturalHeight) {
        return;
      }

      wrapper.style.aspectRatio = `${naturalWidth} / ${naturalHeight}`;
      aspectRatioApplied = true;
    };

    // 当前图片 src，如果已加载则直接标记为 loaded
    const handleLoad = () => {
      applyNaturalAspectRatio();
      wrapper.classList.add('loaded');
    };
    
    // 图片加载失败时也隐藏占位符（显示失败态）
    const handleError = () => {
      wrapper.classList.add('loaded');
    };
    
    // 如果图片已经在缓存中被加载，complete 会为 true
    if (img.complete) {
      handleLoad();
    } else {
      // 监听 load 和 error 事件（once，避免 SPA 反复替换后监听器累积）
      img.addEventListener('load', handleLoad, { once: true });
      img.addEventListener('error', handleError, { once: true });
      // 缓存命中但 complete 尚未置位、或 load 事件错过的边界情况：
      // decode() 解析完成后补一次，替代原来每张图一个 requestAnimationFrame 轮询
      if (typeof img.decode === 'function') {
        img.decode().then(() => {
          if (img.naturalWidth) handleLoad();
        }).catch(() => {});
      }
    }
  });
}

// 页面初始加载时初始化。
// 本文件以 defer 加载：执行时 readyState 已是 interactive，但 DOMContentLoaded 还没触发，
// 因此仍然注册监听，保证在 React 接管并重建 #react-app 之后再处理图片。
// （直接同步执行会作用在即将被 React 丢弃的服务端 DOM 上，占位容器会一起消失）
if (document.readyState === 'complete') {
  initImageLoader();
} else {
  document.addEventListener('DOMContentLoaded', initImageLoader);
}

// React 的首次渲染与 SPA 跳转都会整体重建 #react-app 的子树，
// 用 MutationObserver 兜底：只要内容变了就补一次占位容器（已处理过的图片有 data 标记，不会重复包装）。
(function observeReactApp() {
  const app = document.getElementById('react-app');
  if (!app || typeof MutationObserver !== 'function') {
    return;
  }

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) {
      return;
    }
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      initImageLoader();
    });
  });

  observer.observe(app, { childList: true, subtree: true });
})();
