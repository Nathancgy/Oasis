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
    },
    postingtime: {
        type: Date,
        default: Date.now,
        get: function(value) {
            var offset = 8; // UTC +8
            var utc = value.getTime() + (value.getTimezoneOffset() * 60000); // 转为 UTC 时间
            var date = new Date(utc + (3600000 * offset)); // 根据偏移量调整时间
            return date.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
        },
        immutable: true,
    },
    postAnonymous: {
        type: String
    }
})

module.exports = mongoose.model('Post', postSchema);