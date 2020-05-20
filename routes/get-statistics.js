const { Router } = require('express');
const { ObjectId } = require('mongoose').Types.ObjectId;
const UserCalendar = require('../models/UserCalendar');

const router = Router();

router.get('/statistics', (req, res) => {
  if (req.session.userId) {
    res.render('statistics', {
      title: 'Статистика',
      isStatistics: true,
      style: {
        desk: 'css/statistics.css',
        mob: 'css/statistics-mob.css',
      },
      script: 'js/statistics.js',
    });
  } else {
    res.redirect('/login');
  }
});

router.get('/get-data-statistics', async (req, res) => {
  const data = {};

  await UserCalendar.findOne({ _id: new ObjectId(req.session.userId) }, (err, user) => {
    if (err) throw err;

    data.actions = user.actions;
    data.dates = user.dates;
  });

  res.json(data);
});

module.exports = router;
