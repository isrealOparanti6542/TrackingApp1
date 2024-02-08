const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const AdminSchema = new Schema({
    firstname: { type: String },
    lastname: { type: String },

    email: {
        type: String,
        required: [true, "Please provide a unique email"],
        unique: true,
    },
    phone: { type: String },
    role: { type: String},
    // profile: { type: String}
});

// Mongoose middleware to hash the password before saving
// AdminSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) {
//         return next();
//     }

//     try {
//         const salt = await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//         return next();
//     } catch (error) {
//         return next(error);
//    }
// });

const AdminModel = mongoose.model('Administrator', AdminSchema);

module.exports = AdminModel;
