/* eslint-disable no-debugger */
const stats = require('./blaseballStats.js');

const respondJSON = (request, response, status, object) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

const respondJSONMeta = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  response.writeHead(status, headers);
  response.end();
};

const getTeams = (request, response) => {
  let responseJSON;
  (async () => {
    responseJSON = await stats.getTeams();
    return respondJSON(request, response, 200, responseJSON);
  })();
};

const getTeamsMeta = (request, response) => respondJSONMeta(request, response, 200);

const getTeam = (request, response, body) => {
  console.log(body);
  let responseJSON = {
    message: 'Team id is required',
  };

  if (!body.team) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 200;

  (async () => {
    responseJSON = await stats.getTeam(body.team);
    if (!responseJSON) {
      responseCode = 400;
      responseJSON = {};
      responseJSON.message = 'Recieved invalid team id';
    }
    return respondJSON(request, response, responseCode, responseJSON);
  })();
};

const updateUser = (request, response) => {
  const newUser = {
    createdAt: Date.now(),
  };

  return respondJSON(request, response, 201, newUser);
};

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found!',
    id: 'notFound',
  };

  return respondJSON(request, response, 404, responseJSON);
};

const notFoundMeta = (request, response) => respondJSONMeta(request, response, 404);

/*
const addUser = (request, response, body) => {
  const responseJSON = {
    message: 'Name and age are both required',
  };

  if (!body.name || !body.age) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;

  if (users[body.name]) {
    responseCode = 204;
  } else {
    users[body.name] = {};
    users[body.name].name = body.name;
  }

  users[body.name].age = body.age;

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully!';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};
*/

module.exports = {
  notFound,
  getTeams,
  getTeamsMeta,
  getTeam,
  updateUser,
  notFoundMeta,
};
