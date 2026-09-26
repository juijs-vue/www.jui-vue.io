Vue.createApp({
    data() {
        return {
            axis : [{
                x : {
                    type : "block",
                    domain : "quarter",
                    line : true
                },
                y : {
                    type : "range",
                    domain : [ -40, 40 ],
                    step : 10,
                    line : true
                },
                data : [
                    { quarter : "1Q", sales : 50, profit : 35 },
                    { quarter : "2Q", sales : -20, profit : -30 },
                    { quarter : "3Q", sales : 10, profit : -5 },
                    { quarter : "4Q", sales : 30, profit : 25 }
                ]
            }],
            brush : [{
                type : "column",
                target : [ "sales", "profit" ]
            }]
        };
    },
    mounted() {
        // After 5 seconds, update brush - `<Chart>` re-renders whenever the `brush` prop changes,
        // so a plain reactive mutation replaces the legacy addBrush()/updateBrush()/render() calls.
        this.timer = setTimeout(() => {
            this.brush.push({
                type : "line",
                symbol : "curve",
                target : [ "sales", "profit" ]
            });

            this.brush[0] = {
                type : "scatter",
                target : [ "sales", "profit" ],
                size : 10
            };
        }, 5000);
    },
    beforeUnmount() {
        clearTimeout(this.timer);
    },
    template: '<Chart ref="chartRef" :axis="axis" :brush="brush" />'
}).mount("#result");
