// resource-config.js — 资源类型外置配置
var RESOURCE_CONFIG_EXTERNAL = {
    resources: {
        gold:      { name: '金币', initial: 0 },
        stone:     { name: '石头', initial: 0 },
        wood:      { name: '木头', initial: 0 },
        wheat:     { name: '小麦', initial: 0 },
        bread:     { name: '面包', initial: 0 },
        leather:   { name: '皮革', initial: 0 },
        cloth:     { name: '布料', initial: 0 },
        silk:      { name: '丝绸', initial: 0 },
        iron:      { name: '铁', initial: 0 },
        steel:     { name: '钢', initial: 0 },
        crystal:   { name: '水晶', initial: 0 },
        rune:      { name: '符文', initial: 0 },
        darksteel: { name: '暗钢', initial: 0 },
        gospel:    { name: '福音', initial: 0 },
        goldOre:   { name: '金矿', initial: 0 }
    }
};

// 模块导出（Node.js 环境下用于测试）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RESOURCE_CONFIG_EXTERNAL: RESOURCE_CONFIG_EXTERNAL
    };
}
