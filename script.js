(function () {
  'use strict';

  const header = document.getElementById('header');
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const stickyCta = document.getElementById('stickyCta');
  const hero = document.getElementById('hero');
  const contactForm = document.getElementById('contactForm');
  const contactSubmit = document.getElementById('contactSubmit');
  const contactMessage = document.getElementById('contactMessage');
  const gasEndpoint = 'https://script.google.com/macros/s/AKfycbxuKLC9J76qXCRXSJg4o-bOqfrqQpmeG_OCu2gVFmtF2d8m6eU-aHUS6HJNnhe9yUaf/exec';

  // ヘッダースクロール効果
  function handleScroll() {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }

    // モバイル固定CTA：ヒーローを過ぎたら表示
    if (stickyCta && hero) {
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      if (scrollY > heroBottom - 100) {
        stickyCta.classList.add('visible');
      } else {
        stickyCta.classList.remove('visible');
      }
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // モバイルメニュー
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      const isOpen = menuBtn.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      menuBtn.setAttribute('aria-expanded', isOpen);
      mobileMenu.setAttribute('aria-hidden', !isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menuBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  // スムーススクロール（アンカーリンク）
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // スクロールアニメーション（Intersection Observer）
  const revealElements = document.querySelectorAll(
    '.problem-card, .feature-card, .ba-card, .mission, .faq__item, .story__inner, .community__inner, .compare-table-wrap, .contact-form'
  );

  revealElements.forEach(function (el) {
    el.classList.add('reveal');
  });

  if ('IntersectionObserver' in window) {
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
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // Contact form submission to Google Apps Script.
  if (contactForm && contactSubmit && contactMessage) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!gasEndpoint || gasEndpoint === 'YOUR_GAS_WEB_APP_URL') {
        showContactMessage('送信先URLが未設定です。GASのウェブアプリURLを script.js に設定してください。', 'error');
        return;
      }

      const formData = new FormData(contactForm);
      if (formData.get('website')) {
        return;
      }

      const payload = {
        name: String(formData.get('name') || '').trim(),
        email: String(formData.get('email') || '').trim(),
        phone: String(formData.get('phone') || '').trim(),
        inquiryType: String(formData.get('inquiryType') || '').trim(),
        message: String(formData.get('message') || '').trim(),
        pageUrl: window.location.href,
        userAgent: window.navigator.userAgent,
        submittedAt: new Date().toISOString()
      };

      if (!payload.name || !payload.email || !payload.inquiryType || !payload.message) {
        showContactMessage('必須項目を入力してください。', 'error');
        return;
      }

      contactSubmit.disabled = true;
      contactSubmit.querySelector('span').textContent = '送信中...';
      showContactMessage('', '');

      const params = new URLSearchParams();

      params.append('name', payload.name);
      params.append('email', payload.email);
      params.append('phone', payload.phone);
      params.append('inquiryType', payload.inquiryType);
      params.append('message', payload.message);
      params.append('pageUrl', payload.pageUrl);
      params.append('userAgent', payload.userAgent);
      params.append('submittedAt', payload.submittedAt);

      fetch(gasEndpoint, {
      method: 'POST',
      body: params
      })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('送信失敗');
        }

      return response.json();
      })
      .then(function (result) {

       if (!result.ok) {
        throw new Error(result.message);
       }

        contactForm.reset();

        showContactMessage(
            '送信しました。確認後、メールにてご連絡します。',
            'success'
          );
        })
        .catch(function () {
        showContactMessage(
           '送信に失敗しました。時間をおいて再度お試しください。',
           'error'
          );
        })
        .finally(function () {
          contactSubmit.disabled = false;
          contactSubmit.querySelector('span').textContent = '送信する';
        });
        
    });
  }

  function showContactMessage(message, type) {
    contactMessage.textContent = message;
    contactMessage.classList.remove('contact-form__message--success', 'contact-form__message--error');

    if (type) {
      contactMessage.classList.add('contact-form__message--' + type);
    }
  }

  // FAQ：1つだけ開く
  const faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item && other.open) {
            other.open = false;
          }
        });
      }
    });
  });
})();
