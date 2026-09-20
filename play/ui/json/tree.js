{
    setup() {
        const createTreeData = () => ({
            title: "ROOT",
            children: [
                {
                    title: "Item 1",
                    children: [
                        { title: "Item 1.1" },
                        { title: "Item 1.2" },
                        { title: "Item 1.3" }
                    ]
                },
                {
                    title: "Item 2",
                    children: [
                        { title: "Item 2.1" }
                    ]
                },
                { title: "Item 3" }
            ]
        })

        return {
            rootData: createTreeData(),
            rootData2: createTreeData(),
            rootData3: createTreeData(),
            rootData4: createTreeData()
        }
    }
}
