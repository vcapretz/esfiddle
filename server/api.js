// var mongo = require('mongodb').MongoClient,
const Fiddles = require('./db/fiddles');
const Users = require('./db/users');

module.exports = (app) => {
  // mongo.connect(String(process.env.MONGODB_URI), function(err, db) {
  //     fiddles = db.collection('fiddles');
  // });

  // This will match /fiddles/fiddleNo
  app.get(/^\/fiddles\/\w+$/, (req, res) => {
    const fiddle = req.url.split('/').pop();

    if (fiddle) {
      Fiddles.findOne({ fiddle }, (err, item) => {
        if (item) {
          // Check if this fiddle is private......
          if (item.isPrivate) {
            if (!req.isAuthenticated()) {
              return res.status(401).json({
                message: 'This is a private fiddle please login.',
              });
            }

            if (item.userId.toHexString() === req.user.id) {
              return res.json(item);
            }

            return res.status(400).json({
              message: 'This is a private fiddle!.',
            });
          }
          return res.json(item);
        }

        return res.status(404).json({
          message: `/* Oops! I got 404,
          * but not the fiddle "${fiddle}" you are looking for :(
          */\n`,
        });
      });
    }
  });

  app.post('/save', (req, res) => {
    let fiddle;
    //  console.log('user logged in = ', req.user);
    if (!req.body.value) {
      return res.status(400).send();
    }
    // Check if user trying to save existing fiddle;
    if (req.body.fiddle !== -1 && req.isAuthenticated()) {
      fiddle = req.body.fiddle;
    } else {
      fiddle = parseInt(Date.now(), 10).toString(36);
    }

    return Fiddles.findOne({ fiddle }, (err, item) => {
      if (!item) {
        const newFiddle = new Fiddles({
          fiddle,
          value: req.body.value,
        });
        if (req.isAuthenticated()) {
          newFiddle.userId = req.user.id;
        }

        return newFiddle.save(() => res.json({ saved: true, fiddle }));
      }

      if (item.userId && item.userId.toHexString() === req.user.id) {
        const itemToSave = Object.assign(item, { value: req.body.value });

        return itemToSave.save()
          .then(() => res.json({ saved: true, fiddle }))
          .catch(() => res.status(400).send());
      }

      fiddle = parseInt(Date.now(), 10).toString(36);
      const newFiddle = new Fiddles({
        fiddle,
        value: req.body.value,
        userId: req.user.id,
      });

      return newFiddle.save()
        .then(() => res.json({ saved: true, fiddle }))
        .catch(() => res.status(400).send());
    });
  });

  app.post('/star/:fiddleID', (req, res) => {
    const fiddleID = req.params.fiddleID;

    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Only logged in user allowed to star fiddle !' });
    }

    return Users.findById(req.user.id).then((user) => {
      if (user.startedFiddles.indexOf(fiddleID) > -1) {
        throw new Error(`fiddle: ${fiddleID} is already stared !`);
      }

      return Fiddles.findOneAndUpdate({ fiddle: fiddleID },
        { $inc: { starCounter: 1 } },
        { new: true });
    }).then((fiddle) => {
      if (!fiddle) {
        throw new Error(`fiddle: ${fiddleID} Not Found !`);
      }

      return Users.findByIdAndUpdate(req.user.id, {
        $push: { startedFiddles: fiddleID },
      });
    })
      .then(() => res.status(200).send({ stared: true }))
      .catch((e) => {
        res.status(400).json({ message: e });
      });
  });

  app.post('/private/:fiddleID', (req, res) => {
    const fiddleID = req.params.fiddleID;

    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Only logged in user allowed to have private fiddle !' });
    }

    return Fiddles.findOne({ fiddle: fiddleID })
      .then((fiddle) => {
        if (!fiddle) {
          throw new Error(`fiddle: ${fiddleID} Not Found !`);
        }

        if (!fiddle.userId) {
          throw new Error('You can only make your own fiddle private please click on save first!');
        } else if (fiddle.userId.toHexString() !== req.user.id) {
          throw new Error('You can only make your own fiddle private !');
        }

        return Fiddles.findOneAndUpdate({ fiddle: fiddleID }, { isPrivate: true }, { new: true });
      })
      .then(fiddle => res.json({ fiddle }))
      .catch(e => res.status(400).json({ message: e }));
  });
};
