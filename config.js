module.exports = {
    ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,
    URL: process.env.BASE_URL || 'http://localhost:3000',
    MONGODB_URI: getDatabaseUri(),
    JWT_SECRET: process.env.JWT_SECRET || 'secret',
    ROOT_LOGIN: process.env.ROOT_LOGIN || 'login',
    ROOT_PASSWORD: process.env.ROOT_PASSWORD || 'secret',
    ROOT_NAME: process.env.ROOT_NAME || 'name',
    ROOT_SURNAME: process.env.ROOT_SURNAME || 'su'
};

function getDatabaseUri() {
    return process.env.MONGODB_URI ? `mongodb://${process.env.MONGODB_URI}` : 'mongodb://localhost:27017/best-hair'
}
