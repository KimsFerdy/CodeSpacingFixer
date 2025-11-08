"use strict";

const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const showSelectMsg = () => vscode.window.showInformationMessage('Select one or more lines first.');

    // --- 1. Apply Spacing (overwrites indentation completely)
    const applySpacing = vscode.commands.registerCommand('codespacingfixer.applySpacing', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.selection.isEmpty) return showSelectMsg();

        const tabCountInput = await vscode.window.showInputBox({
            prompt: 'Enter number of tabs per line:',
            value: '2',
            validateInput: v => isNaN(parseInt(v)) || parseInt(v) < 0 ? 'Enter a valid number ≥ 0' : null
        });
        if (tabCountInput === undefined) return;

        const tabNum = Math.max(0, parseInt(tabCountInput));
        const edit = new vscode.WorkspaceEdit();
        const doc = editor.document;
        const { start, end } = editor.selection;

        for (let i = start.line; i <= end.line; i++) {
            const line = doc.lineAt(i);
            const firstNonWhite = line.text.search(/\S/);
            const tabs = '\t'.repeat(tabNum);
            if (firstNonWhite !== -1)
                edit.replace(doc.uri, new vscode.Range(i, 0, i, firstNonWhite), tabs);
            else
                edit.insert(doc.uri, new vscode.Position(i, 0), tabs);
        }

        await vscode.workspace.applyEdit(edit);
    });

    // --- 2. Add Spacing (adds tab characters)
    const addSpacingTabs = vscode.commands.registerCommand('codespacingfixer.addSpacing', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.selection.isEmpty) return showSelectMsg();

        const tabCountInput = await vscode.window.showInputBox({
            prompt: 'Enter number of additional tabs to add:',
            value: '1',
            validateInput: v => isNaN(parseInt(v)) || parseInt(v) < 0 ? 'Enter a valid number ≥ 0' : null
        });
        if (tabCountInput === undefined) return;
        const additionalTabs = Math.max(0, parseInt(tabCountInput));
        if (additionalTabs === 0) return;

        const edit = new vscode.WorkspaceEdit();
        const doc = editor.document;
        const { start, end } = editor.selection;

        for (let i = start.line; i <= end.line; i++) {
            const line = doc.lineAt(i);
            const firstNonWhite = line.text.search(/\S/);
            const newTabs = '\t'.repeat(additionalTabs);

            if (firstNonWhite !== -1)
                edit.insert(doc.uri, new vscode.Position(i, 0), newTabs);
            else
                edit.insert(doc.uri, new vscode.Position(i, 0), newTabs);
        }

        await vscode.workspace.applyEdit(edit);
    });

    // --- 3. Add Spacing (Py) — adds 4 spaces per indent level
    const addSpacingPy = vscode.commands.registerCommand('codespacingfixer.addSpacingPy', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.selection.isEmpty) return showSelectMsg();

        const spaceCountInput = await vscode.window.showInputBox({
            prompt: 'Enter number of indent levels to add (each = 4 spaces):',
            value: '1',
            validateInput: v => isNaN(parseInt(v)) || parseInt(v) < 0 ? 'Enter a valid number ≥ 0' : null
        });
        if (spaceCountInput === undefined) return;
        const indentLevels = Math.max(0, parseInt(spaceCountInput));
        if (indentLevels === 0) return;

        const spaces = ' '.repeat(indentLevels * 4);
        const edit = new vscode.WorkspaceEdit();
        const doc = editor.document;
        const { start, end } = editor.selection;

        for (let i = start.line; i <= end.line; i++) {
            edit.insert(doc.uri, new vscode.Position(i, 0), spaces);
        }

        await vscode.workspace.applyEdit(edit);
    });

    context.subscriptions.push(applySpacing, addSpacingTabs, addSpacingPy);
}

function deactivate() {}

module.exports = { activate, deactivate };
