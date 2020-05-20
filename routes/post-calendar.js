const { Router } = require('express');
const { ObjectId } = require('mongoose').Types.ObjectId;
const UserCalendar = require('../models/UserCalendar');

const router = Router();


router.post('/set-new-dates', async (req, res) => {
  const { activities } = req.body;

  await UserCalendar.findOneAndUpdate(
    { _id: new ObjectId(req.session.userId) },
    { $addToSet: { dates: activities } },
    (err) => {
      if (err) throw err;

      res.json('success');
    },
  );
});

router.post('/update-action-status', async (req, res) => {
  const { dateId, status } = req.body;

  await UserCalendar.findOneAndUpdate(
    { _id: new ObjectId(req.session.userId), dates: { $elemMatch: { _id: dateId } } },
    { $set: { 'dates.$.status': status } },
    (err) => {
      if (err) throw err;

      res.json('success');
    },
  );
});

module.exports = router;
