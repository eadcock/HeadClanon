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

// queries blaseballStats.js for a JSON object containing every blaseball team
const getTeams = (request, response) => {
  let responseJSON;
  (async () => {
    let statusCode = 200;
    responseJSON = await stats.getTeams();
    if (responseJSON === 500) {
      statusCode = 500;
      responseJSON = {
        message: 'Blaseball database did not respond.',
      };
    }
    return respondJSON(request, response, statusCode, responseJSON);
  })();
};

// Handles the head request for getTeams
const getTeamsMeta = (request, response) => {
  (async () => {
    let statusCode = 200;
    const responseJSON = await stats.getTeams();
    if (responseJSON === 500) {
      statusCode = 500;
    }
    return respondJSONMeta(request, response, statusCode);
  })();
};

// Queries blaseballStats.js for a specific team by id
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
    } else if (responseJSON === 500) {
      responseCode = 500;
      responseJSON = {
        message: 'Blaseball database did not respond.',
      };
    }
    return respondJSON(request, response, responseCode, responseJSON);
  })();
};

// Handles the head request for getTeam
const getTeamMeta = (request, response, body) => {
  if (!body.team) {
    return respondJSONMeta(request, response, 400);
  }

  let responseCode = 200;

  return (async () => {
    const responseJSON = await stats.getTeam(body.team);
    if (!responseJSON) {
      responseCode = 400;
    } else if (responseJSON === 500) {
      responseCode = 500;
    }
    return respondJSONMeta(request, response, responseCode);
  })();
};

// Queries blaseballStats.js for a JSON including every blaseball player on a single team
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

// Handles the head response for getPlayers
const getPlayersMeta = (request, response, body) => {
  if (!body.team) {
    return respondJSONMeta(request, response, 400);
  }

  let responseCode = 200;

  return (async () => {
    const responseJSON = await stats.getTeamRoster(body.team);
    if (!responseJSON) {
      responseCode = 400;
    }
    return respondJSONMeta(request, response, responseCode);
  })();
};

// Queries blaseballStats.js for information about a signle player by id
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

// Handles the head request for getPlayer
const getPlayerMeta = (request, response, body) => {
  if (!body.id) {
    return respondJSONMeta(request, response, 400);
  }

  let responseCode = 200;

  return (async () => {
    const responseJSON = await stats.getPlayer(body.id);
    if (!responseJSON) {
      responseCode = 400;
    }
    return respondJSONMeta(request, response, responseCode);
  })();
};

// Queries loreTracker.js for all of the lore entries of a team or player
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

// Handles the head response for getLore
const getLoreMeta = (request, response, body) => {
  if (!body.id) {
    return respondJSONMeta(request, response, 400);
  }

  let responseCode = 200;

  const responseJSON = lore.getLore(body.id);
  if (!responseJSON) {
    responseCode = 400;
  }

  return respondJSONMeta(request, response, responseCode);
};

// Tells loreTracker.js to add a lore entry for a player or team
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
  getTeamMeta,
  notFoundMeta,
  getPlayers,
  getPlayersMeta,
  getPlayer,
  getPlayerMeta,
  getLore,
  getLoreMeta,
  addLore,
};
