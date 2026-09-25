var showEventMessage = function(obj) {
    alert("[" + obj.dataIndex + "] " +
        obj.dataKey + "=" + obj.data[obj.dataKey]);
}

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
            }],
            event : {
                click : function(obj, e) {
                    showEventMessage(obj);
                }
            }
        };
    },
    mounted() {
        // Events defined by the method
        this.$refs.chartRef.getBuilder().on("rclick", function(obj, e) {
            showEventMessage(obj);
        });
    },
    template: '<Chart ref="chartRef" :axis="axis" :brush="brush" :event="event" />'
}).mount("#result");
