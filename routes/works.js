const errors = require('restify-errors');
const Work = require('../models/Work');
const rjwt = require('restify-jwt-community');
const config = require('../config');


module.exports = server => {
    server.get('/_api/works', async (req, res, next) => {
        try {
            const works = await Work.find({});
            res.send(works);
            next();
        } catch (error) {
            next(new errors.InternalServerError(error));
        }
    });

    server.get('/_api/works/:id', async (req, res, next) => {
        try {
            const work = await Work.findById(req.params.id);
            res.send(work);
            next();
        } catch (error) {
            next(new errors.NotFoundError(error));
        }
    });

    server.post('/_api/works', rjwt({ secret: config.JWT_SECRET }), async (req, res, next) => {
        const {
            owner_id,
            title,
            photo,

        } = req.body;

        const work = new Work({
            owner_id,
            title,
            photo,
        });
        try {
            await work.save();
            res.send(201);
            next();
        } catch (err) {
            return next(new errors.InternalError(err.message));
        }
    });
};
