// 代码复制功能脚本

function initCodeCopy() {
  // 获取所有代码块
  const codeBlocks = document.querySelectorAll('pre.highlight > code');
  
  // 为每个代码块添加复制按钮
  codeBlocks.forEach(codeBlock => {
    // 检查是否已经添加了复制按钮
    if (codeBlock.parentElement.querySelector('.code-toolbar')) {
      return;
    }
    
    // 创建工具栏容器
    const toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';
    
    // 创建复制按钮
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.textContent = 'Copy';
    copyButton.title = 'Click to copy';
    
    // 添加复制功能
    copyButton.addEventListener('click', function() {
      const code = codeBlock.textContent;
      navigator.clipboard.writeText(code).then(() => {
        // 复制成功
        copyButton.textContent = 'Copied!';
        copyButton.style.backgroundColor = '#4CAF50'; // 更改背景色为绿色
        
        // 3秒后恢复原始状态
        setTimeout(() => {
          copyButton.textContent = 'Copy';
          copyButton.style.backgroundColor = ''; // 恢复原始背景色
        }, 3000);
      }).catch(err => {
        console.error('Failed to copy code: ', err);
      });
    });
    
    // 将按钮添加到工具栏
    toolbar.appendChild(copyButton);
    
    // 将工具栏插入到代码块前面
    codeBlock.parentElement.insertBefore(toolbar, codeBlock);
  });
}

// 使用 requestIdleCallback 初始化代码复制功能
if ('requestIdleCallback' in window) {
  requestIdleCallback(initCodeCopy, { timeout: 3000 });
} else {
  // 降级方案
  setTimeout(initCodeCopy, 100);
}

// 导出函数以便其他脚本可以调用
window.initCodeCopy = initCodeCopy;