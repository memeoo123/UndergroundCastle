// job-config.js — 工作岗位和建筑的外置配置
var JOB_CONFIG_EXTERNAL = {
    productionInterval: 15000,  // 产出周期（毫秒）

    jobs: {
        farmer: {
            name: '农夫',
            consumes: {},                // 不消耗资源
            produces: { wheat: 1 }       // 每工匠每周期产出 2 小麦
        },
        baker: {
            name: '面包工',
            consumes: { wheat: 2 },      // 每工匠每周期消耗 2 小麦
            produces: { bread: 1 }       // 每工匠每周期产出 1 面包
        },
        quarrier: {
            name: '采石工',
            consumes: { bread: 1 },
            produces: { stone: 3 }
        },
        lumberjack: {
            name: '伐木工',
            consumes: { bread: 1 },
            produces: { wood: 3 }
        },
        ironMiner: {
            name: '铁矿工',
            consumes: { bread: 2 },
            produces: { iron: 1 }
        },
        steelsmith: {
            name: '炼钢工',
            consumes: { iron: 4 },
            produces: { steel: 1 }
        },
        goldMiner: {
            name: '金矿工',
            consumes: { bread: 10 },
            produces: { goldOre: 1 }
        },
        smelter: {
            name: '熔炼工',
            consumes: { goldOre: 1 },
            produces: { gold: 11 }
        },
        crystalsmith: {
            name: '水晶工匠',
            consumes: { gold: 4 },
            produces: { crystal: 1 }
        },
        runesmith: {
            name: '符文工匠',
            consumes: { crystal: 3, stone: 1 },
            produces: { rune: 1 }
        },
        missionary: {
            name: '传教士',
            consumes: { gold: 5 },
            produces: { gospel: 1 }
        },
        darksteelsmith: {
            name: '暗钢工匠',
            consumes: { steel: 10 },
            produces: { darksteel: 1 }
        },
        magicPowdersmith: {
            name: '魔粉工匠',
            consumes: { crystal: 100 },
            produces: { magicPowder: 1 }
        },
        spiritWoodsmith: {
            name: '灵木工匠',
            consumes: { wood: 900, magicPowder: 1 },
            produces: { spiritWood: 1 }
        },
        clothWorker: {
            name: '布料工',
            consumes: { bread: 1 },
            produces: { cloth: 1 }
        },
        silkWorker: {
            name: '丝绸工匠',
            consumes: { cloth: 15 },
            produces: { silk: 1 }
        }
    },

    buildings: {
        dormitory: {
            name: '宿舍',
            cost: { wood: 10, stone: 10 },   // 建造消耗
            effect: { craftsmanCapacity: 2 }  // 每次建造增加 2 工匠容量
        }
    }
};

// 模块导出（Node.js 环境下用于测试）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        JOB_CONFIG_EXTERNAL: JOB_CONFIG_EXTERNAL
    };
}
