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
      if (action.status) {
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
    }

    if (!container.children.length) {
      const emptyMsg = document.createElement('p');

      emptyMsg.classList.add('empty-msg');
      emptyMsg.innerText = 'Вы ещё не создали ни одного действия';
      container.appendChild(emptyMsg);
    }
  }

  static embedData(item, action, name, box, debt) {
    /* eslint-disable no-param-reassign */
    // eslint-disable-next-line prefer-destructuring
    const days = action.days;

    // eslint-disable-next-line no-underscore-dangle
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

  async deleteAction(actionId, container) {
    const obj = { actionId };
    const response = await fetch('/delete-action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(obj),
    });

    if (response.ok) {
      const elems = document.getElementsByClassName('action-item');

      [].forEach.call(elems, (elem) => {
        const itemId = elem.getAttribute('data-id');

        if (itemId === actionId) {
          elem.remove();
          container.innerHTML = '';
          this.renderActions(container);
        }
      });
    } else {
      throw new Error(`Возникла проблема с fetch запросом. ${response.status}`);
    }
  }
}

const container = document.getElementsByClassName('actions-box')[0];
const settings = new Settings();

settings.renderActions(container);

everyday.addEventListener('click', () => {
  settings.constructor.togglePeriod();
});

document.addEventListener('click', (e) => {
  if (e.target.closest('.delete-action')) {
    const actionId = e.target.closest('.action-item').getAttribute('data-id');

    settings.deleteAction(actionId, container);
  }
});
