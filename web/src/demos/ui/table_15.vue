<script setup lang="ts">
// @ts-nocheck
import { ref } from "vue"
import { downloadCsv, rowsToCsv } from "jui-grid-vue"

const columns = [
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' },
    { key: 'location', label: 'Location' }
];

const rows = [
    { id: 1, data: { name: "Hong", age: "20", location: "Ilsan" } },
    { id: 2, data: { name: "Jung", age: "30", location: "Seoul" } },
    { id: 3, data: { name: "Park", age: "15", location: "Yeosu" } },
    { id: 4, data: { name: "Kang", age: "32", location: "Seoul" } },
    { id: 5, data: { name: "Song", age: "12", location: "Gwangju" } },
    { id: 6, data: { name: "Yoon", age: "22", location: "Damyang" } },
    { id: 7, data: { name: "Kim", age: "33", location: "Busan" } },
    { id: 8, data: { name: "Hwang", age: "21", location: "Seoul" } }
];

const grid = ref(null);

// 원본은 화면 컬럼(fields: name/age/location)과 CSV로 내보낼 컬럼(csv: name/age)을
// 따로 설정했다 - DataGrid의 exportCsv()는 항상 "지금 보이는 컬럼 그대로"만 내보내서
// 이 기능을 표현할 수 없으므로, useCsv의 rowsToCsv/downloadCsv를 직접 가져다 CSV 전용
// 컬럼 목록으로 호출한다.
const csvColumns = [
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' }
];

function downloadCsv() {
    const csv = rowsToCsv(csvColumns, rows);
    downloadCsv('table.csv', csv);
}
</script>

<template>
<button class="btn small" @click="downloadCsv">
    <i class="icon-play"></i> Run
</button>

<DataGrid
    ref="grid"
    :columns="columns"
    :rows="rows"
    sortable
    resizable
    variant="simple"
    headline
    style="margin-top: 7px;"
/>
</template>
