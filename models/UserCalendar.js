const {Schema, model} = require('mongoose');

const schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  actions: [],
});

module.exports = model('UserCalendar', schema);
