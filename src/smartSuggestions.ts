import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';


export function activate(context: vscode.ExtensionContext) {
    const provider = vscode.languages.registerCompletionItemProvider(
        "HDLFileList",
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                const line = document.lineAt(position.line);
                const relevantText = line.text.slice(0, position.character);

                const localFolder = path.dirname(document.uri.fsPath);
                const folderPath = path.join(localFolder, relevantText.slice(0, relevantText.lastIndexOf("/")));

                const completionItems: vscode.CompletionItem[] = [];

                if (fs.existsSync(folderPath)) {
                    fs.readdirSync(folderPath).forEach((entry) => {
                        const fullPath = path.join(folderPath, entry);
                        const stat = fs.statSync(fullPath);

                        if (stat.isDirectory()) {
                            const item = new vscode.CompletionItem(entry + "/");
                            item.kind = vscode.CompletionItemKind.Folder;
                            completionItems.push(item);
                        }
                        else if (stat.isFile()) {
                            const item = new vscode.CompletionItem(entry);
                            item.kind = vscode.CompletionItemKind.File;
                            completionItems.push(item);
                        }
                    })
                }

                return completionItems;
            }
        },
        "/"
    );

    context.subscriptions.push(provider);
}