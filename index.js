const restify = require('restify');
const mongoose = require('mongoose');
const config = require('./config');

const server = restify.createServer();

server.use(restify.plugins.bodyParser());

server.listen(config.PORT, () => {
    mongoose.connect(
        config.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then(() => console.log("Database is connected"))
    .catch(err => {
        console.log(`Database connection error: ${err.msg}`)
    });
});

const db = mongoose.connection;

db.on('error', err => console.log(err));