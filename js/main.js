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

  const initializeCollections = () => {
    const phoneQuery = window.matchMedia ? window.matchMedia('(max-width: 599px)') : null;
    const phone = phoneQuery && (phoneQuery.addEventListener || phoneQuery.addListener) ? phoneQuery : null;
    const isPhone = () => Boolean(phone && phone.matches);
    const main = document.getElementById('main-content');
    const projectSection = document.getElementById('projects');
    const certificateSection = document.getElementById('certificates');
    const projectLink = menu && menu.querySelector('a[href="#projects"]');
    const certificateLink = menu && menu.querySelector('a[href="#certificates"]');
    const focus = (element) => {
      if (element) element.focus({ preventScroll: true });
    };
    const preview = (items, limit) => [
      ...items.filter((item) => item.featured),
      ...items.filter((item) => !item.featured),
    ].slice(0, limit);

    // Move the existing nodes, preserving IDs, listeners, and keyboard focus.
    const orderPair = (projects, certificates) => {
      if (!projects || !certificates || projects.parentNode !== certificates.parentNode) return false;
      const first = isPhone() ? projects : certificates;
      const second = isPhone() ? certificates : projects;
      if (first.nextElementSibling !== second) {
        const active = document.activeElement;
        const containsFocus = first.contains(active);
        first.parentNode.insertBefore(first, second);
        if (containsFocus && active.isConnected && document.activeElement !== active) focus(active);
      }
      return true;
    };

    let renderProjects = () => {};
    let renderCertificates = () => {};
    const projectGrid = document.getElementById('projects-grid');
    const projectFilters = document.querySelector('.project-filters');
    const projectToggle = document.querySelector('button[data-show-more="projects"]');
    if (projectGrid && projectFilters) {
      const filterButtons = Array.from(projectFilters.querySelectorAll('button[data-project-filter]'));
      const projects = Array.from(projectGrid.querySelectorAll('.project-card')).map((card) => ({
        card,
        categories: (card.dataset.projectCategories || '').split(/\s+/),
        featured: card.dataset.projectFeatured === 'true',
      }));
      const projectCount = document.getElementById('project-count');
      let category = 'all';
      let expanded = false;

      if (filterButtons.length && projects.length) {
        renderProjects = () => {
          const matching = projects.filter((project) => category === 'all' || project.categories.includes(category));
          const compact = isPhone() && Boolean(projectToggle);
          const visible = compact && !expanded ? preview(matching, 3) : matching;
          const visibleCards = new Set(visible.map((project) => project.card));
          const active = document.activeElement;
          let hidesFocus = false;
          projects.forEach(({ card }) => {
            const hidden = !visibleCards.has(card);
            if (hidden && card.contains(active)) hidesFocus = true;
            card.hidden = hidden;
          });
          filterButtons.forEach((button) => {
            button.setAttribute('aria-pressed', String(button.dataset.projectFilter === category));
          });
          if (projectCount) {
            const count = visible.length < matching.length ? `${visible.length} of ${matching.length}` : String(matching.length);
            projectCount.textContent = `${count} ${matching.length === 1 ? 'project' : 'projects'}`;
          }
          if (projectToggle) {
            projectToggle.hidden = !compact || matching.length <= 3;
            projectToggle.setAttribute('aria-expanded', String(compact && expanded && matching.length > 3));
            projectToggle.textContent = compact && expanded ? 'Show fewer projects' : 'Show more projects';
          }
          if (hidesFocus || (projectToggle && active === projectToggle && projectToggle.hidden)) {
            focus(projectToggle && !projectToggle.hidden ? projectToggle :
              filterButtons.find((button) => button.dataset.projectFilter === category));
          }
        };

        filterButtons.forEach((button) => {
          button.addEventListener('click', () => {
            category = button.dataset.projectFilter;
            expanded = false;
            renderProjects();
          });
        });
        if (projectToggle) {
          projectToggle.addEventListener('click', () => {
            const collapsing = isPhone() && expanded && !projectToggle.hidden;
            expanded = !expanded;
            renderProjects();
            if (collapsing) projectSection?.scrollIntoView({ block: 'start', behavior: 'auto' });
          });
        }
        projectFilters.hidden = false;
      }
    }

    const certificateGrid = document.getElementById('certificates-grid');
    const certificateToggle = document.querySelector('button[data-show-more="certificates"]');
    if (certificateGrid && certificateToggle) {
      const certificates = Array.from(certificateGrid.querySelectorAll('.certificate-card')).map((card) => ({
        card,
        featured: card.dataset.certificateFeatured === 'true',
      }));
      let expanded = false;
      renderCertificates = () => {
        const compact = isPhone();
        const visible = compact && !expanded ? preview(certificates, 2) : certificates;
        const visibleCards = new Set(visible.map((certificate) => certificate.card));
        const active = document.activeElement;
        let hidesFocus = false;
        certificates.forEach(({ card }) => {
          const hidden = !visibleCards.has(card);
          if (hidden && card.contains(active)) hidesFocus = true;
          card.hidden = hidden;
        });
        certificateToggle.hidden = !compact || certificates.length <= 2;
        certificateToggle.setAttribute('aria-expanded', String(compact && expanded && certificates.length > 2));
        certificateToggle.textContent = compact && expanded ? 'Show fewer certificates' : 'Show more certificates';
        if (hidesFocus || (active === certificateToggle && certificateToggle.hidden)) {
          focus(!certificateToggle.hidden ? certificateToggle : visible[0]?.card);
        }
      };
      certificateToggle.addEventListener('click', () => {
        const collapsing = isPhone() && expanded && !certificateToggle.hidden;
        expanded = !expanded;
        renderCertificates();
        if (collapsing) certificateSection?.scrollIntoView({ block: 'start', behavior: 'auto' });
      });
    }

    const renderCollections = () => {
      const sectionsOrdered = orderPair(projectSection, certificateSection);
      orderPair(projectLink, certificateLink);
      if (main) main.classList.toggle('mobile-compact', isPhone() && sectionsOrdered);
      renderProjects();
      renderCertificates();
    };
    if (phone?.addEventListener) phone.addEventListener('change', renderCollections);
    else if (phone?.addListener) phone.addListener(renderCollections);
    renderCollections();
  };
  initializeCollections();

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

  const initializeNameTyping = () => {
    const title = document.getElementById('hero-title');
    if (!title || !window.IntersectionObserver || !window.requestAnimationFrame ||
        !window.matchMedia || !window.NodeFilter || !document.createTreeWalker) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionPreference.matches ||
        (!motionPreference.addEventListener && !motionPreference.addListener)) return;

    const textNodes = [];
    title.querySelectorAll('[data-name-part]').forEach((part) => {
      const walker = document.createTreeWalker(part, window.NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) textNodes.push(node);
    });

    // Keep every letter in place, with the decorative period outside the animation.
    // The heading's static accessible label stays unchanged while it animates.
    const characters = [];
    textNodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      Array.from(node.nodeValue).forEach((letter) => {
        const character = document.createElement('span');
        character.className = 'name-character';
        character.textContent = letter;
        fragment.appendChild(character);
        characters.push(character);
      });
      node.parentNode.replaceChild(fragment, node);
    });
    if (!characters.length) return;

    const duration = 1500;
    let elapsed = 0;
    let previousFrame = null;
    let frameId = 0;
    let started = false;
    let finished = false;

    const reveal = (count) => {
      characters.forEach((character, index) => {
        character.classList.toggle('is-visible', index < count);
        character.classList.toggle('is-current', index === count - 1);
      });
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      window.cancelAnimationFrame(frameId);
      frameId = 0;
      observer.disconnect();
      reveal(characters.length);
      title.classList.remove('name-typing');
      characters.forEach((character) => character.classList.remove('is-current'));
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (motionPreference.removeEventListener) {
        motionPreference.removeEventListener('change', onMotionChange);
      } else {
        motionPreference.removeListener(onMotionChange);
      }
    };

    const frame = (timestamp) => {
      frameId = 0;
      if (previousFrame !== null) elapsed += timestamp - previousFrame;
      previousFrame = timestamp;
      if (elapsed >= duration) {
        finish();
        return;
      }
      reveal(Math.floor((elapsed / duration) * characters.length));
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
      started = true;
      observer.disconnect();
      reveal(0);
      title.classList.add('name-typing');
      resume();
    }, { threshold: 0.1 });

    document.addEventListener('visibilitychange', onVisibilityChange);
    if (motionPreference.addEventListener) {
      motionPreference.addEventListener('change', onMotionChange);
    } else {
      motionPreference.addListener(onMotionChange);
    }
    observer.observe(title);
  };
  initializeNameTyping();

  const editor = document.querySelector('.hero-editor');
  if (!editor || !window.IntersectionObserver || !window.requestAnimationFrame ||
      !window.matchMedia || !window.CSS?.supports('clip-path', 'polygon(0 0, 1ch 0, 1ch 100%, 0 100%)')) {
    return;
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!reducedMotion.addEventListener && !reducedMotion.addListener) return;

  const skipButton = editor.querySelector('.typing-skip');
  const replayButton = editor.querySelector('.typing-replay');
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
  let playing = false;
  let autoplayPending = !reducedMotion.matches;

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
    const focusHiddenControl = (skipButton && document.activeElement === skipButton) ||
      (replayButton && document.activeElement === replayButton && reducedMotion.matches);
    playing = false;
    autoplayPending = false;
    window.cancelAnimationFrame(frameId);
    frameId = 0;
    previousFrame = null;
    observer.disconnect();
    editor.classList.remove('code-typing');
    editor.classList.add('typing-done');
    lines.forEach(({ line }) => {
      line.classList.remove('typing-line');
      line.style.removeProperty('--typed-width');
    });
    if (skipButton) skipButton.hidden = true;
    if (replayButton) replayButton.hidden = reducedMotion.matches;
    if (focusHiddenControl) {
      const focusTarget = replayButton && !replayButton.hidden ? replayButton : code;
      if (focusTarget) focusTarget.focus({ preventScroll: true });
    }
  };

  const frame = (timestamp) => {
    frameId = 0;
    if (!playing || document.hidden) {
      previousFrame = null;
      return;
    }
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
    if (playing && !document.hidden && !frameId) {
      previousFrame = null;
      frameId = window.requestAnimationFrame(frame);
    }
  };

  const startTyping = (replaying = false) => {
    if (playing) return;
    if (reducedMotion.matches) {
      finish();
      return;
    }
    const focusReplay = replayButton && document.activeElement === replayButton;
    autoplayPending = false;
    observer.disconnect();
    window.cancelAnimationFrame(frameId);
    frameId = 0;
    elapsed = 0;
    previousFrame = null;
    playing = true;
    if (replaying && code) code.scrollLeft = 0;
    reveal(0);
    editor.classList.remove('typing-done');
    editor.classList.add('code-typing');
    if (replayButton) replayButton.hidden = true;
    if (skipButton) skipButton.hidden = false;
    if (focusReplay) {
      const focusTarget = skipButton || code;
      if (focusTarget) focusTarget.focus({ preventScroll: true });
    }
    resume();
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
    if (event.matches) {
      finish();
    } else if (!playing && replayButton) {
      replayButton.hidden = false;
    }
  }

  function onCodeFocus() {
    if (playing || autoplayPending) finish();
  }

  const observer = new IntersectionObserver((entries) => {
    if (!autoplayPending || !entries.some((entry) => entry.isIntersecting)) return;
    if (code && document.activeElement === code) {
      finish();
      return;
    }
    startTyping();
  }, { threshold: 0.1 });

  document.addEventListener('visibilitychange', onVisibilityChange);
  if (reducedMotion.addEventListener) {
    reducedMotion.addEventListener('change', onMotionChange);
  } else {
    reducedMotion.addListener(onMotionChange);
  }
  if (skipButton) skipButton.addEventListener('click', finish);
  if (replayButton) replayButton.addEventListener('click', () => startTyping(true));
  if (code) code.addEventListener('focus', onCodeFocus);
  if (autoplayPending) observer.observe(editor);
  else finish();
})();
