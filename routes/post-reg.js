const { Router } = require('express');
const { check, body, validationResult } = require('express-validator');
const UserCalendar = require('../models/UserCalendar');

const router = Router();

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
    // eslint-disable-next-line prefer-destructuring
    req.session.errors = result.array({ onlyFirstError: true })[0];
    res.redirect('back');
  } else {
    const { name, password } = req.body;

    UserCalendar.create({
      name,
      password,
    }, (error, post) => {
      console.log(error, post);
    });

    res.redirect('/');
  }
});

module.exports = router;
