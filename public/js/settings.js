/* eslint-disable no-undef */

'use strict';

const everyday = document.getElementById('everyday');
const certainDays = document.getElementsByName('period');

everyday.addEventListener('click', () => {
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
});

async function renderUserActions() {
  const response = await fetch('/getdata');
  let data;

  if (response.ok) {
    data = await response.json();
  } else {
    throw new Error(`Возникла проблема с fetch запросом. ${response.status}`);
  }

  const container = document.getElementsByClassName('actions-box')[0];

  for (const action of data) {
    const div = document.createElement('div');
    const name = document.createElement('h2');
    const box = document.createElement('div');
    const boxTitle = document.createElement('h3');
    const debt = document.createElement('p');

    container.appendChild(div);
    div.classList.add('action-item');
    div.appendChild(name);
    name.classList.add('action-name');
    div.appendChild(boxTitle);
    boxTitle.innerText = 'Периодичность:';
    div.appendChild(box);
    box.classList.add('action-days');
    div.appendChild(debt);

    for (const key in action) {
      if ({}.hasOwnProperty.call(action, key)) {
        name.innerText = key;

        if (action[key].params.days === 'everyday') {
          box.innerText = 'Каждый день';
        }

        if (Array.isArray(action[key].params.days)) {
          console.log(action[key].params.days);

          box.innerText = action[key].params.days.join(', ');
        }

        if (action[key].params.debt) {
          debt.innerText = 'Долги учитываются';
        } else {
          debt.innerText = 'Без учёта долгов';
        }
      }
    }
  }
}

renderUserActions();
