Vue.createApp({
    data() {
        return {
            axis : {
                x : {
                    type : "block",
                    domain : [ "1Q", "2Q", "3Q", "4Q" ],
                    line : true
                },
                y : {
                    type : "range",
                    domain : [ 0, 10000 ],
                    step : 4
                },
                data : [
                    { sales : 2100, profit : 1800 },
                    { sales : 6000, profit : 4400 },
                    { sales : 8300, profit : 6700 },
                    { sales : 5200, profit : 4800 }
                ]
            },
            brush : {
                type: "scatter",
                target: [ "sales", "profit" ]
            }
        };
    },
    mounted() {
        // After 5 seconds, update axis grid - `axis.updateGrid()` is an imperative Axis method with
        // no reactive-prop equivalent, so it's called directly on the live Builder via the ref
        // (same pattern as an instance-method event handler).
        this.timer = setTimeout(() => {
            var axis = this.$refs.chartRef.getBuilder().axis(0);

            axis.updateGrid("y", {
                type : "block",
                domain : [ "1Q", "2Q", "3Q", "4Q" ],
                line : true
            }, true);

            axis.updateGrid("x", {
                type : "range",
                domain : [ 0, 10000 ],
                step : 4
            }, true);
        }, 5000);
    },
    beforeUnmount() {
        clearTimeout(this.timer);
    },
    template: '<Chart ref="chartRef" :axis="axis" :brush="brush" />'
}).mount("#result");
