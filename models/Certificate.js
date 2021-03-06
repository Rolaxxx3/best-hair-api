const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
    owner_id: {
        type: String,
        required: true,
        trim: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    photo: {
        type: String,
        trim: true,
        required: true,
    },
    teacher: {
        type: String,
        required: false,
        trim: true,
    },
    type: {
        type: String,
        default: "Certificate",
    },
    date_receiving: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true,
    }
}, {
    versionKey: false,
});

const Certificate = mongoose.model('Certificate', CertificateSchema);
module.exports = Certificate;
