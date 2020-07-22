const errors = require('restify-errors');
const Certificate = require('../models/Certificate');
const rjwt = require('restify-jwt-community');
const config = require('../config');

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
        } = req.body;

        const certificate = new Certificate({
            owner_id,
            teacher,
            title,
            photo,
            date_receiving,
        });
        try {
            await certificate.save();
            res.send(201);
            next();
        } catch (err) {
            return next(new errors.InternalError(err.message));
        }
    });
};
