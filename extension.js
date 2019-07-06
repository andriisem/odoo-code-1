const fs = require('fs');
const vscode = require('vscode');

function activate(context) {

	console.log('Congratulations, your extension "odoo-code" is now active!');

	const changeWorkspace = vscode.commands.registerCommand('odoo-code.changeWorkspace', wsselector);

	context.subscriptions.push(changeWorkspace);
}
exports.activate = activate;

function deactivate() {}

module.exports = {
	activate,
	deactivate
}

/* custom functions */

function wsselector () {
	const wsselector_conf = vscode.workspace.getConfiguration('odoo-code');
	const workspace_folders = wsselector_conf.get('paths') || [];
	if (!workspace_folders) {
		vscode.window.showErrorMessage('You have to set paths to workspaces in settings!');
		return;
	}

	const items = [];
	workspace_folders.forEach(function (path) {
		fs.readdirSync(path)
			.filter(file => file.endsWith('.code-workspace'))
			.forEach(file => items.push({
				label: file.slice(0, -15),
				detail: path + '/' + file,
			}));
	});

	vscode.window.showQuickPick(items, {}).then(item => {
		if (item && item.detail) {
			const uri = vscode.Uri.file(item.detail);
			vscode.commands.executeCommand('vscode.openFolder', uri);
		}
	});
}
