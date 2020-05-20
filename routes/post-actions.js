const { Router } = require('express');
const { check, body, validationResult } = require('express-validator');
const { ObjectId } = require('mongoose').Types.ObjectId;
const UserCalendar = require('../models/UserCalendar');
const UserActions = require('../lib/user-actions');

const router = Router();

router.post('/create-action', [
  check('action', 'Название должно состоять от 1 до 30 символов и содержать только цифры, латиницу, нижнее подчеркивание, тире, пробел')
    .not().isEmpty()
    .withMessage('Вы не указали название')
    .isLength({ min: 1, max: 30 })
    .withMessage('Название должно состоять от 1 до 30 символов')
    .matches(/^[a-zA-Zа-яА-Я0-9_ -]+$/, 'i')
    .withMessage('Название должно содержать только цифры, латиницу, кириллицу, нижнее подчеркивание, тире, пробел'),

  body('name').trim(),

  check('period').not().isEmpty().withMessage('Должен быть указан минимум один день'),
  check('start').not().isEmpty().withMessage('Укажите дату начала с которой действие будет применено'),
], async (req, res) => {
  const errorFormatter = ({ msg }) => msg;
  const result = validationResult(req).formatWith(errorFormatter);

  await UserCalendar.findOne({ _id: new ObjectId(req.session.userId) }, async (err, user) => {
    if (err) throw err;

    const { action, period, start, end, debt } = req.body;

    let checkName = false;

    // проверить, есть ли уже действия с таким названием
    for (const item of user.actions) {
      if (action === item.name) checkName = true;
    }

    // максимальное число можно увеличить до 30
    if (user.actions.length === 10) {
      req.session.errors = 'У вас уже максимальное число созданных действий';
      res.redirect('back');
    } else if (!result.isEmpty()) {
      // eslint-disable-next-line prefer-destructuring
      req.session.errors = result.array({ onlyFirstError: true })[0];
      res.redirect('back');
    } else if (checkName) {
      req.session.errors = 'У вас уже есть действие с таким название';
      res.redirect('back');
    } else {
      let position;

      // найти и узнать последний порядковый номер действия
      await UserCalendar.findOne({ _id: new ObjectId(req.session.userId) }, (err, user) => {
        if (err) throw err;

        let presenceActiv = false;

        // проверить наличие активных действий
        if (user.actions.length) {
          for (const act of user.actions) {
            if (act.status) presenceActiv = true;
          }
        }

        // если действий нет или есть только завершенные действия, то установить позицию 1
        if (!user.actions.length || !presenceActiv) {
          position = 1;
        } else {
          const posArr = [];

          for (const act of user.actions) {
            if (act.status) posArr.push(act.position);
          }

          position = Math.max(...posArr) + 1;
        }
      });

      // если сделать async, то push будет происходить два раза
      UserCalendar.findOneAndUpdate(
        { _id: new ObjectId(req.session.userId) },
        { $push: { actions: UserActions.addAction(action, period, debt, position, start, end) } },
        (err) => {
          if (err) throw err;

          res.redirect('back');
        },
      );
    }
  });
});

router.get('/getdata', async (req, res) => {
  let actions;

  await UserCalendar.findOne({ _id: new ObjectId(req.session.userId) }, (err, user) => {
    if (err) throw err;

    actions = user.actions;
  });

  res.json(actions);
});

router.get('/getdata-test', async (req, res) => {
  let actions;

  await UserCalendar.findOne({ name: 'simulated tester' }, (err, user) => {
    if (err) throw err;

    actions = user.actions;
  });

  res.json(actions);
});

router.post('/deactivate-action', async (req, res) => {
  const { actionId, position } = req.body;

  await UserCalendar.findOneAndUpdate(
    { _id: new ObjectId(req.session.userId), actions: { $elemMatch: { _id: actionId } } },
    { $set: { 'actions.$.status': false, 'actions.$.position': 0 } },
    (err, user) => {
      if (err) throw err;

      for (const action of user.actions) {
        if (action.position > position) action.position -= 1;
      }

      user.save();

      res.json(`${actionId} was deactivated`);
    },
  );
});

router.post('/delete-action', async (req, res) => {
  const { actionId } = req.body;

  await UserCalendar.findOne(
    { _id: new ObjectId(req.session.userId) },
    (err, user) => {
      if (err) throw err;

      user.actions.id(actionId).remove();

      for (let i = user.dates.length - 1; i >= 0; i--) {
        if (user.dates[i].id_action === actionId) user.dates[i].remove();
      }

      user.save();
      res.json(`${actionId} was deleted`);
    },
  );
});

router.post('/set-position-action', async (req, res) => {
  const actionsId = req.body;

  await UserCalendar.findOne(
    { _id: new ObjectId(req.session.userId) },
    (err, user) => {
      if (err) throw err;

      for (let i = 0; i < actionsId.length; i++) {
        const action = user.actions.id(actionsId[i]);

        action.position = i + 1;
      }

      user.save();
      res.json('success');
    },
  );
});

module.exports = router;
