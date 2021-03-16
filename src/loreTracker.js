const masterLore = {};

const getLore = (id) => {
  if (!masterLore[id]) {
    masterLore[id] = [];
  }

  return masterLore[id];
};

const addLore = (Id, title, lore) => {
  const pl = getLore(Id);
  pl.push({ title, lore });
};

const updateLore = (Id, index, lore) => {
  const pl = getLore(Id);
  pl[index].lore = lore;
};

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
