var editor;
var comments = { show: function () {} }; // "Leave a comment" 링크의 대상 DOM(#comments)이 애초에
                                          // 이 템플릿에 없어서 죽은 기능이었다 - 클릭해도 에러 없이
                                          // 아무 일도 일어나지 않던 기존 동작을 그대로 유지한다.
var realtimeIndex = 0;
var realtimeInterval = null;

// jui-chart-vue 기반 신규 엔진 연동: 데모 코드(json/*.js)는 이제 레거시 `chart.builder(selector,
// options)` 함수 호출이 아니라, 실제 Vue 앱을 만들고 <Chart> 컴포넌트를 템플릿에 쓰는 형태다
// (`Vue.createApp({ data(){...}, template:'<Chart ref="chartRef" :axis="axis" ... />' }).mount("#result")`).
// `Vue.createApp`을 감싸서 (1) "Chart" 컴포넌트를 앱마다 자동 등록해주고(데모 코드에서
// app.component(...)를 반복할 필요 없게), (2) 마지막으로 mount된 앱/루트 인스턴스를 추적해서
// Style 탭·CSV export/import·테마 드롭다운이 접근할 수 있게 한다. 템플릿에 ref="chartRef"를 쓴
// 데모는 getCurrentBuilder()로 실제 jui-graph-ts Builder 인스턴스(axis()/render()/theme()/
// setTheme() 등 레거시와 동일한 시그니처)에 접근할 수 있다.
var currentApp = null;
var currentVM = null;

// 플레이그라운드 셸(Tab/Style 그리드/컬러 목록 창/Notify) 자체도 이제 Vue 앱이지만, 바로 아래의
// 데모 엔진 연동용 Vue.createApp 래핑과는 완전히 분리해야 한다 - 패치된 Vue.createApp으로 셸 앱을
// 만들면 currentApp/currentVM이 데모가 아니라 셸을 가리키게 되어 getCurrentBuilder()/resetChart()가
// 깨진다. 패치되기 전의 원본을 셸 전용으로 따로 보관해 둔다.
var nativeCreateApp = Vue.createApp;

(function() {
    var origCreateApp = Vue.createApp;

    Vue.createApp = function(options) {
        var app = origCreateApp(options);
        app.component("Chart", JuiChartVue.Chart);

        var origMount = app.mount.bind(app);
        app.mount = function(selector) {
            var vm = origMount(selector);
            currentApp = app;
            currentVM = vm;
            return vm;
        };

        return app;
    };
})();

function getCurrentBuilder() {
    var ref = currentVM && currentVM.$refs && currentVM.$refs.chartRef;
    return ref ? ref.getBuilder() : null;
}

// ---------------------------------------------------------------------------------------------
// 플레이그라운드 셸 UI(Tab / 툴바 / Style 테마 그리드 / 컬러 목록 창 / 인라인 컬러피커 / 토스트
// 알림)는 jui-ui-vue(Tab/Window/Notify/Colorpicker) + jui-grid-vue(DataGrid)로 구현하고, jQuery는
// 전혀 쓰지 않는다(CSV/Theme 텍스트 파싱처럼 DOM과 무관한 순수 문자열 로직만 남는다). Tab+툴바
// 영역과 Window/Notify 영역은 DOM상 서로 떨어져 있어(전자는 .chart_data_main 안, 후자는 body
// 끝) 별도의 두 Vue 앱으로 마운트하되, 아래 모듈 스코프의 reactive 상태를 공유해서 하나처럼
// 동작하게 한다. 헤더의 테마 <select>와 Result 패널의 전체화면/이미지 다운로드 버튼은 이 두
// 마운트 지점 밖에 있어 별도 Vue 앱을 만드는 대신 순수 DOM API로 배선한다(mountShellApps() 끝
// 부분 참고).
// ---------------------------------------------------------------------------------------------

var tabIndex = Vue.ref(0);
var tabItems = [
    { text: "Code", value: "code" },
    { text: "Style", value: "style" }
];

var themeColumns = [
    { key: "key", label: "Key", resizable: true },
    { key: "value", label: "Value", editable: true, resizable: true }
];
var themeRows = Vue.reactive([]);

var colorsWinVisible = Vue.ref(false);
var colorsColumns = [ { key: "color", label: "Color", editable: true } ];
var colorsRows = Vue.reactive([]);
var colorsWinDraft = null;
var colorsWinCommit = null;
var colorsWinCancel = null;

var notifyRef = Vue.ref(null);

var chartTabApp = null;
var chartModalApp = null;

// Window의 제목줄 닫기(X) 아이콘처럼, Save/Cancel 버튼을 거치지 않고 v-model이 그냥 false로
// 바뀌는 경로(모달 바깥 클릭 등)로 닫혔을 때는 편집을 취소한 것으로 간주한다. Save 경로는
// saveColorsWindow()가 참조를 먼저 비우고 나서 hide()를 호출하므로 여기서 다시 취소되지 않는다.
Vue.watch(colorsWinVisible, function(visible) {
    if (!visible && colorsWinCommit) {
        cancelColorsWindow();
    }
});

function isColorKey(key) {
    return typeof key === "string" && key.indexOf("Color") !== -1;
}

function isImageKey(key) {
    return typeof key === "string" && key.indexOf("Image") !== -1;
}

function themeRowsToObject() {
    var theme = {};

    for (var i = 0; i < themeRows.length; i++) {
        var d = themeRows[i].data;
        theme[d.key] = d.key === "colors" ? String(d.value).split("|") : d.value;
    }

    return theme;
}

function applyThemeRows() {
    var chart = window.currentChart;
    if (!chart) return;

    chart.setTheme(themeRowsToObject());

    // 로컬 스토리지에 저장
    localStorage.setItem("jui.chartplay.theme." + getChartKey(), getDataToObject());
}

function onThemeRowEdit() {
    applyThemeRows();
}

function onTabChange(data) {
    if (data.index === 1) {
        createTableStyle();
    } else if (data.index === 0 && editor) {
        // Style 그리드의 스크롤바 유무 등으로 컨테이너 폭이 바뀌었을 수 있으니 Code 탭으로
        // 돌아올 때도 다시 맞춰준다.
        setTimeout(function() { editor.refresh(); }, 0);
    }
}

function createTableStyle() {
    // 아직 jui-chart-vue로 이관되지 않은 데모(레거시 chart.builder를 그대로 쓰는 json/*.js)에서는
    // Vue.createApp(...).mount("#result")가 호출되지 않아 currentVM/getCurrentBuilder()가 null을
    // 반환하고, window.currentChart도 갱신되지 않는다 - 이런 데모에서 Style 탭을 열어도 그냥
    // 빈 그리드로 두고 조용히 무시한다(레거시 코드도 이 경우 changeTheme()의 null 체크로 동일하게
    // 아무 것도 하지 않았다 - 데모 엔진 연동은 이번 작업 범위 밖이라 여기서 고치지 않는다).
    var chart = window.currentChart;

    if (chart == null) {
        themeRows.splice(0, themeRows.length);
        return;
    }

    var themes = chart.theme(),
        rows = [];

    for (var key in themes) {
        rows.push({
            id: key,
            data: {
                key: key,
                value: key === "colors" ? themes[key].join("|") : themes[key]
            }
        });
    }

    themeRows.splice(0, themeRows.length);
    for (var i = 0; i < rows.length; i++) {
        themeRows.push(rows[i]);
    }
}

function openColorsWindow(draft, commit, cancel) {
    colorsWinDraft = draft;
    colorsWinCommit = commit;
    colorsWinCancel = cancel;

    var list = String(draft.value).split("|"),
        rows = [];

    for (var i = 0; i < list.length; i++) {
        rows.push({ id: i, data: { color: list[i] } });
    }

    colorsRows.splice(0, colorsRows.length);
    for (var j = 0; j < rows.length; j++) {
        colorsRows.push(rows[j]);
    }

    colorsWinVisible.value = true;
}

function saveColorsWindow() {
    if (!colorsWinDraft || !colorsWinCommit) return;

    var newData = [];
    for (var i = 0; i < colorsRows.length; i++) {
        newData.push(colorsRows[i].data.color);
    }

    colorsWinDraft.value = newData.join("|");
    colorsWinCommit();

    colorsWinDraft = null;
    colorsWinCommit = null;
    colorsWinCancel = null;
}

function cancelColorsWindow() {
    if (colorsWinCancel) {
        colorsWinCancel();
    }

    colorsWinDraft = null;
    colorsWinCommit = null;
    colorsWinCancel = null;
}

// CODE 저장하기
function saveCode() {
    var code = getChartKey();

    localStorage.setItem("jui.chartplay.code." + code, editor.getValue());

    notifyRef.value && notifyRef.value.add({
        title: code,
        message: "The source code has been saved.",
        color: "danger"
    });
}

function clearCode() {
    if (confirm("Clear the code and data cache?")) {
        var code = getChartKey();

        localStorage.removeItem("jui.chartplay.code." + code);
        location.reload();
    }
}

function clearAllCode() {
    if (confirm("Clear all code and data cache?")) {
        localStorage.clear();
        location.reload();
    }
}

// CSV 내보내기
function exportCsv() {
    var chart = getCurrentBuilder(),
        csv = dataToCsv(chart.get("axis", 0).data),
        code = getChartKey();

    exportTextFile(code.split(".").join("_") + ".csv", csv);
}

// CSV 가져오기
function importCsv(e) {
    var input = e.target,
        reader = new FileReader();

    reader.onload = function(readerEvt) {
        var result = getCsvToObject(readerEvt.target.result);

        getCurrentBuilder().axis(0).update(eval(result));

        input.value = "";
    };

    reader.readAsText(input.files[0]);
}

// Theme 내보내기
function exportTheme() {
    var code = getChartKey(),
        js = getDataToObject();

    exportTextFile(code.split(".").join("_") + ".js", js);

    // 로컬 스토리지에 저장
    localStorage.setItem("jui.chartplay.theme." + code, js);
}

// THEME 가져오기
function importTheme(e) {
    var input = e.target,
        reader = new FileReader();

    reader.onload = function(readerEvt) {
        var result = readerEvt.target.result;

        localStorage.setItem("jui.chartplay.theme." + getChartKey(), result);
        eval(result);

        window.currentChart.setTheme(jui.include("chart.theme.custom"));
        createTableStyle();

        input.value = "";
    };

    reader.readAsText(input.files[0]);
}

function mountShellApps() {
    var tabApp = nativeCreateApp({
        setup: function() {
            return {
                tabIndex: tabIndex,
                tabItems: tabItems,
                onTabChange: onTabChange,
                themeColumns: themeColumns,
                themeRows: themeRows,
                onThemeRowEdit: onThemeRowEdit,
                isColorKey: isColorKey,
                isImageKey: isImageKey,
                openColorsWindow: openColorsWindow,
                saveCode: saveCode,
                clearCode: clearCode,
                clearAllCode: clearAllCode,
                exportCsv: exportCsv,
                importCsv: importCsv,
                exportTheme: exportTheme,
                importTheme: importTheme
            };
        }
    });

    tabApp.use(JuiUiVue);
    tabApp.use(JuiGridVue.default || JuiGridVue);
    tabApp.mount("#chart-tab-app");
    chartTabApp = tabApp;

    var modalApp = nativeCreateApp({
        setup: function() {
            return {
                colorsWinVisible: colorsWinVisible,
                colorsColumns: colorsColumns,
                colorsRows: colorsRows,
                saveColorsWindow: saveColorsWindow,
                cancelColorsWindow: cancelColorsWindow,
                notifyRef: notifyRef
            };
        }
    });

    modalApp.use(JuiUiVue);
    modalApp.use(JuiGridVue.default || JuiGridVue);
    modalApp.mount("#chart-shell-modals");
    chartModalApp = modalApp;

    // 헤더의 테마 <select>와 Result 패널의 전체화면/이미지 다운로드 버튼은 두 마운트 지점(
    // #chart-tab-app, #chart-shell-modals) 밖에 있어 Vue로 감쌀 필요 없이 순수 DOM API로 배선한다.
    var fullscreenBtn = document.querySelector(".btn-fullscreen");
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener("click", function() {
            var chartView = document.querySelector(".chart_view");
            if (chartView.classList.contains("fullscreen")) {
                chartView.classList.remove("fullscreen");
                animateLeft(chartView, "45%", viewCodeEditor);
            } else {
                chartView.classList.add("fullscreen");
                animateLeft(chartView, "0%", viewCodeEditor);
            }
        });
    }

    var imageBtn = document.querySelector(".btn-image");
    if (imageBtn) {
        imageBtn.addEventListener("click", function() {
            window.currentChart.svg.download("jui_image");
        });
    }

    var sidemenu = document.getElementById("sidemenu");
    if (sidemenu) {
        sidemenu.addEventListener("mousedown", function() {
            document.body.classList.toggle("menu-open");
        });
    }
}

// jQuery의 .animate({ left: ... })를 대체하는 최소한의 CSS 트랜지션 기반 구현. chart.css가 이미
// .chart_view에 트랜지션을 걸어주지 않으므로, 여기서 직접 requestAnimationFrame으로 left 값을
// 보간한다 - 애니메이션 자체가 이 기능의 핵심은 아니라서(끝나면 뷰포트 리사이즈만 다시 하면 됨)
// 정교한 이징 없이 단순 선형 보간이면 충분하다.
function animateLeft(el, targetLeft, callback) {
    var startLeft = parseFloat(getComputedStyle(el).left) || 0,
        targetPx = targetLeft.indexOf("%") !== -1
            ? (parseFloat(targetLeft) / 100) * el.parentElement.clientWidth
            : parseFloat(targetLeft),
        duration = 300,
        startTime = null;

    function step(timestamp) {
        if (startTime === null) startTime = timestamp;

        var progress = Math.min((timestamp - startTime) / duration, 1),
            current = startLeft + (targetPx - startLeft) * progress;

        el.style.left = current + "px";

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            el.style.left = targetLeft;
            if (typeof callback === "function") callback();
        }
    }

    requestAnimationFrame(step);
}

function getTodayData() {
    var start = new Date(2014, 10, 7),
        end = time.add(start, time.hours, 23);

    var data = [],
        value = 240;

    for(var i = 0; i < 60 * 23; i++) {
        if(value < 60 * 8) {
            value += 1;
        }

        data.push({ time: time.add(start, time.minutes, i), value: value })
    }

    return {
        start: start,
        end: end,
        data: data
    };
}

function getRealtimeData(min) {
    var start = time.add(new Date(), time.minutes, -5),
        data = [];

    for(var i = 0; i < min * 60; i++) {
        data.push(getRealtimeRowData(time.add(start, time.seconds, i + 1)));

        realtimeIndex++;
    }

    return data;
}

function runRealtimeData(realtime) {
    if(realtimeInterval != null) {
        clearInterval(realtimeInterval);
    }

    realtimeInterval = setInterval(function() {
        realtime.append(getRealtimeRowData(new Date()));

        realtimeIndex++;
    }, 1000);
}

function changeTheme(value) {
    var select = document.querySelector(".header select"),
        name = !value ? (select ? select.value : null) : value,
        chart = getCurrentBuilder();

    if(chart == null) return;

    if(name != null) {
        if (typeof(chart.options.theme) != "object") {
            chart.setTheme(name);
        }

        if (chartTabApp != null) {
            createTableStyle();
        }
    } else {
        notifyRef.value && notifyRef.value.add({
            title: getChartKey(),
            message: "The theme does not exist.",
            color: "warning"
        });

        if (select && select.options.length > 0) select.selectedIndex = 0;
    }
}

function resetChart() {
    if (currentApp) {
        currentApp.unmount();
    }

    currentApp = null;
    currentVM = null;
}

function viewCodeEditor(code) {
    if (!editor) {
        editor = CodeMirror.fromTextArea(document.getElementById("chart-code-text"), {
            mode: "javascript",
            lineNumbers: true,
            styleActiveLine: true,
            matchBrackets: true,
            theme : "neo"
        });

        editor.setOption("extraKeys", {
            "Ctrl-S": function(cm) {
                saveCode();
            }
        });

        editor.on("change", function(cm) {
            try {
                resetChart();
                document.getElementById("result").innerHTML = "";

                (0, eval)(cm.getValue());

                window.currentChart = getCurrentBuilder();

				// 현재 테마 적용
				changeTheme();
            } catch(e) {
                console.log(e);
            }
        });

		if(code != null) {
			var cache = localStorage.getItem("jui.chartplay.code." + getChartKey());
			editor.setValue(cache || code);
		}

        // CodeMirror는 생성 시점의 컨테이너 폭을 기준으로 내부 레이아웃을 굳혀버리는데, Tab 컴포넌트
        // 마운트 직후(Vue의 DOM 반영이 아직 다 settle되지 않은 시점)에 만들어지다 보니 실제 폭보다
        // 좁게 잡혀 오른쪽에 회색 여백이 남았다. 다음 프레임으로 한 틱 미뤄서 refresh()하면 그 시점엔
        // 레이아웃이 이미 확정돼 있어 정확한 폭으로 다시 계산한다.
        setTimeout(function() { editor.refresh(); }, 0);
    }

    // 현재 샘플의 테마가 저장되어 있는지 체크
    var theme = localStorage.getItem("jui.chartplay.theme." + getChartKey());

    if(theme == null) {
        jui.redefine("chart.theme.custom", [], function () { return null; });
    } else {
        eval(theme);

        var select = document.querySelector(".header select");
        if (select && select.options.length > 0) select.selectedIndex = select.options.length - 1;
    }

	changeTheme();
}

function getCsvToObject(csv) {
    var data = [],
        rows = csv.split("\n"),
        fields = rows[0].split(",");

    for(var i = 1; i < rows.length - 1; i++) {
        var cells = rows[i].split(",");

        for(var j = 0; j < cells.length; j++) {
            var v = cells[j].trim();

            if (/^[0-9]*$/.test(v) ||
                (v.indexOf('"') === 0 && v.lastIndexOf('"') === v.length - 1) ||
                (v.indexOf("'") === 0 && v.lastIndexOf("'") === v.length - 1)
            ) {
                cells[j] = fields[j] + ":" + v;
            } else {
                cells[j] = fields[j] + ":'" + v + "'";
            }
        }

        data.push("{" + cells.join(",") + "}");
    }

    return "[" + data.join(",") + "]";
}

function dataToCsv(data) {
    if (!data || data.length == 0) return "";

    var fields = [];

    for(var key in data[0]) {
        if (typeof data[0][key] == 'function') continue;
        fields.push(key);
    }

    var rows = [ fields.join(",") ];

    for(var i = 0; i < data.length; i++) {
        var row = data[i],
            cells = [];

        for(var j = 0; j < fields.length; j++) {
            cells.push(row[fields[j]]);
        }

        rows.push(cells.join(","));
    }

    return rows.join("\n") + "\n";
}

function exportTextFile(name, text) {
    var form = document.createElement("form"),
        nameInput = document.createElement("input"),
        textInput = document.createElement("input");

    form.action = "export.php";
    form.method = "POST";
    form.target = "_blank";

    nameInput.type = "hidden";
    nameInput.name = "filename";
    nameInput.value = name;

    textInput.type = "hidden";
    textInput.name = "filetext";
    textInput.value = text;

    form.appendChild(nameInput);
    form.appendChild(textInput);
    document.body.appendChild(form);

    form.submit();
    form.remove();
}

function getDataToObject() {
    var head = [
            "jui.redefine('chart.theme.custom', [], function() {",
            "\treturn {\n",
        ],
        foot = [
            "\n\t};",
            "});"
        ],
        body = [];

    for(var i = 0; i < themeRows.length; i++) {
        var d = themeRows[i].data,
            r = '\t\t' + d.key + ' : ';

        if(d.key == "colors") {
            var colors = String(d.value).split("|");

            for(var j = 0; j < colors.length; j++) {
                colors[j] = '"' + colors[j] + '"';
            }

            r += '[' + colors.join(",") + ']';
        } else {
            if(typeof(d.value) == "string") {
                r += '"' + d.value + '"';
            } else {
                r += d.value;
            }
        }

        body.push(r);
    }

    return head.join("\n") + body.join(",\n") + foot.join("\n");
}

document.addEventListener("DOMContentLoaded", function() {
    mountShellApps();
    viewCodeEditor(document.getElementById("chart-code-text").value);

    var menu = document.querySelector(".menu"),
        activeItem = menu.querySelector("li.active");

    if (!activeItem) { // 메뉴 매개변수가 없을 때
        activeItem = menu.querySelector("li");
        if (activeItem) activeItem.classList.add("active");

        var basicLink = document.querySelector("a[data-type=basic]");
        if (basicLink) basicLink.classList.add("active");
    } else {
        var parentType = activeItem.getAttribute("data-parent"),
            // 값을 따옴표로 감싸지 않으면 "3d"처럼 숫자로 시작하는 값에서 잘못된 선택자
            // 문법(SyntaxError)이 된다 - jQuery의 Sizzle 엔진은 이런 값도 관대하게 받아줬지만
            // 네이티브 querySelector는 엄격한 CSS 문법을 요구한다.
            parentEl = document.querySelector("[data-type='" + parentType + "']");
        if (parentEl) parentEl.classList.add("active");
    }

    if (activeItem) {
        menu.scrollTop = activeItem.offsetTop - 100;
    }
});
