const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema ({
    title: {
        type: String,
    },
    content: {
        type: String,
    },
    group: {
        type: String,
    },
    username: {
        type: String,
    }
})

module.exports = mongoose.model('Post', postSchema);