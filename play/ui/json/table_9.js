{
    setup() {
        const rows = Vue.reactive([
            { id: 1, data: { name: "Hong", age: "20", location: "Ilsan" } },
            { id: 2, data: { name: "Jung", age: "30", location: "Seoul" } },
            { id: 3, data: { name: "Park", age: "15", location: "Yeosu" } },
            { id: 4, data: { name: "Kang", age: "32", location: "Seoul" } },
            { id: 5, data: { name: "Song", age: "12", location: "Gwangju" } },
            { id: 6, data: { name: "Yoon", age: "22", location: "Damyang" } },
            { id: 7, data: { name: "Kim", age: "33", location: "Busan" } },
            { id: 8, data: { name: "Hwang", age: "21", location: "Seoul" } }
        ])

        // ---- right-click row menu (원본: rowmenu 이벤트가 select()+dd.move()+dd.show()를 호출.
        // 위치는 우클릭한 td 자신의, table을 기준으로 한 상대 좌표(jQuery .position())다) ----
        const selectedId = Vue.ref(null)
        const dropdownStyle = Vue.ref({ display: "none" })

        function showMenu(e, row) {
            selectedId.value = row.id
            const td = e.target.closest("td")
            dropdownStyle.value = {
                display: "block",
                position: "absolute",
                left: td.offsetLeft + "px",
                top: td.offsetTop + "px"
            }
        }
        function hideMenu() {
            dropdownStyle.value = { display: "none" }
        }
        function unselect() {
            selectedId.value = null
            hideMenu()
        }

        // ---- row edit (원본: editRow: [1,2,3] - No를 뺀 name/age/location 전부. "Edit" 메뉴를
        // 눌러야만 들어가고(더블클릭 트리거 없음 - editEvent:false), Enter로 셋 다 한번에 커밋) ----
        const editingId = Vue.ref(null)
        const draft = Vue.reactive({ name: "", age: "", location: "" })

        function startEditSelected() {
            if (selectedId.value === null) return
            const row = rows.find(r => r.id === selectedId.value)
            editingId.value = row.id
            draft.name = row.data.name
            draft.age = row.data.age
            draft.location = row.data.location
            unselect()
        }
        function isEditingRow(row) {
            return editingId.value === row.id
        }
        function commitEdit(row) {
            row.data.name = draft.name
            row.data.age = draft.age
            row.data.location = draft.location
            editingId.value = null
        }

        function onMenuSelect(index) {
            if (index === 0) startEditSelected()
            else unselect()
        }

        function onDocClick(e) {
            if (!e.target.closest("#table_9_dd")) hideMenu()
        }
        Vue.onMounted(() => document.addEventListener("click", onDocClick))
        Vue.onBeforeUnmount(() => document.removeEventListener("click", onDocClick))

        return {
            rows,
            selectedId,
            dropdownStyle,
            showMenu,
            onMenuSelect,
            editingId,
            draft,
            isEditingRow,
            commitEdit
        }
    }
}
