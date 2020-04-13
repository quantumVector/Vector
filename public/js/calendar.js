/* eslint-disable no-continue */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-undef */

'use strict';

class CalendarCreator {
  constructor(container) {
    this.currentDate = 0;
    this.leftCalendar = 0;
    this.middleCalendar = 0;
    this.rightCalendar = 0;
    this.container = container;
  }

  install() {
    const date = new Date();

    this.currentDate = [date.getFullYear(), date.getMonth()];
    this.setDates();
    this.renderCalendar(this.leftCalendar[0], this.leftCalendar[1], 'left');
    this.renderCalendar(this.middleCalendar[0], this.middleCalendar[1], 'middle');
    this.renderCalendar(this.rightCalendar[0], this.rightCalendar[1], 'right');
    this.insertData();
  }

  setDates() {
    const leftMonth = this.currentDate[1] - 1;
    const rightMonth = this.currentDate[1] + 1;

    if (leftMonth < 0) this.leftCalendar = [this.currentDate[0] - 1, 11];
    if (leftMonth >= 0) this.leftCalendar = [this.currentDate[0], leftMonth];
    if (rightMonth > 11) this.rightCalendar = [this.currentDate[0] + 1, 0];
    if (rightMonth <= 11) this.rightCalendar = [this.currentDate[0], rightMonth];
    this.middleCalendar = this.currentDate;
  }

  update(direction) {
    if (direction === 'left') {
      const newCurrentMounth = this.currentDate[1] - 1;

      if (newCurrentMounth < 0) this.currentDate = [this.currentDate[0] - 1, 11];
      if (newCurrentMounth >= 0) this.currentDate = [this.currentDate[0], newCurrentMounth];

      this.setDates();
      this.renderCalendar(this.leftCalendar[0], this.leftCalendar[1], 'left');
    }

    if (direction === 'right') {
      const newCurrentMounth = this.currentDate[1] + 1;

      if (newCurrentMounth > 11) this.currentDate = [this.currentDate[0] + 1, 0];
      if (newCurrentMounth <= 11) this.currentDate = [this.currentDate[0], newCurrentMounth];

      this.setDates();
      this.renderCalendar(this.rightCalendar[0], this.rightCalendar[1], 'right');
    }
  }

  renderCalendar(year, month, position) {
    const div = document.createElement('div');
    const table = document.createElement('table');

    div.classList.add(`${position}-calendar`);

    this.constructor.makeTitle(year, month, div);

    div.appendChild(table);

    this.constructor.makeTHead(table);
    this.constructor.makeTBody(year, month, position, table);

    this.container.appendChild(div);
  }

  static makeTitle(year, month, div) {
    const title = document.createElement('div');

    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    title.classList.add('calendar-title');
    title.innerText = `${months[month]} ${year}`;
    div.appendChild(title);
  }

  static makeTHead(table) {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пн', 'Сб', 'Вс'];

    for (let i = 0; i < 7; i++) {
      const th = document.createElement('th');

      th.innerText = days[i];
      tr.appendChild(th);
    }

    thead.appendChild(tr);
    table.appendChild(thead);
  }

  static makeTBody(year, month, position, table) {
    const tbody = document.createElement('tbody');

    let firstDay = new Date(year, month, 1).getDay();
    const dateInMounth = 33 - new Date(year, month, 33)
      .getDate();
    const dateInMounthArray = [];

    for (let i = dateInMounth; i >= 1; i--) {
      dateInMounthArray.push(i);
    }

    if (firstDay === 0) firstDay = 7;

    let renderTdFlag = false;

    while (dateInMounthArray.length > 0) {
      const dateLine = document.createElement('tr');

      tbody.appendChild(dateLine);

      for (let i = 1; i <= 7; i++) {
        const td = document.createElement('td');
        const actionsContainer = document.createElement('div');

        actionsContainer.classList.add('actions-container');
        td.appendChild(actionsContainer);

        if (firstDay === i) {
          renderTdFlag = true;
          firstDay = null;
        }

        dateLine.appendChild(td);

        if (renderTdFlag === true) {
          const number = dateInMounthArray[dateInMounthArray.length - 1];
          const div = document.createElement('div');

          div.innerText = number;
          td.prepend(div);
          td.setAttribute('data-day', number);
          td.setAttribute('data-month', month);
          td.setAttribute('data-year', year);
          dateInMounthArray.pop();
        }

        if (dateInMounthArray.length === 0) renderTdFlag = false;
      }
    }

    table.appendChild(tbody);
    tbody.setAttribute('data-month', month);
  }

  async getActions() {
    const response = await fetch('/get-data-actions');

    if (response.ok) {
      this.dataActions = await response.json();
    } else {
      throw new Error(`Возникла проблема с fetch запросом. ${response.status}`);
    }
  }

  async getDates() {
    const response = await fetch('/get-data-dates');

    if (response.ok) {
      this.dataDates = await response.json();
    } else {
      throw new Error(`Возникла проблема с fetch запросом. ${response.status}`);
    }
  }

  async insertData() {
    await this.getActions();

    for (const action of this.dataActions.actions) {
      this.scanActionActivity(action);
    }

    await this.getActions(); // получить обновленные данные

    this.changeInsertTarget();
  }

  // Данная функция будет вызываться отдельно для каждого действия со статусом true
  async scanActionActivity(action) {
    const currentDate = new Date();
    const createdDate = new Date(action.created); // Получить дату создания действия
    const actionActivity = this.dataActions.dates[action._id]; // Получить существующие активности
    const newActivity = []; // контейнер для новых активностей
    const sumDays = []; // общее кол-во дней, включая текущий, с момента создания действия
    let i = 0;

    while (createdDate.getDate() !== currentDate.getDate()) {
      currentDate.setDate(currentDate.getDate() - i);
      i = 1;

      // учитываем, что если действие имеет конкретный день, то добавлять только его
      if (action.days[0] !== 'everyday') {
        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const number = currentDate.getDay();

        for (let z = 0; z < action.days.length; z++) {
          if (action.days[z] === days[number]) {
            sumDays.push([
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate(),
            ]);
          }
        }
      } else {
        sumDays.push([currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()]);
      }
    }

    // сравнение количества существующих дат и фактической их суммы
    // если есть разница, то добавить новые активности в контейнер
    if (actionActivity.length !== sumDays.length) {
      // если нет ни одной активности
      if (!actionActivity.length) {
        for (let x = 0; x < sumDays.length; x++) {
          newActivity.push({
            id_action: action._id,
            action_name: action.name,
            year: sumDays[x][0],
            month: sumDays[x][1],
            day: sumDays[x][2],
          });
        }
      } else {
        for (const activity of actionActivity) {
          for (let y = 0; y < sumDays.length; y++) {
            if (+activity.year === sumDays[y][0] && +activity.month === sumDays[y][1]
              && +activity.day === sumDays[y][2]) {
              sumDays.splice(y, 1);
            }
          }
        }

        for (const day of sumDays) {
          newActivity.push({
            id_action: action._id,
            action_name: action.name,
            year: day[0],
            month: day[1],
            day: day[2],
          });
        }
      }
    }

    // если контейнер не пустой, то отправить данные на сервер
    if (newActivity.length) {
      const obj = {
        // eslint-disable-next-line no-underscore-dangle
        id: action._id,
        activities: newActivity,
      };

      const response = await fetch('/set-new-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(obj),
      });

      if (response.ok) {
        console.log('Активность обновлена');
      } else {
        throw new Error(`Возникла проблема с fetch запросом. ${response.status}`);
      }
    }
  }

  changeInsertTarget(side) {
    if (!side) {
      this.insertDataDays('left');
      this.insertDataDays('middle');
      this.insertDataDays('right');
    }
    if (side === 'left') {
      this.insertDataDays('left');
    }
    if (side === 'right') {
      this.insertDataDays('right');
    }
  }

  insertDataDays(position) {
    const calendar = this.container.getElementsByClassName(`${position}-calendar`)[0];
    const td = calendar.getElementsByTagName('td');
    const dateNow = new Date();

    [].forEach.call(td, (item) => {
      const day = item.getAttribute('data-day');
      const month = item.getAttribute('data-month');
      const year = item.getAttribute('data-year');
      const tdDate = new Date(year, month, day);

      // если td не пустой
      if (day) {
        // вставить данные текущих действий
        for (const action of this.dataActions.actions) {
          let endDate;

          if (action.end) endDate = new Date(action.end);

          if (tdDate <= dateNow) {
            for (const date of this.dataActions.dates[action._id]) {
              if (date.year === year && date.month === month && date.day === day) {
                this.constructor.renderAction(item, action.name, action._id, date.status, date._id,
                  date.year, date.month, date.day);
              }
            }
          } else if (action.days[0] === 'everyday') {
            if (tdDate > endDate) continue;
            this.constructor.renderAction(item, action.name, action._id, 'unused');
          } else {
            if (tdDate > endDate) continue;
            const daysName = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
            const tdDay = tdDate.getDay();

            if (action.days.indexOf(daysName[tdDay]) >= 0) {
              this.constructor.renderAction(item, action.name, action._id, 'unused');
            }
          }
        }

        const zeroDateNow = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate());
        // вставить данные не активных действий
        if (zeroDateNow.getTime() !== tdDate.getTime()) {
          for (const action of this.dataActions.notActive) {
            for (const date of this.dataActions.notActiveDates[action._id]) {
              if (date.year === year && date.month === month && date.day === day) {
                this.constructor.renderAction(item, action.name, action._id, date.status, date._id,
                  date.year, date.month, date.day);
              }
            }
          }
        }
      }
    });
  }

  static renderAction(td, name, actionId, status, dateId = 0, year = 0, month = 0, day = 0) {
    const div = document.createElement('div');
    const actionsContainer = td.getElementsByClassName('actions-container')[0];

    div.classList.add('action');
    div.setAttribute('data-action', name);
    div.setAttribute('data-action-id', actionId);
    div.setAttribute('data-id', dateId);
    div.setAttribute('data-status', status);
    div.setAttribute('data-date', `${year}-${month}-${day}`);

    switch (status) {
      case 'unused':
        div.classList.add('action-unused');
        break;
      case false:
        div.classList.add('action-false');
        break;
      case true:
        div.classList.add('action-done');
        break;
      // no default
    }

    actionsContainer.appendChild(div);

    this.setDayStatus(td, actionsContainer);
  }

  static setDayStatus(day, actions) {
    const date = new Date();
    const year = day.getAttribute('data-year');
    const month = day.getAttribute('data-month');
    const currentDay = day.getAttribute('data-day');
    let dayStatus = true;

    [].forEach.call(actions.children, (action) => {
      const actionStatus = action.getAttribute('data-status');

      if (actionStatus === 'false') dayStatus = false;
      if (actionStatus === 'unused') dayStatus = 'unused';
    });

    day.classList.remove('completed-day', 'incompleted-day');

    if (dayStatus === 'unused') day.classList.add('unused-day');
    if (dayStatus === true) day.classList.add('completed-day');
    if (dayStatus === false) day.classList.add('incompleted-day');

    if (+year === date.getFullYear() && +month === date.getMonth()
    && +currentDay === date.getDate()) {
      day.classList.remove('completed-day', 'incompleted-day');
      day.classList.add('current-day');
    }

    if (+year === date.getFullYear() && +month === date.getMonth()
    && +currentDay === date.getDate() && dayStatus === true) {
      day.classList.remove('current-day');
      day.classList.add('completed-day');
    }
  }

  async updateActionStatus(dateId, status, action) {
    let obj = {};

    if (status === 'false') {
      obj = { dateId, status: true };
      action.classList.remove('action-false');
      action.classList.add('action-done');
      action.setAttribute('data-status', true);
    } else {
      obj = { dateId, status: false };
      action.classList.remove('action-done');
      action.classList.add('action-false');
      action.setAttribute('data-status', false);
    }

    const response = await fetch('/update-action-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(obj),
    });

    if (response.ok) {
      const actions = action.parentNode;
      const day = actions.parentNode;

      this.constructor.setDayStatus(day, actions);
      await this.getActions();
    } else {
      throw new Error(`Возникла проблема с fetch запросом. ${response.status}`);
    }
  }

  static showActionInfo(action) {
    const name = action.getAttribute('data-action');
    const modal = document.createElement('div');
    modal.classList.add('action-info');
    modal.innerText = name;

    action.appendChild(modal);
  }
}


const container = document.getElementsByClassName('calendar')[0];
const calendar = new CalendarCreator(container);

calendar.install();

const left = document.getElementById('left');
const right = document.getElementById('right');

left.addEventListener('click', () => {
  const leftCalendar = document.getElementsByClassName('left-calendar')[0];
  const middleCalendar = document.getElementsByClassName('middle-calendar')[0];
  const rightCalendar = document.getElementsByClassName('right-calendar')[0];

  middleCalendar.style.left = '100%';
  leftCalendar.style.left = '0';

  rightCalendar.remove();

  middleCalendar.classList.remove('middle-calendar');
  middleCalendar.classList.add('right-calendar');

  leftCalendar.classList.remove('left-calendar');
  leftCalendar.classList.add('middle-calendar');

  calendar.update('left');
  calendar.changeInsertTarget('left');
});

right.addEventListener('click', () => {
  const leftCalendar = document.getElementsByClassName('left-calendar')[0];
  const middleCalendar = document.getElementsByClassName('middle-calendar')[0];
  const rightCalendar = document.getElementsByClassName('right-calendar')[0];

  middleCalendar.style.left = '-100%';
  rightCalendar.style.left = '0';

  leftCalendar.remove();

  middleCalendar.classList.remove('middle-calendar');
  middleCalendar.classList.add('left-calendar');

  rightCalendar.classList.remove('right-calendar');
  rightCalendar.classList.add('middle-calendar');

  calendar.update('right');
  calendar.changeInsertTarget('right');
});

container.addEventListener('click', (e) => {
  const target = e.target;

  if (target.closest('.action') && !target.closest('.action-unused')) {
    const id = target.getAttribute('data-id');
    const status = target.getAttribute('data-status');

    calendar.updateActionStatus(id, status, target);
  }
});

container.addEventListener('mouseover', (e) => {
  const target = e.target;

  if (target.closest('.action')) calendar.constructor.showActionInfo(target);
});

container.addEventListener('mouseout', (e) => {
  const target = e.target;

  if (target.closest('.action')) {
    const info = target.getElementsByClassName('action-info')[0];

    info.remove();
  }
});
