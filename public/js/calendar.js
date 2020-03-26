/* eslint-disable no-undef */
'use strict';

// eslint-disable-next-line import/extensions
import CalendarCreator from './calendarCreator.js';

const date = new Date();
const calendar = new CalendarCreator(
  date.getFullYear(),
  date.getMonth(),
  document.getElementsByClassName('calendar')[0],
);

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
