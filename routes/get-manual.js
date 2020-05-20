const { Router } = require('express');

const router = Router();

router.get('/manual', (req, res) => {
  res.render('manual', {
    title: 'Руководство',
    isManual: true,
  });
});

module.exports = router;
