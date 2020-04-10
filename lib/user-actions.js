const { ObjectId } = require('mongoose').Types.ObjectId;
// const UserCalendar = require('../models/UserCalendar');

class UserActions {
  static addAction(action, period, debt) {
    const actionObj = {
      id: new ObjectId(),
      name: action,
      days: period,
      debt,
      status: true,
    };

    return actionObj;
  }
}

module.exports = UserActions;
