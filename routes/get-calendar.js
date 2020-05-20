const { Router } = require('express');
const { ObjectId } = require('mongoose').Types.ObjectId;
const UserCalendar = require('../models/UserCalendar');

const router = Router();

router.get('/', async (req, res) => {
  if (req.session.userId) {
    res.render('index', {
      title: 'Goals Calendar',
      isCalendar: true,
      style: {
        desk: 'css/calendar.css',
        mob: 'css/calendar-mob.css',
      },
      styleMob: 'css/calendar-mob.css',
      script: 'js/calendar.js',
      pageTestScript: 'page-tests/tests-calendar.js',
    });
  } else {
    res.redirect('/manual');
  }
});

router.get('/get-data-actions', async (req, res) => {
  await UserCalendar.findOne({ _id: new ObjectId(req.session.userId) },
    (err, user) => {
      if (err) throw err;

      const actions = [];
      const notActive = [];
      const dates = {};
      const notActiveDates = {};
      const debts = [];
      const dateNow = new Date();
      const yearNow = dateNow.getFullYear();
      const monthNow = dateNow.getMonth();
      const dayNow = dateNow.getDate();

      for (const action of user.actions) {
        if (action.status) {
          actions.push(action);
          dates[action._id] = [];

          for (const date of user.dates) {
            // eslint-disable-next-line eqeqeq
            if (action._id == date.id_action) {
              dates[action._id].push(date);

              if (action.debt) {
                if (!date.status) {
                  if (+date.year === yearNow && +date.month === monthNow
                    && +date.day === dayNow) continue;
                  debts.push(date);
                }
              }
            }
          }
        } else {
          notActive.push(action);
          notActiveDates[action._id] = [];

          for (const date of user.dates) {
            // eslint-disable-next-line eqeqeq
            if (action._id == date.id_action) {
              notActiveDates[action._id].push(date);
            }
          }
        }
      }

      // eslint-disable-next-line object-curly-newline
      res.json({ actions, dates, notActive, notActiveDates, debts });
    });
});

module.exports = router;
