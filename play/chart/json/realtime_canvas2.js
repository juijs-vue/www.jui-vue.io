var time = jui.include("util.time");

Vue.createApp({
    data() {
        return {
            canvas : true,
            padding : {
                top : 50,
                bottom : 100,
                left : 100,
                right : 100
            },
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
                    line : true,
                    orient : "right"
                },
                z : {
                    type : "block",
                    domain : [ "fatal", "warning", "normal" ],
                    line : true,
                    key : "level"
                },
                depth : 200,
                degree : {
                    x : 10,
                    y : -45,
                    z : 0
                },
                perspective : 0.7,
                buffer : 1000000,
                data : []
            }],
            brush : [{
                type : "canvas.scatter3d",
                target : [ "delay" ],
                size : 7,
                clip : true,
                colors : function(d) {
                    if(d.level == 0) {
                        return "#ff0000"
                    } else if(d.level == 1) {
                        return "#f2ab14";
                    }

                    return "#4692ca";
                }
            }],
            widget : [{
                type : "title",
                text : "3D Transaction View"
            }],
            style : {
                gridXAxisBorderWidth: 1,
                gridYAxisBorderWidth: 1,
                gridZAxisBorderWidth: 1
            }
        };
    },
    mounted() {
        // Reactive-data version of the legacy per-second chart.axis(0).update()/set()/
        // updateWidget()/render() calls - array mutations run on `this.axis[0].data` (the reactive
        // proxy) directly, see realtime2.js's comment for why a merely-same-reference plain array
        // wouldn't re-render.
        this.timer = setInterval(() => {
            var domain = getDomain();

            appendTxData(this.axis[0].data, domain);
            this.axis[0].x.domain = domain;
            this.widget[0].text = "3D Transaction View (+" + this.axis[0].data.length + ")";
        }, 1000);
    },
    beforeUnmount() {
        clearInterval(this.timer);
    },
    template: '<Chart ref="chartRef" :canvas="canvas" :padding="padding" :axis="axis" :brush="brush" :widget="widget" :style="style" />'
}).mount("#result");

function appendTxData(list, domain) {
    var count = Math.floor(Math.random() * 200);

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
