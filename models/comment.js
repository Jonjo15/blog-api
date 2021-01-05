const mongoose = require('mongoose');
const dayjs = require("dayjs")
const Schema = mongoose.Schema;
var relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

const CommentSchema = new Schema(
  {
    body: {type: String, required: true},
    created_at: {type: Date}, 
    author: {type: String, required: true},
    post: {type: Schema.Types.ObjectId, ref: 'Post', required: true},
  }
);

// Virtual for author's full name
CommentSchema
.virtual('formatted_date')
.get(function () {
  return dayjs().fromNow(this.created_at);
});

// Virtual for author's lifespan


//Export model
module.exports = mongoose.model('Comment', CommentSchema);