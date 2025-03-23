const GoogleStrategy = require('passport-google-oauth2').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const bcrypt = require('bcryptjs');
const passport = require('passport');
const dbConnection = require('./utils/dbConnection'); 

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    done(null, { id }); 
});

passport.use(new GitHubStrategy({
    clientID: "Iv23liigr2VwyjCOv8vx",
    clientSecret: "bb6887507801e8b4efc30cf0504a9109a249e085",
    callbackURL: "http://127.0.0.1:8000/accounts/github/login/callback/",
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (!email) {
            email = `github_${profile.id}@example.com`;
        }

        const [rows] = await dbConnection.execute("SELECT * FROM users WHERE github_id = ?", [profile.id]);

        let user;
        if (rows.length > 0) {
            user = rows[0];
        } else {
            const hashedPassword = await bcrypt.hash('random_generated_password', 10);

            const [result] = await dbConnection.execute(
                "INSERT INTO users (name, email, password, github_id) VALUES (?, ?, ?, ?)",
                [profile.username, email, hashedPassword, profile.id]
            );

            if (result.affectedRows === 1) {
                user = {
                    id: result.insertId,
                    name: profile.username,
                    email: email,
                    github_id: profile.id
                };
            }
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

passport.use(new GoogleStrategy({
    clientID: "340991616685-qj8cjpkhubdpkgcabfucp3kmcqmcd2o2.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://127.0.0.1:8000/accounts/google/login/callback",
}, async (request, accessToken, refreshToken, profile, done) => {
    try {
        let email = profile.emails?.[0]?.value;
        if (!email) {
            return done(new Error("Google не предоставил email"));
        }

        const [existingUser] = await dbConnection.execute("SELECT * FROM users WHERE email = ?", [email]);

        if (existingUser.length > 0) {
            return done(null, existingUser[0]);
        }

        const hashedPassword = await bcrypt.hash('random_generated_password', 10);

        const [result] = await dbConnection.execute(
            "INSERT INTO users (name, email, password, google_id) VALUES (?, ?, ?, ?)",
            [profile.displayName, email, hashedPassword, profile.id]
        );

        if (result.affectedRows === 1) {
            const newUser = {
                id: result.insertId,
                name: profile.displayName,
                email: email,
                google_id: profile.id
            };
            return done(null, newUser);
        }

        return done(null, false);
    } catch (error) {
        return done(error);
    }
}));


module.exports = passport;