document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('nav a');
  const navbar = document.querySelector('nav');
  const sectionParam = new URLSearchParams(window.location.search).get('section');

  navLinks.forEach(link => {
    link.addEventListener('click', event => {
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
