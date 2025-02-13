import dotenv from 'dotenv';
dotenv.config();  // Load environment variables

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log("Google OAuth Access Token:", accessToken); // Debugging

        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = new User({ 
                name: profile.displayName, 
                email: profile.emails[0].value, 
                googleId: profile.id 
            });
            await user.save();
        }
        return done(null, user);
    } catch (error) {
        console.error("Error during authentication:", error);
        return done(error, null);
    }
}));
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});
