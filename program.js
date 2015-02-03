var http = require('http');
var _ = require('lodash');

var statusHtml = "<html><body>No data available</body></html>";

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<!DOCTYPE "html">');
  res.end(statusHtml);
}).listen(80, '127.0.0.1');

console.log('Server running at http://127.0.0.1:80/');

var booksUrl = 'http://metadata.helmet-kirjasto.fi/search/author.json?query=Campbell';

http.get(booksUrl, function(res) {

    var body = "";

    res.on("data", function(chunk) {
        body += chunk;
    });

    res.on("end", function() {
        var bookList = _.map(JSON.parse(body).records, function(d) {
            return {
                displayName: d.title,
                year: d.year
            };
        });
        console.log("Got list of books:", bookList);

        statusHtml = "<html><body>";
        _.map(bookList, function(d) {
            statusHtml += "<h1>" + d.displayName + "</h1>";
            statusHtml += "<p>" + d.year + "</p>";
        });

        statusHtml += "</body></html>";
    });

}).on("error", function(e) {
      console.log("Error: ", e);
});
