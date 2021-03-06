const errors = require('restify-errors');
const Work = require('../models/Work');
const rjwt = require('restify-jwt-community');
const config = require('../config');
const User = require('../models/User');

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
            description,
        } = req.body;
        if (owner_id) {
            try {
                const user = await User.findById(owner_id).exec();
                const work = new Work({
                    owner_id: user._id,
                    title,
                    photo,
                    description,
                });
                await work.save();
                res.send(201);
                next();
            } catch (err) {
                return next(new errors.InvalidContentError(err.message));
            }
        } else {
            return next(errors.InvalidContentError("owner_id is required"));
        }
    });

    server.del('/_api/works/:id', rjwt({ secret: config.JWT_SECRET }), async (req, res, next) => {
        try {
            const { owner_id } = req.body;
            const owner = await User.findById(owner_id).exec();
            const work = await Work.findById(req.params.id).exec();
            if (work.owner_id === String(owner._id) || owner.is_root_user) {
                await work.deleteOne();
                res.send(200);
                next();
            } else {
                next(errors.ForbiddenError('Not enough permission'));
            }
        } catch (error) {
            next(new errors.InvalidContentError(error));
        }
    });

    server.patch('/_api/works/:id', rjwt({ secret: config.JWT_SECRET }), async (req, res, next) => {
        const {
            owner_id,
            title,
            photo,
            description,
        } = req.body;
        try {
            const owner = await User.findById(owner_id).exec();
            const work = await Work.findById(req.params.id).exec();

            if (owner.is_root_user || owner_id === work.owner_id) {
                await work.updateOne({
                    title: title || work.title,
                    photo: photo || work.photo,
                    description: description || work.description,
                });
                res.send(200);
                    next();
            } else {
                return next(new errors.ForbiddenError('Not enough permission'));
            }
        } catch (error) {
            return next(new errors.InvalidContentError(error));
        }
    });
};
