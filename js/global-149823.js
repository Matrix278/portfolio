(() => {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const menu = document.querySelector('.mobile-menu');

  if (toggle && menu) {
    const setMenuOpen = (open) => {
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    };

    toggle.addEventListener('click', () => setMenuOpen(menu.hidden));
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(false));
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !menu.hidden) {
        setMenuOpen(false);
        toggle.focus();
      }
    });
    const desktop = window.matchMedia('(min-width: 960px)');
    desktop.addEventListener('change', () => {
      if (desktop.matches) setMenuOpen(false);
    });
  }

  const year = document.getElementById('copyright-year');
  if (year) year.textContent = String(new Date().getFullYear());

  const projectGrid = document.getElementById('projects-grid');
  const projectFilters = document.querySelector('.project-filters');
  if (projectGrid && projectFilters) {
    const filterButtons = Array.from(projectFilters.querySelectorAll('button[data-project-filter]'));
    const projects = Array.from(projectGrid.querySelectorAll('.project-card')).map((card) => ({
      card,
      categories: (card.dataset.projectCategories || '').split(/\s+/),
    }));
    const projectCount = document.getElementById('project-count');

    if (filterButtons.length && projects.length) {
      const setProjectFilter = (category) => {
        let visibleCount = 0;
        projects.forEach(({ card, categories }) => {
          const visible = category === 'all' || categories.includes(category);
          card.hidden = !visible;
          if (visible) visibleCount += 1;
        });
        filterButtons.forEach((button) => {
          button.setAttribute('aria-pressed', String(button.dataset.projectFilter === category));
        });
        if (projectCount) {
          projectCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'project' : 'projects'}`;
        }
      };

      filterButtons.forEach((button) => {
        button.addEventListener('click', () => setProjectFilter(button.dataset.projectFilter));
      });
      setProjectFilter('all');
      projectFilters.hidden = false;
    }
  }

  // The vendor's floating launcher is a div; make it keyboard accessible.
  const enhanceCoffeeWidget = () => {
    const widget = document.getElementById('bmc-wbtn');
    if (!widget) return false;
    widget.setAttribute('role', 'button');
    const updateWidgetLabel = () => {
      const open = document.getElementById('bmc-iframe')?.style.opacity === '1';
      widget.setAttribute('aria-label', open ? 'Close support panel' : 'Buy me a coffee');
      widget.setAttribute('aria-expanded', String(open));
    };
    updateWidgetLabel();
    const panel = document.getElementById('bmc-iframe');
    if (panel && window.MutationObserver) {
      const panelObserver = new MutationObserver(updateWidgetLabel);
      panelObserver.observe(panel, { attributes: true, attributeFilter: ['style'] });
    }
    widget.tabIndex = 0;
    widget.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        // The vendor's launcher only opens; its overlay handles closing.
        if (panel?.style.opacity === '1') {
          panel.parentElement.click();
        } else {
          widget.click();
        }
      }
    });
    return true;
  };
  if (!enhanceCoffeeWidget() && window.MutationObserver) {
    const widgetObserver = new MutationObserver(() => {
      if (enhanceCoffeeWidget()) widgetObserver.disconnect();
    });
    widgetObserver.observe(document.body, { childList: true, subtree: true });
  }

  const editor = document.querySelector('.hero-editor');
  if (!editor || !window.IntersectionObserver || !window.requestAnimationFrame ||
      !window.matchMedia || !window.CSS?.supports('clip-path', 'polygon(0 0, 1ch 0, 1ch 100%, 0 100%)')) {
    return;
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) return;

  const skipButton = editor.querySelector('.typing-skip');
  const code = editor.querySelector('.editor-code');

  let timelineLength = 0;
  const lines = Array.from(editor.querySelectorAll('.code-line')).map((line) => {
    const content = line.lastElementChild;
    const length = Array.from(content.textContent).length;
    const start = timelineLength;
    // A short pause at each line ending gives the reveal a typing rhythm.
    timelineLength += length + 6;
    return { line, length, start, end: timelineLength };
  });
  if (!lines.length) return;

  const duration = 6000;
  let elapsed = 0;
  let previousFrame = null;
  let frameId = 0;
  let started = false;
  let finished = false;

  // Clip only the painted text. The full code, its highlighting, and its
  // dimensions stay intact throughout, including for assistive technology.
  const reveal = (progress) => {
    lines.forEach(({ line, length, start, end }) => {
      const visible = Math.min(length, Math.max(0, Math.floor(progress - start)));
      line.style.setProperty('--typed-width', `${visible}ch`);
      line.classList.toggle('typing-line', progress >= start && progress < end);
    });
  };

  const finish = () => {
    if (finished) return;
    const restoreFocus = skipButton && document.activeElement === skipButton;
    finished = true;
    window.cancelAnimationFrame(frameId);
    frameId = 0;
    observer.disconnect();
    editor.classList.remove('code-typing');
    editor.classList.add('typing-done');
    lines.forEach(({ line }) => {
      line.classList.remove('typing-line');
      line.style.removeProperty('--typed-width');
    });
    if (skipButton) {
      skipButton.hidden = true;
      skipButton.removeEventListener('click', finish);
    }
    if (code) code.removeEventListener('focus', finish);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (reducedMotion.removeEventListener) {
      reducedMotion.removeEventListener('change', onMotionChange);
    } else {
      reducedMotion.removeListener(onMotionChange);
    }
    if (restoreFocus && code) code.focus({ preventScroll: true });
  };

  const frame = (timestamp) => {
    frameId = 0;
    if (previousFrame !== null) elapsed += timestamp - previousFrame;
    previousFrame = timestamp;
    if (elapsed >= duration) {
      finish();
      return;
    }
    reveal((elapsed / duration) * timelineLength);
    frameId = window.requestAnimationFrame(frame);
  };

  const resume = () => {
    if (started && !finished && !document.hidden && !frameId) {
      previousFrame = null;
      frameId = window.requestAnimationFrame(frame);
    }
  };

  function onVisibilityChange() {
    if (document.hidden) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
      previousFrame = null;
    } else {
      resume();
    }
  }

  function onMotionChange(event) {
    if (event.matches) finish();
  }

  const observer = new IntersectionObserver((entries) => {
    if (finished || started || !entries.some((entry) => entry.isIntersecting)) return;
    if (code && document.activeElement === code) {
      finish();
      return;
    }
    started = true;
    observer.disconnect();
    reveal(0);
    editor.classList.add('code-typing');
    if (skipButton) skipButton.hidden = false;
    resume();
  }, { threshold: 0.1 });

  document.addEventListener('visibilitychange', onVisibilityChange);
  if (reducedMotion.addEventListener) {
    reducedMotion.addEventListener('change', onMotionChange);
  } else {
    reducedMotion.addListener(onMotionChange);
  }
  if (skipButton) skipButton.addEventListener('click', finish);
  if (code) code.addEventListener('focus', finish);
  observer.observe(editor);
})();
