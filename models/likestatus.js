const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const likestatusSchema = new Schema ({
    title: {
        type: String
    },
    username: {
        type: String
    },
    status: {
        type: Boolean
    }
})

module.exports = mongoose.model('Likestatus', likestatusSchema);