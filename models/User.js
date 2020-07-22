const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    login: {
        type: String,
        required: false,
        trim: true,
        select: false,
    },
    password: {
        type: String,
        required: true,
        select: false,
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
        required: false,
    },
    is_root_user: {
        type: Boolean,
        default: false,
    },
    is_show: {
        type: Boolean,
        default: true,
    },
    type: {
        type: String,
        default: "User",
    },
    create_time: {
        type: Date,
        default: Date.now,
    },
    instagram: {
      type: String,
      required: false,
    },
    description: {
        type: String,
        required: true,
    }
}, {
    versionKey: false,
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
