var theme = jui.include("chart.theme.pastel");

var data = [
    { age : "80+",   female : 6.0,  male : 5.3 },
    { age : "75-79", female : 4.7,  male : 4.5 },
    { age : "70-74", female : 9.6,  male : 9.7 },
    { age : "65-69", female : 13.6, male : 12.9 },
    { age : "60-64", female : 19.0, male : 18.7 },
    { age : "55-59", female : 19.7, male : 19.5 },
    { age : "50-54", female : 23.2, male : 25.8 },
    { age : "45-49", female : 30.2, male : 32.1 },
    { age : "40-44", female : 34.9, male : 37.5 },
    { age : "35-39", female : 42.2, male : 42.9 },
    { age : "30-34", female : 43.9, male : 44.7 },
    { age : "25-29", female : 50.1, male : 51.3 },
    { age : "20-24", female : 53.8, male : 57.6 },
    { age : "15-19", female : 56.5, male : 64.0 },
    { age : "10-14", female : 63.3, male : 69.4 },
    { age : "5-9",   female : 60.6, male : 66.3 },
    { age : "5-4",   female : 54.2, male : 58.6 }
];

// 좌우 비교 레이아웃 데모(#chart-left/#chart-right, 두 개의 <Chart>) - $("#result").find(".row")
// 로 높이를 재던 jQuery 코드는 필요 없어졌다(각 col에 고정 높이를 직접 준다). Style/CSV/Theme
// 탭의 "대표 차트"는 왼쪽 것으로 삼는다(ref="chartRef"는 이쪽에만 붙인다).
Vue.createApp({
    data() {
        return {
            axisLeft : {
                x : {
                    type : "range",
                    domain : "female",
                    step : 10,
                    line : true,
                    reverse : true
                },
                y : {
                    type : "block",
                    domain : "age",
                    hide : true
                },
                data : data
            },
            widgetLeft : {
                type : "legend"
            },
            brushLeft : {
                type : "bar",
                target : "female",
                colors : [ theme.colors[0] ]
            },
            axisRight : {
                x : {
                    type : "range",
                    domain : "male",
                    step : 10,
                    line: true
                },
                y : {
                    type : "block",
                    domain : "age"
                },
                data : data
            },
            widgetRight : {
                type : "legend"
            },
            brushRight : {
                type : "bar",
                target : "male",
                colors : [ theme.colors[2] ]
            }
        };
    },
    template:
        '<div class="row">' +
            '<div class="col" style="width:50%;height:500px;display:inline-block;">' +
                '<Chart ref="chartRef" :axis="axisLeft" :brush="brushLeft" :widget="widgetLeft" />' +
            '</div>' +
            '<div class="col" style="width:50%;height:500px;display:inline-block;">' +
                '<Chart :axis="axisRight" :brush="brushRight" :widget="widgetRight" />' +
            '</div>' +
        '</div>'
}).mount("#result");
