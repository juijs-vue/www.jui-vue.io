{
    setup() {
        // uiplay 원본엔 없는 데모다 - jui-ui-vue/jui-grid-vue 포팅에서만 존재하는 기능
        // (컬럼별로 다른 편집 위젯을 꽂을 수 있는 #edit-{column.key} 슬롯)을 보여주기 위해
        // 이 포팅에서 새로 추가했다. table_5/table_8과 같은 데이터셋을 재사용한다.
        const columns = [
            { key: 'name', label: 'Name', editable: true, resizable: true },
            { key: 'age', label: 'Age', editable: true, resizable: true },
            { key: 'location', label: 'Location', editable: true, resizable: true }
        ]

        const rows = Vue.reactive([
            { id: 1, data: { name: "Hong", age: 20, location: "Ilsan" } },
            { id: 2, data: { name: "Jung", age: 30, location: "Seoul" } },
            { id: 3, data: { name: "Park", age: 15, location: "Yeosu" } },
            { id: 4, data: { name: "Kang", age: 32, location: "Seoul" } },
            { id: 5, data: { name: "Song", age: 12, location: "Gwangju" } },
            { id: 6, data: { name: "Yoon", age: 22, location: "Damyang" } },
            { id: 7, data: { name: "Kim", age: 33, location: "Busan" } },
            { id: 8, data: { name: "Hwang", age: 21, location: "Seoul" } }
        ])

        const locations = ["Ilsan", "Seoul", "Yeosu", "Gwangju", "Damyang", "Busan"]

        return { columns, rows, locations }
    }
}
