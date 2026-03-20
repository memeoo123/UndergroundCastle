// boss-config.js — Boss 外置配置
var BOSS_CONFIG_EXTERNAL = {
    bosses: {
        goblin_king: {
            name: '哥布林王',
            stats: { hp: 100, attack: 12, defense: 5, speed: 5 },
            skills: ['basic_attack', 'power_strike', 'war_cry'],
            rewards: {
                gold: { min: 50, max: 100 },
                exp: 100,
                items: [{ resource: 'crystal', amount: 3 }]
            }
        },
        shadow_lord: {
            name: '暗影领主',
            stats: { hp: 200, attack: 18, defense: 8, speed: 6 },
            skills: ['basic_attack', 'power_strike', 'war_cry'],
            rewards: {
                gold: { min: 100, max: 200 },
                exp: 250,
                items: [{ resource: 'rune', amount: 5 }]
            }
        },
        mushroom_king: {
            name: '蘑菇王',
            stats: { hp: 280, attack: 22, defense: 10, speed: 4 },
            skills: ['basic_attack', 'power_strike', 'war_cry'],
            rewards: {
                gold: { min: 150, max: 280 },
                exp: 400,
                items: [{ resource: 'wood', amount: 50 }, { resource: 'crystal', amount: 5 }]
            }
        },
        flame_guardian: {
            name: '烈焰守卫',
            stats: { hp: 350, attack: 28, defense: 12, speed: 5 },
            skills: ['basic_attack', 'power_strike', 'war_cry'],
            rewards: {
                gold: { min: 200, max: 350 },
                exp: 550,
                items: [{ resource: 'iron', amount: 15 }, { resource: 'steel', amount: 5 }]
            }
        },
        frost_wyrm: {
            name: '冰霜巨龙',
            stats: { hp: 500, attack: 35, defense: 15, speed: 6 },
            skills: ['basic_attack', 'power_strike', 'war_cry'],
            rewards: {
                gold: { min: 300, max: 500 },
                exp: 800,
                items: [{ resource: 'crystal', amount: 15 }, { resource: 'rune', amount: 5 }]
            }
        },
        ancient_golem: {
            name: '远古石像',
            stats: { hp: 600, attack: 40, defense: 20, speed: 3 },
            skills: ['basic_attack', 'power_strike', 'war_cry'],
            rewards: {
                gold: { min: 400, max: 600 },
                exp: 1000,
                items: [{ resource: 'stone', amount: 100 }, { resource: 'steel', amount: 10 }]
            }
        },
        swamp_horror: {
            name: '沼泽恐魔',
            stats: { hp: 700, attack: 45, defense: 18, speed: 5 },
            skills: ['basic_attack', 'power_strike', 'war_cry'],
            rewards: {
                gold: { min: 500, max: 700 },
                exp: 1200,
                items: [{ resource: 'crystal', amount: 20 }, { resource: 'darksteel', amount: 3 }]
            }
        },
        void_walker: {
            name: '虚空行者',
            stats: { hp: 800, attack: 50, defense: 22, speed: 7 },
            skills: ['basic_attack', 'power_strike', 'war_cry'],
            rewards: {
                gold: { min: 600, max: 900 },
                exp: 1500,
                items: [{ resource: 'rune', amount: 10 }, { resource: 'darksteel', amount: 5 }]
            }
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BOSS_CONFIG_EXTERNAL: BOSS_CONFIG_EXTERNAL };
}
