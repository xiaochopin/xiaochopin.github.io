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

    const watchNaturalSize = () => {
      applyNaturalAspectRatio();
      if (aspectRatioApplied || img.complete) {
        return;
      }

      requestAnimationFrame(watchNaturalSize);
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
      // 监听 load 和 error 事件
      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);
      watchNaturalSize();
    }
  });
}

// 页面初始加载时初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initImageLoader);
} else {
  initImageLoader();
}
