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
    const everyday = document.getElementById('everyday');
    const certainDays = document.getElementsByName('period');
    let div;
    let dataTester;

    before(async () => {
      const settings = new Settings();

      div = document.createElement('div');
      emptyDiv = document.createElement('div');
      settings.getData = async function getData() {
        const response = await fetch('/getdata-test');

        if (response.ok) {
          this.data = await response.json();
        } else {
          throw new Error(`Возникла проблема с fetch запросом. ${response.status}`);
        }
      };

      settings.renderActions(div);

      const response = await fetch('/getdata-test');

      if (response.ok) {
        dataTester = await response.json();
      } else {
        throw new Error(`Возникла проблема с fetch запросом. ${response.status}`);
      }
    });

    it('Блок должен содержать все действия, которые были созданы пользователем', () => {
      assert.equal(dataTester.length, div.children.length);
    });

    it('В блоке должна отображаться надпись об отсутсвии действий, если пользователь их не создавал', async () => {
      const emptyDiv = document.createElement('div');
      const settings2 = new Settings();

      settings2.getData = async function getData() {
        this.data = [];
      };

      await settings2.renderActions(emptyDiv);

      const emptyMsg = emptyDiv.getElementsByClassName('empty-msg')[0];

      assert.equal(emptyMsg.innerText, 'Вы ещё не создали ни одного действия');
    });

    it('Название действия должно отображаться в соответствующем ему блоке', () => {
      for (let i = 0; i < settings.data.length; i++) {
        const nameAction = div.getElementsByClassName('action-name')[i];
        const key = Object.keys(dataTester[i])[0];

        assert.equal(nameAction.innerText, key);
      }
    });

    it('Периодичность должна отображаться в соответствующем ему блоке', () => {
      for (let i = 0; i < settings.data.length; i++) {
        const daysAction = div.getElementsByClassName('action-days')[i];
        const key = Object.keys(dataTester[i])[0];
        let period = dataTester[i][key].params.days;

        if (Array.isArray(period)) period = period.join(', ');
        if (period === 'everyday') period = 'Каждый день';

        assert.equal(daysAction.innerText, period);
      }
    });

    it('Должна отображаться надпись "Каждый день", если в действии был указан соответсвущий пункт', () => {
      for (let i = 0; i < settings.data.length; i++) {
        const daysAction = div.getElementsByClassName('action-days')[i];
        const key = Object.keys(dataTester[i])[0];
        const period = dataTester[i][key].params.days;

        if (period === 'everyday') assert.equal(daysAction.innerText, 'Каждый день');
      }
    });

    it('Должны отображаться дни, которые были выбраны для действия', () => {
      for (let i = 0; i < settings.data.length; i++) {
        const daysAction = div.getElementsByClassName('action-days')[i];
        const key = Object.keys(dataTester[i])[0];
        const period = dataTester[i][key].params.days;

        if (Array.isArray(period)) assert.equal(daysAction.innerText, period.join(', '));
      }
    });

    it('Информация об учёте долгов должна отображаться в соответствующем ему блоке', () => {
      for (let i = 0; i < settings.data.length; i++) {
        const actionDebt = div.getElementsByClassName('action-debt')[i];
        const key = Object.keys(dataTester[i])[0];
        const dataDebt = dataTester[i][key].params.debt;

        if (dataDebt) {
          assert.equal(actionDebt.innerText, 'Долги учитываются');
        } else {
          assert.equal(actionDebt.innerText, 'Без учёта долгов');
        }
      }
    });
  });
});
