document.addEventListener('DOMContentLoaded', () => {
  setupThemeToggle();
  setupClassifiedEasterEgg();
  setupAnchorOffsetScrolling();
  setupYoutubeAudioPlayer();
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

function loadYouTubeIframeAPI() {
  return new Promise(resolve => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }

    window.__youtubeApiReadyCallbacks = window.__youtubeApiReadyCallbacks || [];
    window.__youtubeApiReadyCallbacks.push(resolve);

    if (window.__youtubeApiLoading) {
      return;
    }

    window.__youtubeApiLoading = true;

    const previousReady = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      if (previousReady) {
        previousReady();
      }

      window.__youtubeApiReadyCallbacks.forEach(callback => callback());
      window.__youtubeApiReadyCallbacks = [];
    };

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });
}

function setupYoutubeAudioPlayer() {
  const playerRoot = document.querySelector('.audio-player[data-youtube-id]');

  if (!playerRoot) {
    return;
  }

  const videoId = playerRoot.dataset.youtubeId;
  const host = playerRoot.querySelector('.audio-youtube-host');

  if (!videoId || !host || !host.id) {
    return;
  }

  const toggle = playerRoot.querySelector('.audio-toggle');
  const icon = playerRoot.querySelector('.audio-toggle-icon');
  const progress = playerRoot.querySelector('.audio-progress');
  const currentTimeEl = playerRoot.querySelector('.audio-current');
  const durationTimeEl = playerRoot.querySelector('.audio-duration');

  if (!toggle || !icon || !progress || !currentTimeEl || !durationTimeEl) {
    return;
  }

  let ytPlayer = null;
  let playerReady = false;
  let pendingPlay = false;
  let tickTimer = null;
  let trackDuration = 0;

  toggle.disabled = true;

  const formatTime = seconds => {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return '0:00';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = String(Math.floor(seconds % 60)).padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
  };

  const updateProgress = seconds => {
    const safeDuration = trackDuration > 0 ? trackDuration : 1;
    const percent = (seconds / safeDuration) * 1000;
    progress.value = percent;
    progress.style.setProperty('--progress', `${percent / 10}%`);
    currentTimeEl.textContent = formatTime(seconds);
  };

  const stopTick = () => {
    if (tickTimer) {
      window.clearInterval(tickTimer);
      tickTimer = null;
    }
  };

  const startTick = () => {
    stopTick();

    tickTimer = window.setInterval(() => {
      if (!ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') {
        return;
      }

      updateProgress(ytPlayer.getCurrentTime());
    }, 250);
  };

  loadYouTubeIframeAPI().then(() => {
    ytPlayer = new YT.Player(host.id, {
      height: '1',
      width: '1',
      videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 0,
        modestbranding: 1,
        origin: window.location.origin,
        playsinline: 1,
        rel: 0
      },
      events: {
        onReady: event => {
          ytPlayer = event.target;
          playerReady = true;
          trackDuration = ytPlayer.getDuration() || 0;
          durationTimeEl.textContent = formatTime(trackDuration);
          progress.disabled = false;
          toggle.disabled = false;

          if (pendingPlay) {
            pendingPlay = false;
            ytPlayer.playVideo();
          }
        },
        onStateChange: event => {
          if (event.data === YT.PlayerState.PLAYING) {
            icon.textContent = '❚❚';
            toggle.setAttribute('aria-pressed', 'true');
            toggle.setAttribute('aria-label', 'Pause track');
            startTick();
            return;
          }

          icon.textContent = '▶';
          toggle.setAttribute('aria-pressed', 'false');
          toggle.setAttribute('aria-label', 'Play track');
          stopTick();

          if (event.data === YT.PlayerState.ENDED) {
            updateProgress(0);
          }
        }
      }
    });
  });

  toggle.addEventListener('click', () => {
    if (!playerReady || !ytPlayer) {
      pendingPlay = true;
      return;
    }

    if (ytPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
      ytPlayer.pauseVideo();
      return;
    }

    ytPlayer.playVideo();
  });

  progress.addEventListener('input', () => {
    if (!ytPlayer || trackDuration <= 0) {
      return;
    }

    const seconds = (Number(progress.value) / 1000) * trackDuration;
    ytPlayer.seekTo(seconds, true);
    updateProgress(seconds);
  });
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
