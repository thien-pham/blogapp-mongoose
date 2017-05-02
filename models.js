const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    author: {type: String, required: true}
});

postSchema.virtual('authorName').get(function() {
    return `${this.author.firstName} ${this.author.lastName}`});

postSchema.methods.apiRepr = function() {
    return {
        id: this._id,
        title: this.title,
        content: this.content,
        author: this.author
    };
};

const Post = mongoose.model('Post', postSchema);

module.exports = {Post};