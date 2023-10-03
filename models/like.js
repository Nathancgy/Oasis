const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const likeSchema = new Schema ({
    postId: {
        type: String
    },
    username: {
        type: String
    },
    forum: {
        type: String
    }
})

module.exports = mongoose.model('Like', likeSchema);