Vue.createApp({
    data() {
        return {
    axis : {
        data : [{
            value : 50,
            min : 0,
            max : 100
        }]
    },
    brush : {
        type : "circlegauge"
    },
    widget : {
        type : "tooltip"
    }
};
    },
    template: '<Chart ref="chartRef" :axis="axis" :brush="brush" :widget="widget" />'
}).mount("#result");
