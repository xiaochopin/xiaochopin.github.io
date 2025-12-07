// 响应式图片优化脚本
// 自动为图片添加srcset和sizes属性，实现自适应图片加载

function optimizeImages() {
  // 查找所有文章内容中的图片
  const images = document.querySelectorAll('.article-main img, .page img');
  
  images.forEach(img => {
    // 跳过已经有srcset的图片
    if (img.hasAttribute('srcset')) {
      return;
    }
    
    // 获取原始图片链接
    const originalSrc = img.src || img.dataset.src;
    
    // 如果没有原始图片链接，跳过
    if (!originalSrc) {
      return;
    }
    
    // 检查是否是外部图片链接
    if (originalSrc.startsWith('http')) {
      // 为外部图片生成响应式属性
      generateResponsiveAttributes(img, originalSrc);
    }
  });
}

function generateResponsiveAttributes(img, src) {
  // 简单的响应式图片策略
  // 生成不同的尺寸版本（假设服务端支持缩放）
  
  // 移除可能存在的尺寸参数
  let baseUrl = src.split('?')[0];
  
  // 如果图片URL包含常见的图片服务参数，尝试生成不同尺寸
  if (baseUrl.includes('picgo.net') || baseUrl.includes('imgur.com') || baseUrl.includes('cloudinary')) {
    // 为这些服务生成响应式图片集合
    const widths = [320, 480, 768, 1024, 1280, 1920];
    const srcset = widths.map(width => `${generateImageUrl(baseUrl, width)} ${width}w`).join(', ');
    
    img.setAttribute('srcset', srcset);
    
    // 设置sizes属性
    img.setAttribute('sizes', '(max-width: 320px) 320px, (max-width: 480px) 480px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, (max-width: 1280px) 1280px, 1920px');
  } else {
    // 对于其他图片，至少添加基本的响应式特性
    img.setAttribute('loading', 'lazy');
  }
}

function generateImageUrl(baseUrl, width) {
  // 根据不同图片服务生成对应尺寸URL
  
  if (baseUrl.includes('picgo.net')) {
    // PicGo 图床支持尺寸调整
    return `${baseUrl}?x-oss-process=style/w_${width}`;
  } else if (baseUrl.includes('cloudinary')) {
    // Cloudinary 支持尺寸调整
    const urlParts = baseUrl.split('/upload/');
    if (urlParts.length === 2) {
      return `${urlParts[0]}/upload/w_${width}/${urlParts[1]}`;
    }
  }
  
  // 默认情况下返回原图链接
  return baseUrl;
}

// 页面加载完成后执行
if ('requestIdleCallback' in window) {
  requestIdleCallback(optimizeImages, { timeout: 3000 });
} else {
  setTimeout(optimizeImages, 100);
}

// 在页面从bfcache恢复时重新执行
window.addEventListener('pageshow', function(event) {
  if (event.persisted) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(optimizeImages, { timeout: 3000 });
    } else {
      setTimeout(optimizeImages, 100);
    }
  }
});