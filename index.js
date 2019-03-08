const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');

const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');
const { sign } = require('jsonwebtoken');

const secret = 'mySecretKey';

const user = {
    username: 'hassansaleh31',
    password: 'abcdefgh',
    name: 'Hassan Saleh',
    email: 'hassansaleh31@gmail.com',
    picture: 'https://picsum.photos/512',
    bio: 'I\'m a fullstack web developer from Lebanon'
}

const authenticateUser = (username, password) => {
    if (!username || !password)
        return null
    // here you would normally fetch the user from your database
    let authUser = { ...user };
    if (authUser.username.toLowerCase() != username.toLowerCase() || authUser.password != password)
        return null
    const token = sign({ username: authUser.username }, secret, { expiresIn: 60 * 60 * 24 });
    return token;
};

const passportOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: secret
};

const jwtStrategy = new Strategy(passportOptions, (jwt_payload, done) => {
    const username = jwt_payload.username;
    // here you would normally fetch the user from your database
    let authUser = { ...user };
    if (authUser.username !== username) {
        done(new Error('User not found'), null)
    } else {
        delete authUser.password;
        done(null, authUser)
    }
});

passport.use(jwtStrategy);

const app = express();

app.use(bodyParser.json());
app.use(compression());
app.use(passport.initialize());

app.post('/api/authenticate', (req, res) => {
    // handle user authentication
    const username = req.body.username;
    const password = req.body.password;
    const token = authenticateUser(username, password);
    if (!token)
        return res.json({ success: false, msg: 'Wrong username or password' });
    return res.json({ success: true, token });
});

app.get('/api/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
    // return user info
    res.json({ user: req.user });
});

app.use(express.static('public'));

app.use('*', (req, res) => res.sendStatus(404));

app.listen(3000, () => console.log('Server started on port 3000'));