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
  actions: [{
    name: { type: String },
    days: [],
    debt: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
  }],
});

module.exports = model('UserCalendar', schema);
