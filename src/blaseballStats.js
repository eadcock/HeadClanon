const fetch = require('node-fetch');

const BLASEBALL_API_URL = 'https://www.blaseball.com/database/';
const DATABLASE_API_URL = 'https://api.blaseball-reference.com/';

const teamsByDivision = {};
const teamsUnsorted = {};

const players = {};
const playersByTeam = {};

let loaded = false;
let playersLoaded = false;

// thanks https://github.com/mjhale/blaseball-reference.com for showing me node-fetch
// https.request().on('end') was never firing, but fetch works so idk what's up.

async function queryBlaseballAPI(queryString) {
  const res = await fetch(`${BLASEBALL_API_URL}${queryString}`);

  return res.json();
}

async function queryDatablaseAPI(queryString) {
  const res = await fetch(`${DATABLASE_API_URL}${queryString}`);

  return res.json();
}

async function loadTeams() {
  loaded = true;
  const divisions = await queryBlaseballAPI('allDivisions').catch((e) => console.log(e));
  const teamsRequest = await queryBlaseballAPI('allTeams').catch((e) => console.log(e));
  // reconfigure the teams output into a more useable format
  for (let i = 0; i < teamsRequest.length; i++) {
    teamsUnsorted[teamsRequest[i].id] = teamsRequest[i];
  }

  for (let i = 0; i < divisions.length; i++) {
    if (divisions[i].name === 'Wild High' || divisions[i].name === 'Mild High' || divisions[i].name === 'Wild Low' || divisions[i].name === 'Mild Low') {
      if (!teamsByDivision[divisions[i].id]) {
        teamsByDivision[divisions[i].id] = {};
        teamsByDivision[divisions[i].id].name = divisions[i].name;
      }
      for (let j = 0; j < divisions[i].teams.length; j++) {
        // There's literally no where to break this line that goes below 100 characters...
        // eslint-disable-next-line max-len
        teamsByDivision[divisions[i].id][teamsUnsorted[divisions[i].teams[j]].id] = teamsUnsorted[divisions[i].teams[j]];
      }
    }
  }
}

async function loadRoster(position, teamId) {
  const returnValue = await queryBlaseballAPI(`players?ids=${teamsUnsorted[teamId][position].join()}`);
  console.log(`Loaded Roster: ${position}, ${teamsUnsorted[teamId].fullName}`);
  return returnValue;
}

async function injectPlayer(player, pos, teamId) {
  console.log(`Injecting player: ${player.name}`);
  teamsUnsorted[teamId][pos][player.id] = player;
  players[player.id] = player;
  if (!playersByTeam[teamId]) {
    playersByTeam[teamId] = {};
  }
  if (!playersByTeam[teamId][pos]) {
    playersByTeam[teamId][pos] = {};
  }
  playersByTeam[teamId][pos][player.id] = player;
}

async function loadPlayersOnTeam(teamId) {
  const positions = ['lineup', 'rotation', 'bullpen', 'bench'];

  const promises = [];
  for (let i = 0; i < positions.length; i++) {
    promises.push(new Promise((resolve) => {
      resolve(loadRoster(positions[i], teamId));
    }));
  }

  await Promise.all(promises)
    .then((pos) => {
      pos.forEach((roster, index) => {
        teamsUnsorted[teamId][positions[index]] = {};
        roster.forEach((player) => {
          injectPlayer(player, positions[index], teamId);
        });
      });
    });
}

async function loadPlayers() {
  console.log('Loading players!');
  playersLoaded = true;
  const teamIds = Object.keys(teamsUnsorted);
  const promises = [];
  for (let i = 0; i < teamIds.length; i++) {
    promises.push(new Promise((resolve) => {
      resolve(loadPlayersOnTeam(teamIds[i]));
    }));
  }

  await Promise.all(promises);
  console.log('Finished loading1');
}

async function getTeamsByDivision() {
  if (!loaded) {
    await loadTeams().then(() => teamsByDivision).catch((e) => console.log(e));
  }

  return teamsByDivision;
}

async function getTeam(teamId) {
  if (!loaded) {
    await loadTeams().then(() => teamsUnsorted[teamId]).catch((e) => console.log(e));
  }

  return teamsUnsorted[teamId];
}

async function getPlayers() {
  if (!playersLoaded) {
    await loadPlayers().then(() => players).catch((e) => console.log(e));
  }

  return players;
}

async function getPlayer(playerId) {
  if (!playersLoaded) {
    return loadPlayers().then(() => players[playerId]).catch((e) => console.log(e));
  }

  return players[playerId];
}

async function getTeamRoster(teamId) {
  if (!playersLoaded) {
    return loadPlayers().then(() => playersByTeam[teamId])
      .catch((e) => console.log(e));
  }
  return playersByTeam[teamId];
}

module.exports = {
  queryAPI: queryBlaseballAPI,
  queryDatablase: queryDatablaseAPI,
  getTeams: getTeamsByDivision,
  getTeam,
  loadTeams,
  getPlayers,
  getPlayer,
  getTeamRoster,
};
