const express = require('express');
const app = express();

const mongoose = require('mongoose');
const p = 'mongodb+srv://jess:jess@cluster0.cgg9ypb.mongodb.net/?retryWrites=true&w=majority';

const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('./models/user');
const Post = require('./models/post');
const Like = require('./models/like');
const Likestatus = require('./models/likestatus');


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
    const ip_address = req.ip || req.connection.remoteAddress;
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

app.get('/',(req, res) => {
    res.render('intro');
})

app.get('/intro',(req, res) => {
    res.render('intro');
})

app.get('/contact',(req, res) => {
    res.render('contact');
})

app.get('/general', checkAuthenticated, async (req, res) => {
    const generalPosts = await Post.find({ group: 'general' });
    const reversedPosts = generalPosts.reverse();
    const generalPostsLikes = await Like.find({ forum: 'general' })
    res.render('general', { reversedPosts, username: req.user.username, generalPostsLikes });
})

app.get('/academics', checkAuthenticated, async (req, res) => {
    const academicsPosts = await Post.find({ group: 'academics' });
    const reversedPosts = academicsPosts.reverse();
    const academicsPostsLikes = await Like.find({ forum: 'academics' })
    res.render('academics', { reversedPosts, username: req.user.username, academicsPostsLikes });
})


app.post('/general', async (req, res) => {
    var anonymous = (req.body.postAnonymous)
    if (anonymous) {anonymous = true} else {anonymous = false}
    const post = new Post({title: req.body.title, content: req.body.content, group: req.body.group, username: req.body.username, postAnonymous: anonymous});
    console.log(post);
    await post.save().then((result) => {
        console.log('Post saved')
        res.redirect('/general')
    })
});

app.post('/academics', async (req, res) => {
    const post = new Post(req.body);
    await post.save().then((result) => {
        console.log('Post saved')
        res.redirect('/academics')
    })
    const likestatus = new Likestatus({title: req.body.title, username: req.body.username, status: false})
    await likestatus.save().then((result) => {
        console.log('likestatus saved');
    })
});

app.post('/generalDeletePost', async (req, res) => {
    console.log('Post delete invoked' )
    const deleteId = req.body.postId;
    try {
        await Post.deleteOne({ _id: deleteId });
        await Like.deleteMany({ postId: deleteId });
        res.redirect('/general');
    } catch (error) {
        console.error('Error during post deletion:', error.message);
        res.status(500).send('Internal server error');
    }
});

app.post('/academicsDeletePost', async (req, res) => {
    console.log('Post delete invoked' )
    console.log(req.body.postId)
    const deleteId = req.body.postId;
    try {
        await Post.deleteOne({ _id: deleteId });
        await Like.deleteMany({ postId: deleteId });
        res.redirect('/academics');
    } catch (error) {
        console.error('Error during post deletion:', error.message);
        res.status(500).send('Internal server error');
    }
});

app.post('/likeGeneralPost', async (req, res) => {

    await Like.deleteMany({ postId: req.body.postId, username: req.body.username })
    const like = new Like(req.body);
    like.save().then((result) => {
        res.redirect('/general');
    })
    
})

app.post('/likeAcademicsPost', async (req, res) => {

    await Like.deleteMany({ postId: req.body.postId, username: req.body.username })
    const like = new Like(req.body);
    like.save().then((result) => {
        res.redirect('/academics');
    })
    
})

app.use((req, res, next) => {
    res.status(404).render('404');
})


