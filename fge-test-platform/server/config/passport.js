import passport from 'passport';
import { User } from '../models/index.js';

// Google OAuth is disabled
console.log('Google OAuth is currently disabled.');

// Serialize/deserialize user for session management
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
