/* ==========================================================================
   丁博文 · 个人网站 交互脚本
   原生 JS，零依赖：主题切换 / 吸顶导航 / scrollspy / 滚动渐显 /
   打字机 / 移动端抽屉 / 返回顶部 / 邮箱复制
   尊重 prefers-reduced-motion
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var prefersReduced = motionQuery.matches;
  var THEME_KEY = 'ding-theme';

  /* ---------- 1. 深浅色主题切换（localStorage 记忆；初始值由 head 内联脚本决定） ---------- */
  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  doc.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        /* 隐私模式等场景下静默失败 */
      }
    });
  });

  /* 首次访问（尚未存储偏好）时，跟随系统深浅色变化 */
  function followSystem() {
    var stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch (e) { /* ignore */ }
    if (!stored) {
      root.setAttribute('data-theme',
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
  }
  var scheme = window.matchMedia('(prefers-color-scheme: dark)');
  if (scheme.addEventListener) {
    scheme.addEventListener('change', followSystem);
  } else if (scheme.addListener) {
    scheme.addListener(followSystem); /* 旧版 Safari */
  }

  /* ---------- 2. 吸顶导航状态 + 返回顶部按钮显隐 ---------- */
  var nav = doc.querySelector('.nav');
  var backTop = doc.querySelector('.back-top');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset || 0;
    if (nav) nav.classList.toggle('is-scrolled', y > 24);
    if (backTop) backTop.classList.toggle('is-show', y > window.innerHeight);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 3. 返回顶部（含页脚按钮） ---------- */
  doc.querySelectorAll('[data-back-top]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------- 4. 移动端抽屉菜单 ---------- */
  var drawer = doc.getElementById('nav-drawer');
  var overlay = doc.getElementById('nav-overlay');
  var navToggle = doc.querySelector('.nav-toggle');

  function setDrawer(open, focusBack) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    if (overlay) overlay.classList.toggle('is-show', open);
    doc.body.classList.toggle('has-drawer', open);
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    }
    if (open) {
      var first = drawer.querySelector('a');
      if (first) first.focus();
    } else if (focusBack !== false && navToggle) {
      navToggle.focus();
    }
  }

  if (drawer && navToggle) {
    navToggle.addEventListener('click', function () {
      setDrawer(!drawer.classList.contains('is-open'));
    });
    if (overlay) overlay.addEventListener('click', function () { setDrawer(false); });
    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setDrawer(false, false); });
    });
    doc.addEventListener('keydown', function (e) {
      if (!drawer.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        setDrawer(false);
      } else if (e.key === 'Tab') {
        /* 焦点圈定：抽屉打开时 Tab 不逃逸到背景内容 */
        var focusables = drawer.querySelectorAll('a, button');
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && doc.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && doc.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 861) setDrawer(false, false);
    });
  }

  /* ---------- 5. Scrollspy：高亮当前阅读板块 ---------- */
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll('.nav-link'));
  var navIds = {};
  navLinks.forEach(function (a) {
    var href = a.getAttribute('href') || '';
    if (href.charAt(0) === '#') navIds[href.slice(1)] = true;
  });
  /* data-sec 链接的目标随当前板块变化：把三个板块的目标 id 都纳入观察 */
  ['pm', 'fintech', 'eval'].forEach(function (b) {
    navLinks.forEach(function (a) {
      var sec = a.getAttribute('data-sec');
      if (sec) navIds[b + '-' + sec] = true;
    });
  });
  var spySections = Array.prototype.slice.call(doc.querySelectorAll('section[id]'))
    .filter(function (s) { return navIds[s.id]; });

  function setActive(id) {
    navLinks.forEach(function (a) {
      var isActive = (a.getAttribute('href') === '#' + id);
      a.classList.toggle('is-active', isActive);
      if (isActive) {
        a.setAttribute('aria-current', 'true');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  if ('IntersectionObserver' in window && spySections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    spySections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 6. 滚动渐显（IntersectionObserver，一次性触发） ---------- */
  var revealEls = Array.prototype.slice.call(doc.querySelectorAll('.reveal'));
  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- 7. Hero 打字机（reduce 动效时静态展示第一个定位词） ---------- */
  var typedEl = doc.getElementById('typed');
  var typedState = {
    phrases: ['Agent 产品设计', 'LLM 评测与可观测性', 'RAG 与检索', '金融 × AI 交叉背景']
  };

  if (typedEl) {
    if (prefersReduced) {
      typedEl.textContent = typedState.phrases[0];
    } else {
      var phraseIndex = 0;
      var charIndex = 0;
      var deleting = false;
      (function tick() {
        var word = typedState.phrases[phraseIndex % typedState.phrases.length];
        charIndex += deleting ? -1 : 1;
        typedEl.textContent = word.slice(0, charIndex);
        var delay = deleting ? 45 : 95;
        if (!deleting && charIndex === word.length) {
          delay = 2000;
          deleting = true;
        } else if (deleting && charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % typedState.phrases.length;
          delay = 350;
        }
        window.setTimeout(tick, delay);
      })();
    }
  }

  /* ---------- 9. 方向板块切换（AI 产品经理 / 金融科技 / 大模型评测） ---------- */
  var BOARD_KEYS = ['pm', 'fintech', 'eval'];
  var BOARD_CONF = {
    pm: {
      title: 'AI 产品经理',
      phrases: ['Agent 产品设计', 'LLM 评测与可观测性', 'RAG 与检索', '金融 × AI 交叉背景'],
      sr: '专注方向：Agent 产品设计、LLM 评测与可观测性、RAG 与检索、金融 × AI 交叉背景',
      quick: '期望 base：北京 / 上海&nbsp;&nbsp;·&nbsp;&nbsp;目标岗位：AI 产品经理（大模型应用 / Agent 方向）/ AI 训练师 / AI 行业研究员'
    },
    fintech: {
      title: '金融科技',
      phrases: ['VC / PE 投研', '行业研究与估值', 'AI × 金融', '十余段实习 · 完整项目闭环'],
      sr: '专注方向：VC / PE 投研、行业研究与估值、AI × 金融、十余段实习与完整项目闭环',
      quick: '期望 base：北京 / 上海&nbsp;&nbsp;·&nbsp;&nbsp;目标岗位：VC / PE / 金融科技'
    },
    eval: {
      title: '大模型评测',
      phrases: ['Benchmark 生态', 'LLM-as-a-judge', 'badcase 归因', '评测工具设计'],
      sr: '专注方向：Benchmark 生态、LLM-as-a-judge、badcase 归因、评测工具设计',
      quick: '期望 base：北京 / 上海&nbsp;&nbsp;·&nbsp;&nbsp;目标岗位：大模型评测 / 模型效果评估 / AI 产品评测'
    }
  };
  var boardTabs = Array.prototype.slice.call(doc.querySelectorAll('.board-tab'));
  var heroTitle = doc.getElementById('hero-title');
  var heroSr = doc.getElementById('hero-sr');
  var quickFacts = doc.getElementById('quick-facts');
  var activeBoard = 'pm';

  function setBoard(key, focusTab) {
    if (BOARD_KEYS.indexOf(key) === -1) key = 'pm';
    activeBoard = key;

    boardTabs.forEach(function (tab) {
      var isActive = tab.getAttribute('data-board') === key;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.tabIndex = isActive ? 0 : -1;
    });

    BOARD_KEYS.forEach(function (k) {
      var panel = doc.getElementById('board-' + k);
      if (panel) {
        if (k === key) panel.removeAttribute('hidden');
        else panel.setAttribute('hidden', '');
      }
    });

    var conf = BOARD_CONF[key];
    if (heroTitle && heroTitle.textContent !== conf.title) heroTitle.textContent = conf.title;
    if (heroSr) heroSr.textContent = conf.sr;
    if (quickFacts) quickFacts.innerHTML = conf.quick;
    typedState.phrases = conf.phrases;

    /* data-sec 导航链接指向当前板块内的节 */
    doc.querySelectorAll('a[data-sec]').forEach(function (a) {
      a.setAttribute('href', '#' + key + '-' + a.getAttribute('data-sec'));
    });

    /* 地址栏同步（不触发滚动）：支持 #pm / #fintech / #eval 直达 */
    try { history.replaceState(null, '', '#' + key); } catch (e) { /* ignore */ }

    if (focusTab) {
      var target = doc.querySelector('.board-tab[data-board="' + key + '"]');
      if (target) target.focus();
    }
  }

  boardTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      setBoard(tab.getAttribute('data-board'), false);
    });
  });

  /* 键盘左右切换（WAI-ARIA Tabs 模式） */
  var tabsWrap = doc.querySelector('.board-tabs');
  if (tabsWrap) {
    tabsWrap.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      var idx = BOARD_KEYS.indexOf(activeBoard);
      var next = e.key === 'ArrowRight' ? (idx + 1) % BOARD_KEYS.length
                                        : (idx - 1 + BOARD_KEYS.length) % BOARD_KEYS.length;
      setBoard(BOARD_KEYS[next], true);
    });
  }

  /* 初始：按地址栏 hash 激活对应板块 */
  var initHash = (location.hash || '').replace('#', '').split('/')[0];
  if (BOARD_KEYS.indexOf(initHash) !== -1) setBoard(initHash, false);

  /* 页内其他入口（如方向锚点变化） */
  window.addEventListener('hashchange', function () {
    var h = (location.hash || '').replace('#', '').split('/')[0];
    if (BOARD_KEYS.indexOf(h) !== -1 && h !== activeBoard) setBoard(h, false);
  });

  /* ---------- 8. 邮箱点击复制（带降级与反馈） ---------- */
  doc.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy') || '';
      var tip = btn.querySelector('.copy-tip');

      function fallbackCopy(value) {
        var ta = doc.createElement('textarea');
        ta.value = value;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        doc.body.appendChild(ta);
        ta.select();
        try { doc.execCommand('copy'); } catch (e) { /* ignore */ }
        doc.body.removeChild(ta);
      }

      function feedback() {
        if (!tip) return;
        btn.classList.add('is-copied');
        tip.innerHTML = '<svg class="icon icon-xs" aria-hidden="true"><use href="#i-check"/></svg>已复制';
        window.setTimeout(function () {
          btn.classList.remove('is-copied');
          tip.innerHTML = '<svg class="icon icon-xs" aria-hidden="true"><use href="#i-copy"/></svg>点击复制';
        }, 2000);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(feedback, function () {
          fallbackCopy(text);
          feedback();
        });
      } else {
        fallbackCopy(text);
        feedback();
      }
    });
  });
})();
