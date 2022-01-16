import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
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

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REDIRECT_URL
}, async (accessToken, refreshToken, profile, done) => {


  const userExists = await User.findOne({
    email: profile.emails[0].value
  });

  if (userExists) return done(null, userExists);

  // checking wheather the user have the googleId or registered in database without google auth
  const currentUser = await User.findOne({
    userId: profile.id,
  });

  if (!currentUser) {
    const newUser = await new User({
      userId: profile.id,
      name: profile.displayName,
      profilePic: profile.photos[0].value,
      email: profile.emails[0].value
    }).save({ validateBeforeSave: false });

    if (newUser) {
      done(null, newUser);
    }
  }
  done(null, currentUser)
}))

export default passport