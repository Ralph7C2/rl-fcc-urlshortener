const express = require('express');
const mongoose = require('mongoose');
const validUrl = require('valid-url');

var app = express();

var Schema = mongoose.Schema;

var countSchema = new Schema({
	count :  Number
});

var Count = mongoose.model('Count', countSchema);

var onNumber = 0;

var urlSchema = new Schema({
	url : String,
	shortened : Number
});

var Url = mongoose.model('Url', urlSchema);

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/urlshortener');

Count.find(function(err, results) {
	console.log(results.length);
	if(results.length === 0) {
		var c = new Count({count : 0});
		c.save(function(err) {
			if(err) console.log(err);
			else console.log("Count initialized")
		});
	} else {
		onNumber = results[0].count;
		console.log("Count loaded");
	}
	console.log(onNumber);
});

app.get('/:id', function(req, res) {
	Url.findOne({shortened : parseInt(req.params.id)}, function(err, doc) {
		if(err) {
			console.log(err.name);
		} else {
			if(doc) {
				console.log(doc);
				res.redirect(doc.url);
			} else {
				res.send("I'm sorry, that number was not saved");
			}
		}
	});
	console.log("Past Url.find()");
});

app.get('/new/*', function(req, res) {
	var saveUrl = req.url.slice(5);
	console.log(saveUrl);
	if(validUrl.isWebUri(saveUrl)) {
		var url = new Url({url : saveUrl, shortened : onNumber});
		url.save(function(err) {
			if(err) {
				console.log("Error saving url");
			} else {
				console.log("Saved url");
			}
		});
		Count.update({count : onNumber}, {count : onNumber+1}, function(err, response) {
			if(err) console.log("err");
			else console.log(response);
		});
		onNumber++;
		res.json({
			original_url: saveUrl,
			short_url: "http://localhost:4040/"+url.shortened
		});
	} else {
		res.json({error: 'Invalid URL'});
	}
});

var port = process.env.PORT || 4040;
app.listen(port, function() {
	console.log("Ready to rock on port "+port);
});