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
        //
        // `:render="false"` + the explicit `builder.render()` at the end (both restored here,
        // matching the legacy demo's own `render: false` + trailing `c.render()`) aren't optional
        // decoration - dropping them (as this file's first conversion pass did) reproduces a real
        // bug: with `render` left at `<Chart>`'s own default (`true`), each `updateGrid()` call
        // re-renders immediately (`Axis.set()`'s own `if (this.chart.isRender()) this.chart.render()`
        // guard), so the chart renders once with x AND y BOTH swapped to "block" (a genuinely
        // invalid intermediate combination - no numeric axis at all) between the two calls, before
        // the second call restores a valid x=range/y=block state. That transient render is real,
        // visible, and threw 8 "<ellipse> attribute cx: Expected length, 'null'" console errors on
        // the scatter brush's markers (confirmed via Playwright) even though the FINAL state always
        // looked correct. `render: false` batches both grid-type swaps before the engine ever
        // re-renders, exactly like the original.
        this.timer = setTimeout(() => {
            var builder = this.$refs.chartRef.getBuilder();
            var axis = builder.axis(0);

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

            builder.render();
        }, 5000);
    },
    beforeUnmount() {
        clearTimeout(this.timer);
    },
    template: '<Chart ref="chartRef" :axis="axis" :brush="brush" :render="false" />'
}).mount("#result");
