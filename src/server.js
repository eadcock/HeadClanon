const http = require('http');
const url = require('url');
const query = require('querystring');

const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');
const stats = require('./blaseballStats.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addTeam') {
    const body = [];

    request.on('error', (e) => {
      console.dir(e);
      response.statusCode = 400;
      response.end();
    });

    request.on('data', (chunk) => {
      body.push(chunk);
    });

    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      const bodyParams = query.parse(bodyString);

      jsonHandler.addUser(request, response, bodyParams);
    });
  }
};

const handleGet = (request, response, parsedUrl) => {
  switch (parsedUrl.pathname) {
    case '/style.css':
      htmlHandler.getStyle(request, response);
      break;
    case '/getTeams':
      jsonHandler.getTeams(request, response);
      break;
    case '/':
      htmlHandler.getIndex(request, response);
      break;
    case 'notFound':
    default:
      jsonHandler.notFound(request, response);
      break;
  }
};

const handleHead = (request, response, parsedUrl) => {
  switch (parsedUrl.pathname) {
    case '/getTeams':
      jsonHandler.getTeamsMeta(request, response);
      break;
    default:
      jsonHandler.notFoundMeta(request, response);
      break;
  }
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);

  switch (request.method) {
    case 'GET':
      handleGet(request, response, parsedUrl);
      break;
    case 'POST':
      handlePost(request, response, parsedUrl);
      break;
    default:
      handleHead(request, response, parsedUrl);
      break;
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);

stats.loadTeams();