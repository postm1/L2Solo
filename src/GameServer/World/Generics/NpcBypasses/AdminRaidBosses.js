const ServerResponse = invoke('GameServer/Network/Response');
const RaidBossSourceCatalog = invoke('GameServer/RaidBoss/RaidBossSourceCatalog');

const PAGE_SIZE = 13;

function escapeHtml(value) {
    return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// One entry per boss template: a boss with several spawn points would
// otherwise repeat in the level-sorted list.
function uniqueByTemplate(bosses) {
    const seen = new Set();
    return bosses.filter((boss) => !seen.has(boss.raidBossTemplateId) && seen.add(boss.raidBossTemplateId));
}

// Without an explicit page argument the list opens on the page holding the
// boss whose level is nearest to the hero's.
function defaultPage(bosses, heroLevel, totalPages) {
    if (bosses.length === 0) return 1;
    const nearest = bosses.reduce((best, boss, index) =>
        Math.abs(boss.avgLevel - heroLevel) < Math.abs(bosses[best].avgLevel - heroLevel) ? index : best, 0);
    return Math.min(totalPages, Math.floor(nearest / PAGE_SIZE) + 1);
}

function adminRaidBosses(session, parts = []) {
    const actor = session?.actor;
    if (!actor) {
        session?.dataSendToMe?.(ServerResponse.actionFailed());
        return;
    }

    // admin-raid-bosses tp <templateId>: step onto the boss spawn point.
    if (parts[1] === 'tp') {
        const boss = uniqueByTemplate(RaidBossSourceCatalog.all())
            .find((entry) => Number(entry.raidBossTemplateId) === Number(parts[2]));
        if (!boss?.center) {
            session.dataSendToMe(ServerResponse.actionFailed());
            return;
        }
        invoke(path.actor).teleportTo(session, actor, {
            locX: boss.center.locX, locY: boss.center.locY, locZ: boss.center.locZ, head: 0
        });
        return;
    }

    // RaidBossSourceCatalog.all() is already sorted by the boss level.
    const bosses = uniqueByTemplate(RaidBossSourceCatalog.all());
    const live = RaidBossSourceCatalog.liveTemplateIds();
    const totalPages = Math.max(1, Math.ceil(bosses.length / PAGE_SIZE));

    let page = Number(parts[1]);
    if (!Number.isInteger(page) || page < 1 || page > totalPages) {
        page = defaultPage(bosses, Number(actor.fetchLevel?.()) || 0, totalPages);
    }

    const rows = bosses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((boss) => {
        const alive = live.has(boss.raidBossTemplateId);
        // The level alone carries the live state through its colour, and only
        // table cells align in the L2 client: the name column fills the row,
        // so the [TP] column sits flush against the right edge.
        const color = alive ? '00A000' : 'C80000';
        return `<tr><td><font color="${color}">[${boss.avgLevel}]</font>`
            + `&nbsp;${escapeHtml(boss.name)}</td>`
            + `<td align="right"><a action="bypass -h admin-raid-bosses tp ${boss.raidBossTemplateId}">[TP]</a></td></tr>`;
    });

    const nav = [];
    if (page > 1) nav.push(`<a action="bypass -h admin-raid-bosses ${page - 1}">Prev</a>`);
    if (page < totalPages) nav.push(`<a action="bypass -h admin-raid-bosses ${page + 1}">Next</a>`);
    if (page < totalPages) nav.push(`<a action="bypass -h admin-raid-bosses ${totalPages}">Last</a>`);

    const body = rows.join('') || '<tr><td colspan=2>The raid boss catalog is empty.</td></tr>';

    session.dataSendToMe(ServerResponse.npcHtml(
        session.activeNpcTalk?.objectId ?? 7146,
        // A little cell padding is the only vertical breathing room the L2
        // html renderer gives between table rows.
        '<html><body><table width=100% cellspacing=0 cellpadding=2 border=0>' +
        `<tr><td><font color="LEVEL">Raid Bosses</font> (page ${page} of ${totalPages})</td>` +
        '<td align="right"><a action="bypass -h html Admin/main">Back to menu</a></td></tr>' +
        '<tr><td colspan=2>&nbsp;</td></tr>' +
        body +
        '<tr><td colspan=2>&nbsp;</td></tr>' +
        `<tr><td colspan=2>${nav.join('&nbsp;&nbsp;|&nbsp;&nbsp;')}</td></tr>` +
        '</table></body></html>'
    ));
    session.dataSendToMe(ServerResponse.actionFailed());
}

module.exports = adminRaidBosses;
