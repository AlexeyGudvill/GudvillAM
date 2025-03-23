const router = require("express").Router();
const { body } = require("express-validator");
const passport = require('passport');

const {
    homePage,
    register,
    registerPage,
    login,
    loginPage,
} = require("./controllers/userController");

const ifNotLoggedin = (req, res, next) => {
    if(!req.session.userID){
        return res.redirect('/login');
    }
    next();
}

const ifLoggedin = (req,res,next) => {
    if(req.session.userID){
        return res.redirect('/');
    }
    next();
}

router.get('/', ifNotLoggedin, homePage);

router.get("/login", ifLoggedin, loginPage);
router.post("/login", ifLoggedin, [
    body("_email", "Invalid email address")
        .notEmpty()
        .escape()
        .trim()
        .isEmail(),
    body("_password", "The Password must be of minimum 4 characters length")
        .notEmpty()
        .trim()
        .isLength({ min: 4 }),
], login);

router.get("/signup", ifLoggedin, registerPage);
router.post("/signup", ifLoggedin, [
    body("_name", "The name must be of minimum 3 characters length")
        .notEmpty()
        .escape()
        .trim()
        .isLength({ min: 3 }),
    body("_email", "Invalid email address")
        .notEmpty()
        .escape()
        .trim()
        .isEmail(),
    body("_password", "The Password must be of minimum 4 characters length")
        .notEmpty()
        .trim()
        .isLength({ min: 4 }),
], register);

router.get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        next(err);
    });
    res.redirect('/login');
});

router.get('/accounts/google/login/callback', 
    passport.authenticate('google', {
        scope: ['openid', 'profile', 'email'],
        failureRedirect: '/login'
    }), 
    (req, res) => {
        req.session.userID = req.user.id;  // id пользователя в сессии
        res.redirect('/login');
    }
);

router.get('/accounts/github/login/callback', 
    passport.authenticate('github', { 
        scope: ['user:email'], 
        failureRedirect: '/login' 
    }),  
    (req, res) => {
        req.session.userID = req.user.id;  // id пользователя в сессии
        res.redirect('/login');
    }
);

module.exports = router;