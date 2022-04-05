/* Editor Stuff
========================================================== */
const editor = ace.edit('html');
editor.$blockScrolling = Infinity;
editor.setOptions({
  selectionStyle: 'line',
  highlightActiveLine: true,
  highlightSelectedWord: true,
  behavioursEnabled: true,
  displayIndentGuides: true,
  fontSize: 12,
  theme: 'ace/theme/tomorrow_night',
  useWorker: false,
  useSoftTabs: true,
  indentedSoftWrap: false,
  tabSize: 2,
  wrap: true,
  mode: 'ace/mode/html',
});

const writtenEdit = ace.edit('writtenhtml');
writtenEdit.$blockScrolling = Infinity;
writtenEdit.setOptions({
  selectionStyle: 'line',
  highlightActiveLine: true,
  highlightSelectedWord: true,
  displayIndentGuides: true,
  fontSize: 12,
  theme: 'ace/theme/tomorrow_night',
  useWorker: false,
  indentedSoftWrap: false,
  tabSize: 2,
  wrap: true,
  mode: 'ace/mode/html',
});

writtenEdit.setReadOnly(true);

/* Resizing Renderer
========================================================== */
const resizers = document.querySelectorAll('.resizers');

for (let i = 0; i < resizers.length; i++) {
  resizers[i].addEventListener('click', () => {
    editor.resize();
    editor.renderer.updateFull();
    writtenEdit.resize();
    writtenEdit.renderer.updateFull();
  });
}

/* Resizer
========================================================== */
$('#codeEditor').resizable({
  handleSelector: '.resizer',
  resizeWidth: true,
  resizeHeight: false,
});

$('.main-editor').resizable({
  handleSelector: '.resizer-horizontal',
  resizeWidth: false,
  resizeHeight: true,
});

$('.written-html').resizable({
  handleSelector: '.resizer-horizontal-2',
  resizeWidth: false,
  resizeHeight: true,
});

/* Sidebar Junk
========================================================== */
const offCanvas = () =>
  document.getElementById('codeEditor').classList.toggle('active');

/* Theme Helper
========================================================== */
const setStyleSource = (linkID, sourceLoc) =>
  (document.querySelector(linkID).href = sourceLoc);

/* Editor Theme Toggle 
========================================================== */
let editorTheme = true;

const toggleTheme = () => {
  if (editorTheme) {
    editor.setTheme('ace/theme/tomorrow_night');
    writtenEdit.setTheme('ace/theme/tomorrow_night');
    $('#fa-editor-toggle').addClass('fa-sun').removeClass('fa-moon');
  } else {
    $('#fa-editor-toggle').addClass('fa-moon').removeClass('fa-sun');
    editor.setTheme('ace/theme/chrome');
    writtenEdit.setTheme('ace/theme/chrome');
  }
};

// Save Editor theme
(() => {
  let savedEditor = localStorage.getItem('userEditor');
  editorTheme = savedEditor === 'true' ? savedEditor === 'true' : editorTheme;
  toggleTheme();
})();

const editorThemeToggle = () => {
  editorTheme = !editorTheme;
  toggleTheme();
  localStorage.setItem('userEditor', editorTheme);
};

/* Change CSS Theme
========================================================== */
// New Theme User
(() => {
  let savedTheme = localStorage.getItem('themeUser');
  if (document.querySelector(`[value='${savedTheme}']`)) {
    document
      .querySelector(`[value='${savedTheme}']`)
      .setAttribute('selected', 'true');
    setStyleSource(
      '#thThemes',
      '../styles/toyhouse_themes/' + savedTheme + '.css'
    );
  }
})();

document.getElementById('thCSSThemes').addEventListener('change', () => {
  let selected =
    '../styles/toyhouse_themes/' +
    this.options[this.selectedIndex].value +
    '.css';
  let vanillaSelected = this.options[this.selectedIndex].value;
  setStyleSource('#thThemes', selected);
  localStorage.setItem('themeUser', vanillaSelected);
});

/* User Warning
========================================================== */
window.onbeforeunload = (_) => '';

/* Tooltip
========================================================== */
$(() => {
  $('[data-toggle="tooltip"]').tooltip();
});

/* Template Creator
========================================================== */
// Loads user's previous html into the editor
window.onload = () => {
  const savedTemplateHTML = localStorage.getItem('htmluser') || '';
  editor.session.setValue(savedTemplateHTML);

  let renderedCode = localStorage.getItem('htmlRendered');
  code.innerHTML = renderedCode;
  writtenEdit.setValue(renderedCode);
};

// Grabs user input from the forms
const inputGetter = () => {
  let userInput = document.querySelectorAll('.user-input');
  let inputArray = [];
  for (let i = 0; i < userInput.length; i++) {
    inputArray[i] = {
      id: userInput[i].id,
      value: userInput[i].value,
    };
  }
  return inputArray;
};

// Grabs the template and makes it look nice and neat
const templateGetter = () => {
  try {
    // Grabbing all dah HTML
    let itemListRaw = editor
      .getValue()
      .match(
        /{{(bootstrap|text|textarea|color|number|dropdown|list|section|subsection)(.+?)}}/gim
      ); //.filter((x, i, a) => a.indexOf(x) == i)
    let cleanList = [];
    let bigArray = [];

    // removes all duplicates from list
    let itemListSet = new Set(itemListRaw);
    let itemList = Array.from(itemListSet);

    for (let i = 0; i < itemList.length; i++) {
      // So we don't have to keep scrubbing the {{}}
      cleanList.push(itemList[i].replace('{{', '').replace('}}', ''));

      // Removes undefined from value
      let itemValues =
        cleanList[i].split(/::(.+)/)[1].split('||')[1] == undefined &&
        cleanList[i].split(/::(.+)/)[0] != 'color'
          ? '[info]'
          : cleanList[i].split(/::(.+)/)[1].split('||')[1];

      // Makes a pretty array of info
      bigArray[i] = {
        itemList: cleanList[i],
        itemInput: cleanList[i].split(/::(.+)/)[0],
        itemTitle: cleanList[i].split(/::(.+)/)[1].split('||')[0],
        itemID: cleanList[i]
          .replace(/\s/g, '-')
          .split(/::(.+)/)[1]
          .split('||')[0],
        itemValue: itemValues,
      };
    }

    let flags = {};
    let bigArrayClean = bigArray.filter((entry) => {
      if (flags[entry.itemID]) {
        return false;
      }
      flags[entry.itemID] = true;
      return true;
    });

    return bigArrayClean;
  } catch (err) {
    document.getElementById(
      'code'
    ).innerHTML = `<div class="alert alert-warning">Error: Looks like you're missing a :: somewhere - check over your template code just in case!</div>`;
  }
};

const insertInput = () => {
  //get the original template
  let inputChange = editor.getValue();
  let inputChangeTest = editor.getValue();
  let bigArray = templateGetter();
  let inputArray = inputGetter();

  //loop through big array to store user input then change html using template accordingly
  for (let i = 0; i < bigArray.length; i++) {
    for (let j = 0; j < inputArray.length; j++) {
      if (inputArray[j].id == bigArray[i].itemID) {
        if (bigArray[i].itemInput == 'textarea') {
          bigArray[i].userInput = inputArray[j].value.includes('\n\n')
            ? '<p>' +
              inputArray[j].value.replaceAll('\n\n', `</p>\n<p>`) +
              '</p>'
            : '<p>' +
              inputArray[j].value.replaceAll('\n', `</p>\n<p>`) +
              '</p>';
        } else if (bigArray[i].itemInput == 'list') {
          bigArray[i].userInput = inputArray[j].value.includes('\n\n')
            ? '<li>' +
              inputArray[j].value.replaceAll('\n\n', `</li>\n<li>`) +
              '</li>'
            : '<li>' +
              inputArray[j].value.replaceAll('\n', `</li>\n<li>`) +
              '</li>';
        } else {
          bigArray[i].userInput = inputArray[j].value;
        }

        let inputValue = '';
        if (
          bigArray[i].itemInput == 'textarea' ||
          bigArray[i].itemInput == 'list'
        ) {
          inputValue = inputArray[j].value.includes('\n\n')
            ? inputArray[j].value.replaceAll('\n\n', '&&')
            : inputArray[j].value.replaceAll('\n', '&&');
        } else if (bigArray[i].itemInput == 'dropdown') {
          inputValue =
            inputArray[j].value +
            ',' +
            bigArray[i].itemValue.replace(`${inputArray[j].value},`, '');
        } else {
          inputValue = inputArray[j].value;
        }

        inputChangeTest = inputChangeTest.replaceAll(
          `{{${bigArray[i].itemList.replaceAll('-', ' ')}}}`,
          `{{${bigArray[i].itemInput}::${bigArray[i].itemTitle}||${inputValue}}}`
        );

        // let regex = new RegExp(`{{${bigArray[i].itemInput}:${bigArray[i].itemID.replaceAll('-',' ')}`+'.*}}', "gmi");
        // let inputChange = inputChange.replaceAll(regex, `${bigArray[i].userInput}`).replace(/{{section(?:.+)}}/gm, "").replace(/{{subsection(?:.+)}}/gm, "");

        inputChange = inputChange
          .replaceAll(`{{${bigArray[i].itemList}}}`, `${bigArray[i].userInput}`)
          .replace(/{{section(?::.+)}}/gm, '')
          .replace(/{{subsection(?::.+)}}/gm, '')
          .replaceAll(
            `{{${bigArray[i].itemInput}::${bigArray[i].itemTitle}}}`,
            `${bigArray[i].userInput}`
          );

        code.innerHTML = inputChange;
        localStorage.setItem('htmluser', editor.getValue());
        localStorage.setItem('htmlRendered', inputChange);
        writtenEdit.setValue(inputChange);
        editor.setValue(inputChangeTest);
      }
    }
  }
};

let bigArray = [];

const formBuilder = () => {
  bigArray = templateGetter();
  document.getElementById('options').innerHTML = '';

  // Creates the forms
  for (let i = 0; i < bigArray.length; i++) {
    let inputText = `
    <div class="row no-gutters mx-n1">
      <div class="col-5 my-auto p-1">
        <label class="m-0" for="${bigArray[i].itemID}">${bigArray[i].itemTitle}</label>
      </div>
      <div class="col-7 my-auto p-1">
        <input class="form-control user-input" type="text" value="${bigArray[i].itemValue}" input-type="${bigArray[i].itemInput}" name="${bigArray[i].itemID}" id="${bigArray[i].itemID}"></input>
      </div>
    </div>
    `;

    let inputTextArea = `
      <div class="mb-3">
        <label class="mb-2" for="${bigArray[i].itemID}">${
      bigArray[i].itemTitle
    }<br><small class="text-muted">Press enter to create a new paragraph.</small></label>
        <textarea rows="6" class="form-control user-input" type="color" input-type="${
          bigArray[i].itemInput
        }" name="${bigArray[i].itemID}" id="${bigArray[i].itemID}">${bigArray[
      i
    ].itemValue.replaceAll('&&', '\n')}</textarea>
      </div>
    `;

    let inputColor = `
    <div class="row no-gutters mx-n1">
      <div class="col-5 my-auto p-1">
        <label class="m-0" for="${bigArray[i].itemID}">${bigArray[i].itemTitle}</label>
      </div>
      <div class="col-7 my-auto p-1">
        <input class="form-control user-input" value="${bigArray[i].itemValue}" type="color" input-type="${bigArray[i].itemInput}" name="${bigArray[i].itemID}" id="${bigArray[i].itemID}"></input>
      </div>
    </div>
    `;

    let inputNumber = `
    <div class="row no-gutters mx-n1">
      <div class="col-5 my-auto p-1">
        <label class="m-0" for="${bigArray[i].itemID}">${bigArray[i].itemTitle}</label>
      </div>
      <div class="col-7 my-auto p-1">
        <input class="form-control user-input" value="${bigArray[i].itemValue}" type="number" input-type="${bigArray[i].itemInput}" name="${bigArray[i].itemID}" id="${bigArray[i].itemID}"></input>
      </div>
    </div>
    `;

    let inputDropdown =
      `
    <div class="row no-gutters mx-n1">
      <div class="col-5 my-auto p-1">
        <label class="m-0" for="${bigArray[i].itemID}">${bigArray[i].itemTitle}</label>
      </div>
      <div class="col-7 my-auto p-1">
        <select class="form-control user-input" input-type="${bigArray[i].itemInput}" name="${bigArray[i].itemID}" id="${bigArray[i].itemID}">
          <option>` +
      bigArray[i].itemValue.replaceAll(
        ',',
        `</option>
          <option>`
      ) +
      `</option>
        </select> 
      </div>
    </div>
    `;

    let inputList = `
    <div class="mb-3">
      <label class="mb-1" for="${bigArray[i].itemID}">${
      bigArray[i].itemTitle
    }<br><small class="text-muted">Press enter to create a new line.</label>
      <textarea rows="4" class="form-control user-input" type="color" input-type="${
        bigArray[i].itemInput
      }" name="${bigArray[i].itemID}" id="${bigArray[i].itemID}">${bigArray[
      i
    ].itemValue.replaceAll('&&', '\n')}</textarea>
    </div>
    `;

    let sectionTitle = `
      <hr class="mx-n4 my-4">
      <h1 class="text-primary text-center text-capitalize display-4 mb-4">${bigArray[i].itemTitle}</h1>
    `;

    let subsectionTitle = `
      <hr>
        <h1 class="text-capitalize text-muted display-4 mb-0" style="font-size:1.25rem;">${bigArray[i].itemTitle}</h1>
      <hr>
    `;

    if (bigArray[i].itemInput == 'text') {
      document.getElementById('options').innerHTML += inputText;
    }
    if (bigArray[i].itemInput == 'textarea') {
      document.getElementById('options').innerHTML += inputTextArea;
    }
    if (bigArray[i].itemInput == 'color') {
      document.getElementById('options').innerHTML += inputColor;
    }
    if (bigArray[i].itemInput == 'number') {
      document.getElementById('options').innerHTML += inputNumber;
    }
    if (bigArray[i].itemInput == 'dropdown') {
      document.getElementById('options').innerHTML += inputDropdown;
    }
    if (bigArray[i].itemInput == 'list') {
      document.getElementById('options').innerHTML += inputList;
    }
    if (bigArray[i].itemInput == 'bootstrap') {
      let inputBootstrap = `
      <div class="row no-gutters mx-n1">
        <div class="col-5 my-auto p-1">
          <label class="m-0" for="${bigArray[i].itemID}">${
        bigArray[i].itemTitle
      }</label>
        </div>
        <div class="col-7 my-auto p-1">
          <select class="form-control user-input" input-type="${
            bigArray[i].itemInput
          }" name="${bigArray[i].itemID}" id="${bigArray[i].itemID}">
            <option value="primary" ${
              bigArray[i].itemValue == 'primary' ? 'selected' : ''
            }>Primary</option>
            <option value="success" ${
              bigArray[i].itemValue == 'success' ? 'selected' : ''
            }}>Success</option>
            <option value="warning" ${
              bigArray[i].itemValue == 'warning' ? 'selected' : ''
            }}>Warning</option>
            <option value="info" ${
              bigArray[i].itemValue == 'info' ? 'selected' : ''
            }}>Info</option>
            <option value="danger" ${
              bigArray[i].itemValue == 'danger' ? 'selected' : ''
            }}>Danger</option>
          </select> 
        </div>
      </div>
      `;
      document.getElementById('options').innerHTML += inputBootstrap;
    }
    if (bigArray[i].itemInput == 'section') {
      document.getElementById('options').innerHTML += sectionTitle;
    }
    if (bigArray[i].itemInput == 'subsection') {
      document.getElementById('options').innerHTML += subsectionTitle;
    }
  }

  insertInput();
};

document.getElementById('render-form').addEventListener('click', () => {
  formBuilder();
});

document.querySelector('#options').addEventListener('change', () => {
  insertInput();
});

/* Save Template
========================================================== */
const saveCodeAs = () => {
  const templateName =
    editor.getValue().match(/{{template(.+?)}}/gm) != null
      ? editor
          .getValue()
          .match(/{{template(.+?)}}/gm)[0]
          .split(/::(.+)/)[1]
          .replace('}}', '')
          .toLowerCase()
          .replace(/\s/g, '-') + '.zip'
      : 'playhouse-template.zip';
  let zip = new JSZip();
  let templateCode = localStorage.getItem('htmluser');
  let renderedCode = localStorage.getItem('htmlRendered');
  zip
    .file('Template HTML.txt', templateCode)
    .file('Rendered HTML.txt', renderedCode);
  zip
    .generateAsync({
      type: 'blob',
    })
    .then((zip) => {
      saveAs(zip, templateName);
    });
};

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && 's' === e.key) {
    e.preventDefault();
    saveCodeAs();
    return false;
  }
  return true;
});
