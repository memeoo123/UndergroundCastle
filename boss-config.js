// boss-config.js — Boss 外置配置（基于标准敌人表-10阶-减法，血量约2.5倍普通怪）
var BOSS_CONFIG_EXTERNAL = {
    bosses: {
        // 1阶 Boss（第4层，进入第5层资源层的关卡）
        goblin_king: {
            name: '哥布林王',
            tier: 1,
            stats: { hp: 400, attack: 30, defense: 15, speed: 8 },
            skills: ['basic_attack', 'power_strike'],
            rewards: {
                gold: { min: 20, max: 50 },
                exp: 50,
                items: [{ resource: 'iron', amount: 3 }]
            }
        },
        // 2阶 Boss（第2层）
        shadow_lord: {
            name: '暗影领主',
            tier: 2,
            stats: { hp: 3340, attack: 89, defense: 33, speed: 10 },
            skills: ['basic_attack', 'power_strike', 'war_cry'],
            rewards: {
                gold: { min: 50, max: 120 },
                exp: 150,
                items: [{ resource: 'crystal', amount: 3 }]
            }
        },
        // 3阶 Boss（第3层）
        mushroom_king: {
            name: '蘑菇王',
            tier: 3,
            stats: { hp: 8900, attack: 187, defense: 56, speed: 8 },
            skills: ['basic_attack', 'power_strike', 'war_cry'],
            rewards: {
                gold: { min: 100, max: 250 },
                exp: 350,
                items: [{ resource: 'wood', amount: 50 }, { resource: 'crystal', amount: 5 }]
            }
        },
        // 4阶 Boss（第4层）
        flame_guardian: {
            name: '烈焰守卫',
            tier: 4,
            stats: { hp: 20380, attack: 376, defense: 93, speed: 9 },
            skills: ['basic_attack', 'power_strike', 'war_cry'],
            rewards: {
                gold: { min: 200, max: 500 },
                exp: 700,
                items: [{ resource: 'iron', amount: 15 }, { resource: 'steel', amount: 5 }]
            }
        },

        // 5阶 Boss（第6层，跳过第5层资源层）
        frost_wyrm: {
            name: '冰霜巨龙',
            tier: 5,
            stats: { hp: 43400, attack: 736, defense: 155, speed: 10 },
            skills: ['basic_attack', 'power_strike', 'war_cry'],
            rewards: {
                gold: { min: 400, max: 1000 },
                exp: 1500,
                items: [{ resource: 'crystal', amount: 15 }, { resource: 'rune', amount: 5 }]
            }
        },
        // 6阶 Boss（第7层）
        ancient_golem: {
            name: '远古石像',
            tier: 6,
            stats: { hp: 87840, attack: 1408, defense: 258, speed: 7 },
            skills: ['basic_attack', 'power_strike', 'war_cry'],
            rewards: {
                gold: { min: 800, max: 2000 },
                exp: 3000,
                items: [{ resource: 'steel', amount: 20 }, { resource: 'rune', amount: 8 }]
            }
        },
        // 7阶 Boss（第8层）
        swamp_horror: {
            name: '沼泽恐魔',
            tier: 7,
            stats: { hp: 146540, attack: 2349, defense: 431, speed: 9 },
            skills: ['basic_attack', 'power_strike', 'war_cry'],
            rewards: {
                gold: { min: 1500, max: 3500 },
                exp: 5000,
                items: [{ resource: 'crystal', amount: 30 }, { resource: 'darksteel', amount: 5 }]
            }
        },
        // 8阶 Boss（第9层）
        void_walker: {
            name: '虚空行者',
            tier: 8,
            stats: { hp: 244340, attack: 3917, defense: 719, speed: 11 },
            skills: ['basic_attack', 'power_strike', 'war_cry'],
            rewards: {
                gold: { min: 3000, max: 7000 },
                exp: 8000,
                items: [{ resource: 'rune', amount: 15 }, { resource: 'darksteel', amount: 10 }]
            }
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BOSS_CONFIG_EXTERNAL: BOSS_CONFIG_EXTERNAL };
}
