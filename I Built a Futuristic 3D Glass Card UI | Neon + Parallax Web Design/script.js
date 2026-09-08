
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initReveal() {
    var blocks = [].slice.call(document.querySelectorAll('.section--reveal'));
    if (!blocks.length) return;
    if (reduced) {
      blocks.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        });
      },
      { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    blocks.forEach(function (el) {
      io.observe(el);
    });
  }

  function initHeroMotion() {
    var shell = document.querySelector('[data-hero-motion]');
    if (!shell || reduced) return;
    shell.addEventListener('mousemove', function (e) {
      var r = shell.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      shell.style.setProperty('--hx', (x * 28).toFixed(1) + 'px');
      shell.style.setProperty('--hy', (y * 22).toFixed(1) + 'px');
    });
    shell.addEventListener('mouseleave', function () {
      shell.style.setProperty('--hx', '0px');
      shell.style.setProperty('--hy', '0px');
    });
  }

  /* ——— Spotlight stage carousel (2D translate) ——— */
  function initCarousel() {
    var root = document.querySelector('[data-carousel]');
    if (!root) return;
    var viewport = root.querySelector('[data-carousel-viewport]');
    var track = root.querySelector('[data-carousel-track]');
    var panels = [].slice.call(root.querySelectorAll('[data-carousel-panel]'));
    var prev = root.querySelector('[data-carousel-prev]');
    var next = root.querySelector('[data-carousel-next]');
    var dots = [].slice.call(root.querySelectorAll('[data-carousel-dots] button'));
    var live = root.querySelector('[data-carousel-live]');
    var n = panels.length;
    if (n < 1 || !track || !viewport) return;

    var idx = 0;
    var w = 0;
    var swipe = { active: false, startX: 0, pid: null };

    function measure() {
      w = viewport.clientWidth || 0;
      if (w < 1) return;
      panels.forEach(function (p) {
        p.style.flex = '0 0 ' + w + 'px';
        p.style.width = w + 'px';
        p.style.maxWidth = w + 'px';
      });
    }

    function announce() {
      if (!live) return;
      live.textContent = 'Slide ' + (idx + 1) + ' of ' + n;
    }

    function render() {
      if (w < 1) measure();
      var offset = -idx * w;
      if (!reduced) {
        track.style.transition = 'transform 0.55s cubic-bezier(0.2, 0.85, 0.25, 1)';
      } else {
        track.style.transition = 'none';
      }
      track.style.transform = 'translate3d(' + offset + 'px,0,0)';
      dots.forEach(function (d, j) {
        var on = j === idx;
        d.classList.toggle('is-active', on);
        d.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      announce();
    }

    function go(delta) {
      idx = (idx + delta + n * 100) % n;
      render();
    }

    measure();
    if (w < 1) {
      requestAnimationFrame(function () {
        measure();
        render();
      });
    } else {
      render();
    }

    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(function () {
        measure();
        render();
      });
      ro.observe(viewport);
    } else {
      window.addEventListener('resize', function () {
        measure();
        render();
      });
    }

    if (prev)
      prev.addEventListener('click', function (e) {
        e.stopPropagation();
        go(-1);
      });
    if (next)
      next.addEventListener('click', function (e) {
        e.stopPropagation();
        go(1);
      });

    dots.forEach(function (d, j) {
      d.addEventListener('click', function () {
        idx = j;
        render();
      });
    });

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        idx = 0;
        render();
      } else if (e.key === 'End') {
        e.preventDefault();
        idx = n - 1;
        render();
      }
    });

    viewport.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      swipe.active = true;
      swipe.startX = e.clientX;
      swipe.pid = e.pointerId;
      try {
        viewport.setPointerCapture(e.pointerId);
      } catch (err) {}
    });

    viewport.addEventListener('pointerup', function (e) {
      if (!swipe.active || e.pointerId !== swipe.pid) return;
      swipe.active = false;
      swipe.pid = null;
      var dx = e.clientX - swipe.startX;
      if (Math.abs(dx) < 40) return;
      if (dx < 0) go(1);
      else go(-1);
    });

    viewport.addEventListener('pointercancel', function () {
      swipe.active = false;
      swipe.pid = null;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initReveal();
      initHeroMotion();
      initCarousel();
    });
  } else {
    initReveal();
    initHeroMotion();
    initCarousel();
  }
})();
