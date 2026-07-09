document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('nav a');
  const navbar = document.querySelector('nav'); 

  navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();

      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        
        const extraPadding = 45; 

        const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;

        const offsetPosition = elementPosition - navbarHeight - extraPadding;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});