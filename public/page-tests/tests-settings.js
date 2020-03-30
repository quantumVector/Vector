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

  describe('Тестирование блока с действиями', () => {
    it('Блок должен содержать все действия, которые были созданы пользователем', () => {
    });

    it('В блоке должна отображаться надпись об отсутсвии действий, если пользователь их не создавал', () => {
    });

    it('Название действия должно отображаться в соответствующем ему блоке', () => {
    });

    it('Периодичность должна отображаться в соответствующем ему блоке', () => {
    });

    it('Должна отображаться надпись "Каждый день", если в действии был указан соответсвущий пункт', () => {
    });

    it('Должныо ображаться дни, которые были выбраны для действия', () => {
    });

    it('Информация об учёте долгов должна отображаться в соответствующем ему блоке', () => {
    });
  });
});
