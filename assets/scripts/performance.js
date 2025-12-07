/**
 * 性能优化脚本
 * 包含懒加载、资源优化等功能
 */

// 页面加载完成后执行
window.addEventListener('load', function() {
  // 使用 requestIdleCallback 延迟执行非关键任务
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initLazyLoading, { timeout: 2000 });
    requestIdleCallback(sendAnalyticsData, { timeout: 3000 });
  } else {
    // 降级方案
    setTimeout(initLazyLoading, 100);
    setTimeout(sendAnalyticsData, 200);
  }
});

function initLazyLoading() {
  // 启用懒加载图片
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          // 如果图片有data-src属性，则将其设置为src
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          // 如果图片有data-srcset属性，则将其设置为srcset
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
          }
          
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px'
    });

    // 观察所有带有data-src属性的图片
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => imageObserver.observe(img));
  }
}

function sendAnalyticsData() {
  // 发送性能数据到Google Analytics（如果需要）
  if (typeof gtag !== 'undefined' && 'performance' in window) {
    // 获取性能数据
    const perfData = performance.getEntriesByType('navigation')[0];
    if (perfData) {
      // 发送页面加载时间数据
      gtag('event', 'timing_complete', {
        'name': 'load',
        'value': Math.round(perfData.loadEventEnd - perfData.fetchStart),
        'event_category': 'Performance'
      });
      
      // 发送首次内容绘制时间
      gtag('event', 'timing_complete', {
        'name': 'first_contentful_paint',
        'value': Math.round(performance.getEntriesByName('first-contentful-paint')[0].startTime),
        'event_category': 'Performance'
      });
    }
  }
}

// 页面可见性API - 当页面变为可见时执行某些操作
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    // 页面变为可见时的操作
    console.log('Page is now visible');
  }
});

// 支持往返缓存(bfcache)
window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    // 页面从bfcache中恢复
    console.log('Page restored from bfcache');
    // 使用 requestIdleCallback 重新激活组件
    if ('requestIdleCallback' in window) {
      requestIdleCallback(reinitializeComponents, { timeout: 2000 });
    } else {
      setTimeout(reinitializeComponents, 100);
    }
  }
});

// 页面隐藏时执行的操作
window.addEventListener('pagehide', function(event) {
  // 即使页面可能因no-store头部无法进入bfcache，我们也做好准备
  if (event.persisted) {
    console.log('Page stored in bfcache');
  } else {
    console.log('Page will not be stored in bfcache due to no-store header or other reasons');
  }
});

function reinitializeComponents() {
  // 重新初始化可能需要重新绑定事件监听器的组件
  // 例如重新绑定目录切换功能
  const tocElements = document.querySelectorAll('.toc');
  tocElements.forEach(function(toc) {
    const tocToggle = toc.querySelector('.toc-toggle');
    const tocContent = toc.querySelector('.toc-content');
    
    if (tocToggle && tocContent) {
      // 先移除可能存在的旧事件监听器
      const cloneToggle = tocToggle.cloneNode(true);
      tocToggle.parentNode.replaceChild(cloneToggle, tocToggle);
      
      // 添加新的事件监听器
      cloneToggle.addEventListener('click', function() {
        toc.classList.toggle('toc-expanded');
      });
    }
  });
  
  // 重新初始化懒加载图片观察器
  if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      // 检查图片是否已经加载
      if (img.dataset.src) {
        // 重新观察未加载的图片
        const imageObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
              }
              
              if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
                img.removeAttribute('data-srcset');
              }
              
              imageObserver.unobserve(img);
            }
          });
        }, {
          rootMargin: '50px 0px'
        });
        
        imageObserver.observe(img);
      }
    });
  }
  
  // 重新初始化代码复制按钮
  if (typeof initCodeCopy !== 'undefined') {
    initCodeCopy();
  }
}

// 检测bfcache支持和问题
(function() {
  // 检测是否有可能阻止bfcache的因素
  const diagnostic = {
    hasUnloadListener: false,
    hasBeforeUnloadListener: false,
    cacheControlHeader: null
  };
  
  // 检查是否有unload或beforeunload事件监听器
  window.addEventListener('unload', function() {
    diagnostic.hasUnloadListener = true;
  });
  
  window.addEventListener('beforeunload', function() {
    diagnostic.hasBeforeUnloadListener = true;
  });
  
  // 输出诊断信息到控制台
  window.addEventListener('pagehide', function(event) {
    if (event.persisted) {
      console.log('Page successfully put into bfcache');
    } else {
      console.warn('Page will not be put into bfcache. Possible reasons:');
      if (diagnostic.hasUnloadListener) {
        console.warn('- Page has unload event listener');
      }
      if (diagnostic.hasBeforeUnloadListener) {
        console.warn('- Page has beforeunload event listener');
      }
      console.warn('- Server might be sending Cache-Control: no-store header (common with GitHub Pages)');
    }
  });
})();