/* ===========================
   JarinRaksa Oy – main.js
=========================== */

'use strict';

/* ===========================
   NAVBAR – scroll & hamburger
=========================== */
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

  // Scroll-tila navbarille
  function handleScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Hamburger-valikko
  function openMenu() {
    mobileMenu.hidden = false;
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Sulje valikko');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu.hidden = true;
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Avaa valikko');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    if (mobileMenu.hidden) {
      openMenu();
    } else {
      closeMenu();
    }
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', toggleMenu);

    // Sulje linkkiä klikattaessa
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Sulje Escape-näppäimellä
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !mobileMenu.hidden) {
        closeMenu();
        hamburger.focus();
      }
    });

    // Sulje kun klikataan valikon ulkopuolelle
    document.addEventListener('click', function (e) {
      if (
        !mobileMenu.hidden &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        closeMenu();
      }
    });
  }
})();

/* ===========================
   FOOTER – vuosiluku
=========================== */
(function setYear() {
  const el = document.getElementById('vuosi');
  if (el) {
    el.textContent = new Date().getFullYear();
  }
})();

/* ===========================
   SCROLL REVEAL
=========================== */
(function initReveal() {
  const elements = document.querySelectorAll(
    '.palvelu-card, .galleria-item, .step, .meista-content, .meista-deco, .lomake-info, .lomake, .fact'
  );

  if (!elements.length) return;

  // Lisää reveal-luokka elementeille
  elements.forEach(function (el) {
    el.classList.add('reveal');
  });

  // Tarkista prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    elements.forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  elements.forEach(function (el) {
    observer.observe(el);
  });
})();

/* ===========================
   YHTEYDENOTTOLOMAKE
=========================== */
(function initForm() {
  const form = document.getElementById('tarjous-form');
  if (!form) return;

  const submitBtn = form.querySelector('.btn-submit');
  const submitText = form.querySelector('.btn-submit-text');
  const submitSpinner = form.querySelector('.btn-submit-spinner');
  const successMsg = document.getElementById('form-success');
  const errorMsg = document.getElementById('form-error');

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitText.textContent = isLoading ? 'Lähetetään...' : 'Lähetä tarjouspyyntö';
    submitSpinner.hidden = !isLoading;
  }

  function showMessage(type) {
    successMsg.hidden = type !== 'success';
    errorMsg.hidden = type !== 'error';

    if (type === 'success') {
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (type === 'error') {
      errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function resetMessages() {
    successMsg.hidden = true;
    errorMsg.hidden = true;
  }

  // Kenttävalidointi
  function validateField(field) {
    const value = field.value.trim();
    let valid = true;

    if (field.required && !value) {
      valid = false;
    }

    if (field.type === 'email' && value) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      valid = emailRe.test(value);
    }

    if (field.type === 'tel' && value) {
      const telRe = /^[\d\s\+\-\(\)]{6,20}$/;
      valid = telRe.test(value);
    }

    field.setAttribute('aria-invalid', valid ? 'false' : 'true');
    field.style.borderColor = valid
      ? ''
      : 'rgba(180, 40, 40, 0.6)';

    return valid;
  }

  // Live-validointi blur-tapahtumassa
  const inputs = form.querySelectorAll('input, textarea, select');
  inputs.forEach(function (input) {
    input.addEventListener('blur', function () {
      if (input.value.trim() !== '') {
        validateField(input);
      }
    });

    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') {
        validateField(input);
      }
      resetMessages();
    });
  });

  // Lomakkeen lähetys
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    resetMessages();

    // Validoi kaikki kentät
    let formValid = true;
    inputs.forEach(function (input) {
      if (!validateField(input)) {
        formValid = false;
      }
    });

    if (!formValid) {
      // Siirrä fokus ensimmäiseen virhekenttään
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json'
        }
      });

      if (response.ok) {
        showMessage('success');
        form.reset();
        // Nollaa validointimerkit
        inputs.forEach(function (input) {
          input.setAttribute('aria-invalid', 'false');
          input.style.borderColor = '';
        });
      } else {
        const data = await response.json().catch(function () { return {}; });
        if (data && data.errors) {
          console.error('Formspree errors:', data.errors);
        }
        showMessage('error');
      }
    } catch (err) {
      console.error('Lähetysvirhe:', err);
      showMessage('error');
    } finally {
      setLoading(false);
    }
  });
})();

/* ===========================
   SMOOTH SCROLL – ankkurilinkit
=========================== */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navbarHeight = document.querySelector('.navbar')
        ? document.querySelector('.navbar').offsetHeight
        : 0;

      const targetTop =
        target.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });

      // Päivitä URL ilman sivun hyppäystä
      if (history.pushState) {
        history.pushState(null, null, targetId);
      }
    });
  });
})();

/* ===========================
   GALLERIA – hover-efekti
=========================== */
(function initGallery() {
  const items = document.querySelectorAll('.galleria-item');

  items.forEach(function (item) {
    item.addEventListener('mouseenter', function () {
      items.forEach(function (other) {
        if (other !== item) {
          other.style.opacity = '0.75';
          other.style.transition = 'opacity 0.3s ease';
        }
      });
    });

    item.addEventListener('mouseleave', function () {
      items.forEach(function (other) {
        other.style.opacity = '';
        other.style.transition = 'opacity 0.3s ease';
      });
    });
  });
})();

/* ===========================
   PROSESSI-ASKEET – stagger-animaatio
=========================== */
(function initStepAnimation() {
  const steps = document.querySelectorAll('.step');
  if (!steps.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const allSteps = document.querySelectorAll('.step');
          allSteps.forEach(function (step, index) {
            setTimeout(function () {
              step.style.opacity = '1';
              step.style.transform = 'translateY(0)';
            }, index * 120);
          });
          observer.disconnect();
        }
      });
    },
    { threshold: 0.2 }
  );

  steps.forEach(function (step) {
    step.style.opacity = '0';
    step.style.transform = 'translateY(20px)';
    step.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  if (steps[0]) {
    observer.observe(steps[0]);
  }
})();