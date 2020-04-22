const { ObjectId } = require('mongoose').Types.ObjectId;
// const UserCalendar = require('../models/UserCalendar');

class UserActions {
  static addAction(action, period, debt, position, start, end) {
    const actionObj = {
      id: new ObjectId(),
      name: action,
      days: period,
      debt,
      created: start,
      status: true,
      position,
    };

    if (end) actionObj.end = new Date(end);

    return actionObj;
  }
}

module.exports = UserActions;
