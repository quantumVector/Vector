const allDays = document.getElementById('all-days');
const period = document.getElementsByName('period');

allDays.addEventListener('click', () => {
  if (allDays.checked) {
    for (let i = 1; i <= 7; i++) {
      period[i].disabled = 1;
      period[i].checked = 0;
    }
  } else {
    for (let i = 1; i <= 7; i++) {
      period[i].disabled = 0;
    }
  }
});
