// Description:
//   Randomly select some funny responses
//
// Author:
//   Haoming Yin

var random = items => {
  return items[Math.floor(Math.random() * items.length)];
};

var confirm = () => {
  candidates = [
    "Roger that",
    "Sure",
    "Aye, Captain",
    "My pleasure",
    "Cool cool",
    "Hmm, sure"
  ];
  return random(candidates);
};

var title = () => {
  candidates = [
    "Commander",
    "Captain",
    "Superior",
    "Yo",
    "Oi",
    "Your highness",
    "Master",
    "The guy over there",
    "Human",
    "My fans",
    "Mate"
  ];
  return random(candidates);
};

module.exports = {
  random,
  confirm,
  title
}
