import { unit, unitForm, container } from './template';
import FORM_ERRORS from '../data/formErrors';
import idGenetator from './idGenerator';
import formatDate from './formatDate';

export default class Widget {
  constructor() {
    this.units = [];
    this.error = null;
  }

  init() {
    this.renderContainer();
    this.bindToDOM();
    this.addWidgetListeners();
    this.renderUnits();
  }

  renderContainer() {
    document.body.append(container());
  }

  bindToDOM() {
    this.wrapper = document.querySelector('div.wrapper');
    this.unitList = document.querySelector('ul.unit-list');
    this.newEntryForm = document.querySelector('form#newEntry');
    this.newEntryInput = document.querySelector('input.form__input');
  }

  addWidgetListeners() {
    this.newEntryForm.addEventListener(
      'submit',
      (event) => {
        event.preventDefault();
        this.unitPush(event.target);
      },
      false
    );

    this.wrapper.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        if (event.target === this.wrapper) {
          try {
            this.allFormsClose();
          } catch (e) {
            // nthg
          }
        }
      },
      false
    );
  }

  renderUnits() {
    this.unitList.innerHTML = '';

    this.units.forEach((element) => {
      const newUnit = unit(element);
      this.unitList.prepend(newUnit);
    });

    this.newEntryInput.focus();
  }

  unitPush(form) {
    if (!this.checkFormValidity(form)) {
      return;
    }

    const data = {
      id: idGenetator(),
      text: form.description.value.replace(/(?:\r\n|\r|\n)/g, '<br>'),
      timestamp: formatDate(new Date()),
    };

    data.geotag = this.autoGeoTag();
    console.log('unitPush: ', data.geotag);

    this.units.push(data);
    form.description.value = '';

    this.allFormsClose();
    this.renderUnits();
  }

  autoGeoTag() {
    let geotag;
    if (navigator.geolocation) {
      console.log('Geo доступно');
      navigator.geolocation.getCurrentPosition(positionDetected, positionNotDetected);

      function positionDetected(position) {
        geotag = `${position.coords.latitude}, ${position.coords.longitude}`;
        console.log('autoGeoTag', geotag);
      }
      function positionNotDetected(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        geotag = this.manualGeoTag();
      }
    } else {
      geotag = this.manualGeoTag();
    }
    return geotag;
  }

  manualGeoTag() {
    try {
      this.allFormsClose();
    } catch (e) {
      // nthg
    }

    const newForm = unitForm();
    const parent = this.unitList;
    document.body.append(newForm);
    this.modalPlace(parent, newForm, 'modal');

    newForm.querySelector(`.btn-cancel`).addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        this.allFormsClose();
      },
      false
    );
    newForm.querySelector(`.btn-submit`).addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        return newForm.coords.value;
      },
      false
    );

    newForm.querySelector(`input.form__input`).focus();
  }

  // ! ---------------------
  // ! CHECK FORM LOGIC DONE
  // ! ---------------------
  /**
   * Checks form elements validity
   * @param {Object} form
   * @returns all elements valid = true, otherwise false
   */
  checkFormValidity(form) {
    let { error } = this;

    // old error removing
    if (error) {
      error.remove();
      error = null;
    }
    // check validity code
    const isValid = form.checkValidity();

    // switch .invalid on all valid elements to .valid
    [...form.elements]
      .filter((o) => o.validity.valid && !o.classList.contains('btn'))
      .forEach((el) => {
        el.classList.add('valid');
        el.classList.remove('invalid');
      });

    if (!isValid) {
      const first = [...form.elements].find((o) => !o.validity.valid);
      first.focus();
      first.classList.remove('valid');
      first.classList.add('invalid');

      const ValidityState = first.validity;
      let errorKey = 'Неизвестная ошибка';

      for (const key in ValidityState) {
        if (ValidityState[key]) {
          errorKey = key;
        }
      }

      error = document.createElement('div');
      error.dataset.id = 'error';
      error.className = 'form-error';
      error.textContent = `${FORM_ERRORS.FORM_ERRORS[first.name][errorKey]}`;

      first.offsetParent.appendChild(error);
      this.modalPlace(first, error, 'error');
      this.error = error;
      return false;
    }
    return true;
  }

  /**
   * Places modal window
   */
  modalPlace(parent, element, role) {
    switch (role) {
      case 'error':
        element.style.width = `200px`;
        element.style.top = `${parent.offsetTop + parent.offsetHeight - 5}px`;
        element.style.left = `${
          parent.offsetLeft + parent.offsetWidth - element.offsetWidth / 2
        }px`;
        break;
      case 'modal':
        element.style.width = `${parent.offsetWidth * 0.8}px`;
        element.style.top = `${parent.offsetTop - 5}px`;
        element.style.left = `${
          parent.offsetLeft + parent.offsetWidth / 2 - element.offsetWidth / 2
        }px`;
    }
  }

  /**
   * Closes modals and errors
   */
  allFormsClose() {
    [...document.querySelectorAll(`div.modal`)].forEach((el) => el.remove());
    [...document.querySelectorAll(`div.form-error`)].forEach((el) => el.remove());
  }
}
