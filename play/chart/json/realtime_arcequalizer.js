Vue.createApp({
    data() {
        return {
            axis : [{
                c: {
                    type: "panel"
                },
                data : []
            }],
            brush : [{
                type : "arcequalizer",
                target : [ "v1", "v2", "v3" ],
                maxValue: 100,
                stackCount: 20,
                textRadius: 30
            }],
            widget : [{
                type : "title",
                text : "Equalizer Sample"
            }]
        };
    },
    mounted() {
        this.timer = setTimeout(() => {
            var data = [];

            for(var i = 0; i < 10; i++) {
                data.push({
                    v1: Math.floor(Math.random() * 50),
                    v2: Math.floor(Math.random() * 20),
                    v3: Math.floor(Math.random() * 10)
                });
            }

            this.axis[0].data = data;
        }, 3000);
    },
    beforeUnmount() {
        clearTimeout(this.timer);
    },
    template: '<Chart ref="chartRef" :axis="axis" :brush="brush" :widget="widget" />'
}).mount("#result");
