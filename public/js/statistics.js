/* eslint-disable no-continue */
/* eslint-disable no-undef */

'use strict';

class StatisticsCreator {
  constructor(container) {
    this.container = container;
  }

  async install() {
    await this.getActions();
    this.renderDays();
    this.setEvents();
  }

  async getActions() {
    const response = await fetch('/get-data-actions');

    if (response.ok) {
      this.dataActions = await response.json();
    } else {
      throw new Error(`Возникла проблема с fetch запросом. ${response.status}`);
    }
  }

  async renderDays() {
    const dateNow = new Date();
    // узнать кол-во дней в текущем году
    const totalDays = (new Date(dateNow.getFullYear(), 11, 31)
      - new Date(dateNow.getFullYear(), 0, 0)) / 86400000;

    for (let i = 2; i <= 8; i++) {
      const dayName = document.createElement('div');
      const dayArr = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

      dayName.innerText = dayArr[i - 2];
      dayName.style.gridRow = i;
      dayName.style.gridColumn = 1;

      this.container.append(dayName);
    }

    const startingDay = new Date(this.getMinDates());
    let column = 2;

    for (let i = 1; i <= totalDays; i++) {
      const currentDate = startingDay.getDay();
      const day = document.createElement('div');
      const monthsArr = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
      const monthName = document.createElement('div');
      monthName.classList.add('month');

      if (i === 1) {
        monthName.innerText = monthsArr[startingDay.getMonth()];
        monthName.style.gridRow = 1;
        monthName.style.gridColumn = 2;
        this.container.append(monthName);
      }
      if (startingDay.getDay() === 1 && startingDay.getDate() === 1) {
        monthName.innerText = monthsArr[startingDay.getMonth()];
        monthName.style.gridRow = 1;
        monthName.style.gridColumn = column;
        this.container.append(monthName);
      }
      if (startingDay.getDay() !== 1 && startingDay.getDate() === 1) {
        monthName.innerText = monthsArr[startingDay.getMonth()];
        monthName.style.gridRow = 1;
        monthName.style.gridColumn = column + 1;
        this.container.append(monthName);
      }

      day.classList.add('day', `day-${i}`);
      day.id = `date-${startingDay.getFullYear()}-${startingDay.getMonth()}-${startingDay.getDate()}`;
      day.style.gridColumn = column;

      if (currentDate > 0) day.style.gridRow = startingDay.getDay() + 1;
      if (currentDate === 0) {
        day.style.gridRow = 8;
        column += 1;
      }

      this.container.append(day);

      startingDay.setDate(startingDay.getDate() + 1);
    }

    this.checkDay();
  }

  getMinDates() {
    const allDates = [];

    for (const key in this.dataActions.dates) {
      if ({}.hasOwnProperty.call(this.dataActions.dates, key)) {
        for (const date of this.dataActions.dates[key]) {
          allDates.push(new Date(date.year, date.month, date.day).getTime());
        }
      }
    }

    return Math.min(...allDates);
  }

  checkDay() {
    const dateNow = new Date();

    for (const key in this.dataActions.dates) {
      if ({}.hasOwnProperty.call(this.dataActions.dates, key)) {
        for (const date of this.dataActions.dates[key]) {
          const day = document.getElementById(`date-${date.year}-${date.month}-${date.day}`);

          if (+date.year === dateNow.getFullYear() && +date.month === dateNow.getMonth()
          && +date.day === dateNow.getDate()) continue;
          if (day.closest('.day-failed')) continue;
          if (date.status) day.classList.add('day-done');
          if (!date.status) day.classList.add('day-failed');
        }
      }
    }
  }

  setEvents() {
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

    for (const key in this.dataActions.dates) {
      if ({}.hasOwnProperty.call(this.dataActions.dates, key)) {
        for (const date of this.dataActions.dates[key]) {
          const dateId = `date-${date.year}-${date.month}-${date.day}`;

          if (!Object.prototype.hasOwnProperty.call(tooltips, dateId)) {
            tooltips[dateId] = [];
          }

          tooltips[dateId].push({
            name: date.action_name,
            status: date.status,
          });
        }
      }
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
      tooltip.append(actionDate);

      if (this.tooltips[target.id]) {
        const actionWrapper = document.createElement('div');

        tooltip.append(actionWrapper);

        for (const action of this.tooltips[target.id]) {
          const actionName = document.createElement('p');

          actionName.innerText = action.name;
          if (!action.status) actionName.style.color = 'red';

          actionWrapper.append(actionName);
        }
      }

      const tooltipStyle = getComputedStyle(tooltip);
      const targetStyle = getComputedStyle(target);
      const leftValue = (parseInt(tooltipStyle.width, 10) / 2
      - parseInt(targetStyle.width, 10) / 2) * -1;
      const topValue = (parseInt(tooltipStyle.height, 10)
      + parseInt(targetStyle.height, 10) / 2) * -1;

      tooltip.style.left = `${leftValue}px`;
      tooltip.style.top = `${topValue}px`;
    }
  }
}

const container = document.getElementsByClassName('wrapper')[0];
const statistics = new StatisticsCreator(container);

statistics.install();
