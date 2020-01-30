import {
    CodeLensProvider,
    TextDocument,
    CodeLens,
    Range,
    Command
  } from "vscode";

class StrestCodeLensProvider implements CodeLensProvider {
    // Each provider requires a provideCodeLenses function which will give the various documents
    // the code lenses
    async provideCodeLenses(document: TextDocument): Promise<CodeLens[]> {
        console.log('strest: registering code lens');

        let codeLenses = this.getCodeLensLines(document);
       
        return codeLenses;
    }

    getCodeLensLines(document: TextDocument): CodeLens[] {
        // Each test
        let x: CodeLens[] = [];
        let testLineRegEx = new RegExp("^\\s\\s(\\w*)+:.*$");

        // Skip the first 2 lines
        for (let line = 2; line < document.lineCount; line++)
        {
            let lineText = document.lineAt(line).text;
            let lineTestMatch = lineText.match(testLineRegEx);
            if (lineTestMatch !== null && lineTestMatch.index !== undefined)
            {

                let loc = new Range(line, 0, line, 0);

                let c: Command = {
                    command: "strest.request",
                    title: `▶ Run test`,
                    arguments: [ lineTestMatch[1] ]
                };

                let codeLensLine = new CodeLens(loc, c);
                x.push(codeLensLine);
            }
        }
        return x;
    }



}
export default StrestCodeLensProvider;
  