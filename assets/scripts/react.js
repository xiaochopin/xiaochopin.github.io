

  const { createElement: e, useState, useEffect, useRef } = React;

  // 滚动位置记忆
  const SCROLL_STORAGE_KEY = 'scrollPositions';
  const MAX_SCROLL_ENTRIES = 50;

  const getScrollPositions = () => {
    try {
      const data = sessionStorage.getItem(SCROLL_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  };

  const saveScrollPositions = (positions) => {
    try {
      const keys = Object.keys(positions);
      if (keys.length > MAX_SCROLL_ENTRIES) {
        keys.slice(0, keys.length - MAX_SCROLL_ENTRIES).forEach(key => delete positions[key]);
      }
      sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(positions));
    } catch (e) {}
  };

  const saveScrollPosition = (pageKey) => {
    const key = pageKey || (location.pathname + location.search);
    const positions = getScrollPositions();
    positions[key] = { x: window.scrollX, y: window.scrollY, timestamp: Date.now() };
    saveScrollPositions(positions);
  };

  const restoreScrollPosition = (pageKey) => {
    const key = pageKey || (location.pathname + location.search);
    const positions = getScrollPositions();
    const saved = positions[key];
    if (saved && typeof saved.y === 'number') {
      window.scrollTo({ left: saved.x || 0, top: saved.y, behavior: 'smooth' });
    }
  };

  const executeScripts = (container) => {
    container.querySelectorAll('script').forEach(old => {
      if (old.type === 'module') {
        // ES Module 需要用 Blob URL 重新执行
        const blob = new Blob([old.textContent], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        import(url).finally(() => URL.revokeObjectURL(url));
      } else {
        const script = document.createElement('script');
        Array.from(old.attributes).forEach(attr => script.setAttribute(attr.name, attr.value));
        script.textContent = old.textContent;
        old.replaceWith(script);
      }
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

  const normalizePath = (p) => p.replace(/\/$/, '') || '/';

  function App() {
    const [content, setContent] = useState(document.getElementById('react-app').innerHTML);
    const [loading, setLoading] = useState(false);
    const [instantLoading, setInstantLoading] = useState(false);
    const navId = useRef(0);

    const navigate = async (url, isPop = false) => {
      const curId = ++navId.current;
      const target = new URL(url, location.origin);
      const current = new URL(location.href);
      const isSamePath = normalizePath(target.pathname) === normalizePath(current.pathname);
      const isSameQuery = target.search === current.search;
      const isSame = isSamePath && isSameQuery;

      // 仅哈希变化：直接滚动，不做加载与淡入淡出
      if (isSame && target.hash !== current.hash) {
        scrollToHash(target.hash);
        history.pushState({}, '', url);
        return;
      }

      // 只在正常跳转时保存当前页面的滚动位置（回退/前进不保存，避免覆盖）
      if (!isPop) {
        const currentPageKey = current.pathname + current.search;
        saveScrollPosition(currentPageKey);
      }

      if (isSame && !isPop) {
        scrollToHash(target.hash);
        history.pushState({}, '', url);
        return;
      }

      setInstantLoading(isPop);
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
          executeScripts(container);
          hljs.initHighlighting.called = false; hljs.initHighlighting();
          initCodeCopy();
          shuffleThings();
          if (isPop) {
            // 回退/前进：滚动恢复完成或超时后解除loading
            const positions = getScrollPositions();
            const saved = positions[location.pathname + location.search];
            const maxWait = 800; // ms
            let finished = false;
            const finish = () => {
              if (finished) return;
              finished = true;
              if (curId === navId.current) setLoading(false);
            };

            if (saved && typeof saved.y === 'number') {
              window.scrollTo({ left: saved.x || 0, top: saved.y, behavior: 'smooth' });
              const checkScroll = () => {
                if (finished) return;
                if (Math.abs(window.scrollY - saved.y) < 10) finish();
                else requestAnimationFrame(checkScroll);
              };
              requestAnimationFrame(checkScroll);
            }

            setTimeout(finish, maxWait);
          } else {
            scrollToHash(hash);
          }
        }, 50);
      } catch (err) {
        if (curId === navId.current && !isPop) location.href = url;
      } finally {
        // 只有非回退时在finally取消loading，回退时等滚动完成
        if (curId === navId.current && !isPop) setLoading(false);
        if (curId === navId.current && isPop) setInstantLoading(false);
      }
    };

    useEffect(() => {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      
      // 首次渲染后执行页面内脚本（因为 React 接管后 DOM 被重建）
      const container = document.getElementById('react-app');
      if (container) {
        shuffleThings();
        executeScripts(container);
        hljs.initHighlighting.called = false; hljs.initHighlighting();
        initCodeCopy();
      }
      
      const handleClick = (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || href.startsWith('mailto:') || link.target === '_blank') return;

        // 处理外链：放行
        const targetUrl = new URL(href, location.href);
        if (targetUrl.origin !== location.origin) return;

        // 同页锚点（含纯哈希）：平滑滚动，不触发加载
        if (targetUrl.hash && normalizePath(targetUrl.pathname) === normalizePath(location.pathname)) {
          e.preventDefault();
          scrollToHash(targetUrl.hash);
          history.pushState({}, '', targetUrl.href);
          return;
        }

        // 站内普通链接，走 SPA 导航
        e.preventDefault();
        navigate(targetUrl.href);
      };

      // 滚动时保存位置（防抖）
      let scrollTimeout;
      const handleScroll = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => saveScrollPosition(), 150);
      };

      const handlePop = () => navigate(location.href, true);
      document.addEventListener('click', handleClick);
      window.addEventListener('popstate', handlePop);
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('beforeunload', () => saveScrollPosition());
      return () => {
        document.removeEventListener('click', handleClick);
        window.removeEventListener('popstate', handlePop);
        window.removeEventListener('scroll', handleScroll);
      };
    }, []);

    return e('div', { className: `page-transition ${loading ? 'loading' : ''} ${instantLoading ? 'instant-loading' : ''}`, dangerouslySetInnerHTML: { __html: content } });
  }

  ReactDOM.createRoot(document.getElementById('react-app')).render(e(App));
