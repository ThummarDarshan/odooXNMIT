const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./database');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const [users] = await db.execute(
      'SELECT id, display_name, email, profile_image, is_verified FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length > 0) {
      done(null, users[0]);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error, null);
  }
});

// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with GitHub ID
    const [existingUsers] = await db.execute(
      'SELECT * FROM users WHERE github_id = ?',
      [profile.id]
    );

    if (existingUsers.length > 0) {
      // User exists, return user
      return done(null, existingUsers[0]);
    }

    // Check if user exists with the same email
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    if (email) {
      const [emailUsers] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (emailUsers.length > 0) {
        // Link GitHub account to existing user
        await db.execute(
          'UPDATE users SET github_id = ?, profile_image = COALESCE(profile_image, ?) WHERE id = ?',
          [profile.id, profile.photos[0]?.value || null, emailUsers[0].id]
        );
        
        const [updatedUser] = await db.execute(
          'SELECT * FROM users WHERE id = ?',
          [emailUsers[0].id]
        );
        
        return done(null, updatedUser[0]);
      }
    }

    // Create new user
    const displayName = profile.displayName || profile.username || 'GitHub User';
    const profileImage = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

    const [result] = await db.execute(
      'INSERT INTO users (display_name, email, github_id, profile_image, is_verified) VALUES (?, ?, ?, ?, ?)',
      [displayName, email, profile.id, profileImage, true]
    );

    const [newUser] = await db.execute(
      'SELECT * FROM users WHERE id = ?',
      [result.insertId]
    );

    return done(null, newUser[0]);

  } catch (error) {
    console.error('GitHub Strategy Error:', error);
    return done(error, null);
  }
}));

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with Google ID
    const [existingUsers] = await db.execute(
      'SELECT * FROM users WHERE google_id = ?',
      [profile.id]
    );

    if (existingUsers.length > 0) {
      // User exists, return user
      return done(null, existingUsers[0]);
    }

    // Check if user exists with the same email
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    if (email) {
      const [emailUsers] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (emailUsers.length > 0) {
        // Link Google account to existing user
        await db.execute(
          'UPDATE users SET google_id = ?, profile_image = COALESCE(profile_image, ?) WHERE id = ?',
          [profile.id, profile.photos[0]?.value || null, emailUsers[0].id]
        );
        
        const [updatedUser] = await db.execute(
          'SELECT * FROM users WHERE id = ?',
          [emailUsers[0].id]
        );
        
        return done(null, updatedUser[0]);
      }
    }

    // Create new user
    const displayName = profile.displayName || 'Google User';
    const profileImage = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

    const [result] = await db.execute(
      'INSERT INTO users (display_name, email, google_id, profile_image, is_verified) VALUES (?, ?, ?, ?, ?)',
      [displayName, email, profile.id, profileImage, true]
    );

    const [newUser] = await db.execute(
      'SELECT * FROM users WHERE id = ?',
      [result.insertId]
    );

    return done(null, newUser[0]);

  } catch (error) {
    console.error('Google Strategy Error:', error);
    return done(error, null);
  }
}));

module.exports = passport;