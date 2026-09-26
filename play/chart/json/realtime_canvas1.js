var time = jui.include("util.time");

Vue.createApp({
    data() {
        return {
            canvas : true,
            height : 600,
            axis : [{
                x : {
                    type : "date",
                    domain : getDomain(),
                    interval : 1,
                    realtime : "minutes",
                    format : "hh:mm",
                    key : "time"
                },
                y : {
                    type : "range",
                    domain : [ 0, 8000 ],
                    step : 4,
                    line : "solid"
                },
                area : {
                    width : "60%",
                    height : "60%"
                },
                buffer : 1000000,
                data : []
            }, {
                extend : 0,
                y : {
                    domain : function(d) {
                        return d.count * 1.2;
                    },
                    step : 2
                },
                area : {
                    width : "100%",
                    height : "30%",
                    y : "70%"
                }
            }, {
                area : {
                    x : "70%",
                    y : "15%",
                    width : "30%",
                    height : "30%"
                }
            }],
            brush : [{
                type : "canvas.scatter",
                symbol : "cross",
                target : [ "delay" ],
                size : 5,
                colors : function(d) {
                    if(d.level == "fatal") {
                        return "#ff0000"
                    } else if(d.level == "warning") {
                        return "#f2ab14";
                    }

                    return "#4692ca";
                },
                clip : true,
                axis : 0
            }, {
                type : "line",
                target : [ "count" ],
                clip : true,
                axis : 1
            }, {
                type : "pie",
                colors : [ "#4692ca", "#f2ab14", "#ff0000" ],
                showText : true,
                format : function(k, v) {
                    return v;
                },
                axis : 2
            }],
            widget : [{
                type : "dragselect",
                dataType : "list"
            }, {
                type : "title",
                align : "end",
                text : "Number of calls per second",
                dy : 370
            }, {
                type : "title",
                align : "end",
                text : "Number of levels",
                dy : 60
            }, {
                type : "cross",
                xFormat : function(d) {
                    return time.format(d, "HH:mm");
                },
                yFormat : function(d) {
                    return Math.round(d);
                },
                axis : 1
            }],
            event : {
                "dragselect.end": function(data) {
                    alert(data.length);
                    console.log(data);
                }
            }
        };
    },
    mounted() {
        // Reactive-data version of the legacy per-tick chart.axis(i).update()/set()/render() calls -
        // array mutations run directly on `this.axis[0].data` (the reactive proxy), see
        // realtime2.js's comment for why mutating a merely-same-reference plain array wouldn't
        // re-render.
        this.timer = setInterval(() => {
            var domain = getDomain();

            appendTxData(this.axis[0].data, domain);
            this.axis[0].x.domain = domain;

            this.axis[1].data = getStatusData(this.axis[0].data);

            this.axis[2].data = getLevelData(this.axis[0].data);
        }, 1000);
    },
    beforeUnmount() {
        clearInterval(this.timer);
    },
    template: '<Chart ref="chartRef" :canvas="canvas" :height="height" :axis="axis" :brush="brush" :widget="widget" :event="event" />'
}).mount("#result");

function appendTxData(list, domain) {
    var count = Math.floor(Math.random() * 200);

    for(var i = 0; i < list.length; i++) {
        if(list[i].time.getTime() < domain[0].getTime()) {
            list.shift();
        } else {
            break;
        }
    }

    for(var i = 0; i < count; i++) {
        var type = Math.floor(Math.random() * 6),
            data = {
                delay: Math.floor(Math.random() * 10000),
                level: "normal",
                time: domain[1]
            };

        if(type > 2 && type < 5) {
            data.level = "warning";
        } else if(type > 4) {
            data.level = "fatal";
        }

        list.push(data);
    }
}

function getStatusData(txData) {
    var list = [],
        cache = {};

    for(var i = 0; i < txData.length; i++) {
        var time = txData[i].time.getTime();

        if(!cache[time]) {
            cache[time] = 1;
        } else {
            cache[time] += 1;
        }
    }

    for(var time in cache) {
        list.push({
            time: time,
            count: cache[time]
        });
    }

    return list;
}

function getLevelData(txData) {
    var list = [{
        normal : 0,
        warning : 0,
        fatal : 0
    }];

    for(var i = 0; i < txData.length; i++) {
        if(txData[i].level == "fatal") {
            list[0].fatal += 1;
        } else if(txData[i].level == "warning") {
            list[0].warning += 1;
        } else {
            list[0].normal += 1;
        }
    }

    return list;
}

function getDomain() {
    return [ new Date(new Date() - time.MINUTE * 5), new Date() ];
}
