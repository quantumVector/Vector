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

        if (firstDay === i) {
          renderTdFlag = true;
          firstDay = null;
        }

        dateLine.appendChild(td);

        if (renderTdFlag === true) {
          td.innerText = dateInMounthArray[dateInMounthArray.length - 1];
          dateInMounthArray.pop();
        }

        if (dateInMounthArray.length === 0) renderTdFlag = false;
      }
    }

    table.appendChild(tbody);
  }

  async insertData() {
    await this.getData();

    for (const action of this.data) {
      this.constructor.scanActionActivity(action);
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

  // Данная функция будет вызываться отдельно для каждого действия со статусом true
  static async scanActionActivity(action) {
    const currentDate = new Date(); // Получить текущую дату
    const createdDate = new Date(action.created); // Получить дату создания действия
    const actionActivity = action.dates; // Получить существующие в бд даты активности
    const newActivity = []; // контейнер для новых активностей
    const sumDays = []; // общее кол-во дней, включая текущий, с момента создания действия
    let i = 0;

    while (createdDate.getDate() !== currentDate.getDate()) {
      currentDate.setDate(currentDate.getDate() - i);
      i = 1;
      sumDays.push([currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()]);
    }

    // сравнение количества существующих дат и фактической их суммы
    // если есть разница, то добавить новые активности в контейнер
    if (actionActivity.length !== sumDays.length) {
      for (let x = 0; x < sumDays.length; x++) {
        if (!actionActivity[x]) {
          newActivity.push({
            year: sumDays[x][0],
            month: sumDays[x][1],
            day: sumDays[x][2],
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

      const response = await fetch('/set-new-activities', {
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
}

const calendar = new CalendarCreator(document.getElementsByClassName('calendar')[0]);

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
});
