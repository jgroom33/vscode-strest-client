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

        const codeLenses = this.getCodeLensLines(document);
       
        return codeLenses;
    }

    getCodeLensLines(document: TextDocument): CodeLens[] {
        // Each test
        const x: CodeLens[] = [];
        const testLineRegEx = new RegExp("^\\s\\s(\\w*)+:.*$");

        // Skip the first 2 lines
        for (let line = 2; line < document.lineCount; line++)
        {
            const lineText = document.lineAt(line).text;
            const lineTestMatch = lineText.match(testLineRegEx);
            if (lineTestMatch !== null && lineTestMatch.index !== undefined)
            {

                const loc = new Range(line, 0, line, 0);

                const c: Command = {
                    command: "strest.request",
                    title: `▶ Run test`,
                    arguments: [ lineTestMatch[1] ]
                };

                const codeLensLine = new CodeLens(loc, c);
                x.push(codeLensLine);
            }
        }
        return x;
    }



}
export default StrestCodeLensProvider;
  