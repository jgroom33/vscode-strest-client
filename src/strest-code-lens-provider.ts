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
        console.log('registering code lens')
        // Define where the CodeLens will exist
        let topOfDocument = new Range(0, 0, 0, 0);

        // Define what command we want to trigger when activating the CodeLens
        let c: Command = {
            command: "strest.request",
            title: "Run all tests", 
        };
    
        let codeLensTop = new CodeLens(topOfDocument, c);

        let eachTest = this.getCodeLensLines(document);
   
        eachTest.push(codeLensTop);
    
        return eachTest;
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
                    title: `Run test`,
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
  