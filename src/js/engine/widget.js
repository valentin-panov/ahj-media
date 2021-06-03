/* eslint-disable default-case */
/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
import { unit, unitForm, container } from './template';
import FORM_ERRORS from '../data/formErrors';
import idGenetator from './idGenerator';
import formatDate from './formatDate';
// import setInputFilter from './setInputFilter';

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
    this.newEntryForm = document.querySelector('#newEntryForm');
    this.newEntryInput = document.querySelector('#newEntryInput');
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
    this.allFormsClose();
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

    this.getGeo()
      .then((position) => {
        data.geotag = `${position.coords.latitude}, ${position.coords.longitude}`;
      })
      .then(() => {
        form.description.value = '';
        this.units.push(data);
        this.renderUnits();
      })
      .catch(() => {
        form.description.value = '';
        this.manualGeoTagQuery(data);
      });
  }

  getGeo() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position),
          (err) => reject(err)
        );
      } else {
        reject(new Error('Geolocation is unavailable'));
      }
    });
  }

  manualGeoTagQuery(data) {
    try {
      this.allFormsClose();
    } catch (e) {
      // nthg
    }

    const newForm = unitForm();
    const parent = this.unitList;
    const formElement = newForm.querySelector(`#manualCoordsForm`);
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
        this.manualGeoTagPush(data, formElement);
      },
      false
    );

    formElement.addEventListener(
      'submit',
      (event) => {
        event.preventDefault();
        this.manualGeoTagPush(data, formElement);
      },
      false
    );

    newForm.querySelector(`#manualCoordsInput`).focus();
  }

  manualGeoTagPush(data, form) {
    if (!this.checkFormValidity(form)) {
      return;
    }

    data.geotag = form.coords.value.replace(/\[|\]|\s*|\+/g, '');
    data.geotag = data.geotag.replace(/,/g, ', ');
    this.units.push(data);
    this.renderUnits();
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
