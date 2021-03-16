const stats = require('./blaseballStats.js');
const lore = require('./loreTracker.js');

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
  let responseJSON = {
    message: 'Team id is required',
  };

  if (!body.team) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 200;

  return (async () => {
    responseJSON = await stats.getTeam(body.team);
    if (!responseJSON) {
      responseCode = 400;
      responseJSON = {};
      responseJSON.message = 'Recieved invalid team id';
    }
    return respondJSON(request, response, responseCode, responseJSON);
  })();
};

const getPlayers = (request, response, body) => {
  let responseJSON = {
    message: 'Team id is required',
  };
  if (!body.team) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 200;

  return (async () => {
    responseJSON = await stats.getTeamRoster(body.team);
    if (!responseJSON) {
      responseCode = 400;
      responseJSON = {
        message: 'Recieved invalid team id',
      };
    }
    return respondJSON(request, response, responseCode, responseJSON);
  })();
};

const getPlayer = (request, response, body) => {
  let responseJSON = {
    message: 'Player id is required',
  };
  if (!body.id) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 200;

  return (async () => {
    responseJSON = await stats.getPlayer(body.id);
    if (!responseJSON) {
      responseCode = 400;
      responseJSON = {
        message: 'Recieved invalid player id',
      };
    }
    return respondJSON(request, response, responseCode, responseJSON);
  })();
};

const getLore = (request, response, body) => {
  let responseJSON = {
    message: 'Team or player id is required',
  };
  if (!body.id) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 200;

  responseJSON = lore.getLore(body.id);
  if (!responseJSON) {
    responseCode = 400;
    responseJSON = {
      message: 'Recieved invalid id',
    };
  }

  return respondJSON(request, response, responseCode, responseJSON);
};

const addLore = (request, response, body) => {
  const responseJSON = {
    message: 'Id, title, and lore are all required',
  };

  if (!body.id || !body.lore || !body.title) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  lore.addLore(body.id, body.title, body.lore);

  responseJSON.message = 'Created Successfully!';
  return respondJSON(request, response, 201, responseJSON);
};

const updateLore = (request, response, body) => {
  const responseJSON = {
    message: 'playerId/teamId, loreId, and lore are all required',
  };

  if (!body.id || !body.lore || !body.loreId) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  lore.updateLore(body.id, body.loreId, body.lore);

  responseJSON.message = 'Updated Successfully!';
  return respondJSONMeta(request, response, 204);
};

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found!',
    id: 'notFound',
  };

  return respondJSON(request, response, 404, responseJSON);
};

const notFoundMeta = (request, response) => respondJSONMeta(request, response, 404);

module.exports = {
  notFound,
  getTeams,
  getTeamsMeta,
  getTeam,
  notFoundMeta,
  getPlayers,
  getPlayer,
  getLore,
  addLore,
  updateLore,
};
