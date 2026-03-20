/* ============================================
   VISUAL EDGE BY NOR — Interactive Features
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Page Loader ──
  const loader = document.getElementById('loader');
  const loaderFlash = document.getElementById('loaderFlash');
  
  function dismissLoader() {
    // Trigger shutter flash
    if (loaderFlash) loaderFlash.classList.add('flash');
    setTimeout(() => loader.classList.add('hidden'), 400);
  }
  
  window.addEventListener('load', () => {
    setTimeout(dismissLoader, 3200);
  });
  // Fallback: hide loader after 5s regardless
  setTimeout(dismissLoader, 5000);


  // ── Hero Particles ──
  const particleContainer = document.getElementById('heroParticles');
  function createParticles() {
    const count = window.innerWidth < 768 ? 20 : 40;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      particle.style.left = Math.random() * 100 + '%';
      particle.style.width = (Math.random() * 3 + 1) + 'px';
      particle.style.height = particle.style.width;
      particle.style.animationDuration = (Math.random() * 8 + 6) + 's';
      particle.style.animationDelay = (Math.random() * 6) + 's';
      particle.style.opacity = Math.random() * 0.6 + 0.1;
      particleContainer.appendChild(particle);
    }
  }
  createParticles();


  // ── Navbar ──
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    // Add/remove scrolled class
    navbar.classList.toggle('scrolled', scrollY > 50);
    
    // Hide/show on scroll direction
    if (scrollY > lastScroll && scrollY > 300) {
      navbar.classList.add('hidden');
    } else {
      navbar.classList.remove('hidden');
    }
    lastScroll = scrollY;

    // Active nav link highlighting
    updateActiveNavLink();
  });

  // Mobile menu toggle
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Active nav link
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    let currentSection = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      if (window.scrollY >= sectionTop) {
        currentSection = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentSection);
    });
  }


  // ── Scroll Reveal (Intersection Observer) ──
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));


  // ── Counter Animation ──
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        animateCounter(el, target);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => counterObserver.observe(el));

  function animateCounter(el, target) {
    const duration = 2000;
    const start = performance.now();
    
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quint
      const eased = 1 - Math.pow(1 - progress, 5);
      el.textContent = Math.floor(target * eased) + '+';
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }


  // ── Gallery Filtering ──
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      galleryItems.forEach((item, i) => {
        const category = item.dataset.category;
        const shouldShow = filter === 'all' || category === filter;
        
        if (shouldShow) {
          item.classList.remove('hidden-item');
          item.style.animation = `fadeIn 0.5s ${i * 0.03}s ease forwards`;
        } else {
          item.classList.add('hidden-item');
        }
      });
    });
  });


  // ── Lightbox ──
  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightboxContent');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentLightboxItems = [];
  let currentLightboxIndex = 0;

  function getVisibleGalleryItems() {
    return Array.from(galleryItems).filter(item => !item.classList.contains('hidden-item'));
  }

  function openLightbox(index) {
    currentLightboxItems = getVisibleGalleryItems();
    currentLightboxIndex = index;
    updateLightboxContent();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    // Stop any playing videos
    const video = lightboxContent.querySelector('video');
    if (video) video.pause();
  }

  function updateLightboxContent() {
    const item = currentLightboxItems[currentLightboxIndex];
    const src = item.dataset.src;
    const type = item.dataset.type;
    const caption = item.querySelector('h4')?.textContent || '';
    const category = item.querySelector('.gallery-overlay span')?.textContent || '';

    lightboxContent.innerHTML = '';
    
    if (type === 'video') {
      const video = document.createElement('video');
      video.src = src;
      video.controls = true;
      video.autoplay = true;
      video.style.maxWidth = '90vw';
      video.style.maxHeight = '85vh';
      video.style.borderRadius = '8px';
      lightboxContent.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = src;
      img.alt = caption;
      lightboxContent.appendChild(img);
    }

    lightboxCaption.textContent = `${caption} — ${category}`;
  }

  function nextLightbox() {
    currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxItems.length;
    updateLightboxContent();
  }

  function prevLightbox() {
    currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxItems.length) % currentLightboxItems.length;
    updateLightboxContent();
  }

  // Gallery item click
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const visibleItems = getVisibleGalleryItems();
      const index = visibleItems.indexOf(item);
      if (index >= 0) openLightbox(index);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', prevLightbox);
  lightboxNext.addEventListener('click', nextLightbox);

  // Close on background click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextLightbox();
    if (e.key === 'ArrowLeft') prevLightbox();
  });


  // ── Back to Top ──
  const backToTop = document.getElementById('backToTop');
  
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 600);
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  // ── Contact Form ──
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value.trim() || 'Portfolio Inquiry';
      const message = document.getElementById('message').value.trim();
      
      const body = `Hi, I'm ${name} (${email}).\n\n${message}`;
      const mailtoLink = `mailto:75nandun@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      window.location.href = mailtoLink;
      
      const btn = contactForm.querySelector('.btn');
      const originalText = btn.textContent;
      btn.textContent = '✓ Opening Email...';
      btn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        contactForm.reset();
      }, 3000);
    });
  }


  // ── Smooth Scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 80;
        window.scrollTo({
          top: target.offsetTop - offset,
          behavior: 'smooth'
        });
      }
    });
  });


  // ── CSS Keyframes (injected for gallery animation) ──
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
  `;
  document.head.appendChild(style);

});
