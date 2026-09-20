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

        const themeListRight = Vue.ref(undefined)
        const themeBottom = Vue.ref(undefined)

        function onChange(value) {
            console.log(value)
        }

        return { items, themeListRight, themeBottom, onChange }
    }
}
