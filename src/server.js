const http = require('http');
const url = require('url');
const query = require('querystring');

const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// Handles POST requests
const handlePost = (request, response, parsedUrl) => {
  // Method to parse the body of a POST request
  const grabData = (callback) => {
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

      callback(request, response, bodyParams);
    });
  };

  // Directs traffic to the correct method
  switch (parsedUrl.pathname) {
    case '/lore':
      grabData(jsonHandler.addLore);
      break;
    default:
      jsonHandler.notFound(request, response);
  }
};

// Handles GET requests
const handleGet = (request, response, parsedUrl) => {
  // if there are any params, parse them
  const params = parsedUrl.search ? query.parse(parsedUrl.search.slice(1)) : '';
  // direct traffic to the correct method
  switch (parsedUrl.pathname) {
    case '/style.css':
      htmlHandler.getStyle(request, response);
      break;
    case '/getTeams':
      jsonHandler.getTeams(request, response);
      break;
    case '/team':
      jsonHandler.getTeam(request, response, params);
      break;
    case '/players':
      jsonHandler.getPlayers(request, response, params);
      break;
    case '/player':
      jsonHandler.getPlayer(request, response, params);
      break;
    case '/lore':
      jsonHandler.getLore(request, response, params);
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

// Handle HEAD requests
const handleHead = (request, response, parsedUrl) => {
  // if there are any params, parse them
  const params = parsedUrl.search ? query.parse(parsedUrl.search.slice(1)) : '';
  switch (parsedUrl.pathname) {
    case '/getTeams':
      jsonHandler.getTeamsMeta(request, response);
      break;
    case '/team':
      jsonHandler.getTeamMeta(request, response, params);
      break;
    case '/players':
      jsonHandler.getPlayersMeta(request, response, params);
      break;
    case '/player':
      jsonHandler.getPlayerMeta(request, response, params);
      break;
    case '/lore':
      jsonHandler.getLoreMeta(request, response, params);
      break;
    default:
      jsonHandler.notFoundMeta(request, response);
      break;
  }
};

// Direct request traffic
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
