const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { suite } = require('selenium-webdriver/testing');
const { assert } = require('chai');

suite((env) => {
  describe('Межстраничные тесты', () => {
    let driver;

    before(async () => {
      driver = await new Builder().forBrowser('chrome').build();
    });

    after(() => driver.quit());

    describe('Валидация формы регистрации на сайте', () => {
      describe('Валидация имени пользователя', () => {
        function makeTest(nameTest, sendName, compare) {
          it(nameTest, async () => {
            await driver.get('http://localhost:3000/register');
            await driver.findElement(By.name('name')).sendKeys(sendName);
            await driver.findElement(By.id('btn-create-user')).click();
            const errorMsg = await driver.findElement(By.css('.error-msg')).getText();
            assert.strictEqual(errorMsg, compare);
          });
        }

        makeTest('Имя не должно быть пустым', '', 'Вы не указали имя');
        makeTest('Длина имени не должна быть менее 3 символов', 'Me',
          'Имя должно состоять от 3 до 16 символов');
        makeTest('Длина имени не должна быть более 16 символов', 'LoooooooooooooooooongName',
          'Имя должно состоять от 3 до 16 символов');
        makeTest('Имя должно состоять только из допустимых символов', '!#$<>?\\|♣•',
          'Имя должно содержать только цифры, латиницу, нижнее подчеркивание, тире, пробел');
        makeTest('Имя должно поддерживать только латинские буквы', 'Ярусский',
          'Имя должно содержать только цифры, латиницу, нижнее подчеркивание, тире, пробел');
      });

      describe('Валидация пароля пользователя', () => {
        function makeTest(nameTest, sendName, sendPassword, compare) {
          it(nameTest, async () => {
            await driver.get('http://localhost:3000/register');
            await driver.findElement(By.name('name')).sendKeys(sendName);
            await driver.findElement(By.name('password')).sendKeys(sendPassword);
            await driver.findElement(By.id('btn-create-user')).click();
            const errorMsg = await driver.findElement(By.css('.error-msg')).getText();
            assert.strictEqual(errorMsg, compare);
          });
        }

        makeTest('Пароль не должен быть пустым', 'SuperTester', '', 'Вы не указали пароль');
        makeTest('Пароль не должен быть менее 6 символов', 'SuperTester', '123',
          'Пароль должен состоять от 6 до 26 символов');
        makeTest('Пароль не должен быть более 26 символов', 'SuperTester',
          '123456789012345678901234567890', 'Пароль должен состоять от 6 до 26 символов');
        makeTest('Пароль должен состоять только из допустимых символов', 'SuperTester',
          '№:?@ .,\\вайвай',
          'Пароль должен содержать только цифры, латиницу, нижнее подчеркивание, тире');
        makeTest('Пароль должен поддерживать только латинские буквы', 'SuperTester',
          'Сложный русский пароль',
          'Пароль должен содержать только цифры, латиницу, нижнее подчеркивание, тире');
      });

      describe('Подтверждение пароля', () => {
        it('Пароль и подтверждение пароля должны совпадать', async () => {
          await driver.get('http://localhost:3000/register');
          await driver.findElement(By.name('name')).sendKeys('SuperTester');
          await driver.findElement(By.name('password')).sendKeys('123456789');
          await driver.findElement(By.name('password-confirmation')).sendKeys('983456701');
          await driver.findElement(By.id('btn-create-user')).click();
          const errorMsg = await driver.findElement(By.css('.error-msg')).getText();
          assert.strictEqual(errorMsg, 'Пароль и подтверждение пароля не совпадают');
        });
      });

      describe('Регистрация пользователя', () => {
        it(`Пользователь не должен быть зарегистрирован, если
            уже существует пользователь с таким же именем`, async () => {
          await driver.get('http://localhost:3000/register');
          await driver.findElement(By.name('name')).sendKeys('test');
          await driver.findElement(By.name('password')).sendKeys('123456');
          await driver.findElement(By.name('password-confirmation')).sendKeys('123456');
          await driver.findElement(By.id('btn-create-user')).click();
          const errorMsg = await driver.findElement(By.css('.error-msg')).getText();
          assert.strictEqual(errorMsg, 'Пользователь с таким именем уже существует');
        });
      });
    });

    describe('Валидация формы авторизации на сайте', () => {
      describe('Валидация имени пользователя', () => {
        function makeTest(nameTest, sendName, compare) {
          it(nameTest, async () => {
            await driver.get('http://localhost:3000/login');
            await driver.findElement(By.name('name')).sendKeys(sendName);
            await driver.findElement(By.id('btn-login-user')).click();
            const errorMsg = await driver.findElement(By.css('.error-msg')).getText();
            assert.strictEqual(errorMsg, compare);
          });
        }

        makeTest('Имя не должно быть пустым', '', 'Вы не указали имя');
        makeTest('Длина имени не должна быть менее 3 символов', 'Me',
          'Имя должно состоять от 3 до 16 символов');
        makeTest('Длина имени не должна быть более 16 символов', 'LoooooooooooooooooongName',
          'Имя должно состоять от 3 до 16 символов');
        makeTest('Имя должно состоять только из допустимых символов', '!#$<>?\\|♣•',
          'Имя должно содержать только цифры, латиницу, нижнее подчеркивание, тире, пробел');
        makeTest('Имя должно поддерживать только латинские буквы', 'Ярусский',
          'Имя должно содержать только цифры, латиницу, нижнее подчеркивание, тире, пробел');
      });

      describe('Валидация пароля пользователя', () => {
        function makeTest(nameTest, sendName, sendPassword, compare) {
          it(nameTest, async () => {
            await driver.get('http://localhost:3000/login');
            await driver.findElement(By.name('name')).sendKeys(sendName);
            await driver.findElement(By.name('password')).sendKeys(sendPassword);
            await driver.findElement(By.id('btn-login-user')).click();
            const errorMsg = await driver.findElement(By.css('.error-msg')).getText();
            assert.strictEqual(errorMsg, compare);
          });
        }

        makeTest('Пароль не должен быть пустым', 'SuperTester', '', 'Вы не указали пароль');
        makeTest('Пароль не должен быть менее 6 символов', 'SuperTester', '123',
          'Пароль должен состоять от 6 до 26 символов');
        makeTest('Пароль не должен быть более 26 символов', 'SuperTester',
          '123456789012345678901234567890', 'Пароль должен состоять от 6 до 26 символов');
        makeTest('Пароль должен состоять только из допустимых символов', 'SuperTester',
          '№:?@ .,\\вайвай',
          'Пароль должен содержать только цифры, латиницу, нижнее подчеркивание, тире');
        makeTest('Пароль должен поддерживать только латинские буквы', 'SuperTester',
          'Сложный русский пароль',
          'Пароль должен содержать только цифры, латиницу, нижнее подчеркивание, тире');
      });

      describe('Авторизация пользователя', () => {
        it(`Пользователь не должен быть авторизован, если
            он не зарегистрирован`, async () => {
          await driver.get('http://localhost:3000/login');
          await driver.findElement(By.name('name')).sendKeys('nonexistentUser');
          await driver.findElement(By.name('password')).sendKeys('123456');
          await driver.findElement(By.id('btn-login-user')).click();
          const needUrl = 'http://localhost:3000/register';
          const currentUrl = await driver.getCurrentUrl();
          assert.strictEqual(needUrl, currentUrl);
        });

        it(`Пользователь должен быть авторизован, если
            он зарегистрирован`, async () => {
          await driver.get('http://localhost:3000/login');
          await driver.findElement(By.name('name')).sendKeys('test');
          await driver.findElement(By.name('password')).sendKeys('123456');
          await driver.findElement(By.id('btn-login-user')).click();
          const needUrl = 'http://localhost:3000/';
          const currentUrl = await driver.getCurrentUrl();
          assert.strictEqual(needUrl, currentUrl);
        });

        it(`Неавторизованный пользователь не должен попасть на страницу,
            требующую авторизацию`, async () => {
          await driver.get('http://localhost:3000/');
          await driver.findElement(By.css('.logout')).click();
          await driver.get('http://localhost:3000/achievements');
          const needUrl = 'http://localhost:3000/login';
          const currentUrl = await driver.getCurrentUrl();
          assert.strictEqual(needUrl, currentUrl);
        });
      });
    });

    describe('Валидация создания действия в настройках', () => {
      before(async () => {
        await driver.get('http://localhost:3000/login');
        await driver.findElement(By.name('name')).sendKeys('test');
        await driver.findElement(By.name('password')).sendKeys('123456');
        await driver.findElement(By.id('btn-login-user')).click();
      });

      function makeTest(nameTest, nameSend, compare) {
        it(nameTest, async () => {
          await driver.get('http://localhost:3000/settings');
          await driver.findElement(By.name('action')).sendKeys(nameSend);
          await driver.findElement(By.id('btn-create-action')).click();
          const errorMsg = await driver.findElement(By.css('.error-msg')).getText();
          assert.strictEqual(errorMsg, compare);
        });
      }

      makeTest('Название не должен быть пустым', '', 'Вы не указали название');
      makeTest('Название не должено быть более 30 символов',
        'Сууууууууупер Длинное Назвааааааание',
        'Название должно состоять от 1 до 30 символов');
      makeTest('Название должно состоять только из допустимых символов',
        '№:?@ .,\\вайвай',
        'Название должно содержать только цифры, латиницу, кириллицу, нижнее подчеркивание, тире, пробел');

      it('Должен быть выбран минимум один день при выборе определённого дня периода', async () => {
        await driver.get('http://localhost:3000/settings');
        await driver.findElement(By.name('action')).sendKeys('Action Cross Test');
        await driver.findElement(By.id('everyday')).click();
        await driver.findElement(By.id('btn-create-action')).click();
        const errorMsg = await driver.findElement(By.css('.error-msg')).getText();
        assert.strictEqual(errorMsg, 'Должен быть указан минимум один день');
      });
    });
  });

});
