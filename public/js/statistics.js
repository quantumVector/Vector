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
}

const container = document.getElementsByClassName('wrapper')[0];
const statistics = new StatisticsCreator(container);

statistics.install();
