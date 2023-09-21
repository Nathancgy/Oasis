const express = require('express');
const app = express();

const mongoose = require('mongoose');
const p = 'mongodb+srv://jess:jess@cluster0.cgg9ypb.mongodb.net/?retryWrites=true&w=majority';

const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('./models/user');
const Post = require('./models/post');

passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await User.findOne({ username }); // add await
            if (!user || user.password !== password) {
                return done(null, false, {message: 'Incorrect username or password'})
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id); // Changed to User
        done(null, user);
    } catch(error) {
        done(error);
    }
})

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'aiercroftstigma',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs');
app.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on port 3000');
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login')
}

function checkLoginAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/dashboard');
}

mongoose.connect(p, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(error => {
        console.error('Error connecting to MongoDB:', error);
    });

app.use(express.static('public'));


app.get('/register', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    res.render('register')
})

app.post('/register', async (req, res) => {
    console.log(req.body);  // Log the received data

    try {
        if (!req.body.username || !req.body.password) {
            return res.status(400).send('Username or password missing');
        }

        const user = new User(req.body);
        await user.save();
        res.redirect('/login');
    } catch (error) {
        console.error('Error during registration:', error.message);
        res.status(500).send('Internal server error');
    }
});




app.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    res.render('login');
});


app.post('/login', passport.authenticate('local', {
    successRedirect: 'dashboard',
    failureRedirect: '/login'
}));

app.get('/dashboard', checkAuthenticated, (req, res) => {
    res.render('dashboard', {username: req.user.username})
})

app.get('/',async (req, res) => {
    res.render('intro');
})

app.get('/general', checkAuthenticated, async (req, res) => {
    const generalPosts = await Post.find({ group: 'general' });
    res.render('general', { generalPosts, username: req.user.username });
})


app.post('/general', (req, res) => {
    const post = new Post(req.body);
    post.save().then((result) => {
        res.redirect('/general')
    })
});

app.use((req, res, next) => {
    res.status(404).render('404');
})
