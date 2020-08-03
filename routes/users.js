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
            next(new errors.NotFoundError(error));
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
            description,
        } = req.body;
        if (owner_id) {
            const owner = await User.findById(owner_id).exec();

            if (owner.is_root_user || owner_id === req.params.id) {
                try {
                    let newPassword;
                    if (password) {
                        newPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
                    }
                    const user = await User.findById(req.params.id);
                    await user.updateOne({
                        password: newPassword || user.password,
                        name: name || user.name,
                        surname: surname || user.surname,
                        photo: photo || user.photo,
                        login: login || user.login,
                        instagram: instagram || user.instagram,
                        description: description || user.description,
                    });
                    res.send(200);
                    next();
                } catch (error) {
                    return next(new errors.InternalServerError(error));
                }
            } else {
                return next(new errors.ForbiddenError('Not have enough permissions'));
            }
        } else {
            return next(new errors.InvalidContentError('owner_id is required'));
        }
    });

    server.post('/_api/users/sign-in', async (req, res, next) => {
        const { login, password } = req.body;
        try {
            const user = await auth.authenticate(login, password);
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

    server.post('/_api/users', rjwt({ secret: config.JWT_SECRET }), async (req, res, next) => {
        const {
            password,
            name,
            surname,
            login,
            owner_id,
            description,
            photo,
            instagram,
        } = req.body;

        try {
            const owner = await User.findById(owner_id).exec();
            if (!owner) return next(errors.InvalidContentError('Invalid owner_id'));
            if (owner.is_root_user) {
                const user = new User({
                    loin: login,
                    password: password,
                    name: name,
                    surname: surname,
                    description: description,
                    photo: photo,
                    instagram: instagram,
                });
                user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
                await user.save();
                res.send(201);
                next();
                } else {
                    return next(new errors.ForbiddenError('Not have enough permissions'));
                }
        } catch (error) {
            return next(new errors.BadRequestError(error));
        }
    });

    server.del('/_api/users/:id', rjwt({ secret: config.JWT_SECRET }), async (req, res, next) => {
        try {
            const { owner_id } = req.body;
            if (owner_id) {
                const owner = await User.findById(owner_id).exec();
                if (owner.is_root_user || req.params.id === owner_id) {
                    await User.findOneAndDelete({_id: req.params.id});
                    res.send(200);
                    next();
                } else {
                    next(errors.ForbiddenError('Not have enough permissions'));
                }
            } else {
                next(new errors.InvalidContentError('owner_id is required'));
            }
        } catch (error) {
            next(new errors.InvalidContentError(error));
        }
    });
};
