/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */

'use strict';

class ActionsCreater {
  constructor() {
    this.dragFlag = false;
    this.elemBelow = null;
    this.dragStartPos = {
      x: 0,
      y: 0,
    };
  }

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

  static toggleEndDate() {
    const endDay = document.getElementById('end-day');
    const endDate = document.getElementById('end-date');

    if (endDay.checked) {
      endDate.disabled = 0;
    } else {
      endDate.disabled = 1;
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
    const dnd = document.createElement('div');

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
    dnd.classList.add('dnd-action');
    item.appendChild(dnd);

    this.constructor.insertData(item, action, name, box, debt);
  }

  static renderEmptyMessage(box, boxType) {
    const emptyMsg = document.createElement('p');

    emptyMsg.classList.add('empty-msg');
    if (boxType === 'active') emptyMsg.innerText = 'Вы ещё не создали ни одного действия';
    if (boxType === 'inactive') emptyMsg.innerText = 'У вас ещё нет неактивных действий';
    box.appendChild(emptyMsg);
  }

  static insertData(item, action, name, box, debt) {
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
      container.innerHTML = '';
      this.renderActions(container);
    } else {
      throw new Error(`Возникла проблема с fetch запросом. ${response.status}`);
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
      container.innerHTML = '';
      this.renderActions(container);
    } else {
      throw new Error(`Возникла проблема с fetch запросом. ${response.status}`);
    }
  }

  static dragAction(event, action, classThis) {
    let closeSibling = action.nextSibling;
    const stub = action.cloneNode(true);
    const shiftX = event.clientX - action.getBoundingClientRect().left;
    const shiftY = event.clientY - action.getBoundingClientRect().top;
    const parentAction = action.parentNode;

    if (!closeSibling) closeSibling = action.previousSibling;

    stub.classList.remove('action-item');
    stub.classList.add('stub');
    action.style.position = 'absolute';
    action.style.zIndex = 1000;
    parentAction.classList.add('active-actions-box-drag');
    parentAction.append(action);
    closeSibling.before(stub);

    function moveAt(pageX, pageY) {
      const styleAction = getComputedStyle(action);
      const styleParent = getComputedStyle(parentAction);
      const maxLeft = parseInt(styleParent.width, 10) - parseInt(styleAction.width, 10);
      const maxTop = parentAction.offsetTop;
      const maxBottom = maxTop + parseInt(styleParent.height, 10)
      - parseInt(styleAction.height, 10);

      action.style.left = `${pageX - shiftX}px`;
      action.style.top = `${pageY - shiftY}px`;

      if (parseInt(styleAction.left, 10) < 0) action.style.left = '0px';
      if (parseInt(styleAction.left, 10) > maxLeft) action.style.left = `${maxLeft}px`;
      if (parseInt(styleAction.top, 10) < maxTop) action.style.top = `${maxTop}px`;
      if (parseInt(styleAction.top, 10) > maxBottom) action.style.top = `${maxBottom}px`;
    }

    moveAt(event.pageX, event.pageY);

    // eslint-disable-next-line no-shadow
    function onMouseMove(event) {
      moveAt(event.pageX, event.pageY);

      action.hidden = true;
      let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
      action.hidden = false;

      elemBelow = elemBelow.closest('.action-item') || null;

      if (elemBelow) {
        if (!classThis.elemBelow) {
          classThis.elemBelow = elemBelow;

          if (event.clientX > classThis.dragStartPos.x) {
            stub.remove();
            elemBelow.after(stub);
            classThis.dragStartPos.x = event.clientX;
            classThis.dragStartPos.y = event.clientY;
          }
          if (event.clientX < classThis.dragStartPos.x) {
            stub.remove();
            elemBelow.before(stub);
            classThis.dragStartPos.x = event.clientX;
            classThis.dragStartPos.y = event.clientY;
          }
        }
      } else {
        classThis.elemBelow = null;
      }
    }

    document.addEventListener('mousemove', onMouseMove);

    action.onmouseup = () => {
      action.remove();
      stub.classList.remove('stub');
      stub.classList.add('action-item');
      parentAction.classList.remove('active-actions-box-drag');
      document.removeEventListener('mousemove', onMouseMove);
      action.onmouseup = null;
    };
  }
}

const container = document.getElementsByClassName('actions')[0];
const endDay = document.getElementById('end-day');
const actions = new ActionsCreater();

actions.renderActions(container);

everyday.addEventListener('click', () => {
  actions.constructor.togglePeriod();
});

endDay.addEventListener('click', () => {
  actions.constructor.toggleEndDate();
});


container.addEventListener('click', (e) => {
  if (e.target.closest('.deactivate-action')) {
    const actionId = e.target.closest('.action-item').getAttribute('data-id');

    actions.deactivateAction(actionId, container);
  }

  if (e.target.closest('.delete-action')) {
    const actionId = e.target.closest('.action-item').getAttribute('data-id');

    actions.deleteAction(actionId, container);
  }
});

container.addEventListener('mousedown', (e) => {
  if (e.target.closest('.dnd-action')) {
    actions.constructor.dragAction(e, e.target.parentNode, actions);
  }
});
