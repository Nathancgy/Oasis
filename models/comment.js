const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema ({
    postId: {
        type: String
    },
    content: {
        type: String
    },
    username: {
        type: String
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
    }
})

module.exports = mongoose.model('Comment', commentSchema);