(function() {
  const animating = new WeakSet();

  function toggle(details) {
    const content = details.querySelector('.details-content');
    if (!content) return;
    const isOpen = details.hasAttribute('open');

    if (animating.has(details)) return;
    animating.add(details);

    if (!isOpen) {
      details.setAttribute('open', '');
      content.style.height = '0px';
      requestAnimationFrame(function() {
        content.style.height = content.scrollHeight + 'px';
        content.style.opacity = '1';
      });
      content.addEventListener('transitionend', function handler(e) {
        if (e.propertyName !== 'height') return;
        content.removeEventListener('transitionend', handler);
        content.style.height = 'auto';
        animating.delete(details);
      });
    } else {
      content.style.height = content.scrollHeight + 'px';
      requestAnimationFrame(function() {
        content.style.height = '0px';
        content.style.opacity = '0';
      });
      content.addEventListener('transitionend', function handler(e) {
        if (e.propertyName !== 'height') return;
        content.removeEventListener('transitionend', handler);
        details.removeAttribute('open');
        content.style.opacity = '';
        animating.delete(details);
      });
    }
  }

  function delegate(e) {
    const summary = e.target.closest('summary');
    if (!summary) return;
    const details = summary.closest('.post-details');
    if (!details) return;
    e.preventDefault();
    toggle(details);
  }

  document.addEventListener('click', delegate);
})();