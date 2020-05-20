const { Router } = require('express');

const router = Router();

router.get('/register', (req, res) => {
  res.render('register', {
    title: 'Регистрация',
    style: {
      desk: 'css/log-and-reg.css',
      mob: 'css/log-and-reg-mob.css',
    },
  });
});

module.exports = router;
