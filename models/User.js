const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    login: {
        type: String,
        required: false,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    surname: {
        type: String,
        required: true,
        trim: true,
    },
    photo: {
        type: String,
        trim: true,
    },
    isRootUser: {
        type: Boolean,
        default: false,
    }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;