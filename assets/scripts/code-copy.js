document.addEventListener('DOMContentLoaded', function() {
  // 为所有代码块添加复制按钮
  const codeBlocks = document.querySelectorAll('pre.highlight');
  
  codeBlocks.forEach(function(codeBlock) {
    // 创建工具栏
    const toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';
    
    // 创建复制按钮
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.textContent = '点击复制';
    button.title = '我去，点一下就能复制！';
    
    // 添加工具栏到代码块
    codeBlock.insertBefore(toolbar, codeBlock.firstChild);
    
    // 添加按钮到工具栏
    toolbar.appendChild(button);
    
    // 添加点击事件
    button.addEventListener('click', function() {
      // 获取代码内容（排除按钮本身）
      let codeElement = codeBlock.querySelector('code');
      if (!codeElement) {
        codeElement = codeBlock.firstChild;
      }
      
      const text = codeElement.textContent || codeElement.innerText;
      
      // 复制到剪贴板
      navigator.clipboard.writeText(text).then(function() {
        // 复制成功反馈
        const originalText = button.textContent;
        button.textContent = '已复制！';
        
        // 几秒后恢复原文本
        setTimeout(function() {
          button.textContent = originalText;
        }, 2000);
      }).catch(function(err) {
        console.error('复制失败！: ', err);
      });
    });
  });
});