const ServerResponse = invoke('GameServer/Network/Response');
const AdminFullBuff = invoke('GameServer/World/Generics/NpcBypasses/AdminFullBuff');
const PartyAwareness = invoke('GameServer/Bot/AI/PartyAwareness');

function adminFullBuffParty(session) {
    const actor = session?.actor;
    if (!actor) {
        session?.dataSendToMe?.(ServerResponse.actionFailed());
        return [];
    }

    // One reader of the party: live members only, the caster included, each
    // member's own servitor handled inside applyFullBuff.
    const members = PartyAwareness.partySessions(session);
    if (members.length === 0) {
        session.dataSendToMe(ServerResponse.actionFailed());
        session.dataSendToMe(ServerResponse.speak(actor, {
            kind: 0,
            text: 'Admin: full buff party found no party members to buff.'
        }));
        return [];
    }

    let buffed = 0;
    let servitors = 0;
    for (const memberSession of members) {
        const member = memberSession?.actor;
        if (!member) continue;
        const result = AdminFullBuff.applyFullBuff(memberSession, member);
        buffed += 1;
        if (result.summonApplied.length) servitors += 1;
    }

    const servitorText = servitors ? ` + ${servitors} servitors` : '';
    session.dataSendToMe(ServerResponse.speak(actor, {
        kind: 0,
        text: `Admin: full buff applied to ${buffed} party members${servitorText}.`
    }));
    return members;
}

module.exports = adminFullBuffParty;
