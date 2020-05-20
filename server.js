/* eslint-disable no-console */
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const connectMongo = require('connect-mongo');
const config = require('./config');

// маршруты
const getCalendar = require('./routes/get-calendar');
const getActions = require('./routes/get-actions');
const getStatistics = require('./routes/get-statistics');
const getManual = require('./routes/get-manual');
const getLog = require('./routes/get-log');
const getReg = require('./routes/get-reg');
const getLogout = require('./routes/get-logout');
const postLog = require('./routes/post-log');
const postReg = require('./routes/post-reg');
const postActions = require('./routes/post-actions');
const postCalendar = require('./routes/post-calendar');

const app = express();
const environment = config.DEVELOPMENT;

const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

const MongoStore = connectMongo(session);

app.use(session({
  secret: config[environment].secret,
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  const { userId, userName } = req.session;

  if (userId) {
    res.locals = {
      displayLink: true,
      userName,
    };
  } else {
    res.locals = { displayLink: false };
  }

  next();
});

app.use((req, res, next) => {
  res.locals.errors = req.session.errors;
  delete req.session.errors;
  next();
});

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  res.locals.showTests = environment !== 'production' && req.query.test === '1';
  next();
});

app.use(getCalendar);
app.use(getActions);
app.use(getStatistics);
app.use(getManual);
app.use(getLog);
app.use(getReg);
app.use(getLogout);
app.use(postCalendar);
app.use(postActions);
app.use(postLog);
app.use(postReg);

// ------------------------------ Database Connection ----------------------------------

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await mongoose.connect(config[environment].database, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    app.listen(PORT, () => {
      console.log(`App listening to ${PORT}....`);
      console.log('Press Ctrl+C to quit.');
    });
  } catch (e) {
    console.log(e);
  }
}

// ----------------------------- Database Connection end -----------------------------------

start();
