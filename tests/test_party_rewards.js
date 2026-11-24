const assert = require('assert');

require('../src/Global');

const NpcDied = invoke('GameServer/Actor/Generics/NpcDied');

function member(level) {
    return { actor: { fetchLevel: () => level } };
}

const equalLevelShares = NpcDied.partyRewardShares([member(20), member(20)], 100, 20);
assert.deepStrictEqual(
    equalLevelShares.map(({ exp, sp }) => ({ exp, sp })),
    [{ exp: 65, sp: 13 }, { exp: 65, sp: 13 }],
    'two same-level members should split the C4 1.30 party reward bonus equally'
);

const weightedShares = NpcDied.partyRewardShares([member(20), member(30)], 130, 26);
assert.deepStrictEqual(
    weightedShares.map(({ exp, sp }) => ({ exp, sp })),
    [{ exp: 52, sp: 10 }, { exp: 117, sp: 23 }],
    'eligible members should receive party rewards proportionally to squared level'
);

const cutoffShares = NpcDied.partyRewardShares([member(20), member(1)], 100, 20);
assert.deepStrictEqual(
    cutoffShares.map(({ session, exp, sp }) => ({ level: session.actor.fetchLevel(), exp, sp })),
    [{ level: 20, exp: 100, sp: 20 }],
    'an extreme low-level passenger should be excluded by the automatic party cutoff'
);

// General.expBossRate: only raid bosses, only once a real player took part.
const bot = { accountId: 'bot_1' };
const player = { accountId: 'user_1' };
const savedBossRate = options.default.General.expBossRate;
try {
    options.default.General.expBossRate = 0.5;
    assert.strictEqual(NpcDied.raidBossExpMultiplier(true, [bot]), 1,
        'a bot-only raid kill keeps the plain experience rate');
    assert.strictEqual(NpcDied.raidBossExpMultiplier(true, [bot, player]), 0.5,
        'a raid kill shared with a real player scales the experience of the whole party');
    assert.strictEqual(NpcDied.raidBossExpMultiplier(false, [player]), 1,
        'ordinary monsters are never touched by the raid boss rate');
    delete options.default.General.expBossRate;
    assert.strictEqual(NpcDied.raidBossExpMultiplier(true, [player]), 1,
        'without the ini key raid boss experience stays at the plain rate');
} finally {
    if (savedBossRate === undefined) delete options.default.General.expBossRate;
    else options.default.General.expBossRate = savedBossRate;
}

console.log('Party reward checks passed');
