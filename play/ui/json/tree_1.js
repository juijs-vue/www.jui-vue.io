{
    setup() {
        const { ref, onMounted } = Vue
        const tree1Ref = ref(null)
        const tree2Ref = ref(null)
        const tree3Ref = ref(null)
        const tree4Ref = ref(null)

        function onSelect(node) {
            alert("index(" + node.index + "), title(" + node.data.title + ")")
        }

        function populateTree(treeRef) {
            if (!treeRef) return
            treeRef.append({ title: "Windows" })
            treeRef.append({ title: "Download" })
            treeRef.append({ title: "Program Files" })
            treeRef.append({ title: "Apache" })
            treeRef.append("0", { title: "run.exe" })
            treeRef.append("0", { title: "setting.conf" })
            treeRef.append("1", { title: "jui.torrent" })
            treeRef.insert("2.0", { title: "Riot Games" })
            treeRef.insert("2.0.0", { title: "lol.exe" })
            treeRef.append("3", { title: "startup.bat" })
            treeRef.fold("0")
            treeRef.fold("1")
            treeRef.fold("3")
        }

        onMounted(() => {
            populateTree(tree1Ref.value)
            populateTree(tree2Ref.value)
            populateTree(tree3Ref.value)
            populateTree(tree4Ref.value)
        })

        return {
            tree1Ref,
            tree2Ref,
            tree3Ref,
            tree4Ref,
            onSelect,
            rootData: { title: "C:\\" }
        }
    }
}
