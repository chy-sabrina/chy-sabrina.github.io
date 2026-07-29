document.addEventListener('DOMContentLoaded', () => {
  setupThemeToggle();
  setupClassifiedEasterEgg();
  setupAnchorOffsetScrolling();
  syncClassifiedLinkLabel();

  const navLinks = document.querySelectorAll('nav a');
  const navbar = document.querySelector('nav');
  const sectionParam = new URLSearchParams(window.location.search).get('section');

  navLinks.forEach(link => {
    link.addEventListener('click', event => {
      const href = link.getAttribute('href');

      if (link.classList.contains('classified-link')) {
        event.preventDefault();
        openClassifiedTerminal();
        return;
      }

      if (!href) {
        return;
      }

      const url = new URL(href, window.location.href);
      const linkSection = url.searchParams.get('section');
      const currentPath = normalizePath(window.location.pathname);
      const linkPath = normalizePath(url.pathname);

      if (!linkSection || linkPath !== currentPath) {
        return;
      }

      const targetElement = document.getElementById(linkSection);

      if (!targetElement) {
        return;
      }

      event.preventDefault();
      scrollToSection(targetElement, navbar);
      window.history.replaceState(null, '', window.location.pathname);
    });
  });

  if (!sectionParam) {
    return;
  }

  const targetElement = document.getElementById(sectionParam);

  if (targetElement) {
    scrollToSection(targetElement, navbar);
    window.history.replaceState(null, '', window.location.pathname);
  }
});

function setupThemeToggle() {
  const toggle = document.querySelector('.theme-toggle');
  const storedTheme = localStorage.getItem('theme');
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const applyTheme = theme => {
    document.documentElement.dataset.theme = theme;

    if (toggle) {
      const isDark = theme === 'dark';
      toggle.textContent = isDark ? '◐' : '◑';
      toggle.setAttribute('aria-pressed', String(isDark));
      toggle.setAttribute('aria-label', 'Toggle color scheme');
    }
  };

  applyTheme(storedTheme || (mediaQuery.matches ? 'dark' : 'light'));

  if (toggle) {
    toggle.addEventListener('click', () => {
      const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', nextTheme);
      applyTheme(nextTheme);
    });
  }

  mediaQuery.addEventListener('change', event => {
    if (localStorage.getItem('theme')) {
      return;
    }

    applyTheme(event.matches ? 'dark' : 'light');
  });
}

function scrollToSection(targetElement, navbar) {
  const navbarHeight = navbar ? navbar.offsetHeight : 0;
  const extraPadding = 45;
  const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - navbarHeight - extraPadding;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

function normalizePath(path) {
  return path.replace(/\/index\.html$/, '/');
}

function setupClassifiedEasterEgg() {
  const overlay = document.getElementById('classified-terminal');
  const input = document.getElementById('classified-token');
  const status = document.getElementById('classified-status');
  const unlockKey = 'classifiedUnlocked';
  const defaultRedirectUrl = './notes.html';

  if (!overlay || !input || !status) {
    return;
  }

  document.querySelectorAll('[data-classified-open]').forEach(trigger => {
    trigger.addEventListener('click', event => {
      event.preventDefault();
      openClassifiedTerminal(trigger.dataset.classifiedTarget || defaultRedirectUrl);
    });
  });

  overlay.classList.add('hidden');
  overlay.style.display = 'none';

  overlay.addEventListener('click', event => {
    if (event.target === overlay) {
      closeClassifiedTerminal();
    }
  });

  input.addEventListener('keydown', event => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();

    if (input.value === 'imsabrina') {
      status.textContent = '[+] Access Granted. Redirecting...';
      status.classList.remove('is-error');
      status.classList.add('is-success');
      sessionStorage.setItem(unlockKey, 'true');
      syncClassifiedLinkLabel();
      const redirectUrl = overlay.dataset.classifiedTarget || defaultRedirectUrl;

      window.setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1000);

      return;
    }

    status.textContent = '[-] Access Denied. Token invalid.';
    status.classList.remove('is-success');
    status.classList.add('is-error');
    input.value = '';
    input.focus();
  });

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !overlay.classList.contains('hidden')) {
      closeClassifiedTerminal();
    }
  });
}

function setupAnchorOffsetScrolling() {
  const navbar = document.querySelector('.navbar');

  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href*="#"]');

    if (!anchor) {
      return;
    }

    const url = new URL(anchor.href, window.location.href);

    if (url.origin !== window.location.origin) {
      return;
    }

    if (normalizePath(url.pathname) !== normalizePath(window.location.pathname)) {
      return;
    }

    const targetId = decodeURIComponent(url.hash.replace('#', ''));

    if (!targetId) {
      return;
    }

    const targetElement = document.getElementById(targetId);

    if (!targetElement) {
      return;
    }

    event.preventDefault();
    scrollToSection(targetElement, navbar);
    window.history.replaceState(null, '', `${window.location.pathname}${url.search}${url.hash}`);
  });

  const initialHash = decodeURIComponent(window.location.hash.replace('#', ''));

  if (!initialHash) {
    return;
  }

  window.requestAnimationFrame(() => {
    const targetElement = document.getElementById(initialHash);

    if (targetElement) {
      scrollToSection(targetElement, navbar);
    }
  });
}

function openClassifiedTerminal(targetUrl = './notes.html') {
  const overlay = document.getElementById('classified-terminal');
  const input = document.getElementById('classified-token');
  const status = document.getElementById('classified-status');
  const unlockKey = 'classifiedUnlocked';

  if (!overlay || !input || !status) {
    return;
  }

  if (sessionStorage.getItem(unlockKey) === 'true') {
    syncClassifiedLinkLabel();
    window.location.href = targetUrl;
    return;
  }

  overlay.dataset.classifiedTarget = targetUrl;
  overlay.classList.remove('hidden');
  overlay.style.display = 'flex';
  overlay.setAttribute('aria-hidden', 'false');
  status.textContent = '';
  status.classList.remove('is-success', 'is-error');
  input.value = '';

  window.requestAnimationFrame(() => {
    input.focus();
  });
}

function closeClassifiedTerminal() {
  const overlay = document.getElementById('classified-terminal');
  const input = document.getElementById('classified-token');

  if (!overlay) {
    return;
  }

  overlay.classList.add('hidden');
  overlay.style.display = 'none';
  overlay.setAttribute('aria-hidden', 'true');

  if (input) {
    input.value = '';
  }
}

function syncClassifiedLinkLabel() {
  const classifiedLink = document.querySelector('.classified-link');

  if (!classifiedLink) {
    return;
  }

  const isUnlocked = sessionStorage.getItem('classifiedUnlocked') === 'true';
  classifiedLink.textContent = isUnlocked ? 'Notes' : '[CONFIDENTIAL]';
  classifiedLink.setAttribute('aria-label', isUnlocked ? 'Open notes page' : 'Open confidential terminal');
}
