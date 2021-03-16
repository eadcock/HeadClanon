const fetch = require('node-fetch');

const BLASEBALL_API_URL = 'https://www.blaseball.com/database/';

// Two seperate team obj organized in different ways
const teamsByDivision = {};
const teamsUnsorted = {};

// Two seperate player obj organized in different ways
// players is unsorted
const players = {};
const playersByTeam = {};

// have we already loaded teams?
let loaded = false;
// have we already loaded players?
let playersLoaded = false;

// thanks https://github.com/mjhale/blaseball-reference.com for showing me node-fetch
// https.request().on('end') was never firing, but fetch works so idk what's up.

// sends a query to the Blaseball api and sends back the JSON
async function queryBlaseballAPI(queryString) {
  const res = await fetch(`${BLASEBALL_API_URL}${queryString}`);

  return res.json();
}

// loads every active blaseball team
async function loadTeams() {
  loaded = true;
  let continueFlag = true;
  const divisions = await queryBlaseballAPI('allDivisions').catch(() => { continueFlag = false; });
  const teamsRequest = await queryBlaseballAPI('allTeams').catch(() => { continueFlag = false; });

  // If the blaseball api didn't respond on either request, send back a 500 error code
  if (!continueFlag) {
    return 500;
  }

  // reconfigure the teams output into a more useable format
  for (let i = 0; i < teamsRequest.length; i++) {
    teamsUnsorted[teamsRequest[i].id] = teamsRequest[i];
  }

  for (let i = 0; i < divisions.length; i++) {
    // Ignore every team not in a division currently active in blaseball
    if (divisions[i].name === 'Wild High' || divisions[i].name === 'Mild High' || divisions[i].name === 'Wild Low' || divisions[i].name === 'Mild Low') {
      // initialize this division if it's the first time we're seeing it
      if (!teamsByDivision[divisions[i].id]) {
        teamsByDivision[divisions[i].id] = {};
        teamsByDivision[divisions[i].id].name = divisions[i].name;
      }

      // Input every team into the correct division within teamsByDivision
      for (let j = 0; j < divisions[i].teams.length; j++) {
        // There's literally no where to break this line that goes below 100 characters...
        // eslint-disable-next-line max-len
        teamsByDivision[divisions[i].id][teamsUnsorted[divisions[i].teams[j]].id] = teamsUnsorted[divisions[i].teams[j]];
      }
    }
  }

  // Everything worked :)
  return 200;
}

// Query the blaseball api to get every player from a certain position
// This is done to keep the number of ids in a single request relatively low,
// otherwise the blaseball database gets unhappy
async function loadRoster(position, teamId) {
  const returnValue = await queryBlaseballAPI(`players?ids=${teamsUnsorted[teamId][position].join()}`);
  return returnValue;
}

// replaces the position properties to include full information about players at a position/
// rather than just their id.
// Additionally fills out the player and playersByTeam objs
async function injectPlayer(player, pos, teamId) {
  // insert more player information into the unsorted teams obj
  teamsUnsorted[teamId][pos][player.id] = player;
  // add the player to the players obj
  players[player.id] = player;
  // add the player into the playersByTeam obj
  if (!playersByTeam[teamId]) {
    playersByTeam[teamId] = {};
  }
  if (!playersByTeam[teamId][pos]) {
    playersByTeam[teamId][pos] = {};
  }
  playersByTeam[teamId][pos][player.id] = player;
}

// Asynchronously loads every player on a team
async function loadPlayersOnTeam(teamId) {
  // Every position in blaseball
  const positions = ['lineup', 'rotation', 'bullpen', 'bench'];

  // Create a promise to load every player at each individual position
  const promises = [];
  for (let i = 0; i < positions.length; i++) {
    promises.push(new Promise((resolve) => {
      resolve(loadRoster(positions[i], teamId));
    }));
  }

  await Promise.all(promises)
    // After players are loaded, inject them into the unsorted teams obj
    .then((pos) => {
      pos.forEach((roster, index) => {
        teamsUnsorted[teamId][positions[index]] = {};
        roster.forEach((player) => {
          injectPlayer(player, positions[index], teamId);
        });
      });
    });
}

// Asynchronously loads every player on every team
async function loadPlayers() {
  playersLoaded = true;
  // create a promise to load every play on each individual team
  const teamIds = Object.keys(teamsUnsorted);
  const promises = [];
  for (let i = 0; i < teamIds.length; i++) {
    promises.push(new Promise((resolve) => {
      resolve(loadPlayersOnTeam(teamIds[i]));
    }));
  }

  // fulfill the promises
  await Promise.all(promises);
}

// Returns the teamsByDivision object
// If teams have never been loaded, load teams
async function getTeamsByDivision() {
  if (!loaded) {
    return loadTeams().then((code) => (code === 200 ? teamsByDivision : code)).catch(() => '500');
  }

  return teamsByDivision;
}

// Returns the unsorted teams object
// If teams have never been loaded, load teams
async function getTeam(teamId) {
  if (!loaded) {
    await loadTeams().then(() => teamsUnsorted[teamId]).catch((e) => console.log(e));
  }

  return teamsUnsorted[teamId];
}

// Returns the unsorted players object
// If players have never been loaded, load players
async function getPlayers() {
  if (!playersLoaded) {
    await loadPlayers().then(() => players).catch((e) => console.log(e));
  }

  return players;
}

// Returns a specific player from the unsorted players object
// If players have never been loaded, load players
async function getPlayer(playerId) {
  if (!playersLoaded) {
    return loadPlayers().then(() => players[playerId]).catch((e) => console.log(e));
  }

  return players[playerId];
}

// Returns a team's roster given the team's id
// If players have never been loaded, load players.
async function getTeamRoster(teamId) {
  if (!playersLoaded) {
    return loadPlayers().then(() => playersByTeam[teamId])
      .catch((e) => console.log(e));
  }
  return playersByTeam[teamId];
}

module.exports = {
  queryAPI: queryBlaseballAPI,
  getTeams: getTeamsByDivision,
  getTeam,
  loadTeams,
  getPlayers,
  getPlayer,
  getTeamRoster,
};
