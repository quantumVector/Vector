/* eslint-disable no-undef */

'use strict';

class Settings {
  static togglePeriod() {
    const everyday = document.getElementById('everyday');
    const certainDays = document.getElementsByName('period');

    if (everyday.checked) {
      for (let i = 1; i <= 7; i++) {
        certainDays[i].disabled = 1;
        certainDays[i].checked = 0;
      }
    } else {
      for (let i = 1; i <= 7; i++) {
        certainDays[i].disabled = 0;
      }
    }
  }

  async getData() {
    const response = await fetch('/getdata');

    if (response.ok) {
      this.data = await response.json();
    } else {
      throw new Error(`Возникла проблема с fetch запросом. ${response.status}`);
    }
  }

  async renderActions(container) {
    await this.getData();

    for (const action of this.data) {
      const div = document.createElement('div');
      const name = document.createElement('h2');
      const box = document.createElement('div');
      const boxTitle = document.createElement('h3');
      const debt = document.createElement('p');

      container.appendChild(div);
      div.classList.add('action-item');
      div.appendChild(name);
      name.classList.add('action-name');
      div.appendChild(boxTitle);
      boxTitle.innerText = 'Периодичность:';
      div.appendChild(box);
      box.classList.add('action-days');
      div.appendChild(debt);

      this.constructor.embedData(action, name, box, debt);
    }
  }

  static embedData(action, name, box, debt) {
    for (const key in action) {
      if ({}.hasOwnProperty.call(action, key)) {
        /* eslint-disable no-param-reassign */
        // eslint-disable-next-line prefer-destructuring
        const days = action[key].params.days;

        name.innerText = key;

        if (action[key].params.days === 'everyday') box.innerText = 'Каждый день';
        if (Array.isArray(action[key].params.days)) box.innerText = days.join(', ');
        if (action[key].params.debt) {
          debt.innerText = 'Долги учитываются';
        } else {
          debt.innerText = 'Без учёта долгов';
        }
      }
    }
  }
}

const settings = new Settings();

settings.renderActions(document.getElementsByClassName('actions-box')[0]);

everyday.addEventListener('click', () => {
  settings.togglePeriod();
});
