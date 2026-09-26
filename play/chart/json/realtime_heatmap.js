var time = jui.include("util.time"),
    txData = [];

Vue.createApp({
    data() {
        return {
            axis : {
                x : {
                    type : "date",
                    domain : getDomain(),
                    interval : 1,
                    realtime : "minutes",
                    format : "HH:mm",
                    key : "time",
                    line : true
                },
                y : {
                    type : "range",
                    domain : [ 0, 10000 ],
                    step : 5,
                    line : true,
                    orient : "left"
                },
                buffer : 100000,
                data : []
            },
            brush : {
                type : "heatmapscatter",
                target : [ "delay" ],
                yInterval : 250,
                xInterval : 5000,
                colors : function(d) {
                    if(d.level == 0) {
                        return "#ff0000"
                    } else if(d.level == 1) {
                        return "#f2ab14";
                    }

                    return "#4692ca";
                }
            },
            event : {
                "dragselect.end": function(data) {
                    console.log(data.length);
                }
            },
            widget : [{
                type : "title",
                text : "Heat-Map Transaction View (0)"
            }, {
                type : "dragselect",
                dataType : "list"
            }]
        };
    },
    mounted() {
        // The original decouples data accumulation (every 5s, into a plain buffer) from the actual
        // chart redraw (every 7s) for performance - kept as-is: `txData` stays a plain (non-reactive)
        // working array that's only copied into the reactive `axis.data` (a fresh array, so the
        // assignment is actually observed - see realtime2.js's comment) on the slower 7s cadence.
        this.accumulateTimer = setInterval(() => {
            var domain = getDomain();
            appendTxData(txData, domain);
        }, 5000);

        this.renderTimer = setInterval(() => {
            var domain = getDomain();

            this.axis.data = txData.slice();
            this.axis.x.domain = domain;
            this.widget[0].text = "Heat-Map Transaction View (+" + txData.length + ")";
        }, 7000);
    },
    beforeUnmount() {
        clearInterval(this.accumulateTimer);
        clearInterval(this.renderTimer);
    },
    template: '<Chart ref="chartRef" :axis="axis" :brush="brush" :event="event" :widget="widget" />'
}).mount("#result");

function appendTxData(list, domain) {
    var count = Math.floor(Math.random() * 1000);

    for(var i = 0; i < list.length; i++) {
        if(list[i].time < domain[0]){
            list.shift();
        } else {
            break;
        }
    }

    for(var i = 0; i < count; i++) {
        var type = Math.floor(Math.random() * 6),
            data = {
                delay: Math.floor(Math.random() * 10000),
                level: 2,
                time: domain[1]
            };

        if(type > 2 && type < 5) {
            data.level = 1;
        } else if(type > 4) {
            data.level = 0;
        }

        list.push(data);
    }
}

function getDomain() {
    return [ new Date() - time.MINUTE * 5, new Date().getTime() ];
}
