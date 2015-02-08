var mongoose = require('mongoose');
var async = require('async');
mongoose.connect('mongodb://localhost/mashup');
var express = require('express');
var http = require('http');
var _ = require('lodash');
var router = express.Router();
var url = 'http://metadata.helmet-kirjasto.fi/search/author.json?query=Campbell';

var BookSchema = new mongoose.Schema({
	title: String,
	year: String
});

var Book = mongoose.model('Book', BookSchema);

router.get('/', 

	function(req, res) {

		var refreshCache = function(callback) {
			Book.count({}, function(err, count) {
				if (count == 0) {
					console.log('Starting to fill cache')
					http.get(url, function(res) {

						var body = "";

						res.on("data", function(chunk) {
							body += chunk;
						});

						res.on("end", function() {

							var authorRes = JSON.parse(body);
							for (var i = 0; i < authorRes.records.length; i++) {
								var title = authorRes.records[i].title;
								var year = authorRes.records[i].year;
								var book = new Book( {title: title, year: year});
								book.save();
							};
							console.log("Cache is up-to-date");
							callback(null);
						});

					}).on("error", function(e) {
						  console.log("Error: ", e);
					});
				} else {
					console.log('Cache was up-to-date');
					callback(null);
				}
			});
		}

		var createResponse = function(callback) {
			console.log('Starting to create a response');
			Book.find(function(err, books) {
				res.writeHead(200, {"Content-Type": "application/json"});
				var resBooks = [];
				_.forEach(books, function(book) {
					resBooks.push({ id: book._id, title: book.title, year: book.year });
				});
				res.write(JSON.stringify(resBooks));
				res.end();
				callback(null);
			});
		}

		async.waterfall([
			refreshCache,
			createResponse
		])
	}

);

module.exports = router;
