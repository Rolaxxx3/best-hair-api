const errors = require('restify-errors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const auth = require('../auth');
const config = require('../config');

module.exports = server => {
    server.post('/_api/admin/create', (req, res, next) => {
        const { email, password, name, surname, photo } = req.body;

        const admin = new Admin({
            email,
            password,
            name,
            surname,
            photo,
        });

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(admin.password, salt, async (err, hash) => {
                admin.password = hash;
                try {
                    const newAdmin = await admin.save();
                    res.send(201);
                    next();
                } catch (err) {
                    return next(new errors.InternalError(err.message));
                }
            });
        });
    });

    server.post('/_api/admin/sign-in', async (req, res, next) => {
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