const { Router } = require('express');

const router = Router();

router.get('/actions', async (req, res) => {
  if (req.session.userId) {
    res.render('actions', {
      title: 'Настройки',
      isSettings: true,
      style: {
        desk: 'css/actions.css',
        mob: 'css/actions-mob.css',
      },
      pageTestScript: 'page-tests/tests-actions.js',
    });
  } else {
    res.redirect('/login');
  }
});

module.exports = router;
