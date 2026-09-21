{
    setup() {
        const { ref, computed } = Vue

        const columns = [
            { key: 'name', label: 'Name', sortable: true, resizable: true },
            { key: 'age', label: 'Age', sortable: true, resizable: true },
            { key: 'location', label: 'Location', sortable: true, resizable: true }
        ]

        const allData = [
            { id: 1, data: { name: "Hong", age: 20, location: "Ilsan" } },
            { id: 2, data: { name: "Jung", age: 30, location: "Seoul" } },
            { id: 3, data: { name: "Park", age: 10, location: "Dangjin" } }
        ]

        const filteredData = ref(allData)

        const displayRows = computed(() => filteredData.value)

        function onFilter(isMulti) {
            if (isMulti) {
                filteredData.value = allData.filter(row => {
                    const data = row.data
                    return data.age >= 30 || data.name.indexOf("ng") !== -1
                })
            } else {
                filteredData.value = allData.filter(row => {
                    const data = row.data
                    return data.location.indexOf("eo") !== -1
                })
            }
        }

        return { columns, displayRows, onFilter }
    }
}