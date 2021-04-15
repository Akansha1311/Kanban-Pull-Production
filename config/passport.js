const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passReqToCallback: true },
      async function (req, username, password, done) {
        let user = await User.findByEmail(username);
        if (!user) {
          return done(null, false, req.flash("message", "Incorrect Email"));
        }
        if (!bcrypt.compareSync(password, user.password)) {
          return done(null, false, req.flash("message", "Incorrect Password"));
        }
        return done(null, user);
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((user, done) => {
    // User.findById(id, (err, user) => done(err, user));
    done(null, user);
  });
};
