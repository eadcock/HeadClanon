const masterLore = {};

const getLore = (id) => {
  if (!masterLore[id]) {
    masterLore[id] = {};
  }

  return masterLore[id];
};

const addLore = (Id, lore) => {
  const pl = getLore(Id);
  const symbol = Symbol(Id);
  pl[symbol] = lore;
};

const updateLore = (Id, symbol, lore) => {
  const pl = getLore(Id);
  pl[symbol] = lore;
};

const removeLore = (id, symbol) => {
  if (masterLore[id][symbol]) {
    delete masterLore[id][symbol];
  }
};

export {
  getLore,
  addLore,
  updateLore,
  removeLore,
}
