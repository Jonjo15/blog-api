const mongoose = require('mongoose');
const dayjs = require("dayjs")
const Schema = mongoose.Schema;
var relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

const PostSchema = new Schema(
  {
    title: {type: String, required: true, maxlength: 100},
    published: {type: Boolean, required: true},
    body: {type: String, required: true},
    created_at: {type: Date}, 
    comment_count: {type: Number, max:10},
    author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  }
);

// Virtual for author's full name
PostSchema
.virtual('formatted_date')
.get(function () {
  return dayjs().fromNow(this.created_at);
});

// Virtual for author's lifespan


//Export model
module.exports = mongoose.model('Post', PostSchema);