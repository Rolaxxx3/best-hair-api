const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.authenticate = (login, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({ login }).select('+password').select('+login');
            await bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) reject(err.message);
                if (!isMatch) reject('Password did not match');
                resolve(user);
            });
        } catch (err) {
            reject('Authentication Failed');
        }
    });
};
