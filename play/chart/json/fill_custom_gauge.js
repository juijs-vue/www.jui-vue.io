Vue.createApp({
    data() {
        return {
    width: 150,
    height : 330,
    padding : "empty",
    brush : {
        type : "fillgauge",
        shape : "custom", // default circle
        direction : "horizontal",
        value : 50,
        min : 0,
        max : 100,
        svg : "../res/doc/chart/resource/woman.svg"
    }
};
    },
    template: '<Chart ref="chartRef" :width="width" :height="height" :padding="padding" :brush="brush" />'
}).mount("#result");
