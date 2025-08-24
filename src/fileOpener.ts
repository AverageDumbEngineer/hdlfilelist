import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';



export function activate(context: vscode.ExtensionContext) {
    const definitionProvider = vscode.languages.registerDefinitionProvider({language: 'HDLFileList'}, {
        provideDefinition(document: vscode.TextDocument, position: vscode.Position,
                    token: vscode.CancellationToken): vscode.ProviderResult<vscode.Definition | vscode.DefinitionLink[]> {

        const localFolder = path.dirname(document.uri.fsPath);
        const lineText  = document.lineAt(position.line).text.trim();

        if (lineText === "") {return null;}

        const filepath = path.join(localFolder, lineText);
        if (fs.existsSync(filepath)) {
            const stat = fs.statSync(filepath);
            if (stat.isFile()) {
                const uri = vscode.Uri.file(filepath);
                return new vscode.Location(uri, new vscode.Position(0,0));
            }
        }
        return null;
        }
    });
    context.subscriptions.push(definitionProvider);
}