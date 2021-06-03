/* eslint-disable no-useless-escape */
function container() {
  const newContainer = document.createElement('div');
  newContainer.classList.add('wrapper');
  newContainer.innerHTML = `
  <div class="unit-container">
    <h2 class="widget-header">ТайМлайн</h2>
    <ul class="unit-list">
    </ul>
    <div class="container__footer">
      <form name="unitForm" novalidate class="form" id="newEntryForm">
        <input class="form__input" type="text" name="description" id = "newEntryInput" required placeholder="Введите текст заметки">
      </form
    </div>
  </div>
    `;
  return newContainer;
}

function unit(data) {
  const newUnit = document.createElement('li');
  newUnit.classList.add('unit');
  newUnit.dataset.unitId = data.id;
  newUnit.innerHTML = `
      <div class="unit__header">
        <span class="unit-timestamp">${data.timestamp}</span>
      </div>
      <div class="unit__body">
        <span class="unit-text">${data.text}</span>
      </div>
      <div class="unit__footer">
        <span class="unit-geotag">[${data.geotag}]</span>&nbsp;&#128065;
      </div>
  `;
  return newUnit;
}

function unitForm() {
  const formElement = document.createElement('div');
  formElement.classList.add('modal');
  formElement.innerHTML = `
    <form name="getManualGeo" novalidate class="form" id="manualCoordsForm">
      
      <h2 class="modal__header">Что-то пошло не так</h2>
      
      <span class="modal__text">К сожалению, нам не удалось определить ваше местоположение, пожалуйста, дайте разрешение на использование геолокации, либо введите координаты вручную.</span>
      
      <input class="form__input" type="text" name="coords" id="manualCoordsInput" required placeholder="Введите координаты в формате 00.00000, 00.00000" pattern="\\[?[-+]?([1-8]?\\d(\\.\\d+)?|90(\\.0+)?),\\s*[-+]?(180(\\.0+)?|((1[0-7]\\d)|([1-9]?\\d))(\\.\\d+)?)\\]?">
      
      <div class="form__input-button-holder">
        <button type="button" class="btn btn-cancel">Отмена</button>
        <button type="submit" class="btn btn-submit">Ok</button>
      </div>
    </form>
  `;
  return formElement;
}

export { container, unit, unitForm };
