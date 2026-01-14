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
      let finished = false;
      const finish = function() {
        if (finished) return;
        finished = true;
        content.style.height = 'auto';
        animating.delete(details);
      };
      requestAnimationFrame(function() {
        content.style.height = content.scrollHeight + 'px';
        content.style.opacity = '1';
      });
      const onEndOpen = function handler(e) {
        if (e.propertyName !== 'height') return;
        content.removeEventListener('transitionend', handler);
        finish();
      };
      content.addEventListener('transitionend', onEndOpen);
      setTimeout(finish, 500);
    } else {
      content.style.height = content.scrollHeight + 'px';
      let finished = false;
      const finish = function() {
        if (finished) return;
        finished = true;
        details.removeAttribute('open');
        content.style.opacity = '';
        animating.delete(details);
      };
      requestAnimationFrame(function() {
        content.style.height = '0px';
        content.style.opacity = '0';
      });
      const onEndClose = function handler(e) {
        if (e.propertyName !== 'height') return;
        content.removeEventListener('transitionend', handler);
        finish();
      };
      content.addEventListener('transitionend', onEndClose);
      setTimeout(finish, 500);
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