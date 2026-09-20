{
    setup() {
        const page = Vue.ref(1)
        const items = Vue.ref([])
        const pageCount = 100

        function generateData() {
            const result = []
            for (let i = 0; i < 1000; i++) {
                result.push({
                    name: "Item " + (i + 1),
                    age: Math.floor(Math.random() * 100) + 1,
                    location: "LA"
                })
            }
            items.value = result
            page.value = 1
        }

        function onPage(pNo) {
            console.log("Page changed to:", pNo)
        }

        const paginatedItems = Vue.computed(() => {
            const start = (page.value - 1) * pageCount
            const end = start + pageCount
            return items.value.slice(start, end)
        })

        return { page, items, pageCount, generateData, onPage, paginatedItems }
    }
}

