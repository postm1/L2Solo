const Skills = require('../PrivateStoreLimits');

// Local C4-flavored inventory size: 120 base slots (150 for dwarves, race 4),
// plus Expand Inventory (1372) at +6 a level, capped at level 8.
function capacity(race, skillLevel = 0) {
    return (Number(race) === 4 ? 150 : 120) + Math.max(0, Math.min(8, Number(skillLevel) || 0)) * 6;
}

// Bounds item request batches without excluding a fully expanded dwarf bag.
const MAX_CAPACITY = capacity(4, 8);

function forActor(actor) {
    return capacity(actor?.fetchRace?.(), Skills.skillLevel(actor, 1372));
}

function forState(state = {}, inputs = {}) {
    return capacity(Skills.stateRace(state, inputs), Skills.stateSkillLevel(state, 1372, inputs));
}

module.exports = { MAX_CAPACITY, capacity, forActor, forState };
