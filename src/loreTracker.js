// A list containing all lore entires.
// Lore entries are indexed by player/team id
// Lore entries contain 2 properties: the title of the entry and the entry itself
const masterLore = {};

// Initializes the array of lore of a player/team or returns every entry
const getLore = (id) => {
  if (!masterLore[id]) {
    masterLore[id] = [];
  }

  return masterLore[id];
};

// Adds an entry to a player/team
const addLore = (Id, title, lore) => {
  const pl = getLore(Id);
  pl.push({ title, lore });
};

// Updates an entry's lore property
const updateLore = (Id, index, lore) => {
  const pl = getLore(Id);
  pl[index].lore = lore;
};

// Deletes a lore entry at the specified index
const removeLore = (id, index) => {
  if (masterLore[id][index]) {
    delete masterLore[id][index];
  }
};

module.exports = {
  getLore,
  addLore,
  updateLore,
  removeLore,
};
