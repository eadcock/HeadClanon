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
  const divisions = await queryBlaseballAPI('allDivisions').catch(e => console.log(e));
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

  console.log(teamsByDivision);
}

async function loadPlayers() {
  playersLoaded = true;
  let playerString = 'ids=';
  for (let i = 0; i < teamsUnsorted.length; i++) {
    const team = teamsUnsorted[i];
    let first = true;
    for (let j = 0; j < team.lineup.length; i++) {
      const player = team.lineup[j];
      if (!first) {
        playerString += ',';
      }

      playerString += player;
      first = false;
    }
  }

  const playerData = await queryBlaseballAPI(`players?${playerString}`);
  for (let i = 0; i < playerData.length; i++) {
    players[playerData[i].id] = playerData[i];
    if (!playersByTeam[playerData[i].leagueTeamId]) {
      playersByTeam[playerData[i].leagueTeamId] = {};
    }

    playersByTeam[playerData[i].leagueTeamId][playerData[i].id] = playerData[i];
  }
}

async function getTeamsByDivision() {
  if (!loaded) {
    await loadTeams().then(() => teamsByDivision).catch((e) => console.log(e));
  }

  return teamsByDivision;
}

async function getTeam(teamId) {
  if (!loaded) {
    await loadTeams().then(() => teamsByDivision).catch((e) => console.log(e));
  }

  return teamsUnsorted[teamId];
}

async function getPlayers() {
  if (!playersLoaded) {
    await loadPlayers().then(() => players).catch((e) => console.log(e));
  }

  return players;
}

async function getTeamRoster(teamId) {
  if (!playersLoaded) {
    await loadPlayers().then(() => players).catch((e) => console.log(e));
  }

  return playersByTeam[teamId];
}

module.exports = {
  queryAPI: queryBlaseballAPI,
  getTeams: getTeamsByDivision,
  getTeam,
  loadTeams,
  getPlayers,
  getTeamRoster
};
