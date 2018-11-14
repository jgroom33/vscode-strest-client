// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { commands, workspace, window, ExtensionContext, ViewColumn, StatusBarAlignment, StatusBarItem, TextDocument } from 'vscode';
import Window = vscode.window;
import Document = vscode.TextDocument;
import TextEditor = vscode.TextEditor;
import Uri = vscode.Uri;
const cp = require('child_process')

const yamlParser = require('./yaml-parser');

var path = require('path');
var fs = require('fs');
const { parseYaml } = yamlParser;

export function activate(ctx: ExtensionContext) {
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
    let d = e.document;
    let sel = e.selections;

    let foundPath = getParsedFullKey();
    let strestKey = ""
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
        console.log(`YAML Object path ${foundPath} and key ${strestKey}`)
    }
    var strestFilename = e.document.fileName;
    var historyFilename = getFullPath(vscode.workspace.rootPath, "strest_history.json");
    const activeColumn = window.activeTextEditor.viewColumn;
    const previewColumn = activeColumn + 1

    if (!fs.existsSync(historyFilename)) {
        vscode.window.showInformationMessage(`Could not find ${historyFilename}!`);
    }

    let outpuChannel = vscode.window.createOutputChannel("stREST");
    outpuChannel.clear()
    outpuChannel.show(true)
    let commandExec = `cd ${vscode.workspace.rootPath} && node /Users/jgroom/Downloads/18.02.2/shared/strest/dist/main.js ${strestFilename} -k ${strestKey} -l -s`
    console.log(commandExec)
    cp.exec(commandExec, (err, stdout, stderr) => {
        outpuChannel.append(stdout)
        outpuChannel.append(stderr)
        if (err) {
            outpuChannel.append(`error: ${err}`)
        }
    })
    // .then(() => {
        workspace.openTextDocument(historyFilename).then((textDocument) => {
            if (!textDocument) {
                window.showErrorMessage(`Could not open ${historyFilename}!`);
            }
            window.showTextDocument(textDocument, { viewColumn: previewColumn, preserveFocus: false, preview: false }).then((editor) => {
                if (!editor) {
                    window.showErrorMessage(`Could not show ${historyFilename}!`);
                }
            });
        });
    // });
}
