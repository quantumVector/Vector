class UserActions {
  // constructor() {}

  static addAction(action, period, debt) {
    const actionObj = {
      [action]: {
        params: {
          days: period,
          debt,
        },
      },
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
