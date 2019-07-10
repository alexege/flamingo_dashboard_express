var session = require('express-session')
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');

mongoose.Promise = global.Promise;
app.use(session({
   secret: 'keyboardkitteh',
   resave: false,
   saveUninitialized: true,
   cookie: { maxAge: 60000 }
 }))
 
const flash = require('express-flash');
app.use(flash());

mongoose.connect('mongodb://localhost/flamingo_dashboard');
var FlamingoSchema = new mongoose.Schema({
   name: {type:String, required:true, minlength:2},
   quote: {type:String, required:true, maxlength:20},
  }, {timestamps: true});
  mongoose.model('Flamingo', FlamingoSchema); // We are setting this Schema in our Models as 'Flamingo'
  var Flamingo = mongoose.model('Flamingo') // We are retrieving this Schema from our Models, named 'Flamingo'
  
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// Root Request
app.get('/', function(req, res) {
    Flamingo.find({}, function(err, flamingos) {
        res.render('index', {all_flamingos: flamingos});
    })
})

// Add new flamingo
app.get('/flamingos/new', function(req, res) {
    res.render('new_flamingo');
})

// See details of specific flamingo
app.get('/flamingos/:id', function(req, res) {
    Flamingo.findOne({_id: req.params.id}, function(err, flamingos) {
       res.render('view_flamingo', {current_flamingo: flamingos});
    })
})

 // Update specific flamingo
 app.post('/flamingos/:id', function(req, res) {
    Flamingo.findOne({_id: req.params.id}, function(err, flamingos) {
        flamingos.name = req.body.name;
        flamingos.quote = req.body.quote;
        flamingos.save(function(err){})
       res.redirect('/flamingos/' + req.params.id);
    })
})

// Edit details of specific flamingo
app.get('/flamingos/edit/:id', function(req, res) {
    Flamingo.find({_id: req.params.id}, function(err, flamingos) {
       res.render('edit_flamingo', {current_flamingo: flamingos});
    })
})

// Delete specific flamingo
app.get('/flamingos/destroy/:id', function(req, res) {
    Flamingo.remove({_id: req.params.id}, function(err, flamingos) {
        console.log("Attempting to remove flamingo");
        res.redirect('/');
    })
})

app.post('/flamingos/', function(req, res) {
    var flamingo = new Flamingo({name: req.body.name, quote: req.body.quote});
    flamingo.save(function(err) {
       if(err){
          // if there is an error upon saving, use console.log to see what is in the err object 
          console.log("We have an error!", err);
          // adjust the code below as needed to create a flash message with the tag and content you would like
          for(var key in err.errors){
              req.flash('registration', err.errors[key].message);
          }
          // redirect the user to an appropriate route
          res.redirect('/');
       } else {
          console.log("Successfully grabbed the flamingos")
          res.redirect('/')
       }
    })
 })
  
// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening on port 8000");
})