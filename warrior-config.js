var WARRIOR_CONFIG_EXTERNAL = {
    warriors: {
        swordsman: {
            name: '剑士',
            recruitCost: { gold: 50, iron: 5 },
            equipmentType: 'sword',
            levelUpCost: function(level) {
                return level;
            },
            maxLevel: 10
        },
        archer: {
            name: '弓箭手',
            recruitCost: { gold: 40, wood: 10 },
            equipmentType: 'bow',
            levelUpCost: function(level) {
                return level;
            },
            maxLevel: 10
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WARRIOR_CONFIG_EXTERNAL: WARRIOR_CONFIG_EXTERNAL };
}
