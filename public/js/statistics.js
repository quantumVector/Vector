/* eslint-disable no-underscore-dangle */
/* eslint-disable no-continue */
/* eslint-disable no-undef */

'use strict';

class StatisticsCreator {
  constructor(container, btnBox) {
    this.container = container;
    this.btnBox = btnBox;
  }

  async install() {
    await this.getActions();
    this.sortDataByYear();
    this.setYearButtons();
    this.renderDaysName();
    this.renderDaysOfTheYear();
    this.setEvents();
    this.checkDay();
    this.setSuccessDaysInMonth();
  }

  async getActions() {
    const response = await fetch('/get-data-statistics');

    if (response.ok) {
      this.dataActions = await response.json();
    } else {
      throw new Error(`Возникла проблема с fetch запросом. ${response.status}`);
    }
  }

  sortDataByYear() {
    const year = {};
    const allDates = [];

    // добавить в массив все даты действий в миллисекундах
    if (this.dataActions.dates.length) {
      for (const date of this.dataActions.dates) {
        allDates.push(new Date(date.year, date.month, date.day).getTime());
      }
    } else {
      const dateNow = new Date();

      allDates.push(new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate())
        .getTime());
    }

    // вычеслить дату и год первого существующего действия и последнего
    const startingDate = new Date(Math.min(...allDates));
    const startingYear = startingDate.getFullYear();
    const lastDate = new Date(Math.max(...allDates));
    const lastYear = lastDate.getFullYear();

    // рассортировать даты по годам
    for (let i = startingYear; i <= lastYear; i++) {
      year[i] = [];

      for (const date of this.dataActions.dates) {
        if (+date.year === i) year[i].push(date);
      }
    }

    this.dates = year;
    this.activeYear = lastYear;
  }

  setYearButtons() {
    for (const key in this.dates) {
      if (Object.prototype.hasOwnProperty.call(this.dates, key)) {
        const btn = document.createElement('div');

        btn.classList.add('btn-year');
        btn.setAttribute('data-year', key);
        btn.innerText = key;
        this.btnBox.append(btn);

        if (this.activeYear === +key) btn.classList.add('active');
      }
    }
  }

  renderDaysName() {
    for (let i = 2; i <= 8; i++) {
      const dayName = document.createElement('div');
      const dayArr = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

      dayName.innerText = dayArr[i - 2];
      dayName.style.gridRow = i;
      dayName.style.gridColumn = 1;

      this.container.append(dayName);
    }
  }

  renderDaysOfTheYear() {
    const nextYear = this.activeYear + 1;
    const firstDate = new Date(this.activeYear, 0, 1);
    const lastDate = new Date(nextYear, 0, 1);
    let column = 2;

    for (let i = firstDate; i < lastDate;) {
      const day = document.createElement('div');

      day.classList.add('day');
      day.id = `date-${firstDate.getFullYear()}-${firstDate.getMonth()}-${firstDate.getDate()}`;
      day.style.gridRow = firstDate.getDay() + 1;
      day.style.gridColumn = column;

      if (firstDate.getDay() === 0) day.style.gridRow = 8;

      this.container.append(day);

      this.renderMonthName(firstDate.getMonth(), firstDate.getDay(), firstDate.getDate(), column);

      firstDate.setDate(firstDate.getDate() + 1);

      if (firstDate.getDay() === 1) column += 1;
    }
  }

  renderMonthName(month, day, date, column) {
    const monthsArr = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    const monthName = document.createElement('div');
    monthName.classList.add('month');

    if (date === 1) {
      monthName.innerText = monthsArr[month];
      monthName.style.gridRow = 1;
      monthName.style.gridColumn = 2;
      this.container.append(monthName);
    }
    if (day === 1 && date === 1) {
      monthName.innerText = monthsArr[month];
      monthName.style.gridRow = 1;
      monthName.style.gridColumn = column;
      this.container.append(monthName);
    }
    if (day !== 1 && date === 1) {
      monthName.innerText = monthsArr[month];
      monthName.style.gridRow = 1;
      monthName.style.gridColumn = column + 1;
      this.container.append(monthName);
    }
  }

  checkDay() {
    const dateNow = new Date();

    for (const date of this.dates[this.activeYear]) {
      const day = document.getElementById(`date-${date.year}-${date.month}-${date.day}`);

      if (+date.year === dateNow.getFullYear() && +date.month === dateNow.getMonth()
        && +date.day === dateNow.getDate()) continue;
      if (day.closest('.day-failed')) continue;
      if (date.status) day.classList.add('day-done');
      if (!date.status) day.classList.add('day-failed');
    }
  }

  setEvents() {
    this.btnBox.addEventListener('click', (e) => {
      const { target } = e;

      if (target.closest('.btn-year')) {
        const active = this.btnBox.getElementsByClassName('active')[0];

        active.classList.remove('active');
        this.activeYear = +target.getAttribute('data-year');
        target.classList.add('active');
        this.container.innerHTML = '';
        this.renderDaysName();
        this.renderDaysOfTheYear();
        this.checkDay();
        this.setTooltips();
      }
    });

    this.setTooltips();

    this.container.addEventListener('mouseover', (e) => {
      const { target } = e;

      this.showTooltip(target);
    });

    this.container.addEventListener('mouseout', (e) => {
      const { target } = e;

      if (target.closest('.day')) {
        document.getElementsByClassName('tooltip')[0].remove();
      }
    });
  }

  setTooltips() {
    const tooltips = {};

    for (const date of this.dates[this.activeYear]) {
      const dateId = `date-${date.year}-${date.month}-${date.day}`;

      if (!Object.prototype.hasOwnProperty.call(tooltips, dateId)) {
        tooltips[dateId] = [];
      }

      tooltips[dateId].push({
        name: date.action_name,
        status: date.status,
      });
    }

    this.tooltips = tooltips;
  }

  showTooltip(target) {
    if (target.closest('.day')) {
      const tooltip = document.createElement('div');
      const triangle = document.createElement('div');
      const actionDate = document.createElement('p');
      const monthsArr = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

      tooltip.classList.add('tooltip');
      target.append(tooltip);
      triangle.classList.add('triangle-down');
      tooltip.append(triangle);

      const regexp = /\d+/g;
      regexp.lastIndex = 5;
      const year = regexp.exec(target.id)[0];
      regexp.lastIndex = 10;
      const month = monthsArr[regexp.exec(target.id)[0]];
      regexp.lastIndex = 12;
      const day = regexp.exec(target.id)[0];

      actionDate.innerText = `${month} ${day}, ${year}`;
      actionDate.classList.add('action-date');
      tooltip.append(actionDate);

      if (this.tooltips[target.id]) {
        for (const action of this.tooltips[target.id]) {
          const actionName = document.createElement('p');

          actionName.innerText = action.name;
          if (!action.status) actionName.style.color = '#BF250D';
          if (action.status) actionName.style.color = '#02B3C7';

          tooltip.append(actionName);
        }
      } else {
        tooltip.classList.add('tooltip-only-date');
      }

      const tooltipStyle = getComputedStyle(tooltip);
      const targetStyle = getComputedStyle(target);
      const leftValue = (parseInt(tooltipStyle.width, 10) / 2
        - parseInt(targetStyle.width, 10) / 2) * -1;
      const topValue = (parseInt(tooltipStyle.height, 10)
        + parseInt(targetStyle.height, 10) / 2) * -1;

      tooltip.style.left = `${leftValue}px`;
      tooltip.style.top = `${topValue}px`;

      const coord = tooltip.getBoundingClientRect();

      if (coord.left < 0) {
        tooltip.style.left = '-40px';
        triangle.style.left = '45px';
      }
      if (coord.left > 0) {
        triangle.style.right = 0;
      }

      if (coord.right > document.documentElement.clientWidth) {
        tooltip.style.left = 'auto';
        tooltip.style.right = '-40px';
        triangle.style.right = '45px';
        triangle.style.left = 'auto';
      }
    }
  }

  setSuccessDaysInMonth() {
    const dateNow = new Date();
    const monthNow = dateNow.getMonth();
    const dayNow = dateNow.getDate();
    const succesDays = [];
    const failedDays = [];
    const daysInMonth = new Date(dateNow.getFullYear(), monthNow + 1, 0).getDate();
    const allSuccesDays = [];
    const allFailedDays = [];
    const allDaysInYear = [];
    const totalDays = [];
    const actionsWithDebts = [];
    const debts = [];
    const activeActions = {};

    for (const action of this.dataActions.actions) {
      if (action.debt) actionsWithDebts.push(action);
      if (action.status) {
        activeActions[action.name] = { successDaysInMonth: 0, failedDaysInMonth: 0 };
      }
    }

    for (const date of this.dates[this.activeYear]) {
      const indexSucces = succesDays.indexOf(date.day);
      const indexFailed = failedDays.indexOf(date.day);
      const indexAllSuccessDays = allSuccesDays.indexOf(`${date.year}-${date.month}-${date.day}`);
      const indexAllFailedDays = allFailedDays.indexOf(`${date.year}-${date.month}-${date.day}`);
      const indexInYear = allDaysInYear.indexOf(`${date.year}-${date.month}-${date.day}`);

      if (+date.month === monthNow) {
        if (date.status && indexSucces < 0) succesDays.push(date.day);
        if (!date.status && indexSucces > -1) succesDays.splice(indexSucces, 1);
        if (!date.status && indexFailed < 0 && +date.day < dayNow) failedDays.push(date.day);
        if (date.status) activeActions[date.action_name].successDaysInMonth += 1;
        if (!date.status) activeActions[date.action_name].failedDaysInMonth += 1;
      }

      if (date.status && indexAllSuccessDays < 0) {
        allSuccesDays.push(`${date.year}-${date.month}-${date.day}`);
      }
      if (!date.status && indexAllSuccessDays > -1) allSuccesDays.splice(indexAllSuccessDays, 1);
      if (!date.status && indexAllFailedDays < 0
        && (`${date.month}-${date.day}` !== `${monthNow}-${dayNow}`)) {
        allFailedDays.push(`${date.year}-${date.month}-${date.day}`);
      }
      if (indexInYear < 0
        && (`${date.month}-${date.day}` !== `${monthNow}-${dayNow}`)) {
        allDaysInYear.push(`${date.year}-${date.month}-${date.day}`);
      }
    }

    const percentSuccessInMonth = (succesDays.length * 100) / daysInMonth;
    const percentFailedInMonth = (failedDays.length * 100) / daysInMonth;
    const percentSuccessInYear = (allSuccesDays.length * 100) / allDaysInYear.length;
    const percentFailedInYear = (allFailedDays.length * 100) / allDaysInYear.length;

    for (const year in this.dates) {
      if (Object.prototype.hasOwnProperty.call(this.dates, year)) {
        for (const date of this.dates[year]) {
          const indexTotal = totalDays.indexOf(`${date.year}-${date.month}-${date.day}`);

          if (indexTotal < 0) totalDays.push(`${date.year}-${date.month}-${date.day}`);

          for (const action of actionsWithDebts) {
            if (action._id === date.id_action && !date.status
              && (`${date.year}-${date.month}-${date.day}` !== `${dateNow.getFullYear()}-${monthNow}-${dayNow}`)) {
              debts.push(date);
            }
          }
        }
      }
    }

    document.getElementById('success-days-in-month').innerText = succesDays.length;
    document.getElementById('percent-success-days-in-month').innerText = `${Math.floor(percentSuccessInMonth)}%`;
    document.getElementById('all-failed-days-in-month').innerText = failedDays.length;
    document.getElementById('percent-failed-days-in-month').innerText = `${Math.floor(percentFailedInMonth)}%`;
    document.getElementById('all-success-days').innerText = allSuccesDays.length;
    document.getElementById('percent-success-days').innerText = `${Math.floor(percentSuccessInYear) || 0}%`;
    document.getElementById('all-failed-days').innerText = allFailedDays.length;
    document.getElementById('percent-failed-days').innerText = `${Math.floor(percentFailedInYear || 0)}%`;
    document.getElementById('total-days').innerText = totalDays.length;
    document.getElementById('debts').innerText = debts.length;

    const activeActionsLength = Object.keys(activeActions).length;
    const actBlock = document.getElementById('stat-act-block');

    if (activeActionsLength) {
      for (const key in activeActions) {
        if (Object.prototype.hasOwnProperty.call(activeActions, key)) {
          const action = document.createElement('div');
          const percentCompletedAct = (activeActions[key].successDaysInMonth * 100) / daysInMonth;
          let percentFailedAct = (activeActions[key].failedDaysInMonth * 100) / daysInMonth;
          let failedDaysInMonth;

          if (activeActions[key].failedDaysInMonth - 1 < 0) {
            failedDaysInMonth = 0;
          } else {
            failedDaysInMonth = activeActions[key].failedDaysInMonth - 1;
          }

          if (activeActions[key].failedDaysInMonth - 1 === 0) percentFailedAct = 0;

          action.innerHTML = `<span>${key}:</span>
          <div><p class="act-done">Выполнено: ${activeActions[key].successDaysInMonth} (${Math.floor(percentCompletedAct)}%)</p>
          <p class="act-failed">Провалено: ${failedDaysInMonth} (${Math.floor(percentFailedAct)}%)</p></div>`;

          actBlock.append(action);
        }
      }
    } else {
      actBlock.innerHTML = '<p class="not-actions">Нет созданных действий</p>';
    }
  }
}

const container = document.getElementsByClassName('wrapper')[0];
const btnBox = document.getElementsByClassName('btn-box')[0];
const statistics = new StatisticsCreator(container, btnBox);

statistics.install();
