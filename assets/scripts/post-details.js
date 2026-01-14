(function() {
  function setupDetailsAnimation(root) {
    const details = root.querySelector('.post-details');
    if (!details) return;
    const summary = details.querySelector('summary');
    const content = details.querySelector('.details-content');
    if (!summary || !content) return;

    let animating = false;

    function openDetails() {
      if (animating) return;
      animating = true;
      details.setAttribute('open', '');
      content.style.height = '0px';
      requestAnimationFrame(function() {
        content.style.height = content.scrollHeight + 'px';
        content.style.opacity = '1';
      });
      function onEnd(e) {
        if (e.propertyName !== 'height') return;
        content.removeEventListener('transitionend', onEnd);
        content.style.height = 'auto';
        animating = false;
      }
      content.addEventListener('transitionend', onEnd);
    }

    function closeDetails() {
      if (animating) return;
      animating = true;
      content.style.height = content.scrollHeight + 'px';
      requestAnimationFrame(function() {
        content.style.height = '0px';
        content.style.opacity = '0';
      });
      function onEnd(e) {
        if (e.propertyName !== 'height') return;
        content.removeEventListener('transitionend', onEnd);
        details.removeAttribute('open');
        content.style.opacity = '';
        animating = false;
      }
      content.addEventListener('transitionend', onEnd);
    }

    summary.addEventListener('click', function(e) {
      e.preventDefault();
      if (details.hasAttribute('open')) {
        closeDetails();
      } else {
        openDetails();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setupDetailsAnimation(document);
    });
  } else {
    setupDetailsAnimation(document);
  }
})();