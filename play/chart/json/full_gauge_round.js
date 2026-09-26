Vue.createApp({
    data() {
        return {
    axis : [{
		c : {
			type : "panel",
		},
        data : [{
            title : "Overall Visits",
            value : 140,
            max : 200,
            min : 0
        }]
    }],
    brush : [{
        type : "fullgauge",
		symbol : "round",
        startAngle : 270,
        size : 20,
        titleY : 40,
        showText : true,
        format : function(value) {
            return value + "k";
        }
    }],
	style : {
		gaugeFontSize : 30
	}
};
    },
    template: '<Chart ref="chartRef" :axis="axis" :brush="brush" :style="style" />'
}).mount("#result");
