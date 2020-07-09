const errors = require('restify-errors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../auth');
const config = require('../config');

module.exports = server => {
    server.get('/_api/users', async (req, res, next) => {
        try {
            const users = await User.find({});
            res.send(users);
            next();
        } catch (error) {
            next(new errors.InvalidContentError(error));
        }
    });
    server.post('/_api/users', (req, res, next) => {
        const {
            email,
            password,
            name,
            surname,
            photo,
            login,
            isRootUser
        } = req.body;

        const user = new User({
            email,
            password,
            name,
            surname,
            photo,
            login,
            isRootUser,
        });

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, async (err, hash) => {
                user.password = hash;
                try {
                    const newUser = await user.save();
                    res.send(201);
                    next();
                } catch (err) {
                    return next(new errors.InternalError(err.message));
                }
            });
        });
    });

    server.post('/_api/users/sign-in', async (req, res, next) => {
        const { email, password } = req.body;

        try {
            const user = await auth.authenticate(email, password);

            const token = jwt.sign(user.toJSON(), config.JWT_SECRET, {
                expiresIn: '15m'
            });

            const { iat, exp } = jwt.decode(token);
            res.send({ iat, exp, token });

            next();
        } catch (err) {
            return next(new errors.UnauthorizedError(err));
        }
    });
};