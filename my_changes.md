*** Main changes of our local branch ***

- Never change README.md file, only read if you need it

Each completed item below ships as its own separate local commit.

- BUFF_LIMIT - character buff slots (EffectStore), 20 by default, 30 by our change
- RAID_LEVEL_MAX_DIFFERENCE - raid boss curse var, 8 by default, 20 by our change
- admin-full-buff-party - admin panel bypass added: full buff every party member (own class profile) and their servitors with one click
- ADMIN_BUFF_DURATION_MS - admin full buff duration, 20 minutes by default, 1 hour by our change
- autoloot (NpcRewards) - real player NPC drops go straight to inventory through native pickup (works in party too, the ini General.autoloot switch now has an engine consumer)
- bAllLootForLeader - all party loot (items and Adena whole) to the real-player leader; boss_loot_leader_only - raid-boss item drops to the player leader only; both apply to player parties only (never bot-led ones)
- bLootPenaltyLevel - the deep-blue drop penalty level gap (was hardcoded 9) now reads local.ini General.bLootPenaltyLevel (25); missing or bad value falls back to retail 9
- admin-raid-bosses - new admin panel section: raid boss list sorted by level (13 per page, Prev/Next/Last paging, Back to menu in the header), level colored green when live and red when dead, [TP] button per row teleports to the boss spawn, opens on the page nearest the hero level
- expBossRate - raid boss experience multiplier (0.5 = half) for everyone sharing the kill, but only when a real player lands the kill or stands in the party; bot-only parties, ordinary monsters and SP are untouched, missing key means 1
- baseSlotsLimit - inventory base slots (InventoryLimits.capacity) raised from retail 80/100 to 120 for ordinary races and 150 for dwarves (race 4); Expand Inventory (1372) +6 a level up to level 8 unchanged
- README.md - never touched by our commits; doc notes about our changes live only in this file
