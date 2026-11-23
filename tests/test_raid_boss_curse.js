const assert = require('assert');

require('../src/Global');

const RaidCurse = invoke('GameServer/RaidBoss/RaidCurse');
const EffectStore = invoke('GameServer/Effects/EffectStore');
const EffectRestrictions = invoke('GameServer/Effects/EffectRestrictions');
const World = invoke('GameServer/World/World');

function actor(id, level) {
    return {
        fetchId: () => id,
        fetchLevel: () => level,
        fetchLocX: () => 0,
        fetchLocY: () => 0,
        fetchLocZ: () => 0,
        fetchHead: () => 0,
        state: {
            setHits() {},
            setCasts() {},
            setCombats() {},
            fetchCombats: () => false
        }
    };
}

function boss(level) {
    return {
        model: { raidBoss: true },
        fetchIsRaidBoss: () => true,
        fetchLevel: () => level
    };
}

const session = { dataSendToMeAndOthers() {} };
const bossLevel = 20;
const target = boss(bossLevel);
const highLevel = actor(101, bossLevel + RaidCurse.RAID_LEVEL_MAX_DIFFERENCE + 1);
const lowLevel = actor(102, bossLevel + RaidCurse.RAID_LEVEL_MAX_DIFFERENCE);

assert.strictEqual(RaidCurse.isAboveRaidThreshold(highLevel, target), true);
assert.strictEqual(RaidCurse.isAboveRaidThreshold(lowLevel, target), false,
    `exactly ${RaidCurse.RAID_LEVEL_MAX_DIFFERENCE} levels above a raid boss must remain allowed`);

assert.strictEqual(RaidCurse.normalAttackBlocked(session, highLevel, target), true);
assert.strictEqual(EffectStore.list(highLevel).some((effect) => effect.id === RaidCurse.PETRIFICATION_SKILL_ID), true);
assert.strictEqual(EffectStore.impairments(highLevel).disabled, true);
assert.strictEqual(EffectStore.impairments(highLevel).physicalMuted, false);
assert.strictEqual(EffectStore.remainingMs(highLevel, 'raid_petrification') > 119000, true);
assert.strictEqual(EffectStore.list(highLevel).find((effect) => effect.id === RaidCurse.PETRIFICATION_SKILL_ID).stats.reflectDam, undefined);
assert.strictEqual(EffectStore.list(lowLevel).length, 0);

const caster = actor(103, bossLevel + RaidCurse.RAID_LEVEL_MAX_DIFFERENCE + 1);
assert.strictEqual(RaidCurse.skillBlocked(session, caster, [target], {
    fetchSemantic: () => ({ target: 'enemy', effectType: 'debuff' })
}), true);
assert.strictEqual(EffectStore.list(caster).some((effect) => effect.id === RaidCurse.RAID_CURSE_SKILL_ID), true);
assert.strictEqual(EffectStore.impairments(caster).silenced, true);
assert.strictEqual(EffectStore.impairments(caster).physicalMuted, true);
assert.strictEqual(EffectStore.impairments(caster).magicMuted, true);
assert.strictEqual(EffectRestrictions.canAttack(caster), false);
assert.strictEqual(EffectRestrictions.canCast(caster), false);

const historicalBoss = { ...boss(20), fetchId: () => 9001, model: { raidBoss: true, raidAttackers: new Set([104]) } };
World.npc = { spawns: [historicalBoss] };
let currentTarget = historicalBoss.fetchId();
const attackedAlly = actor(104, 20);
attackedAlly.fetchDestId = () => currentTarget;
attackedAlly.automation = { fetchDestId: () => currentTarget };
attackedAlly.state.fetchCombats = () => true;
const supportCaster = actor(105, bossLevel + RaidCurse.RAID_LEVEL_MAX_DIFFERENCE + 1);
const supportSkill = { fetchSemantic: () => ({ target: 'friend', effectType: 'buff' }) };
assert.strictEqual(RaidCurse.skillBlocked(session, supportCaster, [attackedAlly], supportSkill), true);
EffectStore.remove(supportCaster, 'raid_curse');
currentTarget = 7777;
assert.strictEqual(RaidCurse.skillBlocked(session, supportCaster, [attackedAlly], supportSkill), false,
    'a stale raid-boss hit must not curse a support caster after the ally retargets');
World.npc = { spawns: [] };

EffectStore.remove(highLevel, 'raid_petrification');
EffectStore.remove(caster, 'raid_curse');
console.log('Raid boss curse ok');
