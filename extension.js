const fs = require('fs');
const vscode = require('vscode');
const child_process = require('child_process');

function activate(context) {
	console.log('Congratulations, your extension "odoo-code" is now active!');
	context.subscriptions.push(vscode.commands.registerCommand('odoo-code.changeWorkspace', wsselector));
	context.subscriptions.push(vscode.commands.registerCommand('odoo-code.openTerminal', openTerminal));
	context.subscriptions.push(vscode.commands.registerCommand('odoo-code.breakIntoContainer', breakIntoContainer));
}
exports.activate = activate;

function deactivate() {}

module.exports = {
	activate,
	deactivate
}

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

function breakIntoContainer () {
	child_process.exec('docker ps --format "{{.ID}}:{{.Names}}"', (error, stdout, stderr) => {
		if (error) {
			vscode.window.showErrorMessage(`error while "docker ps": ${error}`);
			return;
		}

		if (!stdout) {
			vscode.window.showErrorMessage(`No active containers run!`);
			return;
		}

		const quickPickItems = [];
		const reducer = function (acum, item) {
			const pair = item.split(':');
			acum[pair[1]] = pair[0];
			quickPickItems.push({label: pair[1]});
			return acum;
		};
		let containers = stdout.split('\n').filter(Boolean).reduce(reducer, {});

		vscode.window.showQuickPick(quickPickItems, {}).then(item => {
			if (item) {
				const options = {
					'name': item,
					shellPath: 'docker',
					shellArgs: ['exec', '-itu', '0', `${containers[item.label]}`, '/bin/bash'],
				}
				vscode.window.createTerminal(options).show();
			}
		});
	});
}
