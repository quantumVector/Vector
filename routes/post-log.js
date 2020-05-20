const { Router } = require('express');
const { check, validationResult } = require('express-validator');
const UserCalendar = require('../models/UserCalendar');

const router = Router();

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
    // eslint-disable-next-line prefer-destructuring
    req.session.errors = result.array({ onlyFirstError: true })[0];
    res.redirect('back');
  } else {
    const { name, password } = req.body;

    UserCalendar.findOne({ name }, (err, user) => {
      if (user) {
        if (password === user.password) {
          req.session.userId = user._id;
          req.session.userName = user.name;
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

module.exports = router;
