// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as errorHighlights from './errorHighlights';
import * as smartSuggestions from './smartSuggestions';


export function activate(context: vscode.ExtensionContext) {
	errorHighlights.activate(context);
	smartSuggestions.activate(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
