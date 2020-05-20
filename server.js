//var browserify = require('browserify-middleware');
var express = require('express');
var app = express();

//provide browserified versions of all the files in the script directory

app.use(express.static(__dirname + '/script'));
app.use(express.static(__dirname));
app.use(express.static(__dirname + '/public'));

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

function hello(){
  console.log('hello')
}


console.log('Ready!')