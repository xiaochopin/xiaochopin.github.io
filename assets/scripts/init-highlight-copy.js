// highlight.js 初始化后再初始化 code-copy
hljs.initHighlightingOnLoad();
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    initCodeCopy();
  }, 0);
});