/* eslint-disable no-undef */

describe('Тестирования класса CalendarCreator', () => {
  describe('Инициализация', () => {
    const date = new Date();

    it('Текущая дата установлена правильно', () => {
      const currentDate = date.getFullYear();
      const currentMonth = date.getMonth();

      assert.equal(currentDate, calendar.currentDate[0]);
      assert.equal(currentMonth, calendar.currentDate[1]);
    });

    it('Даты левого календаря соответствуют прошлому месяцу', () => {
      const currentDate = [date.getFullYear(), date.getMonth()];
      const leftMonth = currentDate[1] - 1;
      let leftCalendar;

      if (leftMonth < 0) leftCalendar = [currentDate[0] - 1, 11];
      if (leftMonth >= 0) leftCalendar = [currentDate[0], leftMonth];

      assert.equal(leftCalendar[0], calendar.leftCalendar[0]);
      assert.equal(leftCalendar[1], calendar.leftCalendar[1]);
    });

    it('Даты центрального календаря соответствуют текущему месяцу', () => {
      const middleCalendar = [date.getFullYear(), date.getMonth()];

      assert.equal(middleCalendar[0], calendar.middleCalendar[0]);
      assert.equal(middleCalendar[1], calendar.middleCalendar[1]);
    });

    it('Даты правого календаря соответствуют следующему месяцу', () => {
      const currentDate = [date.getFullYear(), date.getMonth()];
      const rightMonth = currentDate[1] + 1;
      let rightCalendar;

      if (rightMonth > 11) rightCalendar = [currentDate[0] + 1, 0];
      if (rightMonth <= 11) rightCalendar = [currentDate[0], rightMonth];

      assert.equal(rightCalendar[0], calendar.rightCalendar[0]);
      assert.equal(rightCalendar[1], calendar.rightCalendar[1]);
    });

    it('Левый календарь рендериться в элементе, который заданн в container', () => {
      const container = document.createElement('div');
      const newCalendar = new CalendarCreator(container);
      newCalendar.install();

      assert.propertyVal(container.childNodes[0], 'className', 'left-calendar');
    });

    it('Центральный календарь рендериться в элементе, который заданн в container', () => {
      const container = document.createElement('div');
      const newCalendar = new CalendarCreator(container);
      newCalendar.install();

      assert.propertyVal(container.childNodes[1], 'className', 'middle-calendar');
    });

    it('Правый календарь рендериться в элементе, который заданн в container', () => {
      const container = document.createElement('div');
      const newCalendar = new CalendarCreator(container);
      newCalendar.install();

      assert.propertyVal(container.childNodes[2], 'className', 'right-calendar');
    });
  });

  describe('Переключение на прошлый календарь', () => {
    const date = new Date();
    const container = document.createElement('div');
    const newCalendar = new CalendarCreator(container);

    newCalendar.install();
    newCalendar.update('left');

    it('Текущая дата должна поменять своё значение на значение прошлого месяца, если переключить календарь назад', () => {
      const leftMonth = date.getMonth() - 1;
      let leftCalendar;

      if (leftMonth < 0) leftCalendar = [date.getFullYear() - 1, 11];
      if (leftMonth >= 0) leftCalendar = [date.getFullYear(), leftMonth];

      assert.equal(leftCalendar[0], newCalendar.currentDate[0]);
      assert.equal(leftCalendar[1], newCalendar.currentDate[1]);
    });

    it('Дата левого календаря должна поменяться на дату прошлого месяца, относительно новой текущей даты', () => {
      const leftMonth = newCalendar.currentDate[1] - 1;
      let leftCalendar;

      if (leftMonth < 0) leftCalendar = [newCalendar.currentDate[0] - 1, 11];
      if (leftMonth >= 0) leftCalendar = [newCalendar.currentDate[0], leftMonth];

      assert.equal(leftCalendar[0], newCalendar.leftCalendar[0]);
      assert.equal(leftCalendar[1], newCalendar.leftCalendar[1]);
    });

    it('Дата центрального календаря должна поменяться на текущую дату', () => {
      const leftMonth = date.getMonth() - 1;
      let leftCalendar;

      if (leftMonth < 0) leftCalendar = [date.getFullYear() - 1, 11];
      if (leftMonth >= 0) leftCalendar = [date.getFullYear(), leftMonth];

      assert.equal(leftCalendar[0], newCalendar.middleCalendar[0]);
      assert.equal(leftCalendar[1], newCalendar.middleCalendar[1]);
    });

    it('Дата правого календаря должна поменяться на дату следующего месяца, относительно новой текущей даты', () => {
      const rightMonth = newCalendar.currentDate[1] + 1;
      let rightCalendar;

      if (rightMonth > 11) rightCalendar = [newCalendar.currentDate[0] + 1, 0];
      if (rightMonth <= 11) rightCalendar = [newCalendar.currentDate[0], rightMonth];

      assert.equal(rightCalendar[0], newCalendar.rightCalendar[0]);
      assert.equal(rightCalendar[1], newCalendar.rightCalendar[1]);
    });
  });

  describe('Переключение на будущий календарь', () => {
    const date = new Date();
    const container = document.createElement('div');
    const newCalendar = new CalendarCreator(container);

    newCalendar.install();
    newCalendar.update('right');

    it('Текущая дата должна поменять своё значение на значение следующего месяца, если переключить календарь вперёд', () => {
      const rightMonth = date.getMonth() + 1;
      let rightCalendar;

      if (rightMonth > 11) rightCalendar = [date.getFullYear() + 1, 0];
      if (rightMonth <= 11) rightCalendar = [date.getFullYear(), rightMonth];

      assert.equal(rightCalendar[0], newCalendar.currentDate[0]);
      assert.equal(rightCalendar[1], newCalendar.currentDate[1]);
    });

    it('Дата левого календаря должна поменяться на дату прошлого месяца, относительно новой текущей даты', () => {
      const leftMonth = newCalendar.currentDate[1] - 1;
      let leftCalendar;

      if (leftMonth < 0) leftCalendar = [newCalendar.currentDate[0] - 1, 11];
      if (leftMonth >= 0) leftCalendar = [newCalendar.currentDate[0], leftMonth];

      assert.equal(leftCalendar[0], newCalendar.leftCalendar[0]);
      assert.equal(leftCalendar[1], newCalendar.leftCalendar[1]);
    });

    it('Дата центрального календаря должна поменяться на текущую дату', () => {
      const rightMonth = date.getMonth() + 1;
      let rightCalendar;

      if (rightMonth > 11) rightCalendar = [newCalendar.currentDate[0] + 1, 0];
      if (rightMonth <= 11) rightCalendar = [newCalendar.currentDate[0], rightMonth];

      assert.equal(rightCalendar[0], newCalendar.middleCalendar[0]);
      assert.equal(rightCalendar[1], newCalendar.middleCalendar[1]);
    });

    it('Дата правого календаря должна поменяться на дату следующего месяца, относительно новой текущей даты', () => {
      const rightMonth = newCalendar.currentDate[1] + 1;
      let rightCalendar;

      if (rightMonth > 11) rightCalendar = [newCalendar.currentDate[0] + 1, 0];
      if (rightMonth <= 11) rightCalendar = [newCalendar.currentDate[0], rightMonth];

      assert.equal(rightCalendar[0], newCalendar.rightCalendar[0]);
      assert.equal(rightCalendar[1], newCalendar.rightCalendar[1]);
    });
  });

  describe('Рендер элементов таблицы', () => {
    const container = document.createElement('div');
    const newCalendar = new CalendarCreator(container);

    newCalendar.install();

    it('Название текущего месяца и года рендерится', () => {
      const div = container.getElementsByClassName('middle-calendar')[0];
      const title = div.getElementsByClassName('calendar-title')[0];

      assert.isDefined(title);
    });

    it('Название месяца должно быть корректным', () => {
      const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

      for (let i = 0; i < 12; i++) {
        const leftCalendar = container.getElementsByClassName('left-calendar')[0];
        const middleCalendar = container.getElementsByClassName('middle-calendar')[0];
        const rightCalendar = container.getElementsByClassName('right-calendar')[0];

        rightCalendar.remove();

        middleCalendar.classList.remove('middle-calendar');
        middleCalendar.classList.add('right-calendar');

        leftCalendar.classList.remove('left-calendar');
        leftCalendar.classList.add('middle-calendar');

        newCalendar.update('left');

        const div = container.getElementsByClassName('middle-calendar')[0];
        const title = div.getElementsByClassName('calendar-title')[0];

        const month = title.innerText.match(/^\S+/i);

        assert.equal(months.indexOf(month[0]), newCalendar.currentDate[1]);
      }
    });
  });
});
