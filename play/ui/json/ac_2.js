{
    setup() {
        const initialWords = [
            "ActionScript",
            "AppleScript",
            "Asp",
            "BASIC",
            "C",
            "C++",
            "Clojure",
            "COBOL",
            "ColdFusion",
            "Erlang"
        ]

        const newWords = [
            "Fortran",
            "Groovy",
            "Haskell",
            "Java",
            "JavaScript",
            "Lisp",
            "Perl",
            "PHP",
            "Python",
            "Ruby",
            "Scala",
            "Scheme"
        ]

        const text = Vue.ref("")
        const words = Vue.ref(initialWords)
        const ac2Ref = Vue.ref(null)

        function runUpdate() {
            ac2Ref.value.update(newWords)
        }

        return { text, words, ac2Ref, runUpdate }
    }
}
