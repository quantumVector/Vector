/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */

'use strict';

class ActionsCreater {
  constructor(container, everyday, endDay, btnComletedBox,
    btnActiveBox, btnCreationBox) {
    this.container = container;
    this.everyday = everyday;
    this.endDay = endDay;
    this.btnComletedBox = btnComletedBox;
    this.btnActiveBox = btnActiveBox;
    this.btnCreationBox = btnCreationBox;
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
      try {
        this.data = await response.json();
      } catch (e) {
        window.location.reload();
      }
    } else {
      throw new Error(`Возникла проблема с fetch запросом. ${response.status}`);
    }
  }

  async setActions() {
    const currentActionsBox = document.getElementById('active-actions-box');
    const completedActionsBox = document.getElementById('completed-actions-box');
    const activeActionsObj = {};
    let activeActionsLength = 0;

    await this.getData();

    for (const action of this.data) {
      if (action.status) {
        activeActionsObj[action.position] = action;
        activeActionsLength += 1;
      } else {
        this.renderActionItem(completedActionsBox, 'delete', 'Удалить', action);
      }
    }

    if (activeActionsLength > 0) {
      for (let i = 1; i <= activeActionsLength; i++) {
        this.renderActionItem(currentActionsBox, 'deactivate', 'Завершить', activeActionsObj[i]);
      }
    }

    if (currentActionsBox.children.length) {
      const icon = document.createElement('div');

      icon.classList.add('current-actions-info');
      currentActionsBox.before(icon);
    }
    if (!currentActionsBox.children.length) {
      this.constructor.renderEmptyMessage(currentActionsBox, 'active');
    }
    if (!completedActionsBox.children.length) {
      this.constructor.renderEmptyMessage(completedActionsBox, 'inactive');
    }

    this.setEvents();
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
    if (actionsBox.id === 'completed-actions-box') {
      item.classList.add('completed-action-item');
    } else {
      item.classList.add('action-item');
    }
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

    const icon = document.getElementsByClassName('current-actions-info')[0];

    box.appendChild(emptyMsg);
    icon.style.display = 'none';
  }

  static insertData(item, action, name, box, debt) {
    /* eslint-disable no-param-reassign */
    // eslint-disable-next-line prefer-destructuring
    const days = action.days;

    item.dataset.id = action._id;
    item.dataset.position = action.position;
    item.id = action._id;
    name.innerText = action.name;

    if (action.days[0] === 'everyday') box.innerText = 'Каждый день';
    if (action.days.length > 1 && action.days[0] !== 'everyday') box.innerText = days.join(', ');
    if (action.debt) {
      debt.innerText = 'Долги учитываются';
    } else {
      debt.innerText = 'Без учёта долгов';
    }
  }

  async deactivateAction(actionId, position, activeBox, completedBox) {
    const obj = { actionId, position };
    const response = await fetch('/deactivate-action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(obj),
    });

    if (response.ok) {
      activeBox.innerHTML = '';
      activeBox.style.display = 'flex';
      completedBox.innerHTML = '';
      this.setActions();
    } else {
      throw new Error(`Возникла проблема с fetch запросом. ${response.status}`);
    }
  }

  async deleteAction(actionId, activeBox, completedBox) {
    const obj = { actionId };
    const response = await fetch('/delete-action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(obj),
    });

    if (response.ok) {
      activeBox.innerHTML = '';
      completedBox.innerHTML = '';
      completedBox.style.display = 'flex';
      this.setActions();
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
    action.style.margin = 0; // нужено, чтобы элемент не выходил за границы
    document.body.classList.add('active-actions-box-drag');

    // если курсор был нажат на последнем действии
    if (!closeSibling) {
      closeSibling = action.previousSibling;
      closeSibling.after(stub);
    } else {
      closeSibling.before(stub);
    }

    document.body.append(action);

    function moveAt(pageX, pageY) {
      const styleAction = getComputedStyle(action);
      const styleParent = getComputedStyle(parentAction);
      const maxLeft = parseInt(parentAction.offsetWidth, 10) - action.offsetWidth;
      const maxTop = parentAction.offsetTop;
      const maxBottom = maxTop + parseInt(styleParent.height, 10)
        - action.offsetHeight - 10;

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
            const rightSiblingStub = stub.previousSibling;
            const rightSiblingItem = item.nextSibling;

            rightSiblingStub.after(item);
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

    document.onmouseup = async () => {
      action.remove();
      stub.classList.remove('stub');
      stub.classList.add('action-item');
      document.body.classList.remove('active-actions-box-drag');
      document.removeEventListener('mousemove', onMouseMove);
      document.onmouseup = null;

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

      if (!response.ok) throw new Error(`Возникла проблема с fetch запросом. ${response.status}`);
    };
  }

  static toggleActionBlock(block) {
    const activeBox = document.getElementById('active-actions-box');
    const completedBox = document.getElementById('completed-actions-box');
    const creationBox = document.getElementById('creation-box');
    const btnActiveBox = document.getElementsByClassName('btn-active-box')[0];
    const btnCompletedBox = document.getElementsByClassName('btn-completed-box')[0];
    const btnCreationBox = document.getElementsByClassName('btn-creation-box')[0];
    const icon = document.getElementsByClassName('current-actions-info')[0];
    const arrowsActiveBox = btnActiveBox.getElementsByClassName('arrow-down');
    const arrowsCompletedBox = btnCompletedBox.getElementsByClassName('arrow-down');
    const arrowsCreationBox = btnCreationBox.getElementsByClassName('arrow-down');
    const textActiveBox = btnActiveBox.getElementsByClassName('btn-action')[0];
    const textCompletedBox = btnCompletedBox.getElementsByClassName('btn-action')[0];
    const textCreationBox = btnCreationBox.getElementsByClassName('btn-action')[0];
    const paramsActiveBox = [textActiveBox, arrowsActiveBox, btnActiveBox, activeBox, 'grid'];
    const paramsCompletedBox = [textCompletedBox, arrowsCompletedBox, btnCompletedBox,
      completedBox, 'grid'];
    const paramsCrationBox = [textCreationBox, arrowsCreationBox, btnCreationBox, creationBox,
      'flex'];

    function openBox(text, arrows, btn, box, layout) {
      text.innerText = 'Скрыть';
      arrows[0].classList.remove('close-block');
      arrows[1].classList.remove('close-block');
      arrows[0].classList.add('open-block');
      arrows[1].classList.add('open-block');
      btn.classList.remove('btn-close');
      btn.classList.add('btn-open');
      if (box.getElementsByClassName('empty-msg')[0]) layout = 'flex';
      box.style.display = layout;
    }

    function closeBox(text, arrows, btn, box) {
      text.innerText = 'Показать';
      arrows[0].classList.remove('open-block');
      arrows[1].classList.remove('open-block');
      arrows[0].classList.add('close-block');
      arrows[1].classList.add('close-block');
      btn.classList.remove('btn-open');
      btn.classList.add('btn-close');
      box.style.display = 'none';
    }

    if (block.closest('.btn-close')) {
      if (block.closest('.btn-active-box')) {
        openBox(...paramsActiveBox);
        if (btnCompletedBox.classList.contains('btn-open')) closeBox(...paramsCompletedBox);
        if (btnCreationBox.classList.contains('btn-open')) closeBox(...paramsCrationBox);
        if (document.getElementsByClassName('action-item')[0]) {
          icon.style.display = 'block';
        } else {
          icon.style.display = 'none';
        }
      }

      if (block.closest('.btn-completed-box')) {
        icon.style.display = 'none';
        openBox(...paramsCompletedBox);
        if (btnActiveBox.classList.contains('btn-open')) closeBox(...paramsActiveBox);
        if (btnCreationBox.classList.contains('btn-open')) closeBox(...paramsCrationBox);
      }

      if (block.closest('.btn-creation-box')) {
        icon.style.display = 'none';
        openBox(...paramsCrationBox);
        if (btnActiveBox.classList.contains('btn-open')) closeBox(...paramsActiveBox);
        if (btnCompletedBox.classList.contains('btn-open')) closeBox(...paramsCompletedBox);
      }

      return;
    }

    if (block.closest('.btn-open')) {
      if (block.closest('.btn-active-box')) {
        icon.style.display = 'none';
        closeBox(...paramsActiveBox);
      }
      if (block.closest('.btn-completed-box')) closeBox(...paramsCompletedBox);
      if (block.closest('.btn-creation-box')) closeBox(...paramsCrationBox);
    }
  }

  setEvents() {
    const closeModalInfo = document.getElementById('close-modal-info');

    this.everyday.addEventListener('click', () => {
      this.constructor.togglePeriod();
    });

    this.endDay.addEventListener('click', () => {
      this.constructor.toggleEndDate();
    });

    this.container.addEventListener('click', (e) => {
      const { target } = e;

      const activeBox = document.getElementById('active-actions-box');
      const completedBox = document.getElementById('completed-actions-box');

      if (target.closest('.deactivate-action')) {
        const actionId = target.closest('.action-item').getAttribute('data-id');
        const position = target.closest('.action-item').getAttribute('data-position');

        this.deactivateAction(actionId, position, activeBox, completedBox);
      }

      if (target.closest('.delete-action')) {
        const actionId = target.closest('.completed-action-item').getAttribute('data-id');

        this.deleteAction(actionId, activeBox, completedBox);
      }

      if (target.closest('.current-actions-info')) {
        document.getElementById('modal-info').style.display = 'flex';
      }
    });

    this.container.addEventListener('mousedown', (e) => {
      if (e.target.closest('.dnd-action')) {
        this.constructor.dragAction(e, e.target.parentNode);
      }
    });

    // Далее addEventListener не используется, так как события с ним будут вызываться два раза,
    // если завершить или удалить действие. (вероятнее всего из-за всплытия и перехвата события)

    this.btnComletedBox.onclick = () => {
      this.constructor.toggleActionBlock(this.btnComletedBox);
    };

    this.btnActiveBox.onclick = () => {
      this.constructor.toggleActionBlock(this.btnActiveBox);
    };

    this.btnCreationBox.onclick = (e) => {
      this.constructor.toggleActionBlock(this.btnCreationBox);
      window.scrollBy(0, window.innerHeight);
      e.preventDefault();
    };

    closeModalInfo.addEventListener('click', () => {
      document.getElementById('modal-info').style.display = 'none';
    });
  }
}

const container = document.getElementsByClassName('actions')[0];
const everyday = document.getElementById('everyday');
const endDay = document.getElementById('end-day');
const btnComletedBox = document.getElementsByClassName('btn-completed-box')[0];
const btnActiveBox = document.getElementsByClassName('btn-active-box')[0];
const btnCreationBox = document.getElementsByClassName('btn-creation-box')[0];
const actions = new ActionsCreater(container, everyday, endDay, btnComletedBox,
  btnActiveBox, btnCreationBox);

actions.setActions();
