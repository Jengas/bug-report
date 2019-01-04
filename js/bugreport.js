var field_data = {
    desc: {
        fn: "Короткое описание",
        ht: "Опишите свою ошибку в одном предложении",
        al: "title"
    },
    exp: {
        fn: "Ожидаемый результат",
        ht: "Что *должно* произойти при выполнении этих действий? (т.е. если ошибка не возникает)",
        al: "expected"
    },
    act: {
        fn: "Реальный результат",
        ht: "Что *на самом деле* происходит при выполнении шагов?",
        al: "actual"
    }
};

var mm = {
    dark: {
        d: "Светлый режим",
        m: "sun"
    },
    light: {
        d: "Тёмный режим",
        m: "moon"
    }
};

function updateSyntax() {
    var desc = $('#desc-field').val();
    var expected = $('#exp-field').val();
    var actual = $('#act-field').val();
    var client = $('#client-field').val();
    var system = $('#sys-field').val();
    var steps = '';
    var bugtext = '';
    for (var i = 1; i <= window.sct; i++) {
        var step = $('#s' + i + '-field').val();
        if (step) {
            steps = steps + ' - ' + step;
        }
    }
    if (desc && expected && actual && steps) {
        bugtext = '!submit ' + desc + ' | Шаги для воспроизведения:' + steps + ' Ожидаемый результат: ' + expected + ' Реальный результат: ' + actual;
    }
    $('#syntax').text(bugtext);
    $('#lrg-rep').toggleClass('hidden', bugtext.length < 1400);
}
function addStep() {
    window.sct++;
    var stxt = '<div class="input-group" id="s' + window.sct + '-grp"><span class="input-group-label">Шаг ' + window.sct + '</span><input type="text" class="input-group-field" id="s' + window.sct + '-field"></div>';
    $('#steps-fs').append(stxt);
}

function removeStep(event) {
    if (window.sct > 1) {
        $('#s' + window.sct + '-grp').remove();
        window.sct--;
        if (typeof(event.data) !== 'undefined' && event.data.edit) {
            updateEditSyntax();
        } else {
            updateSyntax();
        }
    }
}

function updateEditSyntax() {
    var edit_id = $('#edit-id').val();
    var edit_type = $('#edit-section').val();
    var edit_val = '';
    var alias = '';
    if (edit_type == 'steps') {
        alias = 'str';
        for (var i = 1; i <= window.sct; i++) {
            var step = $('#s' + i + '-field').val();
            if (step) {
                edit_val = edit_val + ' - ' + step;
            }
        }
        if (edit_val) {
            edit_val = edit_val.substr(1);
        }
    } else {
        edit_val = $('#' + edit_type + '-field').val();
        alias = field_data[edit_type].al;
    }
    var edit_txt = '';
    if (edit_id && edit_val) {
        edit_txt = '!edit ' + edit_id + ' | ' + alias + ' | ' + edit_val;
    }
    $('#edit-syntax').text(edit_txt);
}

function updateField(event) {
    $('#edit-syntax').text('');
    window.sct = 1;
    $('#add-btn').off('click');
    $('#del-btn').off('click');
    switch(event.target.value) {
        case "steps":            
            var steps_html = '<label>Шаги для воспроизведения</label><p class="help-text" id="steps-help">Напишите каждый шаг, за которым должны следовать другие, чтобы воспроизвести ошибку. Примечание: дефисы будут добавлены автоматически для каждого шага. Чтобы добавить/удалить поля, вы можете использовать кнопки ниже</p><div class="callout mbox" id="steps-fs"><div class="button-group small"><button type="button" class="button" id="add-btn"><i class="fas fa-plus"></i> Добавить</button><button type="button" class="button" id="del-btn"><i class="fas fa-minus"></i> Удалить</button></div><div class="input-group" id="s1-grp"><span class="input-group-label">Шаг 1</span><input type="text" class="input-group-field" id="s1-field" required></div></div>';
            $('#edit-field').html(steps_html);
            $('#add-btn').on('click', addStep);
            $('#del-btn').on('click', {edit: true}, removeStep);
            break;
        default:
            if (event.target.value in field_data) {
                var field_html = '<label for="' + event.target.value + '-field">' + field_data[event.target.value].fn + '</label><p class="help-text" id="' + event.target.value + '-help">' + field_data[event.target.value].ht + '</p><input type="text" id="' + event.target.value + '-field" aria-describedby="' + event.target.value + '-help" required>';
                $('#edit-field').html(field_html);
            }
    }
}

function loadTheme() {
    var light = false;
    if (typeof(Storage) !== 'undefined') {
        light = (localStorage.getItem('light') == 'true');
    }
    return light;
}

function setTheme() {
    if (typeof(Storage) !== 'undefined') {
        var light = false;
        if ($('body').attr('class') == 'light') {
            light = true;
        }
        localStorage.setItem('light', light.toString());
    }
}

function switchMode() {
    var bc = $('body').toggleClass('light')[0].className;
    if (bc == '') {
        bc = 'dark';
    }
    $('#switch-mobile').html('<i class="far fa-' + mm[bc].m + '"></i>');
    $('#switch-desktop').html('<i class="far fa-' + mm[bc].m + '"></i> ' + mm[bc].d);
    setTheme();
}

function pageLoad(page) {
    window.sct = 1;
    var cb_btn = '';
    var st = '';
    switch (page) {
        case "create":
            $('div#content').on('input', 'input[id*="-field"]', updateSyntax);
            $('#add-btn').on('click', addStep);
            $('#del-btn').on('click', removeStep);
            cb_btn = '#copy-btn';
            st = '#syntax';
            break;
        case "edit":
            $('#edit-section').on('change', updateField);
            $('#edit-id').on('input', updateEditSyntax);
            $('div#content').on('input', 'input[id*="-field"]', updateEditSyntax);
            $('#edit-section').change();
            cb_btn = '#edit-copy-btn';
            st = '#edit-syntax';
            break;
    }
    var cb = new ClipboardJS(cb_btn, {
        text: function(trigger) {
            return $(st).text();
        }
    });
    cb.on('success', function(e) {
        $(e.trigger).html('Copied');
        ga('send', 'event', 'syntax', 'copy');
        setTimeout(function() {
            $(e.trigger).html('Copy');
        }, 2000);
    });
    $('body').on('click', 'a[id*="switch-"]', switchMode);
    if (loadTheme()) {
        switchMode();
    }
}
