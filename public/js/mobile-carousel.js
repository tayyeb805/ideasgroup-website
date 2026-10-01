/**
 * IDEAS Group — Ultra-Smooth Mobile Carousel & Table-Card Switcher Engine
 * Enables native 1-by-1 card carousel with snap physics on mobile (<= 768px)
 * while preserving standard wide grid/flex/spreadsheet layouts on Windows/PC (>= 769px).
 */
(function () {
  'use strict';

  function initCarousels() {
    const isMobile = window.innerWidth <= 768;
    const tracks = document.querySelectorAll('.mobile-carousel, .plan-cards-carousel, .compare-cards-carousel');

    tracks.forEach((track, trackIndex) => {
      // If desktop, remove controls if any exist
      let controls = track.nextElementSibling;
      if (!isMobile) {
        if (controls && controls.classList.contains('mobile-carousel-controls')) {
          controls.style.display = 'none';
        }
        return;
      }

      // In mobile, ensure controls exist
      if (!controls || !controls.classList.contains('mobile-carousel-controls')) {
        controls = document.createElement('div');
        controls.className = 'mobile-carousel-controls';
        track.parentNode.insertBefore(controls, track.nextSibling);
      } else {
        controls.style.display = 'flex';
      }

      const items = Array.from(track.children).filter(el => {
        return !el.classList.contains('mobile-carousel-controls') && el.style.display !== 'none';
      });

      if (items.length <= 1) {
        controls.style.display = 'none';
        return;
      }

      // Build controls UI
      controls.innerHTML = `
        <button type="button" class="carousel-nav-btn prev-btn" aria-label="Previous card">&lsaquo;</button>
        <div class="carousel-dots">
          ${items.map((_, i) => `<span class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}
        </div>
        <button type="button" class="carousel-nav-btn next-btn" aria-label="Next card">&rsaquo;</button>
        <span class="carousel-counter">1 / ${items.length}</span>
      `;

      const prevBtn = controls.querySelector('.prev-btn');
      const nextBtn = controls.querySelector('.next-btn');
      const dots = controls.querySelectorAll('.carousel-dot');
      const counter = controls.querySelector('.carousel-counter');

      function getCurrentIndex() {
        const visibleItems = Array.from(track.children).filter(el => el.style.display !== 'none');
        if (visibleItems.length === 0) return 0;
        
        let closestIndex = 0;
        let minDiff = Infinity;
        
        visibleItems.forEach((item, idx) => {
          const itemCenter = item.offsetLeft + item.offsetWidth / 2 - track.offsetLeft;
          const trackCenter = track.scrollLeft + track.offsetWidth / 2;
          const diff = Math.abs(itemCenter - trackCenter);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = idx;
          }
        });
        return closestIndex;
      }

      function scrollToIndex(idx) {
        const visibleItems = Array.from(track.children).filter(el => el.style.display !== 'none');
        if (idx < 0) idx = 0;
        if (idx >= visibleItems.length) idx = visibleItems.length - 1;
        
        const target = visibleItems[idx];
        if (target) {
          const offset = target.offsetLeft - track.offsetLeft - (track.offsetWidth - target.offsetWidth) / 2;
          track.scrollTo({ left: offset, behavior: 'smooth' });
        }
      }

      function updateActiveDot() {
        const idx = getCurrentIndex();
        const visibleItems = Array.from(track.children).filter(el => el.style.display !== 'none');
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === idx);
        });
        if (counter) {
          counter.textContent = `${idx + 1} / ${visibleItems.length}`;
        }
      }

      prevBtn.onclick = function (e) {
        e.preventDefault();
        const idx = getCurrentIndex();
        scrollToIndex(idx - 1);
      };

      nextBtn.onclick = function (e) {
        e.preventDefault();
        const idx = getCurrentIndex();
        scrollToIndex(idx + 1);
      };

      dots.forEach(dot => {
        dot.onclick = function (e) {
          e.preventDefault();
          const idx = parseInt(dot.getAttribute('data-index'), 10);
          scrollToIndex(idx);
        };
      });

      let scrollTimeout;
      track.onscroll = function () {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateActiveDot, 60);
      };

      track.dataset.carouselInit = 'true';
    });
  }

  // View toggle function for switching between Card Carousel and Full Table on mobile
  window.switchPlanView = function (btn, mode, carouselId, tableContainerId) {
    const parentToggle = btn.closest('.mobile-view-toggle');
    if (parentToggle) {
      parentToggle.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    const carousel = document.getElementById(carouselId);
    const tableCont = document.getElementById(tableContainerId);
    if (!carousel || !tableCont) return;

    const controls = carousel.nextElementSibling;

    if (mode === 'cards') {
      carousel.style.display = '';
      if (controls && controls.classList.contains('mobile-carousel-controls')) {
        controls.style.display = 'flex';
      }
      tableCont.classList.add('mobile-hidden');
      if (window.refreshMobileCarousels) {
        window.refreshMobileCarousels();
      }
    } else {
      carousel.style.display = 'none';
      if (controls && controls.classList.contains('mobile-carousel-controls')) {
        controls.style.display = 'none';
      }
      tableCont.classList.remove('mobile-hidden');
    }
  };

  // Refresh carousels when tab or category filters change
  window.refreshMobileCarousels = function () {
    const tracks = document.querySelectorAll('.mobile-carousel, .plan-cards-carousel, .compare-cards-carousel');
    tracks.forEach(t => {
      t.dataset.carouselInit = '';
      const controls = t.nextElementSibling;
      if (controls && controls.classList.contains('mobile-carousel-controls')) {
        controls.remove();
      }
    });
    setTimeout(initCarousels, 60);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousels);
  } else {
    initCarousels();
  }

  window.addEventListener('resize', () => {
    initCarousels();
  });
})();
