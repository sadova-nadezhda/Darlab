window.addEventListener("load", function () {
  const header = document.querySelector("header");
  const lang = document.documentElement.lang || 'en';

  const handleScroll = () => {
    window.scrollY > 0 ? header.classList.add("scroll") : header.classList.remove("scroll");
  };

  handleScroll();

  // Menu
  let link = document.querySelector(".header__burger");
  let menu = document.querySelector(".header__nav");
  if (menu) {
    link.addEventListener(
      "click",
      function () {
        link.classList.toggle("active");
        menu.classList.toggle("open");
      },
      false
    );
  }

  // Password
  [].forEach.call( document.querySelectorAll('.toggle-password'),function(button) {
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
    const initialValues = new Map();

    startValidation()

    function startValidation() {
      cabinetForm.addEventListener('submit', (event) => {
        if (hasInvalidInput()) {
          event.preventDefault();
          formError();
        } else if (!cabinetForm.classList.contains('modal__form')) {
          event.preventDefault();
          inputs.forEach(input => {
            initialValues.set(input.id, input.value);
          });
          toggleButton();
        } else {
          toggleButton();
        }
      });
      
      inputs.forEach(input => {
        initialValues.set(input.id, input.value);
      });
      
      inputs.forEach((inputElement) => {
        inputElement.addEventListener('input', () => {
          checkInputValidity(inputElement)
          toggleButton()
        })
      })
    }

    function checkInputValidity(inputElement) {
      if (inputElement.id === 'sum') {
        const rawValue = inputElement.value.replace(/\s/g, '');
        const numericValue = parseInt(rawValue, 10);
        const minValue = parseInt(inputElement.dataset.min, 10);

        if (isNaN(numericValue) || numericValue < minValue) {
          inputElement.setCustomValidity(inputElement.dataset.errorMessage);
        } else {
          inputElement.setCustomValidity('');
        }
      } else if (inputElement.validity.patternMismatch) {
        inputElement.setCustomValidity(inputElement.dataset.errorMessage);
      } else {
        inputElement.setCustomValidity(checkLengthMismatch(inputElement));
      }

      const passwordOld = document.getElementById('password-old');
      const passwordNew = document.getElementById('password-new');
      const passwordRepeat = document.getElementById('password-repeat');

      if (inputElement.id === 'password-old') {
        if (!validatePassword(inputElement.value)) {
          inputElement.setCustomValidity(inputElement.dataset.errorMessage);
        } else {
          inputElement.setCustomValidity('');
        }
      }

      if (inputElement.id === 'password-new') {
        if (!validatePassword(inputElement.value)) {
          inputElement.setCustomValidity(inputElement.dataset.errorMessage);
        } else if (inputElement.value === passwordOld.value) {
          inputElement.setCustomValidity(inputElement.dataset.errorMessage);
        } else {
          inputElement.setCustomValidity('');
        }
      }

      // Проверка повтора пароля: должен совпадать с новым
      if (inputElement.id === 'password-repeat') {
        if (inputElement.value !== passwordNew.value) {
          inputElement.setCustomValidity(inputElement.dataset.errorMessage);
        } else {
          inputElement.setCustomValidity('');
        }
      }

      // Обновление отображения ошибок
      if (!inputElement.validity.valid) {
        toggleErrorSpan(inputElement, inputElement.validationMessage);
      } else {
        toggleErrorSpan(inputElement);
      }
    }

    function validatePassword(password) {
      // Проверяем, содержит ли пароль минимум 8 символов, цифры, буквы верхнего и нижнего регистров, а также специальные символы
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?-]).{8,}$/;
      return passwordRegex.test(password);
    }

    function checkLengthMismatch(inputElement) {
      if (inputElement.type !== 'text') {
        return ''
      }
      const valueLength = inputElement.value.trim().length
      if (valueLength < inputElement.minLength) {
        return `${inputElement.dataset.errorMessage}  ${inputElement.minLength}`
      }
      return ''
    }

    function hasInvalidInput() {
      return inputs.some((inputElement) => {
        return !inputElement.validity.valid
      })
    }

    function toggleErrorSpan(inputElement, errorMessage) {
      const errorElement = document.querySelector(`#${inputElement.id}-error`)
      if (errorMessage) {
        inputElement.classList.add('invalid');
        errorElement.classList.add('invalid');
        errorElement.textContent = errorMessage;
      } else {
        inputElement.classList.remove('invalid');
        errorElement.classList.remove('invalid');
        errorElement.textContent = '';
      }
    }

    function toggleButton() {
      const changed = isFormChanged();
      cancelBtn ? cancelBtn.disabled = !changed : false;
      saveBtn ? saveBtn.disabled = !changed || hasInvalidInput() : false;
      modalBtn ? modalBtn.disabled = !changed || hasInvalidInput() : false;
    }

    function formError() {
      // formErrorElement.textContent = formErrorElement.dataset.errorMessage;
      inputs.forEach((inputElement) => {
        if (inputElement.required && inputElement.value.trim() === '') {
          inputElement.classList.add('invalid');
        } else {
          inputElement.classList.remove('invalid');
        }
      });
    }

    function isFormChanged() {
      return inputs.some(input => input.value !== initialValues.get(input.id));
    }

    if(cancelBtn) {
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

  // Animation
  const { animate, scroll } = Motion;

  document.querySelectorAll(".fade-in").forEach((el) => {
    const delay = parseFloat(el.dataset.delay || "0");

    animate(
      el,
      { opacity: [0, 1], transform: ["translateY(50px)", "translateY(0)"] },
      { duration: 1, delay, easing: "ease-out" }
    );
  });

  document.querySelectorAll(".fade-down").forEach((el) => {
    const delay = parseFloat(el.dataset.delay || "0");

    animate(
      el,
      { opacity: [0, 1], transform: ["translateY(-50px)", "translateY(0)"] },
      { duration: 1, delay, easing: "ease-out" }
    );
  });

  document.querySelectorAll(".fade-left").forEach((el) => {
    const delay = parseFloat(el.dataset.delay || "0");

    animate(
      el,
      { opacity: [0, 1], transform: ["translateX(-50px)", "translateY(0)"] },
      { duration: 1, delay, easing: "ease-out" }
    );
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target, { opacity: 1, transform: "translateY(0)" }, { duration: 0.8, easing: "ease-out" });
        observer.unobserve(entry.target); // одноразовая анимация
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll(".scroll-animate").forEach((el) => observer.observe(el));

  // Form Search

  const searchForm = document.querySelector('.search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
    });
  }

  // Search Table
  const search = document.querySelector('#search');
  const searchTable = document.querySelector('.table-search');

  if(search && searchTable) {
    function filterTable() {
      const filter = search.value.toUpperCase();
      const rows = searchTable.querySelectorAll('.table__body .table__row');
      let visibleCount = 0;

      for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("div");
        let match = false;

        for (let j = 0; j < cells.length; j++) {
          if (cells[j].textContent.toUpperCase().includes(filter)) {
            match = true;
            break;
          }
        }

        if (match) {
          rows[i].classList.remove("hide");
          visibleCount++;
        } else {
          rows[i].classList.add("hide");
        }
      }
    }

    search.addEventListener("input", function() {
      filterTable();
    });
  }

  // Show More
  const showMore = document.querySelector('.cabinet__button.show');
  const hiddenRows = () => document.querySelectorAll('.cabinet__wrap .hidden');
  const ShowPerClick = 2;

  if(showMore && hiddenRows) {
    showMore.addEventListener('click', function () {
      const rows = hiddenRows();

      if (rows.length === 0) {
        showMore.style.display = 'none';
        return;
      }

      for (let i = 0; i < Math.min(ShowPerClick, rows.length); i++) {
        rows[i].classList.remove('hidden');
      }

      if (hiddenRows().length === 0) {
        showMore.style.display = 'none';
      }
    });
  }

  // Quantity

  const materialsRows = document.querySelectorAll('.table-materials .table__row');
  const totalAmount = document.querySelector('.cabinet__amount span');

  const updateTotal = () => {
    let sum = 0;
    materialsRows.forEach(row => {
      const countEl = row.querySelector('.table__quantity span');
      const count = parseInt(countEl.textContent, 10);
      sum += count;

      if (count > 0) {
        row.classList.add('active');
      } else {
        row.classList.remove('active');
      }
    });

    if(totalAmount) {
      totalAmount.textContent = sum;
    }
  };

  if(materialsRows) {
    materialsRows.forEach(row => {
      const minusBtn = row.querySelector('.button.minus');
      const plusBtn = row.querySelector('.button.plus');
      const countEl = row.querySelector('.table__quantity span');

      minusBtn.addEventListener('click', () => {
        let value = parseInt(countEl.textContent, 10);
        if (value > 0) {
          value--;
          countEl.textContent = value;
          updateTotal();
        }
      });

      plusBtn.addEventListener('click', () => {
        let value = parseInt(countEl.textContent, 10);
        value++;
        countEl.textContent = value;
        updateTotal();
      });
    });
    updateTotal();
  }

  // Date 

  const locales = {
    en: flatpickr.l10ns.default,
    ru: flatpickr.l10ns.ru,
    kk: flatpickr.l10ns.kk
  };

  const locale = locales[lang] || flatpickr.l10ns.default;

  // Profile Picker

  const date = flatpickr(".date", {
    dateFormat: "d-m-Y",
    locale: locale,
    maxDate: "today"
  });

  // Filter Picker

  const fromPicker = flatpickr(".fromDate", {
    dateFormat: "d-m-Y",
    locale: locale,
    maxDate: "today",
    onChange: function(selectedDates, dateStr, instance) {
      toPicker.set("minDate", selectedDates[0]);
    }
  });

  const toPicker = flatpickr(".toDate", {
    dateFormat: "d-m-Y",
    locale: locale,
    maxDate: "today",
    onChange: function(selectedDates, dateStr, instance) {
      fromPicker.set("maxDate", selectedDates[0]);
    }
  });

  // Filter

  const filterToggleBtn = document.querySelector('.cabinet__btn-filter');
  const filterBlock = document.querySelector('.cabinet__filter');
  const filterCloseBtn = document.querySelector('.filter__close');
  const cabinetTable = document.querySelector('.cabinet__table');

  if (filterToggleBtn && filterBlock && cabinetTable) {
    filterToggleBtn.addEventListener('click', function () {
      filterBlock.classList.toggle('active');
      cabinetTable.style.zIndex = filterBlock.classList.contains('active') ? '-1' : '0';
    });
  }

  if (filterCloseBtn && cabinetTable) {
    filterCloseBtn.addEventListener('click', function () {
      filterBlock.classList.remove('active');
      setTimeout(() => {
        cabinetTable.style.zIndex = '0';
      }, 300);
    });
  }

  // Accordion

  const accordionRows = document.querySelectorAll('.accordion__row');
  
  if(accordionRows) {
    accordionRows.forEach(row => {
      const head = row.querySelector('.accordion__head');
      const body = row.querySelector('.accordion__body');
      
      head.addEventListener('click', function(e) {
        if (e.target.closest('.accordion__download')) {
          return;
        }
        
        accordionRows.forEach(otherRow => {
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

  // Listener

  document.addEventListener("click", (e) => {
    let target = e.target;
    if (
      !target.classList.contains("header__nav") &&
      !target.classList.contains("header__burger")
    ) {
      link.classList.remove("active");
      menu.classList.remove("open");
    }
  });

  window.addEventListener("scroll", () => {
    handleScroll();
    if (menu.classList.contains("open")) {
      link.classList.remove("active");
      menu.classList.remove("open");
    }
  });
});