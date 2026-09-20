{
    setup() {
        const items = [
            { value: "jennifer", text: "Jennifer" },
            { value: "dark", text: "Dark" },
            { value: "pastel", html: "<strong>Pastel</strong>" },
            { value: "pattern", text: "Pattern" },
            { type: "divider" },
            {
                value: "gradient",
                html: '<img src="https://placehold.co/20x20" width="20" height="20" style="vertical-align: middle;" /> <span style="color: yellow;">Gradient</span>'
            }
        ]

        const themeListMulti = Vue.ref([])

        function onChange(value) {
            console.log(value)
        }

        return { items, themeListMulti, onChange }
    }
}
