// Общие функции
const debounce = (func, delay = 100) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};
const toggleClass = (element, className, condition) => {
  condition ? element.classList.add(className) : element.classList.remove(className);
};

// GSAP 
gsap.registerPlugin(ScrollTrigger);

function initBenefitsAnimation() {
  const benefitsSection = document.querySelector("#benefits");
  if (!benefitsSection) return;

  const pinWrap = benefitsSection.querySelector(".pin-wrap");
  const cardImages = benefitsSection.querySelectorAll(".benefits-card__img");

  // Анимация для всего блока (горизонтальный параллакс)
  gsap.to(pinWrap, {
    x: "-35%", // Сдвигаем блок влево на 35%
    ease: "none",
    scrollTrigger: {
      trigger: benefitsSection,
      start: "top 12%",
      end: "+=2000", // Увеличиваем область прокрутки для анимации
      scrub: 1, 
      pin: true,
      markers: false
    }
  });

  // Анимация для иконок (сдвиг вправо для создания глубины)
  cardImages.forEach((img) => {
    gsap.fromTo(img,
      { x: 0 },
      {
        x: 30,
        ease: "none",
        scrollTrigger: {
          trigger: img,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
        }
      }
    );
  });
}

// Работа с куки

function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + value + "; path=/" + expires;
}

function getCookie(name) {
  let nameEQ = name + "=";
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

if (!getCookie("preloader_status")) {
  const preloader = document.querySelector('.preloader');
  if(preloader) {
    preloader.classList.add('active');
    setCookie("preloader_status", "1", 1);
  }

} else {
  const preloader = document.querySelector('.preloader');

  if (preloader) {
    preloader.style.opacity = 0;
    preloader.style.zIndex = -1;
  }
}

window.addEventListener("load", function () {
  const lang = document.documentElement.lang || 'en';
  const header = document.querySelector("header");
  const isDesktop = window.innerWidth >= 981;
  
  // Обработчик скролла
  const handleScroll = () => {
    toggleClass(header, "scroll", window.scrollY > 0);
  };

  handleScroll();

  // socials

  const socials = document.querySelector('.hero__socials');

  if(socials) {
    socials.addEventListener('click', () => {
      socials.classList.toggle('active');
    })
  }

  // Menu
  const link = document.querySelector(".header__burger");
  const menu = document.querySelector(".header__nav");
  
  if (menu) {
    link.addEventListener("click", () => {
      link.classList.toggle("active");
      menu.classList.toggle("open");
    });
  }

  // Password
  document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', () => {
      const label = button.closest('label');
      const input = label.querySelector('input');
      const isPassword = input.type === 'password';
      
      input.type = isPassword ? 'text' : 'password';
      button.classList.toggle('visible', isPassword);
    });
  });

  // Phone
  [].forEach.call( document.querySelectorAll('input[type="tel"]'), function(input) {
    var keyCode;
    function mask(event) {
        event.keyCode && (keyCode = event.keyCode);
        var pos = this.selectionStart;
        if (pos < 3) event.preventDefault();
        var matrix = "+7 (___) ___ ____",
            i = 0,
            def = matrix.replace(/\D/g, ""),
            val = this.value.replace(/\D/g, ""),
            new_value = matrix.replace(/[_\d]/g, function(a) {
                return i < val.length ? val.charAt(i++) || def.charAt(i) : a
            });
        i = new_value.indexOf("_");
        if (i != -1) {
            i < 5 && (i = 3);
            new_value = new_value.slice(0, i)
        }
        var reg = matrix.substring(0, this.value.length).replace(/_+/g,
            function(a) {
                return "\\d{1," + a.length + "}"
            }).replace(/[+()]/g, "\\$&");
        reg = new RegExp("^" + reg + "$");
        if (!reg.test(this.value) || this.value.length < 5 || keyCode > 47 && keyCode < 58) this.value = new_value;
        if (event.type == "blur" && this.value.length < 5)  this.value = ""
    }

    input.addEventListener("input", mask, false);
    input.addEventListener("focus", mask, false);
    input.addEventListener("blur", mask, false);
    input.addEventListener("keydown", mask, false);
  });


  // Валидация формы
  const cabinetForm = document.querySelector('.cabinet__form');

  if(cabinetForm) {
    const saveBtn = cabinetForm.querySelector('.cabinet__button.save');
    const cancelBtn = cabinetForm.querySelector('.cabinet__button.cancel');
    const modalBtn = cabinetForm.querySelector('.modal__button');
    const inputs = Array.from(cabinetForm.querySelectorAll('input'));
    const initialValues = new Map(inputs.map(input => [input.id, input.value]));

    const validatePassword = (password) => {
      return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?-]).{8,}$/.test(password);
    };

    const checkLengthMismatch = (inputElement) => {
      if (inputElement.type !== 'text') return '';
      const valueLength = inputElement.value.trim().length;
      return valueLength < inputElement.minLength 
        ? `${inputElement.dataset.errorMessage} ${inputElement.minLength}`
        : '';
    };

    const toggleErrorSpan = (inputElement, errorMessage = '') => {
      const errorElement = document.querySelector(`#${inputElement.id}-error`);
      toggleClass(inputElement, 'invalid', !!errorMessage);
      toggleClass(errorElement, 'invalid', !!errorMessage);
      errorElement.textContent = errorMessage;
    };

    const checkInputValidity = (inputElement) => {
      if (inputElement.id === 'sum') {
        const rawValue = inputElement.value.replace(/\s/g, '');
        const numericValue = parseInt(rawValue, 10);
        const minValue = parseInt(inputElement.dataset.min, 10);
        
        inputElement.setCustomValidity(
          isNaN(numericValue) || numericValue < minValue 
            ? inputElement.dataset.errorMessage 
            : ''
        );
      } 
      else if (inputElement.validity.patternMismatch) {
        inputElement.setCustomValidity(inputElement.dataset.errorMessage);
      } 
      else {
        inputElement.setCustomValidity(checkLengthMismatch(inputElement));
      }

      // Проверки паролей
      const passwordOld = document.getElementById('password-old');
      const passwordNew = document.getElementById('password-new');
      const passwordRepeat = document.getElementById('password-repeat');

      if (inputElement.id === 'password-old' && !validatePassword(inputElement.value)) {
        inputElement.setCustomValidity(inputElement.dataset.errorMessage);
      }
      
      if (inputElement.id === 'password-new') {
        if (!validatePassword(inputElement.value)) {
          inputElement.setCustomValidity(inputElement.dataset.errorMessage);
        } else if (inputElement.value === passwordOld?.value) {
          inputElement.setCustomValidity(inputElement.dataset.errorMessage);
        } else {
          inputElement.setCustomValidity('');
        }
      }

      if (inputElement.id === 'password-repeat' && inputElement.value !== passwordNew?.value) {
        inputElement.setCustomValidity(inputElement.dataset.errorMessage);
      }

      toggleErrorSpan(inputElement, inputElement.validationMessage);
    };

    const hasInvalidInput = () => inputs.some(input => !input.validity.valid);
    const isFormChanged = () => inputs.some(input => input.value !== initialValues.get(input.id));

    const toggleButton = () => {
      const changed = isFormChanged();
      if (cancelBtn) cancelBtn.disabled = !changed;
      if (saveBtn) saveBtn.disabled = !changed || hasInvalidInput();
      if (modalBtn) modalBtn.disabled = !changed || hasInvalidInput();
    };

    const formError = () => {
      inputs.forEach(input => {
        toggleClass(input, 'invalid', input.required && input.value.trim() === '');
      });
    };

    // Инициализация валидации
    cabinetForm.addEventListener('submit', (e) => {
      if (hasInvalidInput()) {
        e.preventDefault();
        formError();
      } else if (!cabinetForm.classList.contains('modal__form')) {
        e.preventDefault();
        inputs.forEach(input => initialValues.set(input.id, input.value));
        toggleButton();
      } else {
        toggleButton();
      }
    });

    inputs.forEach(input => {
      input.addEventListener('input', () => {
        checkInputValidity(input);
        toggleButton();
      });
    });

    if (cancelBtn) {
      cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        inputs.forEach(input => {
          input.value = initialValues.get(input.id);
          toggleErrorSpan(input);
        });
        toggleButton();
      });
    }
  }

  // Анимации
  const { animate } = Motion;
  const animateElements = (selector, props, options) => {
    document.querySelectorAll(selector).forEach(el => {
      animate(el, props, {
        duration: 1,
        delay: parseFloat(el.dataset.delay || "0"),
        easing: "ease-out",
        ...options
      });
    });
  };

  animateElements(".fade-in", { 
    opacity: [0, 1], 
    transform: ["translateY(50px)", "translateY(0)"] 
  });

  animateElements(".fade-down", { 
    opacity: [0, 1], 
    transform: ["translateY(-50px)", "translateY(0)"] 
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target, { 
          opacity: 1, 
          transform: "translateY(0)" 
        }, { 
          duration: 0.8, 
          easing: "ease-out" 
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll(".scroll-fade-in").forEach(observer.observe.bind(observer));

  // Календарь
  document.querySelectorAll(".calendar__date").forEach(el => {
    if (!el.dataset.width) return;
    
    el.style.width = '0%';
    animate(el, { 
      width: `${el.dataset.width}%` 
    }, { 
      duration: 1, 
      delay: 0.3, 
      easing: 'linear' 
    });
  });

  // Формы
  document.querySelector('.search-form')?.addEventListener('submit', e => e.preventDefault());

  // Фильтры
  const Filterform = document.getElementById("form-filter");
  const resetBtn = document.querySelector(".filter__reset");

  document.querySelectorAll(".filter__heading .button").forEach(clearBtn => {
    clearBtn.addEventListener("click", () => {
      const filterRow = clearBtn.closest(".filter__row");
      
      filterRow.querySelectorAll("input").forEach(input => input.value = "");
      filterRow.querySelectorAll("select").forEach(select => select.selectedIndex = 0);
    });
  });

  resetBtn?.addEventListener("click", () => Filterform.reset());

  // Поиск по таблице
  const search = document.querySelector('#search');
  const searchTable = document.querySelector('.table-search');

  if(search && searchTable) {
    const filterTable = debounce(() => {
      const filter = search.value.toUpperCase();
      const rows = searchTable.querySelectorAll('.table__body .table__row');
      
      rows.forEach(row => {
        const cells = row.getElementsByTagName("div");
        const match = Array.from(cells).some(cell => 
          cell.textContent.toUpperCase().includes(filter)
        );
        
        toggleClass(row, "hide", !match);
      });
    });

    search.addEventListener("input", filterTable);
  }

  // Поиск услуг

  const searchInput = document.getElementById('services-search');
  const servicesCards = document.querySelectorAll('.services-page__card');

  if(searchInput && servicesCards) {
    searchInput.addEventListener('input', debounce(function () {
      const query = searchInput.value.trim().toLowerCase();

      servicesCards.forEach(card => {
        const text = card.querySelector('.services-card__txt').textContent.toLowerCase();
        if (text.includes(query)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }, 300));
  }

  // Показать еще
  const showMore = document.querySelector('.cabinet__button.show');
  const ShowPerClick = 2;

  if(showMore) {
    showMore.addEventListener('click', function () {
      const rows = document.querySelectorAll('.cabinet__wrap .hidden');
      
      if (rows.length === 0) {
        showMore.style.display = 'none';
        return;
      }

      Array.from(rows)
        .slice(0, ShowPerClick)
        .forEach(row => row.classList.remove('hidden'));
        
      if (!document.querySelector('.cabinet__wrap .hidden')) {
        showMore.style.display = 'none';
      }
    });
  }

  // Количество материалов
  const materialsRows = document.querySelectorAll('.table-materials .table__row');
  const totalAmount = document.querySelector('.cabinet__amount span');

  if(materialsRows) {
    const updateTotal = () => {
      let sum = 0;
      
      materialsRows.forEach(row => {
        const countEl = row.querySelector('.table__quantity span');
        const count = parseInt(countEl.textContent, 10);
        sum += count;
        toggleClass(row, 'active', count > 0);
      });

      if(totalAmount) totalAmount.textContent = sum;
    };

    materialsRows.forEach(row => {
      const minusBtn = row.querySelector('.button.minus');
      const plusBtn = row.querySelector('.button.plus');
      const countEl = row.querySelector('.table__quantity span');

      const updateCount = (change) => {
        let value = parseInt(countEl.textContent, 10) + change;
        if (value >= 0) {
          countEl.textContent = value;
          updateTotal();
        }
      };

      minusBtn.addEventListener('click', () => updateCount(-1));
      plusBtn.addEventListener('click', () => updateCount(1));
    });
    
    updateTotal();
  }

  // Date pickers
  const locales = {
    en: flatpickr.l10ns.default,
    ru: flatpickr.l10ns.ru,
    kk: flatpickr.l10ns.kk
  };

  const locale = locales[lang] || flatpickr.l10ns.default;

  const date = flatpickr(".date", {
    dateFormat: "d-m-Y",
    locale: locale,
    maxDate: "today"
  });

  const fromPicker = flatpickr(".fromDate", {
    dateFormat: "d-m-Y",
    locale: locale,
    maxDate: "today",
    onChange: (selectedDates) => toPicker.set("minDate", selectedDates[0])
  });

  const toPicker = flatpickr(".toDate", {
    dateFormat: "d-m-Y",
    locale: locale,
    maxDate: "today",
    onChange: (selectedDates) => fromPicker.set("maxDate", selectedDates[0])
  });

  // Фильтр
  const filterToggleBtn = document.querySelector('.cabinet__btn-filter');
  const filterBlock = document.querySelector('.cabinet__filter');
  const filterCloseBtn = document.querySelector('.filter__close');
  const cabinetTable = document.querySelector('.cabinet__table');

  if (filterToggleBtn && filterBlock && cabinetTable) {
    filterToggleBtn.addEventListener('click', () => {
      filterBlock.classList.toggle('active');
      cabinetTable.style.zIndex = filterBlock.classList.contains('active') ? '-1' : '0';
    });

    filterCloseBtn?.addEventListener('click', () => {
      filterBlock.classList.remove('active');
      setTimeout(() => cabinetTable.style.zIndex = '0', 300);
    });
  }

  // Аккордеон
  document.querySelectorAll('.accordion__row').forEach(row => {
    const head = row.querySelector('.accordion__head');
    const body = row.querySelector('.accordion__body');
    
    head.addEventListener('click', function(e) {
      if (e.target.closest('.accordion__download')) return;
      
      document.querySelectorAll('.accordion__row').forEach(otherRow => {
        if (otherRow !== row) {
          otherRow.classList.remove('active');
          otherRow.querySelector('.accordion__body').style.maxHeight = '0';
          otherRow.querySelector('.accordion__body').style.opacity = '0';
        }
      });
      
      if (row.classList.contains('active')) {
        row.classList.remove('active');
        body.style.maxHeight = '0';
        body.style.opacity = '0';
      } else {
        row.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
        body.style.opacity = '1';
      }
    });
  });

  // Swipers
  const swipers = {
    heroSwiper: {
      direction: "vertical",
      spaceBetween: 16,
      loop: true,
      autoplay: { 
        delay: 2500, 
        disableOnInteraction: false 
      },
      pagination: { 
        el: ".hero-pagination" 
      },
      breakpoints: { 
        981: { 
          spaceBetween: 20 
        } 
      }
    },
    priceSwiper: {
      direction: 'horizontal',
      slidesPerView: 1.1,
      spaceBetween: 16,
      autoplay: { 
        delay: 3000, 
        disableOnInteraction: false 
      },
      breakpoints: { 
        981: { 
          slidesPerView: 4, 
          spaceBetween: 24 
        } 
      }
    },
    newsSwiper: {
      direction: 'horizontal',
      slidesPerView: 1.1,
      spaceBetween: 16,
      loop: true,
      autoplay: { 
        delay: 3500, 
        disableOnInteraction: false 
      },
      breakpoints: { 
        981: { 
          slidesPerView: 2.8, 
          spaceBetween: 20 
        } 
      }
    },
    teamsSwiper: {
      slidesPerView: 1,
      spaceBetween: 20,
      // loop: true,
      initialSlide: 2,
      autoplay: { 
        delay: 3000, 
        disableOnInteraction: false 
      },
      pagination: {
        el: ".teams-pagination",
      },
    }
  };

  Object.entries(swipers).forEach(([key, config]) => {
    const el = document.querySelector(`.${key}`);
    if (el) new Swiper(el, config);
  });

  const tabs = document.querySelector('.history-buttons .swiper-wrapper');

  const tabButtons = new Swiper('.history-buttons', {
    slidesPerView: 4,
    breakpoints: { 
      981: { 
        slidesPerView: 11,
      } 
    }
  });

  if(tabs) {
    tabs.addEventListener('click', (event) => {
      const target = event.target.closest('.swiper-slide');
      if (target && !target.classList.contains('active-tab')) {
        const activeTab = tabs.querySelector('.active-tab');
        if (activeTab) activeTab.classList.remove('active-tab');
        target.classList.add('active-tab');

        const index = Array.from(tabs.children).indexOf(target);
        tabContent.slideTo(index);
      }
    });
  }

  const tabContent = new Swiper('.history-content', {
    slidesPerView: 1,
  });

  tabContent.on('slideChange', () => {
    const previous = tabs.querySelector('.active-tab');
    if (previous) previous.classList.remove('active-tab');

    const newActive = tabs.children[tabContent.activeIndex];
    if (newActive) newActive.classList.add('active-tab');
  });

  // about tabs

  function initAboutTabs() {
    document.querySelectorAll("[data-about]").forEach(container => {
        if (container.dataset.about === "initilized") return;

        const buttons = Array.from(container.querySelectorAll("[data-about-button]"));
        const panes = Array.from(container.querySelectorAll("[data-about-pane]"));
        const select = container.querySelector("[data-about-select]");

        let activeButton = buttons.find(btn => btn.classList.contains("active")) || buttons[Math.floor(buttons.length / 2)];
        let activeKey = activeButton?.dataset.aboutButton;
        let activePane = panes.find(pane => pane.dataset.aboutPane === activeKey);

        function activateAbout(key) {
            const newButton = buttons.find(btn => btn.dataset.aboutButton === key);
            const newPane = panes.find(pane => pane.dataset.aboutPane === key);

            activeButton?.classList.remove("active");
            newButton.classList.add("active");
            activeButton = newButton;

            activePane?.classList.remove("active");
            newPane.classList.add("active");
            activePane = newPane;
        }

        buttons.forEach(btn => {
            btn.addEventListener("click", () => activateAbout(btn.dataset.aboutButton));
        });

        if (select) {
          select.addEventListener("change", () => {
              activateAbout(select.value);
          });
        }

        container.dataset.about = "initilized";
    });
  }

  initAboutTabs();

  // GSAP 

  if (isDesktop) {
    initBenefitsAnimation();
  } else {
    new Swiper(".benefitsSwiper", {
      pagination: {
        el: ".benefits-pagination",
      },
    });
  }

  const scrollTriggerConfig = {
    start: "top bottom",
    end: "bottom 20%",
    anticipatePin: 1,
    toggleActions: "play none none reverse",
  };

  gsap.utils.toArray(".up").forEach(element => {
    gsap.fromTo(element,
      { yPercent: 60, opacity: 0 },
      {
        duration: 1.2,
        opacity: 1,
        yPercent: 0,
        ease: "power2.out",
        scrollTrigger: { trigger: element, ...scrollTriggerConfig }
      }
    );
  });
  
  // Animation

  const images = document.querySelectorAll('.anim-img');

  const imgObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        imgObserver.unobserve(entry.target); // однократное срабатывание
      }
    });
  }, { threshold: 0.5 });

  images.forEach(img => imgObserver.observe(img));

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.section-hidden').forEach(el => revealObserver.observe(el));
  document.querySelectorAll('.services-page').forEach(el => revealObserver.observe(el));

  // Service scroll

  const links = document.querySelectorAll('.services-page__list a');
  const groups = document.querySelectorAll('.services-page__group');
  const headerOffset = header.offsetHeight;


  function setActiveLink(activeLink) {
    links.forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
  }

  function serviceScroll() {
    const scrollY = window.scrollY + headerOffset;

    groups.forEach(group => {
      const top = group.offsetTop;
      const height = group.offsetHeight;

      if (scrollY >= top && scrollY < top + height) {
        const id = group.getAttribute('id');
        const activeLink = document.querySelector(`.services-page__list a[href="#${id}"]`);
        if (activeLink) setActiveLink(activeLink);
      }
    });
  }

  // Modal

  function hideModal(modal) {
    modal.addEventListener('click', function(e) {
      const target = e.target;
      if (
        target.classList.contains("modal__close") ||
        target.classList.contains("modals") ||
        target.classList.contains("close")
      ) {
        modal.style.transition = "opacity 0.4s";
        modal.style.opacity = "0";
        setTimeout(() => {
          modal.style.display = "none";
        }, 400);
      }
    });
  }

  function showModal(modal) {
    modal.style.display = "flex";
    setTimeout(() => {
      modal.style.transition = "opacity 0.4s";
      modal.style.opacity = "1";
    }, 10);
  } 

  let modals = document.querySelector('.modals')
  let modalAll = document.querySelectorAll('.modal')
  let modalBtns = document.querySelectorAll(".modal-btn");

  if(modals && modalBtns){
    hideModal(modals);
    modalBtns.forEach( btn => {
      btn.addEventListener('click', () => {
        showModal(modals)
        let typeBtn = btn.dataset.type;
        modalAll.forEach( modal => {
          let typeModal = modal.dataset.type;
          modal.style.display = 'none'
          if(typeBtn == typeModal) {
            modal.style.display = 'block'
          }
        });
      })
    })
  }

  // Глобальные обработчики
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".header__nav") && !e.target.closest(".header__burger") && !e.target.closest(".header__search")) {
      link?.classList.remove("active");
      menu?.classList.remove("open");
    }
  });

  let ticking = false;
  window.addEventListener("scroll", () => {
    handleScroll();
    if (menu?.classList.contains("open")) {
      link?.classList.remove("active");
      menu?.classList.remove("open");
    }
    if (!ticking) {
      window.requestAnimationFrame(() => {
        serviceScroll();
        ticking = false;
      });
      ticking = true;
    }
  });
});