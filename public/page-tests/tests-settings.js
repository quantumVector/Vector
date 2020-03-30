/* eslint-disable no-undef */
describe('Тестирование страницы "Настройки"', () => {
  describe('Форма создания действия', () => {
    const everyday = document.getElementById('everyday');
    const certainDays = document.getElementsByName('period');

    before(() => {
      const settings = new Settings();
      const div = document.createElement('div');

      settings.renderActions(div);
    });

    it('Список дней должен быть заблокирован, если пункт "каждый день" активен', () => {
      everyday.checked = 1;
      settings.constructor.togglePeriod();

      for (let i = 1; i <= 7; i++) {
        assert.isTrue(certainDays[i].disabled);
      }
    });

    it('Список дней должен быть разблокирован, если пункт "каждый день" неактивен', () => {
      everyday.checked = 0;
      settings.constructor.togglePeriod();

      for (let i = 1; i <= 7; i++) {
        assert.isFalse(certainDays[i].disabled);
      }
    });

  });
});