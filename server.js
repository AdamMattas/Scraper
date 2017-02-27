/* Showing Mongoose's "Populated" Method (18.3.8)
 * INSTRUCTOR ONLY
 * =============================================== */

// dependencies
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var moment = require('moment');
// Notice: Our scraping tools are prepared, too
var request = require('request'); 
var cheerio = require('cheerio');

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static(process.cwd() + '/public'));

// use morgan and bodyparser with our app
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

var exphbs = require('express-handlebars');
var hbs = exphbs.create({
  extname:'handlebars',
  layoutsDir:  './views/layouts',
  defaultLayout: 'main',
  // Specify helpers which are only registered on this instance.
  helpers: {
    prettifyDatetime: function(timestamp) {
      return moment(timestamp).format('lll');
    } 
  }

});

// Initialize engine
app.engine('handlebars', hbs.engine);

// Set engine
app.set('view engine', 'handlebars');

// Database configuration with mongoose
mongoose.connect('mongodb://heroku_kjck5jc1:gjv3mdvolm8equegiel2r60nrb@ds019936.mlab.com:19936/heroku_kjck5jc1');
var db = mongoose.connection;

// show any mongoose errors
db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

// once logged in to the db through mongoose, log a success message
db.once('open', function() {
  console.log('Mongoose connection successful.');
});

// And we bring in our Note and Article models
var Note = require('./models/Note.js');
var Article = require('./models/Article.js');

// Routes
// ======

// redirects user to /home
app.get('/', function (req, res) {
  res.redirect('/scrape');
});

// A GET request to scrape the echojs website.
app.get('/scrape', function(req, res) {
  // first, we grab the body of the html with request
  request('https://crossorigin.me/http://www.cnn.com/specials/politics/world-politics', function(error, response, html) {
    // then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // now, we grab every h2 within an article tag, and do the following:
    $('article .cd__wrapper .cd__content .cd__description').each(function(i, element) {

        // save an empty result object
        var result = {};

        // add the text and href of every link, 
        // and save them as properties of the result obj
        result.title = $(this).parent().children('.cd__headline').children('a').children('span.cd__headline-text').text();
        result.link = $(this).parent().prev().children('a').attr('href');
        result.image = $(this).parent().prev().children('a').children('img.media__image').attr('data-src-large');
        result.auxiliary = $(this).prev().text();
        result.description = $(this).text();

        console.log('HELLO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', result);

        // using our Article model, create a new entry.
        // Notice the (result):
        // This effectively passes the result object to the entry (and the title and link)
        var entry = new Article (result);
        console.log(entry);
        Article.count({'title': entry.title}, function (err, count){ 
          if(count > 0){
              console.log('Already exists!');
          }else{
            // now, save that entry to the db
            entry.save(function(err, doc) {
              // log any errors
              if (err) {
                console.log(err);
              } 
              // or log the doc
              else {
                console.log(doc);
              }
            });
          }
        }); 

    });
  });
  // tell the browser that we finished scraping the text.
  //res.send("Scrape Complete");
  res.redirect('/index');
});

// this will get the articles we scraped from the mongoDB
app.get('/index', function(req, res){
  // grab every doc in the Articles array
  Article.find({}, function(err, doc){
    // log any errors
    if (err){
      console.log(err);
    } 
    // or send the doc to the browser as a json object
    else {
      //res.json(doc);
      console.log(doc);
      res.render('index', {
        doc: doc
      });
    }
  });
});

// this will get the articles we scraped from the mongoDB
app.get('/all', function(req, res){
  // grab every doc in the Articles array
  Article.find({}, function(err, doc){
    // log any errors
    if (err){
      console.log(err);
    } 
    // or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

app.get('/articles/:id', function(req, res){
  // using the id passed in the id parameter, 
  // prepare a query that finds the matching one in our db...
  Article.findOne({'_id': req.params.id})
  // and populate all of the notes associated with it.
  //.populate('note')
  // now, execute our query
  .exec(function(err, doc){
    Note.find({'artId': req.params.id})

    .exec(function(err, docNote){

      console.log(doc, docNote);
      // log any errors
      if (err){
        console.log(err);
      } 
      // otherwise, send the doc to the browser as a json object
      else {
        //res.json(doc);
        res.render('article', {
          doc: doc,
          docNote: docNote
        });
      }

    });
  });
});

// grab an article by it's ObjectId
app.get('/notes/:id', function(req, res){
  // using the id passed in the id parameter, 
  // prepare a query that finds the matching one in our db...
  Note.find({'artId': req.params.id})
  // and populate all of the notes associated with it.
  // now, execute our query
  .exec(function(err, doc){
    // log any errors
    if (err){
      console.log(err);
    } 
    // otherwise, send the doc to the browser as a json object
    else {
      res.send(doc);
    }
  });
});

// grab an article by it's ObjectId
app.post('/update/:id', function(req, res){
  // using the id passed in the id parameter, 
  // prepare a query that finds the matching one in our db...
  Article.findOneAndUpdate({'_id': req.params.id}, {$set: {note: 1}})
  // and populate all of the notes associated with it.
  // now, execute our query
  .exec(function(err, doc){
    // log any errors
    if (err){
      console.log(err);
    } 
    // otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// grab an article by it's ObjectId
app.get('/notes', function(req, res){
  // using the id passed in the id parameter, 
  // prepare a query that finds the matching one in our db...
  Note.find({})
  // and populate all of the notes associated with it.
  // now, execute our query
  .exec(function(err, doc){
    // log any errors
    if (err){
      console.log(err);
    } 
    // otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// replace the existing note of an article with a new one
// or if no note exists for an article, make the posted note it's note.
app.post('/articles/:id', function(req, res){
  // create a new note and pass the req.body to the entry.
  var newNote = new Note(req.body);

  // and save the new note the db
  newNote.save(function(err, doc){
    console.log(doc);
    // log any errors
    if (err){
      console.log(err);
    } 
    // otherwise
    else {
      console.log(doc);
      Article.findOneAndUpdate({'_id': req.params.id}, {$set: {note: 1}})
      // and populate all of the notes associated with it.
      // now, execute our query
      .exec(function(err, doc){
        // log any errors
        if (err){
          console.log(err);
        } 
        // otherwise, send the doc to the browser as a json object
        else {
          res.json(doc);
        }
      });
    }
  });
});

// Delete One from the DB
app.get('/delete/:id', function(req, res) {
  // remove a note using the objectID
  Article.remove({_id: req.params.id
  }, function(err, removed) {
    // log any errors from mongojs
    if (err) {
      console.log(err);
      res.send(err);
    } 
    // otherwise, send the mongojs response to the browser.
    // this will fire off the success function of the ajax request
    else {
      console.log(removed);
      //res.send(removed);
      res.redirect('/index');
    }
  });
});

// Delete One article from the DB manually
app.get('/article/manual', function(req, res) {
  // remove a note using the objectID
  Article.remove({_id: ""
  }, function(err, removed) {
    // log any errors from mongojs
    if (err) {
      console.log(err);
      res.send(err);
    } 
    // otherwise, send the mongojs response to the browser.
    // this will fire off the success function of the ajax request
    else {
      console.log(removed);
      //res.send(removed);
      res.redirect('/index');
    }
  });
});

// Delete One from the DB
app.get('/delete/note/:id', function(req, res) {
  // remove a note using the objectID
  Note.remove({_id: req.params.id
  }, function(err, removed) {
    // log any errors from mongojs
    if (err) {
      console.log(err);
      res.send(err);
    } 
    // otherwise, send the mongojs response to the browser.
    // this will fire off the success function of the ajax request
    else {
      console.log(removed);
      //res.send(removed);
      res.redirect('/index');
    }
  });
});

// Delete One Note from the DB manually
// app.get('/note/manual', function(req, res) {
//   // remove a note using the objectID
//   Note.remove({_id: ""
//   }, function(err, removed) {
//     // log any errors from mongojs
//     if (err) {
//       console.log(err);
//       res.send(err);
//     } 
//     // otherwise, send the mongojs response to the browser.
//     // this will fire off the success function of the ajax request
//     else {
//       console.log(removed);
//       res.send(removed);
//       //res.redirect('/articles');
//     }
//   });
// });

// listen on port 3000
var port = process.env.PORT || 3000;
app.listen(port);