document.addEventListener('DOMContentLoaded', () => {
  setupThemeToggle();
  setupClassifiedEasterEgg();
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

  if (!overlay || !input || !status) {
    return;
  }

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

    if (input.value === 'bypass_allow_2026') {
      status.textContent = '[+] Access Granted. Redirecting...';
      status.classList.remove('is-error');
      status.classList.add('is-success');
      sessionStorage.setItem(unlockKey, 'true');
      syncClassifiedLinkLabel();

      window.setTimeout(() => {
        window.location.href = './notes.html';
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

function openClassifiedTerminal() {
  const overlay = document.getElementById('classified-terminal');
  const input = document.getElementById('classified-token');
  const status = document.getElementById('classified-status');
  const unlockKey = 'classifiedUnlocked';

  if (!overlay || !input || !status) {
    return;
  }

  if (sessionStorage.getItem(unlockKey) === 'true') {
    syncClassifiedLinkLabel();
    window.location.href = './notes.html';
    return;
  }

  overlay.classList.remove('hidden');
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
