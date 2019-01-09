import * as vscode from 'vscode';
import { workspace, window } from 'vscode';
import Window = vscode.window;
import * as fs from 'fs-extra';
const curlconverter = require("curlconverter")
const clipboardy = require('clipboardy');
const cp = require('child_process')

const yamlParser = require('./yaml-parser');

var path = require('path');
var fs = require('fs');
const { parseYaml } = yamlParser;

export function activate(context: vscode.ExtensionContext) {
    console.log('stREST is now active!');
    vscode.commands.registerCommand('strest.request', request);
    vscode.commands.registerCommand('strest.curlToStrest', curlToStrest);
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
        return parsed
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
    let foundKey = getParsedFullKey();
    let outpuChannel = vscode.window.createOutputChannel("stREST");
    outpuChannel.clear()
    outpuChannel.show(true)

    if (!foundKey) {
        window.showErrorMessage(`Could not calculate YAML path`);
        return;
    } else {
        outpuChannel.append(`Successfully parsed YAML. Found YAML Object key ${foundKey}\n`)
    }
    var strestFilename = e.document.fileName;

    let root = vscode.workspace.rootPath.toString()
    // TODO: check for vscode.workspace.rootPath undefined.  it means there is no folder open... only a file
    var historyFilename = getFullPath(root, "strest_history.json");
    const activeColumn = window.activeTextEditor.viewColumn;
    const previewColumn = activeColumn + 1

    if (!fs.existsSync(historyFilename)) {
        outpuChannel.append(`Could not find ${historyFilename}! It was created.`);
        fs.writeFileSync(historyFilename, "{}")
    } else {
        outpuChannel.append(`Found ${historyFilename}!\n`);
    }
    // This is hideous
    root = root.replace(/(c:)/g,'')
    root = root.replace(/(\\)/g,'/')
    strestFilename = strestFilename.replace(/(c:)/g,'')
    strestFilename = strestFilename.replace(/(\\)/g,'/')
    let commandExec = `strest ${strestFilename} -k ${foundKey} -l ${root}/strest_history.json -s ${root}/strest_history.json`
    outpuChannel.append(`Executing command ${commandExec}\n`)
    cp.exec(commandExec,{
        maxBuffer: 2000 * 1024
        }, (err, stdout, stderr) => {
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

function curlToStrest() {
    let clipboard: string = getClipboard();

    if(clipboard.startsWith('curl')){
        let converted = curlconverter.toStrest(clipboard)
        //replace the clipboard contents with the modified version...
        clipboardy.write(converted).then(() => {
            vscode.commands.executeCommand('editor.action.clipboardPasteAction')
        });
    } else {
        window.showErrorMessage(`Clipboard does not contain string starting with curl`);
    }
}

export function getClipboard()
{
	return clipboardy.readSync();
}
