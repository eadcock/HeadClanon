const fetch = require('node-fetch');

const BLASEBALL_API_URL = 'https://www.blaseball.com/database/';
const DATABLASE_API_URL = 'https://api.blaseball-reference.com/';

let teams = {};

let loaded = false;

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
  const teamBuffer = await queryDatablaseAPI('v1/allTeams').catch(e => console.log(e));
  for (let i = 0; i < teamBuffer.length; i++) {
    if (!teams[teamBuffer[i].division_id]) {
      teams[teamBuffer[i].division_id == null ? 'uncategorized' : teamBuffer[i].division_id] = {};
    }
    // i don't think destructuring makes sense here?
    // eslint-disable-next-line prefer-destructuring
    teams[teamBuffer[i].division_id == null ? 'uncategorized' : teamBuffer[i].division_id][teamBuffer[i].team_id] = teamBuffer[i];
  }
}

async function getTeams() {
  if (!loaded) {
    await loadTeams().then(() => teams).catch(e => console.log(e));
  }
  
  return teams;
}

module.exports = {
  queryAPI: queryBlaseballAPI,
  getTeams,
  loadTeams,
};
