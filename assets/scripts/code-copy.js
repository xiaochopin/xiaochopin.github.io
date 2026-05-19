// 代码复制功能脚本 - 使用事件委托方式

function initCodeCopy() {
  // 获取所有代码块
  const codeBlocks = document.querySelectorAll('pre.highlight > code');
  console.log('[CodeCopy] Found code blocks:', codeBlocks.length);
  
  // 为每个代码块添加复制按钮
  codeBlocks.forEach((codeBlock, index) => {
    // 检查是否已经添加了复制按钮
    if (codeBlock.parentElement.querySelector('.code-toolbar')) {
      console.log('[CodeCopy] Button already exists for block', index);
      return;
    }
    
    // 创建工具栏容器
    const toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';
    
    // 创建复制按钮
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.textContent = 'Copy';
    copyButton.title = '我去，点一下就能复制！';
    copyButton.type = 'button';
    
    // 将按钮添加到工具栏
    toolbar.appendChild(copyButton);
    
    // 将工具栏插入到代码块前面
    codeBlock.parentElement.insertBefore(toolbar, codeBlock);
    console.log('[CodeCopy] Button added for block', index);
  });
}

// 使用全局事件委托处理复制按钮点击
document.addEventListener('click', function(e) {
  const copyButton = e.target.closest('.copy-button');
  if (!copyButton) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  console.log('[CodeCopy] Copy button clicked');
  
  // 找到关联的代码块
  const toolbar = copyButton.closest('.code-toolbar');
  if (!toolbar) return;
  
  const codeBlock = toolbar.nextElementSibling;
  if (!codeBlock || !codeBlock.matches('code')) return;
  
  const code = codeBlock.textContent;
  navigator.clipboard.writeText(code).then(() => {
    // 复制成功
    copyButton.textContent = '已复制';
    copyButton.style.backgroundColor = '#4CAF50';
    
    // 3秒后恢复原始状态
    setTimeout(() => {
      copyButton.textContent = 'Copy';
      copyButton.style.backgroundColor = '';
    }, 3000);
  }).catch(err => {
    console.error('Failed to copy code: ', err);
  });
});

// 立即执行初始化（确保不错过）
console.log('[CodeCopy] Script loaded, readyState:', document.readyState);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('[CodeCopy] DOMContentLoaded fired');
    setTimeout(initCodeCopy, 200);
  });
} else {
  console.log('[CodeCopy] Document already ready, initializing now');
  setTimeout(initCodeCopy, 200);
}

// 额外保险：100ms 后再调用一次
setTimeout(function() {
  console.log('[CodeCopy] Running backup initialization');
  initCodeCopy();
}, 300);