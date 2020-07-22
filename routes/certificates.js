const errors = require('restify-errors');
const Certificate = require('../models/Certificate');
const rjwt = require('restify-jwt-community');
const config = require('../config');
const User = require('../models/User')

module.exports = server => {
    server.get('/_api/certificates', async (req, res, next) => {
        try {
            const certificates = await Certificate.find({});
            res.send(certificates);
            next();
        } catch (error) {
            next(new errors.InternalServerError(error));
        }
    });

    server.get('/_api/certificates/:id', async (req, res, next) => {
        try {
            const certificate = await Certificate.findById(req.params.id);
            res.send(certificate);
            next();
        } catch (error) {
            next(new errors.NotFoundError(error));
        }
    });

    server.post('/_api/certificates', rjwt({ secret: config.JWT_SECRET }), async (req, res, next) => {
        const {
            owner_id,
            title,
            photo,
            teacher,
            date_receiving,
            description,
        } = req.body;

        const certificate = new Certificate({
            owner_id,
            teacher,
            title,
            photo,
            date_receiving,
            description,
        });
        try {
            await certificate.save();
            res.send(201);
            next();
        } catch (err) {
            return next(new errors.InternalError(err.message));
        }
    });
    server.del('/_api/certificates/:id', rjwt({ secret: config.JWT_SECRET }), async (req, res, next) => {
        try {
            const { owner_id } = req.body;
            const owner = User.findById(owner_id);
            const certificate = await Certificate.findById(req.params.id);
            if (certificate.owner_id === req.params.id || owner.is_root_user) {
                certificate.deleteOne();
                res.send(200);
                next();
            } else {
                next(errors.ForbiddenError());
            }
        } catch (error) {
            next(new errors.InvalidContentError(error));
        }
    });
    server.patch('/_api/certificates/:id', rjwt({ secret: config.JWT_SECRET }), async (req, res, next) => {
        const {
            owner_id,
            teacher,
            title,
            photo,
            date_receiving,
            description,
        } = req.body;
        const owner = await User.findById(owner_id);
        const certificate = await Certificate.findById(req.params.id);

        if (owner.is_root_user || owner_id === certificate.owner_id) {
            try {
                await certificate.update({
                    teacher: teacher || certificate.teacher,
                    title: title || certificate.title,
                    photo: photo || certificate.photo,
                    date_receiving: date_receiving || certificate.date_receiving,
                    description: description || certificate.description,
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
};
