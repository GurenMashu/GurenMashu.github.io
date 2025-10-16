document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.getElementById('navbar');

    // Mobile Menu Toggle (guard against missing elements)
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Close menu when a link is clicked
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            });
        });
    }

    // Navbar background change on scroll
    // Throttle using requestAnimationFrame for smoother performance
    if (navbar) {
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    try {
                        if (window.scrollY > 50) {
                            navbar.style.backgroundColor = 'rgba(28, 32, 49, 0.95)';
                            navbar.style.backdropFilter = 'blur(10px)';
                        } else {
                            navbar.style.backgroundColor = 'var(--color-dark-navy)';
                            navbar.style.backdropFilter = 'none';
                        }
                    } catch (e) {
                        // If styling fails (e.g., in very old browsers), silently ignore
                        // but do not rethrow to avoid breaking other scripts.
                        // eslint-disable-next-line no-console
                        console.warn('Navbar scroll handler error:', e);
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
    }
});