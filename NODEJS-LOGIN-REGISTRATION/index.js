const express = require('express');
const session = require('express-session');
const path = require('path');
const passport = require('./passport');
const routes = require('./routes');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(session({
    name: 'session',
    secret: 'my_secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600 * 1000,
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(routes);
app.use((err, req, res, next) => {
    console.log(err);
    return res.send('Internal Server Error');
});

app.listen(8000, () => console.log('Server is running on port 8000'));