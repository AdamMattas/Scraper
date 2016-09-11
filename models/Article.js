// require mongoose
var mongoose = require('mongoose');
// create Schema class
var Schema = mongoose.Schema;

// Create article schema
var ArticleSchema = new Schema({
  // title is required
  title: {
    type:String,
    required:true
  },
  // auxiliary is required
  auxiliary: {
    type:String,
    required:true
  },
  // description is required
  description: {
    type:String,
    required:true
  },
  // link is required
  link: {
    type:String,
    required:true
  },
  // image is required
  image: {
    type:String,
    required:true 
  },
  // this only saves one note's ObjectId. ref refers to the Note model.
  note: {
      type:Number,
      default:0
  }
});

// Create the Article model with the ArticleSchema
var Article = mongoose.model('Article', ArticleSchema);

// export the model
module.exports = Article;
