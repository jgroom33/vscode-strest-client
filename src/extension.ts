import * as vscode from 'vscode';
import { workspace, window} from 'vscode';
import Window = vscode.window;
const cp = require('child_process')

const yamlParser = require('./yaml-parser');

var path = require('path');
var fs = require('fs');
const { parseYaml } = yamlParser;

export function activate(context: vscode.ExtensionContext) {
    console.log('stREST is now active!');
    vscode.commands.registerCommand('strest.request', request);
}

function getParsedFullKey() {
    const editor = window.activeTextEditor;
    if (!editor) {
        return;
    }
    const doc = editor.document;
    if (!doc) return;
    if (doc.languageId === 'strest') {
        const parsed = parseYaml(editor);
        if (!parsed) {
            return;
        }
        return Object.keys(parsed).reduce((result, key) => {
            result += !result ? parsed[key] : '.' + parsed[key];
            return result;
        }, '');
    }
    return null
}

var getFullPath = (root, filePath) => {
    if (filePath.indexOf('/') === 0) {
        return filePath;
    }
    if (filePath.indexOf('~') === 0) {
        var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
        return path.join(home, filePath.substr(1));
    }
    return path.resolve(root, filePath);
}

function request() {

    let e = Window.activeTextEditor;
    let foundPath = getParsedFullKey();
    let strestKey = ""
    let outpuChannel = vscode.window.createOutputChannel("stREST");
    outpuChannel.clear()
    outpuChannel.show(true)

    if (!foundPath) {
        window.showErrorMessage(`Could not calculate YAML path`);
        return;
    } else {
        var splitted = foundPath.split(".");
        if (splitted[0] != 'requests') {
            window.showErrorMessage(`File is not a strest yaml.  Expecting requests instead found: ${splitted[0]}`);
            return;
        }
        strestKey = splitted[1]
        outpuChannel.append(`Successfully parsed YAM. Found YAML Object path ${foundPath} and key ${strestKey}\n`)
    }
    var strestFilename = e.document.fileName;
    var historyFilename = getFullPath(vscode.workspace.rootPath, "strest_history.json");
    const activeColumn = window.activeTextEditor.viewColumn;
    const previewColumn = activeColumn + 1

    if (!fs.existsSync(historyFilename)) {
        vscode.window.showInformationMessage(`Could not find ${historyFilename}!`);
    }

    let commandExec = `cd ${vscode.workspace.rootPath} && strest ${strestFilename} -k ${strestKey} -l -s`
    outpuChannel.append(`Executing command ${commandExec}\n`)
    cp.exec(commandExec, (err, stdout, stderr) => {
        outpuChannel.append(stdout)
        outpuChannel.append(stderr)
        if (err) {
            outpuChannel.append(`error: ${err}`)
        }
    })
    workspace.openTextDocument(historyFilename).then((textDocument) => {
        if (!textDocument) {
            window.showErrorMessage(`Could not open ${historyFilename}!`);
        }
        window.showTextDocument(textDocument, { viewColumn: previewColumn, preserveFocus: false, preview: false }).then((editor) => {
            if (!editor) {
                window.showErrorMessage(`Could not show ${historyFilename}!`);
            }
        });
    }).then(() => {
        window.showTextDocument(e.document.uri, { viewColumn: activeColumn, preserveFocus: false, preview: false }).then((editor) => {
            if (!editor) {
                window.showErrorMessage(`Could not show ${historyFilename}!`);
            }
        });
    })
}
