import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';


function getErrorHighlight(line: number, start: number, end: number,
			message: string, severity: vscode.DiagnosticSeverity = vscode.DiagnosticSeverity.Error) {
	const range = new vscode.Range(new vscode.Position(line, start), new vscode.Position(line, end));
	const diagnostic = new vscode.Diagnostic(range, message, severity);

	return diagnostic;
}


function verifyFileEntryLine(document: vscode.TextDocument, line: number) {
	let errorHighlights: vscode.Diagnostic[] = []
	const localFolder = path.dirname(document.uri.fsPath);

	const lineText  = document.lineAt(line).text;
	if (lineText.length == 0) {
		return errorHighlights;
	}

	const pathParts = lineText.split("/");
	const file      = pathParts.pop();
	if (file === undefined || file === "") {
		return errorHighlights;
	}

	let pathToFile = localFolder;
	let column = 0;
	for (let folder of pathParts) {
		pathToFile = path.join(pathToFile, folder);

		if (fs.existsSync(pathToFile)) {
			const stats = fs.statSync(pathToFile);
			if (!stats.isDirectory()) {
                errorHighlights.push(getErrorHighlight(line, column, column + folder.length, "\"" +pathToFile+ "\" is not a folder"));
                return errorHighlights;
			}
		}
		else {
            errorHighlights.push(getErrorHighlight(line, column, column + folder.length, "Folder at \"" +pathToFile+ "\" does not exist"));
            return errorHighlights;
		}

		column += 1 + folder.length;
	}

	pathToFile = path.join(pathToFile, file);
	if (fs.existsSync(pathToFile)) {
		const stats = fs.statSync(pathToFile);
		if (!stats.isFile()) {
            errorHighlights.push(getErrorHighlight(line, column, column + file.length, "\"" +pathToFile+ "\" is not a file"));
		}
	}
	else {
        errorHighlights.push(getErrorHighlight(line, column, column + file.length, "File at \"" +pathToFile+ "\" does not exist"));
	}

	return errorHighlights;
}



let diagnosticCollection: vscode.DiagnosticCollection;

function updateDiagnostics(document: vscode.TextDocument) {
    let errorHighlights: vscode.Diagnostic[] = []
	for (let i = 0; i < document.lineCount; i++) {
		errorHighlights = errorHighlights.concat(verifyFileEntryLine(document, i));
	}

    diagnosticCollection.delete(document.uri);
    diagnosticCollection.set(document.uri, errorHighlights);
}


export function activate(context: vscode.ExtensionContext) {
    diagnosticCollection = vscode.languages.createDiagnosticCollection("HDLFileList");
    context.subscriptions.push(diagnosticCollection);

    vscode.workspace.onDidChangeTextDocument(event => {
		if (event.document.languageId == "HDLFileList") {
			updateDiagnostics(event.document);
		}
	})

    vscode.workspace.onDidOpenTextDocument(document => {
		if (document.languageId == "HDLFileList") {
			updateDiagnostics(document);
		}
	})

    vscode.workspace.onDidCloseTextDocument(document => {
        if (document.languageId == "HDLFileList") {
            diagnosticCollection.delete(document.uri);
        }
    })

    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document
        if (document.languageId == "HDLFileList") updateDiagnostics(document);
    }
}
