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
  var PHRASES = ['Agent 产品设计', 'LLM 评测与可观测性', 'RAG 与检索', '金融 × AI 交叉背景'];

  if (typedEl) {
    if (prefersReduced) {
      typedEl.textContent = PHRASES[0];
    } else {
      var phraseIndex = 0;
      var charIndex = 0;
      var deleting = false;
      (function tick() {
        var word = PHRASES[phraseIndex];
        charIndex += deleting ? -1 : 1;
        typedEl.textContent = word.slice(0, charIndex);
        var delay = deleting ? 45 : 95;
        if (!deleting && charIndex === word.length) {
          delay = 2000;
          deleting = true;
        } else if (deleting && charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % PHRASES.length;
          delay = 350;
        }
        window.setTimeout(tick, delay);
      })();
    }
  }

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
