const { Router } = require('express');
const { check, body, validationResult } = require('express-validator');
const { ObjectId } = require('mongoose').Types.ObjectId;
const UserCalendar = require('../models/UserCalendar');
const UserActions = require('../lib/user-actions');

const router = Router();

router.get('/', async (req, res) => {
  console.log(req.session);

  let calendar;

  if (req.session.userId) {
    await UserCalendar.findOne({ _id: new ObjectId(req.session.userId) }, (err, user) => {
      calendar = user.name;
    });
  } else {
    calendar = 'Авторизуйтесь, чтобы начать управление календарем';
  }

  res.render('index', {
    title: 'Goals Calendar',
    calendar,
    calendarStyle: 'css/calendar.css',
    pageTestScript: 'page-tests/tests-calendar.js',
  });
});

router.get('/settings', (req, res) => {
  if (req.session.userId) {
    res.render('settings', {
      title: 'Настройки',
      isSettings: true,
    });
  } else {
    res.redirect('/login');
  }
});

router.get('/statistics', (req, res) => {
  if (req.session.userId) {
    res.render('statistics', {
      title: 'Статистика',
      isStatistics: true,
    });
  } else {
    res.redirect('/login');
  }
});

router.get('/manual', (req, res) => {
  res.render('manual', {
    title: 'Руководство',
    isManual: true,
  });
});

router.get('/achievements', (req, res) => {
  if (req.session.userId) {
    res.render('achievements', {
      title: 'Достижения',
      isAchievements: true,
    });
  } else {
    res.redirect('/login');
  }
});

router.get('/login', (req, res) => {
  res.render('login', {
    title: 'Авторизация',
  });
});

router.get('/register', (req, res) => {
  res.render('register', {
    title: 'Регистрация',
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// ------------------------------ Login user ----------------------------------
router.post('/login', [
  check('name', 'Имя должно состоять от 3 до 16 символов и содержать только цифры, латиницу, нижнее подчеркивание, тире, пробел')
    .not().isEmpty()
    .withMessage('Вы не указали имя')
    .isLength({ min: 3, max: 16 })
    .withMessage('Имя должно состоять от 3 до 16 символов')
    .matches(/^[a-zA-Z0-9_ -]+$/, 'i')
    .withMessage('Имя должно содержать только цифры, латиницу, нижнее подчеркивание, тире, пробел')
    .bail(),

  check('password').not().isEmpty().withMessage('Вы не указали пароль')
    .isLength({ min: 6, max: 26 })
    .withMessage('Пароль должен состоять от 6 до 26 символов')
    .matches(/^[a-zA-Z0-9_-]+$/, 'i')
    .withMessage('Пароль должен содержать только цифры, латиницу, нижнее подчеркивание, тире'),
], (req, res) => {
  const errorFormatter = ({ msg }) => msg;
  const result = validationResult(req).formatWith(errorFormatter);

  if (!result.isEmpty()) {
    res.render('register', {
      title: 'Регистрация',
      errors: result.array({ onlyFirstError: true })[0],
    });
  } else {
    const { name, password } = req.body;

    UserCalendar.findOne({ name }, (err, user) => {
      if (user) {
        if (password === user.password) {
          req.session.userId = user._id;
          res.redirect('/');
        } else {
          res.redirect('/login');
        }
      } else {
        res.redirect('/register');
      }
    });
  }
});
// ------------------------------ Login user end ----------------------------------

// ------------------------------ Register user ----------------------------------
router.post('/register', [
  check('name', 'Имя должно состоять от 3 до 16 символов и содержать только цифры, латиницу, нижнее подчеркивание, тире, пробел')
    .not().isEmpty()
    .withMessage('Вы не указали имя')
    .isLength({ min: 3, max: 16 })
    .withMessage('Имя должно состоять от 3 до 16 символов')
    .matches(/^[a-zA-Z0-9_ -]+$/, 'i')
    .withMessage('Имя должно содержать только цифры, латиницу, нижнее подчеркивание, тире, пробел')
    .bail()
    .custom(async (value) => {
      const result = await UserCalendar.findOne({ name: value });
      if (result) throw new Error('Пользователь с таким именем уже существует');
    }),

  body('name').trim(),

  check('password').not().isEmpty().withMessage('Вы не указали пароль')
    .isLength({ min: 6, max: 26 })
    .withMessage('Пароль должен состоять от 6 до 26 символов')
    .matches(/^[a-zA-Z0-9_-]+$/, 'i')
    .withMessage('Пароль должен содержать только цифры, латиницу, нижнее подчеркивание, тире'),

  check('password-confirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Пароль и подтверждение пароля не совпадают');
    }

    return true;
  }),
], (req, res) => {
  const errorFormatter = ({ msg }) => msg;
  const result = validationResult(req).formatWith(errorFormatter);

  if (!result.isEmpty()) {
    res.render('register', {
      title: 'Регистрация',
      errors: result.array({ onlyFirstError: true })[0],
    });
  } else {
    const { name, password } = req.body;

    UserCalendar.create({
      name,
      password,
      // actions: UserActions.createActions(),
      // actions: 'something',
    }, (error, post) => {
      console.log(error, post);
    });

    res.redirect('/');
  }
});
// ------------------------------ Register user end ----------------------------------

router.post('/settings', (req, res) => {
  const { phase } = req.body;

  console.log(phase);

  UserCalendar.findOneAndUpdate({ name: 'test' }, { $push: { actions: UserActions.addAction(phase) } }, (err) => {
    if (err) throw err;

    res.redirect('/');
  });

  // res.redirect('/');
});

module.exports = router;
