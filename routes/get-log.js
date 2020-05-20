const { Router } = require('express');

const router = Router();

router.get('/login', (req, res) => {
  res.render('login', {
    title: 'Авторизация',
    style: {
      desk: 'css/log-and-reg.css',
      mob: 'css/log-and-reg-mob.css',
    },
  });
});

module.exports = router;
