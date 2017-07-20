const Fiddles = require('../db/fiddles');
const Users = require('../db/users');

module.exports = (app) => {
  app.get('/profile/:id', (req, res) => {
    const { id } = req.params;

    if (req.user && id === req.user.id) {
      return res.redirect('/github/myProfile');
    }
    Users.findById(id, (err, user) => {
      console.log('user::::::', id);
      if (user) {
        Fiddles.find({
          userId: req.params.id,
          isPrivate: false,
        }).then((fiddles) => {
          const starFiddle = user.startedFiddles.map(fiddle => Fiddles.findOne({
            fiddle,
            isPrivate: false,
          }).then(pubFiddle => pubFiddle));

          Promise.all(starFiddle).then((value) => {
            // filter null value from array.
            const pubStarFiddles = value.filter(v => v);
            res.render('profile', {
              user,
              fiddles,
              startedFiddles: pubStarFiddles.map(fiddle => fiddle.fiddle),
              message: req.flash(),
            });
          });
        });
      } else {
        res.status(404).render('profile', {
          id,
        });
      }
    });
  });
};
