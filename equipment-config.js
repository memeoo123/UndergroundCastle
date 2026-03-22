var EQUIPMENT_CONFIG_EXTERNAL = {
    equipment: {
        sword: {
            name: '铁剑',
            craftCost: { iron: 3, wood: 1 },
            warriorType: 'swordsman'
        },
        bow: {
            name: '长弓',
            craftCost: { wood: 5, cloth: 2 },
            warriorType: 'archer'
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EQUIPMENT_CONFIG_EXTERNAL: EQUIPMENT_CONFIG_EXTERNAL };
}
