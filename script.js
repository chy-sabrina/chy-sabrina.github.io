document.addEventListener('DOMContentLoaded', () => {
  setupThemeToggle();
  setupClassifiedEasterEgg();
  setupAnchorOffsetScrolling();
  setupYoutubeAudioPlayer();
  setupDemoVideoModal();
  syncClassifiedLinkLabel();

  const navbar = document.querySelector('nav');
  const sectionParam = new URLSearchParams(window.location.search).get('section');

  document.addEventListener('click', event => {
    const link = event.target.closest('nav a');

    if (!link) {
      return;
    }

    const state = getAuthState();

    if (link.classList.contains('classified-link')) {
      event.preventDefault();
      openClassifiedTerminal(getNotesIndexHref(state));
      return;
    }

    const href = link.getAttribute('href');

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
  const extraPadding = 52;
  const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - navbarHeight - extraPadding;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

function normalizePath(path) {
  if (path === '/index.html') {
    return '/';
  }

  return path.replace(/\/index\.html$/, '/').replace(/\.html$/, '/');
}

const AUTH_KEYS = Object.freeze({
  unlocked: 'classifiedUnlocked',
  previewNote: 'previewNote'
});

function getCurrentNoteSlug(path = normalizePath(window.location.pathname)) {
  const noteMatch = path.match(/^\/notes\/([^/]+)\/$/);
  return noteMatch ? noteMatch[1] : '';
}

function isUnlocked() {
  return sessionStorage.getItem(AUTH_KEYS.unlocked) === 'true';
}

function getPreviewNote() {
  return sessionStorage.getItem(AUTH_KEYS.previewNote) || '';
}

function clearPreview() {
  sessionStorage.removeItem(AUTH_KEYS.previewNote);
}

function grantPreview(noteSlug) {
  if (isUnlocked()) {
    clearPreview();
    return;
  }

  sessionStorage.setItem(AUTH_KEYS.previewNote, noteSlug);
}

function unlockNotes() {
  sessionStorage.setItem(AUTH_KEYS.unlocked, 'true');
  clearPreview();
}

function getAuthState() {
  const currentPath = normalizePath(window.location.pathname);
  const currentNoteSlug = getCurrentNoteSlug(currentPath);
  const unlocked = isUnlocked();
  const previewNote = getPreviewNote();
  const isNotesIndex = currentPath === '/notes/';
  const isNotePage = Boolean(currentNoteSlug);
  const isProtectedNotePage = isNotePage && currentNoteSlug !== 'oow';
  const isPreviewAllowed = !unlocked && isProtectedNotePage && previewNote === currentNoteSlug;

  return {
    currentPath,
    currentNoteSlug,
    unlocked,
    previewNote,
    isNotesIndex,
    isNotePage,
    isProtectedNotePage,
    isPreviewAllowed
  };
}

function getNotesIndexHref(state = getAuthState()) {
  return '/notes/';
}

function getNoteHref(noteSlug) {
  return `/notes/${noteSlug}/`;
}

function getNotesNavLink() {
  const navbar = document.querySelector('.navbar nav');

  if (!navbar) {
    return null;
  }

  return navbar.querySelector('.classified-link') || navbar.querySelector('a[href$="/notes/"]');
}

function ensureClassifiedTerminal() {
  let overlay = document.getElementById('classified-terminal');

  if (overlay) {
    return overlay;
  }

  document.body.insertAdjacentHTML(
      'beforeend',
      `
        <div class="term-modal-overlay hidden" id="classified-terminal" role="dialog" aria-modal="true" aria-labelledby="classified-terminal-title" aria-hidden="true">
          <div class="term-box" role="document">
            <div class="term-header">
              <div class="term-dots" aria-hidden="true">
                <span class="term-dot term-dot-red"></span>
                <span class="term-dot term-dot-yellow"></span>
                <span class="term-dot term-dot-green"></span>
              </div>
              <p class="term-title" id="classified-terminal-title">/mnt/secure_storage</p>
            </div>

            <div class="term-body">
              <p class="term-line">[SYSTEM ERROR] ACCESS DENIED. VALIDATION TOKEN REQUIRED.</p>

              <label class="term-prompt" for="classified-token">
                <span>Enter Access Token:</span>
                <input id="classified-token" class="term-input" type="password" autocomplete="off" spellcheck="false" inputmode="text" />
              </label>

              <p class="term-hint">[!] HINT: Access token is hidden in this page. Code never lies.</p>
              <p class="term-status" id="classified-status" aria-live="polite"></p>
            </div>
          </div>
        </div>
      `
  );

  overlay = document.getElementById('classified-terminal');
  return overlay;
}

function renderPreviewBanner(article) {
  if (!article || article.querySelector('.note-preview-banner')) {
    return;
  }

  const banner = document.createElement('aside');
  banner.className = 'note-preview-banner';
  banner.setAttribute('role', 'note');
  banner.innerHTML = `
    <strong>Just a preview 👀</strong>
    <span>This note is available directly from the project page. The rest of my Notes are still locked behind the terminal.</span>
  `;

  const backToNotes = article.querySelector('.back-to-notes');
  const projectLink = article.querySelector('.preview-project-link');

  if (backToNotes) {
    backToNotes.style.display = 'none';
  }

  if (projectLink) {
    projectLink.style.display = '';
  }

  article.insertBefore(banner, article.firstChild);
}

function removePreviewBanner(article) {
  const banner = article.querySelector('.note-preview-banner');

  if (banner) {
    banner.remove();
  }

  const backToNotes = article.querySelector('.back-to-notes');
  const projectLink = article.querySelector('.preview-project-link');

  if (backToNotes) {
    backToNotes.style.display = '';
  }

  if (projectLink) {
    projectLink.style.display = 'none';
  }
}

function applyClassifiedPageState() {
  const state = getAuthState();
  const notesIndexHref = getNotesIndexHref(state);

  syncClassifiedLinkLabel(state);

  if (state.unlocked && state.previewNote) {
    clearPreview();
  }

  if (state.isNotesIndex) {
    document.body.classList.toggle('notes-locked', !state.unlocked);

    if (!state.unlocked) {
      openClassifiedTerminal(notesIndexHref);
    }

    return;
  }

  document.body.classList.remove('notes-locked');

  if (!state.isNotePage) {
    return;
  }

  const article = document.querySelector('.note-page');

  if (!article) {
    return;
  }

  if (state.unlocked) {
    removePreviewBanner(article);
    return;
  }

  if (state.isPreviewAllowed) {
    renderPreviewBanner(article);
    return;
  }

  if (state.isProtectedNotePage) {
    window.location.replace(notesIndexHref);
    return;
  }

  removePreviewBanner(article);
}

function setupClassifiedEasterEgg() {
  const overlay = ensureClassifiedTerminal();
  const input = document.getElementById('classified-token');
  const status = document.getElementById('classified-status');
  const defaultRedirectUrl = getNotesIndexHref();

  if (!overlay || !input || !status) {
    return;
  }

  document.querySelectorAll('[data-classified-open]').forEach(trigger => {
    trigger.addEventListener('click', event => {
      event.preventDefault();

      const targetUrl = trigger.dataset.classifiedTarget || defaultRedirectUrl;
      const previewNote = trigger.dataset.classifiedPreviewNote;

      if (previewNote) {
        grantPreview(previewNote);
        window.location.href = targetUrl;
        return;
      }

      openClassifiedTerminal(targetUrl);
    });
  });

  document.querySelectorAll('.back-to-notes').forEach(link => {
    link.addEventListener('click', event => {
      const state = getAuthState();

      if (!state.isPreviewAllowed) {
        return;
      }

      event.preventDefault();
      openClassifiedTerminal(getNotesIndexHref(state));
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
      unlockNotes();
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

  applyClassifiedPageState();
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

function openClassifiedTerminal(targetUrl = getNotesIndexHref()) {
  const defaultTargetUrl = getNotesIndexHref();
  const overlay = document.getElementById('classified-terminal');
  const input = document.getElementById('classified-token');
  const status = document.getElementById('classified-status');

  if (!overlay || !input || !status) {
    return;
  }

  if (isUnlocked()) {
    syncClassifiedLinkLabel();
    window.location.href = targetUrl || defaultTargetUrl;
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
  const playerRoot = document.querySelector('.audio-player[data-youtube-url], .audio-player[data-youtube-id]');

  if (!playerRoot) {
    return;
  }

  const host = playerRoot.querySelector('.audio-youtube-host');
  const toggle = playerRoot.querySelector('.audio-toggle');
  const icon = playerRoot.querySelector('.audio-toggle-icon');
  const progress = playerRoot.querySelector('.audio-progress');
  const currentTimeEl = playerRoot.querySelector('.audio-current');
  const durationTimeEl = playerRoot.querySelector('.audio-duration');
  const titleEl = playerRoot.querySelector('.audio-title');
  const artistEl = playerRoot.querySelector('.audio-artist');

  if (!host || !host.id || !toggle || !icon || !progress || !currentTimeEl || !durationTimeEl || !titleEl || !artistEl) {
    return;
  }

  let ytPlayer = null;
  let playerReady = false;
  let pendingPlay = false;
  let tickTimer = null;
  let trackDuration = 0;
  let loadToken = 0;

  const resolveVideoUrl = () => playerRoot.dataset.youtubeUrl || (playerRoot.dataset.youtubeId ? `https://www.youtube.com/watch?v=${playerRoot.dataset.youtubeId}` : '');

  const parseVideoId = value => {
    if (!value) {
      return '';
    }

    try {
      const parsedUrl = new URL(value, window.location.href);

      if (parsedUrl.hostname.includes('youtu.be')) {
        return parsedUrl.pathname.split('/').filter(Boolean)[0] || '';
      }

      if (parsedUrl.pathname === '/watch') {
        return parsedUrl.searchParams.get('v') || '';
      }

      if (parsedUrl.pathname.startsWith('/embed/')) {
        return parsedUrl.pathname.split('/')[2] || '';
      }

      return parsedUrl.searchParams.get('v') || value;
    } catch {
      return value;
    }
  };

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
    const percent = Math.min(
        1000,
        Math.max(
            0,
            (seconds / safeDuration) * 1000
        )
    );
    progress.value = percent;
    progress.style.setProperty('--progress', `${percent / 10}%`);
    currentTimeEl.textContent = formatTime(seconds);
  };

  const resetPlayerState = () => {
    playerReady = false;
    pendingPlay = false;
    trackDuration = 0;
    progress.disabled = true;
    toggle.disabled = true;
    progress.value = '0';
    progress.style.setProperty('--progress', '0%');
    currentTimeEl.textContent = '0:00';
    durationTimeEl.textContent = '--:--';
    icon.textContent = '▶';
    toggle.setAttribute('aria-pressed', 'false');
  };

  const updateTrackMetadata = () => {
      const title = titleEl.textContent.trim();
      const artist = artistEl.textContent.trim();

      playerRoot.setAttribute(
          'aria-label',
          `${title} by ${artist}`
      );

      toggle.setAttribute(
          'aria-label',
          `Play ${title}`
      );
  };

  const stopTick = () => {
    if (tickTimer) {
      window.clearInterval(tickTimer);
      tickTimer = null;
    }
  };

  const destroyPlayer = () => {
    stopTick();

    if (ytPlayer && typeof ytPlayer.destroy === 'function') {
      ytPlayer.destroy();
    }

    ytPlayer = null;
    resetPlayerState();
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

  const loadTrack = async () => {
    const videoUrl = resolveVideoUrl();
    const videoId = parseVideoId(videoUrl);
    const token = ++loadToken;

    if (!videoUrl || !videoId) {
      destroyPlayer();
      return;
    }

    destroyPlayer();
    updateProgress(0);

    await loadYouTubeIframeAPI();

    if (token !== loadToken) {
      return;
    }

    updateTrackMetadata();

    ytPlayer = new window.YT.Player(host.id, {
      height: '100%',
      width: '100%',
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
          if (token !== loadToken) {
            event.target.destroy();
            return;
          }

          ytPlayer = event.target;
          playerReady = true;
          trackDuration = ytPlayer.getDuration();
          if (!trackDuration) {
              setTimeout(() => {
                  trackDuration = ytPlayer.getDuration() || 0;
                  durationTimeEl.textContent = formatTime(trackDuration);
              }, 500);
          }
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
            toggle.setAttribute('aria-label', `Pause ${titleEl.textContent}`);
            startTick();
            return;
          }

          icon.textContent = '▶';
          toggle.setAttribute('aria-pressed', 'false');
          toggle.setAttribute('aria-label', `Play ${titleEl.textContent}`);
          stopTick();

          if (event.data === YT.PlayerState.ENDED) {
            updateProgress(0);
          }
        }
      }
    });
  };

  loadTrack();

  const observer = new MutationObserver(mutations => {
    if (mutations.some(mutation => mutation.attributeName === 'data-youtube-url' || mutation.attributeName === 'data-youtube-id')) {
      loadTrack();
    }
  });

  observer.observe(playerRoot, {
    attributes: true,
    attributeFilter: ['data-youtube-url', 'data-youtube-id']
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

function syncClassifiedLinkLabel(state = getAuthState()) {
  const classifiedLink = getNotesNavLink();

  if (!classifiedLink) {
    return;
  }

  classifiedLink.textContent = state.unlocked ? 'Notes' : '[CONFIDENTIAL]';
  classifiedLink.setAttribute('aria-label', state.unlocked ? 'Open notes page' : 'Open confidential terminal');
  classifiedLink.setAttribute('href', state.unlocked ? getNotesIndexHref(state) : '#');
  classifiedLink.classList.toggle('classified-link', !state.unlocked);

  if (state.unlocked && (state.isNotesIndex || state.isNotePage)) {
    classifiedLink.setAttribute('aria-current', 'page');
  } else {
    classifiedLink.removeAttribute('aria-current');
  }
}

function setupDemoVideoModal() {
  const modal = document.getElementById('demo-video-modal');
  const iframe = document.getElementById('demo-video-iframe');
  const closeButton = document.querySelector('[data-demo-close]');
  const triggers = document.querySelectorAll('[data-demo-video]');

  if (!modal || !iframe || !closeButton || !triggers.length) {
    return;
  }

  const getEmbedUrl = rawUrl => {
    if (!rawUrl) {
      return '';
    }

    if (rawUrl.includes('/embed/')) {
      return rawUrl;
    }

    try {
      const parsed = new URL(rawUrl);
      const videoId = parsed.searchParams.get('v');

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&playsinline=1`;
      }

      if (parsed.hostname.includes('youtu.be')) {
        const shortId = parsed.pathname.split('/').filter(Boolean)[0];
        if (shortId) {
          return `https://www.youtube.com/embed/${shortId}?autoplay=1&mute=1&rel=0&playsinline=1`;
        }
      }
    } catch {
      // Ignore malformed URLs and fall through to the raw source below.
    }

    return rawUrl;
  };

  const closeDemoModal = () => {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    iframe.src = '';
    document.body.style.overflow = '';
  };

  const openDemoModal = rawUrl => {
    const embedUrl = getEmbedUrl(rawUrl);

    if (!embedUrl) {
      return;
    }

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    iframe.src = embedUrl;
    document.body.style.overflow = 'hidden';
  };

  triggers.forEach(button => {
    button.addEventListener('click', () => {
      openDemoModal(button.dataset.demoVideo || '');
    });
  });

  closeButton.addEventListener('click', closeDemoModal);

  modal.addEventListener('click', event => {
    if (event.target === modal) {
      closeDemoModal();
    }
  });

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeDemoModal();
    }
  });
}
