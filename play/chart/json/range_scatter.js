var time = jui.include('util.time');

function getNumber() {
    return Math.round(Math.random() * 30  % 20);
}

var start = new Date(),
    end = time.add(start, time.hours, 5),
    data = [];

for(var i = 0; i < 30; i++) {
    data.push({
        time : time.add(start, time.minutes, i*10),
        sales : getNumber(),
        profit : getNumber() * 0.75,
        total : getNumber() * 1.5
    });
}

// 레거시 top-level `series`(target별 symbol 지정)는 jui-chart-vue의 <Chart>/jui-graph-ts
// Builder에 대응 옵션이 없다(stack_bar.js의 NOTE 참고) - 대신 scatter 브러시가 지원하는
// `symbol` 콜백(target별로 다른 symbol 문자열을 반환)으로 완전히 동일하게 재현할 수 있다.
var symbolByTarget = {
    sales : "rectangle",
    profit : "cross",
    total : "triangle"
};

Vue.createApp({
    data() {
        return {
            axis : {
                x : {
                    type : "date",
                    domain : [ start, end ],
                    step : [ time.hours, 1 ],
                    format : "hh:mm",
                    key: "time",
                    line : true
                },
                y : {
                    type : "range",
                    domain : "total",
                    step : 10,
                    line : true
                },
                data : data
            },
            brush : {
                type : "scatter",
                size : 7,
                target : [ "sales", "profit", "total" ],
                symbol : function(target) {
                    return symbolByTarget[target];
                }
            }
        };
    },
    template: '<Chart ref="chartRef" :axis="axis" :brush="brush" />'
}).mount("#result");
