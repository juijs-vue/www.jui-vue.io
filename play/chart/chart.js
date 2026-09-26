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
// 플레이그라운드 셸 UI(Tab / Style 테마 그리드 / 컬러 목록 창 / 인라인 컬러피커 / 토스트 알림)는
// jui-ui-vue(Tab/Window/Notify/Colorpicker) + jui-grid-vue(DataGrid)로 구현한다. Tab 영역과
// Window/Notify 영역은 DOM상 서로 떨어져 있어(Tab은 .chart_data_main 안, Window/Notify는 body
// 끝) 별도의 두 Vue 앱으로 마운트하되, 아래 모듈 스코프의 reactive 상태를 공유해서 하나처럼
// 동작하게 한다.
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
    if (data.index === 0) {
        $("#save_btn").show();
        $(".tools").find(".csv").css("display", "inline-block");
        $(".tools").find(".theme").hide();
    } else if (data.index === 1) {
        createTableStyle();

        $("#save_btn").hide();
        $(".tools").find(".csv").hide();
        $(".tools").find(".theme").css("display", "inline-block");
    }
}

function createTableStyle() {
    if (jui.include("util.base").browser.msie) return;

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
                openColorsWindow: openColorsWindow
            };
        }
    });

    tabApp.use(JuiUiVue);
    tabApp.use(JuiGridVue.default || JuiGridVue);
    tabApp.mount("#chart-tab-app");
    chartTabApp = tabApp;

    // Tab 컴포넌트는 최초 활성 탭(index:0, Code)에 대해서는 change 이벤트를 쏘지 않으므로,
    // Code 탭과 함께 보여야 하는 csv 툴 그룹의 초기 표시 상태를 직접 맞춰준다.
    $(".tools").find(".csv").css("display", "inline-block");

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
	var name = !value ? $("select").find("option:selected").val() : value,
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

        $("select").find("option:first-child")[0].selected = true;
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
        editor = CodeMirror.fromTextArea($("#chart-code-text")[0], {
            mode: "javascript",
            lineNumbers: true,
            styleActiveLine: true,
            matchBrackets: true,
            theme : "neo"
        });

        editor.setOption("extraKeys", {
            "Ctrl-S": function(cm) {
                $("#save_btn").trigger("click");
            }
        });

        editor.on("change", function(cm) {
            try {
                resetChart();
                $("#result").empty();

                $.globalEval(cm.getValue());

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
    }

    // 현재 샘플의 테마가 저장되어 있는지 체크
    var theme = localStorage.getItem("jui.chartplay.theme." + getChartKey());

    if(theme == null) {
        jui.redefine("chart.theme.custom", [], function () { return null; });
    } else {
        eval(theme);
        $("select").find("option:last-child")[0].selected = true;
    }

	changeTheme();
}

function setFunctions() {
    var $el = $(".btn-fullscreen");

    $el.on('click', function() {
        var $el = $(".chart_view");

        if ($el.hasClass("fullscreen")) {
            $el.removeClass("fullscreen").animate({ left : "45%" }, viewCodeEditor);
        } else {
            $el.addClass("fullscreen").animate({ left : "0%" }, viewCodeEditor);
        }
    });

    $(".btn-style").on("click", function() {
        if(themeRows.length > 0) {
            JuiGridVue.downloadCsv("jui_style.csv", JuiGridVue.rowsToCsv(themeColumns, themeRows));
        } else {
            alert("Style data is not loaded.");
        }
    });

    $(".btn-image").on("click", function() {
        var chart = window.currentChart;
        chart.svg.download("jui_image");
    });
}

function getCsvToObject(csv) {
    var _ = jui.include("util.base"),
        data = [],
        rows = csv.split("\n"),
        fields = rows[0].split(",");

    for(var i = 1; i < rows.length - 1; i++) {
        var cells = rows[i].split(",");

        for(var j = 0; j < cells.length; j++) {
            var v = $.trim(cells[j]);

            if (/^[0-9]*$/.test(v) ||
                (_.startsWith(v, '"') && _.endsWith(v, '"')) ||
                (_.startsWith(v, "'") && _.endsWith(v, "'"))
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
    var $form = $("<form action='export.php' method='POST' target='_blank'></form>"),
        $name = $("<input type='hidden' name='filename'/>"),
        $text = $("<input type='hidden' name='filetext'/>");

    $name.val(name);
    $text.val(text);
    $form.append($name);
    $form.append($text);
    $("body").append($form);

    $form.submit();
    $form.remove();
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

jui.ready([ "util.base" ], function(_) {
    setFunctions();
    mountShellApps();

    // IE일 경우, 탭 제거
    if(_.browser.msie) {
        $("#chart-tab-app").hide();
    }

    // 모바일 버전 이벤트
    $("#sidemenu").on("mousedown", function(e) {
        if($("body").hasClass("menu-open")) {
            $("body").removeClass("menu-open");
        } else {
            $("body").addClass("menu-open");
        }
    });

    // CSV 내보내기
    $("#export_csv_btn").on("click", function (e) {
        var chart = getCurrentBuilder(),
            csv = dataToCsv(chart.get("axis", 0).data),
			code = getChartKey();

        exportTextFile(code.split(".").join("_") + ".csv", csv);
    });

    // CSV 가져오기
    $("#import_csv_input").on("change", function (e) {
        var reader = new FileReader();

        reader.onload = function(readerEvt) {
            var result = getCsvToObject(readerEvt.target.result);

            getCurrentBuilder().axis(0).update(eval(result));

            $("#import_csv_input").val("");
        };

        reader.readAsText(e.target.files[0]);
    });

    // Theme 내보내기
    $("#export_theme_btn").on("click", function (e) {
        var code = getChartKey(),
            js = getDataToObject();

        exportTextFile(code.split(".").join("_") + ".js", js);

        // 로컬 스토리지에 저장
        localStorage.setItem("jui.chartplay.theme." + code, js);
    });

    // THEME 가져오기
    $("#import_theme_input").on("change", function (e) {
        var reader = new FileReader();

        reader.onload = function(readerEvt) {
            var result = readerEvt.target.result;

            localStorage.setItem("jui.chartplay.theme." + getChartKey(), result);
            eval(result);

            window.currentChart.setTheme(jui.include("chart.theme.custom"));
            createTableStyle();

            $("#import_theme_input").val("");
        };

        reader.readAsText(e.target.files[0]);
    });

    // CODE 저장하기
    $("#save_btn").on("click", function (e) {
		var code = getChartKey();

        localStorage.setItem("jui.chartplay.code." + code, editor.getValue());

        notifyRef.value && notifyRef.value.add({
            title: code,
            message: "The source code has been saved.",
            color: "danger"
        });
    });

    $("#clear_btn").on("click", function (e) {
        if(confirm("Clear the code and data cache?")) {
            var code = getChartKey();

            localStorage.removeItem("jui.chartplay.code." + code);
            location.reload();
        }
    });

    $("#clear_all_btn").on("click", function (e) {
        if(confirm("Clear all code and data cache?")) {
            localStorage.clear();
            location.reload();
        }
    });
});
