const { Router } = require('express');

const router = Router();

router.get('/manual', (req, res) => {
  res.render('manual', {
    title: 'Руководство',
    isManual: true,
    style: {
      desk: 'css/manual.css',
      mob: 'css/manual-mob.css',
    },
  });
});

module.exports = router;
