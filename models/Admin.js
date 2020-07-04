const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    login: {
        type: String,
        required: true,
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
        required: true,
        trim: true,
    },
});

const Admin = mongoose.model('Admin', AdminSchema);
module.exports = Admin;