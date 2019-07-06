const fs = require('fs');
const vscode = require('vscode');

function activate(context) {
	console.log('Congratulations, your extension "odoo-code" is now active!');

	context.subscriptions.push(vscode.commands.registerCommand('odoo-code.changeWorkspace', wsselector));
	context.subscriptions.push(vscode.commands.registerCommand('odoo-code.openTerminal', openTerminal,));
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
	const workspace_folders = wsselector_conf.get('workspace-paths') || [];
	if (!workspace_folders) {
		vscode.window.showErrorMessage('You have to set paths to workspaces in settings!');
		return;
	}

	const items = [];
	workspace_folders.forEach(function (path) {
		if (!fs.existsSync(path)) return;
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

function openTerminal () {
	const wsselector_conf = vscode.workspace.getConfiguration('odoo-code');
	const cwd = wsselector_conf.get('base-path') || './';

	const options = {'name': 'Base', 'cwd': cwd};
	vscode.window.createTerminal(options).show();
}
