

  const { createElement: e, useState, useEffect, useRef } = React;

  // 滚动位置记忆
  const SCROLL_STORAGE_KEY = 'scrollPositions';
  const MAX_SCROLL_ENTRIES = 50;
  const MIN_LOADING_DURATION = 200; // 缩短加载动画停留时间
  const FADE_OUT_DURATION = 200; // 与 CSS 过渡时间保持一致

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
    if (!container) return;
    container.querySelectorAll('script').forEach(old => {
      const isModule = old.type === 'module';
      const src = old.getAttribute('src');
      if (isModule) {
        if (src) {
          // 直接动态导入外部模块脚本
          import(src).catch(() => {});
        } else {
          // ES Module 内联脚本使用 Blob 重新执行
          const code = old.textContent || '';
          const blob = new Blob([code], { type: 'text/javascript' });
          const url = URL.createObjectURL(blob);
          import(url).finally(() => URL.revokeObjectURL(url)).catch(() => {});
        }
      } else {
        // 普通脚本：重新创建以触发浏览器执行（含 src）
        const script = document.createElement('script');
        Array.from(old.attributes).forEach(attr => script.setAttribute(attr.name, attr.value));
        script.textContent = old.textContent || '';
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

  const waitForFadeOut = () => new Promise(resolve => {
    requestAnimationFrame(() => setTimeout(resolve, FADE_OUT_DURATION));
  });

  function App() {
    const initialContainer = document.getElementById('react-app');
    const [content, setContent] = useState(initialContainer ? initialContainer.innerHTML : '');
    const [loading, setLoading] = useState(false);
    const [instantLoading, setInstantLoading] = useState(false);
    const navId = useRef(0);
    const loadingStartRef = useRef(0);
    const lastHrefRef = useRef(location.href);

    const navigate = async (url, isPop = false, fromUrl) => {
      const curId = ++navId.current;
      const target = new URL(url, location.origin);
      const current = new URL(fromUrl || location.href);
      const isSamePath = normalizePath(target.pathname) === normalizePath(current.pathname);
      const isSameQuery = target.search === current.search;
      const isSame = isSamePath && isSameQuery;

      const ensureMinLoading = (done) => {
        const elapsed = performance.now() - loadingStartRef.current;
        const delay = Math.max(MIN_LOADING_DURATION - elapsed, 0);
        setTimeout(() => {
          if (curId === navId.current) done();
        }, delay);
      };

      // 回退/前进到同页锚点：只滚动，不触发加载
      if (isPop && isSame) {
        scrollToHash(target.hash);
        lastHrefRef.current = target.href;
        return;
      }

      // 仅哈希变化：直接滚动，不做加载与淡入淡出
      if (isSame && target.hash !== current.hash) {
        scrollToHash(target.hash);
        history.pushState({}, '', url);
        lastHrefRef.current = target.href;
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
        lastHrefRef.current = target.href;
        return;
      }

      setInstantLoading(isPop);
      loadingStartRef.current = performance.now();
      setLoading(true);
      await waitForFadeOut();
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
        lastHrefRef.current = target.href;

        setTimeout(() => {
          if (curId !== navId.current) return;
          const container = document.getElementById('react-app');
          executeScripts(container);
          if (window.hljs && typeof hljs.initHighlighting === 'function') {
            try { hljs.initHighlighting.called = false; } catch (e) {}
            try { hljs.initHighlighting(); } catch (e) {}
          }
          if (typeof initCodeCopy === 'function') {
            try { initCodeCopy(); } catch (e) {}
          }
          if (typeof shuffleThings === 'function') {
            try { shuffleThings(); } catch (e) {}
          }
          if (isPop) {
            // 回退/前进：滚动恢复完成或超时后解除loading
            const positions = getScrollPositions();
            const saved = positions[location.pathname + location.search];
            const maxWait = 800; // ms
            let finished = false;
            const finish = () => {
              if (finished) return;
              finished = true;
              ensureMinLoading(() => {
                setLoading(false);
                setInstantLoading(false);
              });
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
        if (isPop) {
          ensureMinLoading(() => {
            setLoading(false);
            setInstantLoading(false);
          });
        } else if (curId === navId.current) {
          location.href = url;
        }
      } finally {
        // 只有非回退时在finally取消loading，回退时等滚动完成
        if (!isPop) ensureMinLoading(() => setLoading(false));
        if (curId === navId.current && (isPop || !loading)) {
          // record current URL as the latest known location after navigation attempt
          lastHrefRef.current = target.href;
        }
      }
    };

    useEffect(() => {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      
      // 首次渲染后执行页面内脚本（因为 React 接管后 DOM 被重建）
      const container = document.getElementById('react-app');
      if (container) {
        executeScripts(container);
        if (typeof shuffleThings === 'function') {
          try { shuffleThings(); } catch (e) {}
        }
        if (window.hljs && typeof hljs.initHighlighting === 'function') {
          try { hljs.initHighlighting.called = false; } catch (e) {}
          try { hljs.initHighlighting(); } catch (e) {}
        }
        if (typeof initCodeCopy === 'function') {
          try { initCodeCopy(); } catch (e) {}
        }
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
        navigate(targetUrl.href, false, lastHrefRef.current);
      };

      // 滚动时保存位置（防抖）
      let scrollTimeout;
      const handleScroll = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => saveScrollPosition(), 150);
      };

      const handlePop = () => navigate(location.href, true, lastHrefRef.current);
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
