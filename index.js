var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var db = mongojs('customerapp', ['users']);
var ObjectId = mongojs.ObjectId;

var app = express();

/*
//middleware before routes compulosry
var logger = function(req, res, next){
    console.log('Logging...');
    next();
}
app.use(logger);
*/

//view engine mw
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

//Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//set static path
app.use(express.static(path.join(__dirname,'public')));

//global variables
app.use(function(req, res, next){
    res.locals.errors = null;
    next();
});

//express validator mw
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//routes
app.get('/', function(req, res){
    db.users.find(function (err, thisis) {
        //console.log(docs);
        res.render('index', {
            title: 'Customers',
            users: thisis
        });
    });
});

app.get('/about',function(req,res){
    res.render('about');
})

app.post('/users/add', function(req, res){

    var users=[];

    req.checkBody('first_name', 'First Name is Required').notEmpty();
    req.checkBody('last_name', 'Last Name is Required').notEmpty();
    req.checkBody('email', 'Email is Required').notEmpty();

    var errors = req.validationErrors();

    if(errors){
        res.render('index', {
            title: 'Customers',
            users: users,
            errors: errors
        });
    }else{
        var newUser = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email
        }
        
        db.users.insert(newUser, function(err, result){
            if(err){
                console.log(err);
            }
            res.redirect('/');
        });
    }
});

app.delete('/users/delete/:id', function(req, res){
    db.users.remove({_id: ObjectId(req.params.id)}, function(err, result){
        if(err){
            console.log(err);
        }
        res.redirect('/');
    });
});

//msg to console
app.listen(3000, function(){
    console.log('LOL SERVER STARTED!');
});