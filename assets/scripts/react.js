document.addEventListener('DOMContentLoaded', () => {
  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') return console.error('React/ReactDOM missing');

  const { createElement: e, useState, useEffect, useRef } = React;

  const executeScripts = (container) => {
    container.querySelectorAll('script').forEach(old => {
      const script = document.createElement('script');
      Array.from(old.attributes).forEach(attr => script.setAttribute(attr.name, attr.value));
      script.textContent = old.textContent;
      old.replaceWith(script);
    });
  };

  const scrollToHash = (hash) => {
    if (!hash) return window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const id = decodeURIComponent(hash.slice(1));
      const el = document.getElementById(id) || document.getElementById(hash.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {}
  };

  function App() {
    const [content, setContent] = useState(document.getElementById('react-app').innerHTML);
    const [loading, setLoading] = useState(false);
    const navId = useRef(0);

    const navigate = async (url, isPop = false) => {
      const curId = ++navId.current;
      const target = new URL(url, location.origin);
      const current = new URL(location.href);
      const isSame = target.pathname === current.pathname && target.search === current.search;

      if (isSame && !isPop) {
        scrollToHash(target.hash);
        history.pushState({}, '', url);
        return;
      }

      setLoading(true);
      const hash = target.hash;
      const fetchUrl = url.split('#')[0];

      const waitScroll = new Promise(resolve => {
        if (isPop || window.scrollY < 50) return resolve();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        let last = window.scrollY, stuck = 0, done = false;
        const finish = () => { if (!done) { done = true; resolve(); } };
        setTimeout(finish, 1000);
        
        const check = () => {
          if (done) return;
          const now = window.scrollY;
          if (now < 50 || (Math.abs(now - last) <= 1 && ++stuck > 3)) finish();
          else { stuck = 0; last = now; requestAnimationFrame(check); }
        };
        requestAnimationFrame(check);
      });

      try {
        const [res] = await Promise.all([fetch(fetchUrl), waitScroll]);
        if (curId !== navId.current) return;

        const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
        document.title = doc.title;
        setContent(doc.getElementById('react-app').innerHTML);
        if (!isPop) history.pushState({}, '', url);

        setTimeout(() => {
          if (curId !== navId.current) return;
          const container = document.getElementById('react-app');
          if (container) executeScripts(container);
          if (window.hljs) { window.hljs.initHighlighting.called = false; window.hljs.initHighlighting(); }
          if (!isPop) scrollToHash(hash);
        }, 50);
      } catch (err) {
        if (curId === navId.current && !isPop) location.href = url;
      } finally {
        if (curId === navId.current) setLoading(false);
      }
    };

    useEffect(() => {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      
      const handleClick = (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href || (href.startsWith('http') && !href.startsWith(location.origin)) || 
            href.startsWith('#') || href.startsWith('mailto:') || link.target === '_blank') return;
        e.preventDefault();
        navigate(href);
      };

      const handlePop = () => navigate(location.href, true);
      document.addEventListener('click', handleClick);
      window.addEventListener('popstate', handlePop);
      return () => {
        document.removeEventListener('click', handleClick);
        window.removeEventListener('popstate', handlePop);
      };
    }, []);

    return e('div', { className: `page-transition ${loading ? 'loading' : ''}`, dangerouslySetInnerHTML: { __html: content } });
  }

  ReactDOM.createRoot(document.getElementById('react-app')).render(e(App));
});
