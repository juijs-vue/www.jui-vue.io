{
    setup() {
        // Inject CSS for splitter and container
        const style = document.createElement('style');
        style.textContent = `
            .splitter-container {
                width: 100%;
                position: relative;
                height: 150px;
                border: 1px solid #ececec;
            }
            .splitter {
                width: 100% !important;
                height: 100% !important;
                left: auto !important;
                top: auto !important;
                bottom: auto !important;
                background-color: transparent !important;
            }
        `;
        document.head.appendChild(style);
        return {}
    }
}
