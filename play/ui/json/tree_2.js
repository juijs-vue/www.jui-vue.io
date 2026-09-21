{
    setup() {
        const { ref, onMounted } = Vue
        const treeRef = ref(null)

        function onSelect(node) {
            alert("index(" + node.index + "), title(" + node.data.title + ")")
        }

        function handleMove() {
            if (treeRef.value) {
                treeRef.value.move("3", "2.1")
            }
        }

        function handleRemove() {
            if (treeRef.value) {
                treeRef.value.remove("1")
            }
        }

        function handleUpdate() {
            if (treeRef.value) {
                treeRef.value.update("2", { title: "Applications" })
            }
        }

        onMounted(() => {
            const t = treeRef.value
            if (!t) return
            t.append({ title: "Windows" })
            t.append({ title: "Download" })
            t.append({ title: "Program Files" })
            t.append({ title: "Apache" })
            t.append("0", { title: "run.exe" })
            t.append("0", { title: "setting.conf" })
            t.append("1", { title: "jui.torrent" })
            t.insert("2.0", { title: "Riot Games" })
            t.insert("2.0.0", { title: "lol.exe" })
            t.append("3", { title: "startup.bat" })
            t.fold("0")
            t.fold("1")
            t.fold("3")
        })

        return {
            treeRef,
            onSelect,
            handleMove,
            handleRemove,
            handleUpdate,
            rootData: { title: "C:\\" }
        }
    }
}
