const { ObjectId } = require('mongoose').Types.ObjectId;
const UserCalendar = require('../models/UserCalendar');

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

  /* static createActions(action) {
    const date = new Date();
    let actionsObj = {};

    // actionsObj[date.getFullYear()];
    actionsObj = {
      [date.getFullYear()]: {
        [date.getMonth()]: {
          [date.getDate()]: {
            actions: {
              [action]: false,
            },
          },
        },
      },
    };

    return actionsObj;
  } */
}

module.exports = UserActions;
