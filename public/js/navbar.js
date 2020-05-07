/* eslint-disable no-undef */
// eslint-disable-next-line lines-around-directive
'use strict';

function setVersion(version) {
  if (version === 'mob') document.getElementsByClassName('header-desk')[0].style.display = 'none';
  if (version === 'desk') document.getElementsByClassName('header-mob')[0].style.display = 'none';
}

function changeVersion(version) {
  if (version === 'mob') {
    document.getElementsByClassName('header-desk')[0].style.display = 'none';
    document.getElementsByClassName('header-mob')[0].style.display = 'flex';
  }
  if (version === 'desk') {
    document.getElementsByClassName('header-mob')[0].style.display = 'none';
    document.getElementsByClassName('header-desk')[0].style.display = 'flex';
  }
}

if (window.matchMedia('(max-width: 768px)').matches) {
  setVersion('mob');
} else {
  setVersion('desk');
}

window.addEventListener('resize', () => {
  if (window.matchMedia('(max-width: 768px)').matches) {
    changeVersion('mob');
  } else {
    changeVersion('desk');
  }
});

document.addEventListener('click', (e) => {
  const { target } = e;
  const modal = document.getElementsByClassName('modal-nav')[0];

  if (target.closest('.btn-navbar')) modal.classList.toggle('active-modal');
  if (target.closest('.close') || (target.closest('.modal-nav')
  && !target.closest('.modal-container'))) {
    modal.classList.toggle('active-modal');
    modal.classList.add('close-modal');
    setTimeout(() => {
      modal.classList.remove('close-modal');
    }, 300);
  }
});