*** Main changes of our local branch ***

- Never change README.md file, only read if you need it

Each completed item below ships as its own separate local commit.

- BUFF_LIMIT - character buff slots (EffectStore), 20 by default, 30 by our change
- RAID_LEVEL_MAX_DIFFERENCE - raid boss curse var, 8 by default, 20 by our change
- admin-full-buff-party - admin panel bypass added: full buff every party member (own class profile) and their servitors with one click
- ADMIN_BUFF_DURATION_MS - admin full buff duration, 20 minutes by default, 1 hour by our change
- autoloot (NpcRewards) - real player NPC drops go straight to inventory through native pickup (works in party too, the ini General.autoloot switch now has an engine consumer)
- bAllLootForLeader - all party loot (items and Adena whole) to the real-player leader; boss_loot_leader_only - raid-boss item drops to the player leader only; both apply to player parties only (never bot-led ones)
- README.md - never touched by our commits; doc notes about our changes live only in this file
