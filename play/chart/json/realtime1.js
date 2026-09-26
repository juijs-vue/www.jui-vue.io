var time = jui.include("util.time");

Vue.createApp({
    data() {
        return {
            height : 600,
            axis : [{
                x : {
                    type : "dateblock",
                    domain : [ new Date("2016/01/01"), new Date("2016/01/02") ],
                    interval : time.HOUR, // Only milliseconds
                    format : function(d, i) {
                        return i;
                    }
                },
                y : {
                    type : "range",
                    domain : [ 0, 100 ],
                    step : 4
                },
                area : {
                    height: "40%"
                },
                data : getTPSData(1440)
            }, {
                x : {
                    type : "dateblock",
                    realtime : "minutes",
                    interval : 1, // But number for the real-time basis
                    format : "HH:mm"
                },
                y : {
                    type : "range",
                    domain : [ 0, 1024 ],
                    step : 4,
                    line : "solid"
                },
                area : {
                    y : "60%",
                    height : "40%"
                },
                data : getMemoryData(300)
            }],
            brush : [{
                type : "splitarea",
                target : [ "tps" ],
                split : getTimeToIndex(),
                axis : 0
            }, {
                type : "pin",
                split : getTimeToIndex(),
                axis : 0,
                format : function(d) {
                    return time.format(d, "HH:mm");
                }
            }, {
                type : "line",
                target : [ "memory" ],
                axis : 1
            }],
            widget : [{
                type : "title",
                text : "Today's TPS",
                align : "end"
            }, {
                type : "cross",
                xFormat : function(d) {
                    return time.format(d, "HH:mm");
                },
                yFormat : function(d) {
                    return Math.round(d);
                },
                axis : 0
            }, {
                type : "cross",
                yFormat : function(d) {
                    return Math.round(d);
                },
                axis : 1
            }, {
                type : "title",
                text : "Memory Usage (MB)",
                align : "end",
                dy : 300
            }]
        };
    },
    mounted() {
        // Reactive-data version of the legacy per-second chart.axis(i).update()/updateBrush()/
        // render() calls. IMPORTANT: array mutations (shift/push) run on `this.axis[i].data` (the
        // reactive proxy Vue instruments), not on a separately-held plain array - see realtime2.js
        // for why mutating a merely-same-reference plain array would silently never re-render.
        this.timer = setInterval(() => {
            this.updateTPS();
            this.updateMemory();
        }, 1000);
    },
    beforeUnmount() {
        clearInterval(this.timer);
    },
    methods: {
        updateTPS() {
            var now = new Date();

            if(now.getSeconds() == 0) {
                var index = getTimeToIndex();

                if(this.axis[0].data.length == 1440) {
                    this.axis[0].data.shift();
                    this.axis[0].data.push(getTPSData(1)[0]);
                }

                this.brush[0].split = index;
                this.brush[1].split = index;
            }
        },
        updateMemory() {
            if(this.axis[1].data.length == 300) {
                this.axis[1].data.shift();
                this.axis[1].data.push(getMemoryData(1)[0]);
            }

            this.axis[1].x.domain = [ new Date() - time.MINUTE * 5, new Date() ];
        }
    },
    template: '<Chart ref="chartRef" :height="height" :axis="axis" :brush="brush" :widget="widget" />'
}).mount("#result");

function getTPSData(count) {
    var data = [];

    for(var i = 0; i < count; i++) {
        data.push({ tps: Math.floor(Math.random() * 5) + 50 });
    }

    return data;
}

function getTimeToIndex() {
    var now = new Date();
    return now.getHours() * 60 + now.getMinutes();
}

function getMemoryData(count) {
    var data = [];

    for(var i = 0; i < count; i++) {
        data.push({ memory: (Math.floor(Math.random() * 60) == 1) ? 700 : 300 });
    }

    return data;
}
