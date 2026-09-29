<script setup lang="ts">
// jui-graph-ts's RuleGrid ("chart.grid.rule") - the only demo of this grid type anywhere in this
// gallery (it was previously unreachable in this Vue ecosystem: never registered under
// jui-chart-vue's own grid-type map, and never actually rendered in the real legacy engine either
// - see jui-graph-ts's grid/rule.ts header comment for the full history of what was fixed).
//
// Not used as the main y-axis of the column brush below: `jui-graph-ts`'s own `getXY()` decides
// which axis is the "value" axis purely by `axis.y.type == "range"` (see brush/core.ts's header
// comment) - a "rule"-typed grid never satisfies that check, so no brush (column, line, or
// otherwise) can read a RuleGrid as its value axis without x/y silently swapping roles. RuleGrid's
// only real use is therefore as a second, brush-less axis group overlaid on the SAME plot area as
// the real data axis - a right-side reference scale, same pattern the legacy `mixed3_axis_3` demo
// uses (`axis[1].extend: 0` inherits axis[0]'s x config; `axis[1]` gets no `brush` entry of its
// own, so it only ever draws, never gets read for coordinates).
import { ref } from "vue"
import { Chart } from "jui-chart-vue"

const data = [
    { month: "Jan", sales: 82 },
    { month: "Feb", sales: 95 },
    { month: "Mar", sales: 71 },
    { month: "Apr", sales: 108 },
    { month: "May", sales: 90 },
    { month: "Jun", sales: 120 }
]

const padding = { left: 50, right: 60 }
const axis = [
    {
        x: {
            type: "block",
            domain: "month",
            line: true
        },
        y: {
            type: "range",
            domain: "sales",
            step: 20,
            line: true
        },
        data: data
    },
    {
        x: {
            hide: true
        },
        y: {
            type: "rule",
            domain: "sales",
            step: 10,
            orient: "right",
            // RuleGrid.right()'s own tick+label reach ~10px INWARD from this grid's own origin
            // (a short tick plus 4px of label padding, see rule.ts's right() method) - with the
            // default dist:0 that origin sits exactly on the plot's right edge, so the label
            // overlapped the column brush's own full-width bars. Push the grid itself out into
            // the right padding area so the label clears the bars.
            dist: 40
        },
        extend: 0,
        data: data
    }
]
const brush = {
    type: "column",
    target: "sales",
    axis: 0
}

const chartRef = ref(null)
</script>

<template>
<Chart ref="chartRef" :padding="padding" :axis="axis" :brush="brush" />
</template>
