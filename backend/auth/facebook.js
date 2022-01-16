import passport from 'passport';
import FacebookStrategy from 'passport-facebook';
import User from '../models/userModel.js';

// serialize the user.id to save in the cookie session
// so the browser will remember the user when login
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// deserialize the cookieUserId to user in the database
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
    .catch(e => {
      done(new Error("Failed to deserialize an user"));
    });
});

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: process.env.FACEBOOK_REDIRECT_URL,
  profileFields: ['id', 'displayName', 'photos', 'email']
}, async (accessToken, refreshToken, profile, done) => {

  const currentUser = await User.findOne({
    userId: profile.id,
  });

  if (!currentUser) {
    const newUser = await new User({
      userId: profile.id,
      name: profile.displayName,
      profilePic: profile.photos[0].value,
      email: profile.email[0].value,
    }).save({ validateBeforeSave: false });

    if (newUser) {
      done(null, newUser)
    }
  }
  done(null, currentUser)
}))


export default passport