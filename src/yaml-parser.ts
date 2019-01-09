const { Range } = require('vscode');
const yaml = require('js-yaml');

function parseYaml(editor) {
  const { document, selection } = editor;
  const selectedLine = document.lineAt(selection.active);

  const range = new Range(0, 0, selection.end.line, selectedLine.text.length);
  const replaced  = document.getText(range).replace(/(\rn|\n|\r)/g, '\n')
  const lines = replaced.split('\n');

  const yamldoc = yaml.safeLoad(document.getText());
  const keys = []
  for (let key in yamldoc.requests) {
    keys.push(key)
  }
  let result = null
  for (let el of lines.reverse()) {
    let key_search = el.replace(/\s+/,'').replace(":","")
    if (keys.includes(key_search)) {
      result = key_search
      break
    }
  }
  return result
}

module.exports = {
  parseYaml
};