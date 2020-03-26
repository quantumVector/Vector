/* eslint-disable no-console */
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const connectMongo = require('connect-mongo');
const config = require('./config');
const routes = require('./routes/app-routes');

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

app.use((req, res, next) => {
  const { userId } = req.session;
  if (userId) {
    res.locals = { displayLink: true };
  } else {
    res.locals = { displayLink: false };
  }
  next();
});

app.use(express.static(`${__dirname}/public`));

app.use(routes);

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
