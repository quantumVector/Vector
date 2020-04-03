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

    if (this.data.length) {
      for (const action of this.data) {
        const item = document.createElement('div');
        const name = document.createElement('h2');
        const box = document.createElement('div');
        const boxTitle = document.createElement('h3');
        const debt = document.createElement('p');
        const deleteBtn = document.createElement('button');

        container.appendChild(item);
        item.classList.add('action-item');
        item.appendChild(name);
        name.classList.add('action-name');
        item.appendChild(boxTitle);
        boxTitle.innerText = 'Периодичность:';
        item.appendChild(box);
        box.classList.add('action-days');
        item.appendChild(debt);
        debt.classList.add('action-debt');
        deleteBtn.classList.add('delete-action');
        deleteBtn.innerText = 'Удалить';
        item.appendChild(deleteBtn);

        this.constructor.embedData(item, action, name, box, debt);
      }
    } else {
      const emptyMsg = document.createElement('p');

      emptyMsg.classList.add('empty-msg');
      emptyMsg.innerText = 'Вы ещё не создали ни одного действия';
      container.appendChild(emptyMsg);
    }
  }

  static embedData(item, action, name, box, debt) {
    /* for (const key in action) {
      if ({}.hasOwnProperty.call(action, key)) { */
        /* eslint-disable no-param-reassign */
        // eslint-disable-next-line prefer-destructuring
        /* const days = action[key].params.days;

        item.dataset.id = action[key].params.id;
        name.innerText = key;

        if (action[key].params.days === 'everyday') box.innerText = 'Каждый день';
        if (Array.isArray(action[key].params.days)) box.innerText = days.join(', ');
        if (action[key].params.debt) {
          debt.innerText = 'Долги учитываются';
        } else {
          debt.innerText = 'Без учёта долгов';
        }
      }
    } */

    /* eslint-disable no-param-reassign */
    // eslint-disable-next-line prefer-destructuring
    const days = action.days;

    item.dataset.id = action._id;
    name.innerText = action.name;

    if (action.days === 'everyday') box.innerText = 'Каждый день';
    if (Array.isArray(action.days)) box.innerText = days.join(', ');
    if (action.debt) {
      debt.innerText = 'Долги учитываются';
    } else {
      debt.innerText = 'Без учёта долгов';
    }
  }

  static async deleteAction(actionId) {
    const obj = { actionId };

    const response = await fetch('/delete-action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(obj),
    });
  }
}

const settings = new Settings();

settings.renderActions(document.getElementsByClassName('actions-box')[0]);

everyday.addEventListener('click', () => {
  settings.constructor.togglePeriod();
});

document.addEventListener('click', (e) => {
  if (e.target.closest('.delete-action')) {
    const actionId = e.target.closest('.action-item').getAttribute('data-id');

    settings.constructor.deleteAction(actionId);
  }
});
