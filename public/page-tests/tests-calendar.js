/* eslint-disable no-undef */

describe('Тестирования класса CalendarCreator', () => {

  it('Объект calendar должен устанавливаться с корректными датами', () => {
    const date = new Date();
    const currentDate = [date.getFullYear(), date.getMonth()];

    assert.equal(currentDate[0], calendar.currentDate[0], 'Текущий год устанавливается правильно');
  });

});