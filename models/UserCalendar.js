const { Schema, model } = require('mongoose');

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
    created: { type: Date },
    status: { type: Boolean, default: true },
    end: { type: Date },
    position: { type: Number },
  }],
  dates: [{
    id_action: { type: String },
    action_name: { type: String },
    year: { type: String },
    month: { type: String },
    day: { type: String },
    status: { type: Boolean, default: false },
  }],
});

module.exports = model('UserCalendar', schema);
