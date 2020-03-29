class UserActions {
  // constructor() {}

  static addAction(action) {
    let actionObj = {};

    actionObj = {
      [action]: {
        params: 'discribing',
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
