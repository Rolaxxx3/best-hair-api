const mongoose = require('mongoose');

const WorkSchema = new mongoose.Schema({ 
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
        required: true,
        trim: true,
    },
    is_show: {
        type: Boolean,
        default: true,
    },
    type: {
        type: String,
        default: "Work",
    },
    create_time: {
        type: Date,
        default: Date.now,
    },
    description: {
        type: String,
        required: true,
    }
}, {
    versionKey: false,
});

const Work = mongoose.model('Work', WorkSchema);
module.exports = Work;
