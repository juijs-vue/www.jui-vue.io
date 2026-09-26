Vue.createApp({
    data() {
        return {
    axis : {
        y : {
           type : "range",
           domain : [0, 100],
           step : 10,
           dist : -150
        }
    },
    brush : {
        type : "fillgauge",
        value : 70,
        min : 0,
        max : 100
    }
};
    },
    template: '<Chart ref="chartRef" :axis="axis" :brush="brush" />'
}).mount("#result");
