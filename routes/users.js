const errors = require('restify-errors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../auth');
const config = require('../config');
const rjwt = require('restify-jwt-community');

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

    server.get('/_api/users/:id', async (req, res, next) => {
        try {
            const user = await User.findById(req.params.id);
            res.send(user);
            next();
        } catch (error) {
            next(new errors.InvalidContentError(error));
        }
    });

    server.patch('/_api/users/:id', rjwt({ secret: config.JWT_SECRET }), async (req, res, next) => {
        const {
            password,
            name,
            surname,
            photo,
            login,
            owner_id,
            instagram,
        } = req.body;
        const owner = await User.findById(owner_id);

        if (owner.is_root_user || owner_id === req.params.id) {
            try {
                const newPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
                await User.findOneAndUpdate({_id: req.params.id},
                    {
                        password: newPassword,
                        name: name,
                        surname: surname,
                        photo: photo,
                        login: login,
                        instagram: instagram,
                    });
                res.send(200);
                next();
            } catch (error) {
                return next(new errors.InternalServerError(error));
            }
        } else {
            return next(new errors.ForbiddenError());
        }
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

    server.post('/_api/users/', rjwt({ secret: config.JWT_SECRET }), async (req, res, next) => {
        const {
            password,
            name,
            surname,
            login,
            owner_id,
        } = req.body;
        const owner = await User.findById(owner_id);
        if (owner.is_root_user) {
            try {
                const user = new User({
                    login: login,
                    password: password,
                    name: name,
                    surname: surname,
                });
                user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
                await user.save();
                res.send(201);
                next();
            } catch (error) {
                return next(new errors.InternalServerError());
            }
        } else {
            return next(new errors.ForbiddenError());
        }
    });
};