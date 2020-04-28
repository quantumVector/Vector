/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */

'use strict';

class ActionsCreater {
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
      try {
        this.data = await response.json();
      } catch (e) {
        window.location.reload();
      }
    } else {
      throw new Error(`Возникла проблема с fetch запросом. ${response.status}`);
    }
  }

  async renderActions(container) {
    const titleActiveBox = document.createElement('h2');
    const activeActionsBox = document.createElement('div');
    const titleInactiveBox = document.createElement('h2');
    const inactiveActionsBox = document.createElement('div');
    const activeActionsObj = {};
    let activeActionsLength = 0;

    titleActiveBox.innerText = 'Текущие действия';
    activeActionsBox.classList.add('active-actions-box');
    container.appendChild(titleActiveBox);
    container.appendChild(activeActionsBox);

    titleInactiveBox.innerText = 'Завершенные действия';
    inactiveActionsBox.classList.add('inactive-actions-box');
    container.appendChild(titleInactiveBox);
    container.appendChild(inactiveActionsBox);

    await this.getData();

    for (const action of this.data) {
      if (action.status) {
        activeActionsObj[action.position] = action;
        activeActionsLength += 1;
      } else {
        this.renderActionItem(inactiveActionsBox, 'delete', 'Удалить', action);
      }
    }

    if (activeActionsLength > 0) {
      for (let i = 1; i <= activeActionsLength; i++) {
        console.log(activeActionsObj[i])
        this.renderActionItem(activeActionsBox, 'deactivate', 'Завершить', activeActionsObj[i]);
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
    item.dataset.position = action.position;
    item.id = action._id;
    name.innerText = action.name;

    if (action.days === 'everyday') box.innerText = 'Каждый день';
    if (Array.isArray(action.days)) box.innerText = days.join(', ');
    if (action.debt) {
      debt.innerText = 'Долги учитываются';
    } else {
      debt.innerText = 'Без учёта долгов';
    }
  }

  async deactivateAction(actionId, position, container) {
    const obj = { actionId, position };
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

  static dragAction(event, action) {
    let closeSibling = action.nextSibling;
    const stub = action.cloneNode(true);
    const shiftX = event.clientX - action.getBoundingClientRect().left;
    const shiftY = event.clientY - action.getBoundingClientRect().top;
    const parentAction = action.parentNode;

    stub.classList.remove('action-item');
    stub.classList.add('stub');
    action.style.position = 'absolute';
    action.style.zIndex = 1000;
    parentAction.classList.add('active-actions-box-drag');
    parentAction.append(action);

    // если курсор был нажат на последнем действии
    if (!closeSibling) {
      closeSibling = action.previousSibling;
      closeSibling.after(stub);
    } else {
      closeSibling.before(stub);
    }

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

    let saveActionBelow = null;
    let dragStartPosX = event.pageX;

    // eslint-disable-next-line no-shadow
    function onMouseMove(event) {
      moveAt(event.pageX, event.pageY);

      action.hidden = true;
      const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
      action.hidden = false;

      let actionBelow;

      // если курсор за пределами окна
      if (!elemBelow) {
        actionBelow = null;
      } else {
        actionBelow = elemBelow.closest('.action-item');
      }

      if (actionBelow) {
        if (!saveActionBelow) {
          saveActionBelow = actionBelow;

          const elemId = actionBelow.getAttribute('data-id');
          const item = document.getElementById(elemId);

          // элемент над курсором является соседом заглушки
          if (stub.nextSibling === actionBelow || stub.previousSibling === actionBelow) {
            if (event.pageX > dragStartPosX) {
              stub.remove();
              item.after(stub);

              dragStartPosX = event.pageX;
            } else {
              stub.remove();
              item.before(stub);

              dragStartPosX = event.pageX;
            }

            return;
          }

          // элемент над курсором не является соседом заглушки + заглушка не имеет соседа слева
          if (stub.nextSibling !== actionBelow && stub.previousSibling !== actionBelow
            && !stub.previousSibling) {
            const rightSiblingStub = stub.nextSibling;
            const leftSiblingItem = item.previousSibling;

            rightSiblingStub.before(item);
            leftSiblingItem.after(stub);

            return;
          }

          // элемент над курсором не является соседом заглушки + эелемент не имеет соседа слева
          if (stub.nextSibling !== actionBelow && stub.previousSibling !== actionBelow
            && !item.previousSibling) {
            const rightSiblingStub = stub.nextSibling;
            const rightSiblingItem = item.nextSibling;

            rightSiblingStub.before(item);
            rightSiblingItem.before(stub);

            return;
          }

          // элемент над курсором не является соседом заглушки + заглушка имеет соседа слева
          if (stub.nextSibling !== actionBelow && stub.previousSibling !== actionBelow
            && stub.previousSibling) {
            const leftSiblingStub = stub.previousSibling;
            const leftSiblingItem = item.previousSibling;

            leftSiblingStub.after(item);
            leftSiblingItem.after(stub);
          }
        }
      } else {
        saveActionBelow = null;
      }
    }

    document.addEventListener('mousemove', onMouseMove);

    action.onmouseup = async () => {
      action.remove();
      stub.classList.remove('stub');
      stub.classList.add('action-item');
      parentAction.classList.remove('active-actions-box-drag');
      document.removeEventListener('mousemove', onMouseMove);
      action.onmouseup = null;

      const actionsId = [];

      // так как forEach перебирает элементы по порядку,
      // то их порядковый номер будет равен индексу массива + 1
      [].forEach.call(parentAction.children, (item) => {
        const actionId = item.getAttribute('data-id');

        actionsId.push(actionId);
      });

      const response = await fetch('/set-position-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(actionsId),
      });

      if (response.ok) {
        console.log('Порядок действий обновлён');
      } else {
        throw new Error(`Возникла проблема с fetch запросом. ${response.status}`);
      }
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
    const position = e.target.closest('.action-item').getAttribute('data-position');

    actions.deactivateAction(actionId, position, container);
  }

  if (e.target.closest('.delete-action')) {
    const actionId = e.target.closest('.action-item').getAttribute('data-id');

    actions.deleteAction(actionId, container);
  }
});

container.addEventListener('mousedown', (e) => {
  if (e.target.closest('.dnd-action')) {
    actions.constructor.dragAction(e, e.target.parentNode);
  }
});
