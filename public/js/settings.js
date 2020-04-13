/* eslint-disable no-underscore-dangle */
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
    const titleActiveBox = document.createElement('h2');
    const activeActionsBox = document.createElement('div');
    const titleInactiveBox = document.createElement('h2');
    const inactiveActionsBox = document.createElement('div');

    titleActiveBox.innerText = 'Текущие действия';
    activeActionsBox.classList.add('active-actions-box');
    container.appendChild(titleActiveBox);
    container.appendChild(activeActionsBox);

    titleInactiveBox.innerText = 'Неактивные действия';
    inactiveActionsBox.classList.add('inactive-actions-box');
    container.appendChild(titleInactiveBox);
    container.appendChild(inactiveActionsBox);

    await this.getData();

    for (const action of this.data) {
      if (action.status) {
        this.renderActionItem(activeActionsBox, 'deactivate', 'Деактивировать', action);
      } else {
        this.renderActionItem(inactiveActionsBox, 'delete', 'Удалить', action);
      }
    }

    if (!activeActionsBox.children.length) {
      this.constructor.renderEmptyMessage(activeActionsBox, 'active');
    }
    if (!inactiveActionsBox.children.length) {
      this.constructor.renderEmptyMessage(inactiveActionsBox, 'inactive');
    }
  }

  renderActionItem(actionsBox, btnClassName, btnName, action) {
    const item = document.createElement('div');
    const name = document.createElement('h2');
    const box = document.createElement('div');
    const boxTitle = document.createElement('h3');
    const debt = document.createElement('p');
    const btn = document.createElement('button');

    actionsBox.appendChild(item);
    item.classList.add('action-item');
    item.appendChild(name);
    name.classList.add('action-name');
    item.appendChild(boxTitle);
    boxTitle.innerText = 'Периодичность:';
    item.appendChild(box);
    box.classList.add('action-days');
    item.appendChild(debt);
    debt.classList.add('action-debt');
    btn.classList.add(`${btnClassName}-action`);
    btn.innerText = btnName;
    item.appendChild(btn);

    this.constructor.embedData(item, action, name, box, debt);
  }

  static renderEmptyMessage(box, boxType) {
    const emptyMsg = document.createElement('p');

    emptyMsg.classList.add('empty-msg');
    if (boxType === 'active') emptyMsg.innerText = 'Вы ещё не создали ни одного действия';
    if (boxType === 'inactive') emptyMsg.innerText = 'У вас ещё нет неактивных действий';
    box.appendChild(emptyMsg);
  }

  static embedData(item, action, name, box, debt) {
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

  async deactivateAction(actionId, container) {
    const obj = { actionId };
    const response = await fetch('/deactivate-action', {
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

const container = document.getElementsByClassName('actions')[0];
const settings = new Settings();

settings.renderActions(container);

everyday.addEventListener('click', () => {
  settings.constructor.togglePeriod();
});

document.addEventListener('click', (e) => {
  if (e.target.closest('.deactivate-action')) {
    const actionId = e.target.closest('.action-item').getAttribute('data-id');

    settings.deactivateAction(actionId, container);
  }
});
