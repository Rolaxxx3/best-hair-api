const restify = require('restify');
const mongoose = require('mongoose');
const config = require('./config');
const User = require('./models/User');
const bcrypt = require('bcryptjs')

const server = restify.createServer();

server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());

server.listen(config.PORT, () => {
    mongoose.connect(
        config.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then(async () => {
        console.log("Database is connected");
        const rootUser = await User.find({is_root_user: true}).exec();
        if (!Boolean(rootUser.length)) {
            const user = new User({
                login: config.ROOT_LOGIN,
                password: config.ROOT_PASSWORD,
                name: config.ROOT_NAME,
                surname: config.ROOT_SURNAME,
                is_root_user: true,
                instagram: config.ROOT_INSTAGRAM,
                description: config.ROOT_DESCRIPTION,
            });

            user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
            await user.save();
        }
    })
    .catch(err => {
        console.log(`Database connection error: ${err.message}`)
    });
});

const db = mongoose.connection;

db.on('error', err => console.log(err));

db.once('open', () => {
    require('./routes/users')(server);
    require('./routes/certificates')(server);
    require('./routes/works')(server);
});

module.exports = server;
