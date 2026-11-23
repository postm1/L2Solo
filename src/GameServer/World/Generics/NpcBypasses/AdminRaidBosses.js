const ServerResponse = invoke('GameServer/Network/Response');
const RaidBossSourceCatalog = invoke('GameServer/RaidBoss/RaidBossSourceCatalog');

const PAGE_SIZE = 15;

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
        const mark = alive
            ? '<font color="00A000">+</font>'
            : '<font color="C80000">-</font>';
        return `${mark} [${boss.avgLevel}] ${escapeHtml(boss.name)}`;
    });

    const nav = [];
    if (page > 1) nav.push(`<a action="bypass -h admin-raid-bosses ${page - 1}">Prev</a>`);
    if (page < totalPages) nav.push(`<a action="bypass -h admin-raid-bosses ${page + 1}">Next</a>`);
    nav.push('<a action="bypass -h admin-raid-bosses">Nearest</a>');

    const body = rows.length
        ? rows.join('<br><br>')
        : 'The raid boss catalog is empty.';

    session.dataSendToMe(ServerResponse.npcHtml(
        session.activeNpcTalk?.objectId ?? 7146,
        `<html><body><center>` +
        `<font color="LEVEL">Raid Bosses</font> (page ${page} of ${totalPages})<br><br>` +
        `${body}<br><br>` +
        `${nav.join('&nbsp;&nbsp;|&nbsp;&nbsp;')}<br><br>` +
        `<a action="bypass -h html Admin/main">Admin Menu</a>` +
        `</center></body></html>`
    ));
    session.dataSendToMe(ServerResponse.actionFailed());
}

module.exports = adminRaidBosses;
