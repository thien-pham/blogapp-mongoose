const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    author: {
        firstName: String, required: true,
        lastName: String, required: true 
    }
});

postSchema.virtual('authorName').get(function() {
    return `${this.author.firstName} ${this.author.lastName}`});

postSchema.methods.apiRepr = function() {
    return {
        id: this._id,
        title: this.title,
        content: this.content,
        author: this.authorName
    };
};

const Post = mongoose.model('Post', postSchema);

module.exports = {Post};