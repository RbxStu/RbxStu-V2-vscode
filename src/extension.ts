import * as vscode from 'vscode';
import * as ws from 'ws';
import * as globals from './packets.js';
import * as packetDefinitions from './packet_definitions.js';

export function activate(context: vscode.ExtensionContext) {
	let rbxstuSocket: ws.WebSocket | undefined;
	let connectedToRbxStu = false;
	let webSocketServer = new ws.WebSocketServer({
		port: 8523,
		host: "0.0.0.0"
	});
	webSocketServer.setMaxListeners(1);

	let isConnectedToRbxStu = () => {
		return rbxstuSocket !== undefined && rbxstuSocket.readyState === rbxstuSocket.OPEN;
	};

	const disposable = vscode.commands.registerCommand('rbxstu-v2.change_datamodel', () => {
		if (!connectedToRbxStu) {
			vscode.window.showErrorMessage("RbxStu-V2 is not connected!");
			return;
		}

		let response = vscode.window.showQuickPick([
			"Edit", "Client", "Server", "Standalone"
		], { canPickMany: false });
		response.then((input: string | undefined) => {
			if (typeof input === "string") {
				switch (input) {
					case "Edit":
						break;
					case "Client":
						break;
					case "Server":
						break;
					case "Standalone":
						break;

					default:
						return;
				}


				vscode.window.showInformationMessage(`Execution DataModel changed to ${input as string}`);

				rbxstuSocket?.send(JSON.stringify(globals.Packets.CreateExecutionDataModelPacket(input)));
			} else {
				vscode.window.showErrorMessage("An error occured. Execution DataModel not changed!");
			}
		});
	});

	context.subscriptions.push(disposable);

	const connect = vscode.commands.registerCommand('rbxstu-v2.connect', () => {
		if (isConnectedToRbxStu()) {
			vscode.window.showErrorMessage("The extension is already connected to RbxStu V2!");
			return;
		}

		if (webSocketServer.listeners("connection").length === 0) {
			webSocketServer.on('connection', (socket: ws.WebSocket) => {
				socket.on("message", (data: ws.RawData, isBinary: boolean) => {
					if (isBinary) {
						console.warn("RbxStu has sent a Binary packet into the websocket server. This is wrong!");
						return;
					}

					let packet = JSON.parse(data.toString());

					let packetId: number = packet.packet_id;

					switch (packetId) {
						case packetDefinitions.PacketIdentifier.HelloPacket:
							console.warn("Obtained RbxStu-V2's configuration!: ", JSON.stringify(packet));
							connectedToRbxStu = true;
							rbxstuSocket = socket;
							vscode.window.showInformationMessage("Connected to RbxStu V2!");
							break;
						case packetDefinitions.PacketIdentifier.ScheduleLuauResponsePacket:
							let scheduled: packetDefinitions.ScheduleLuauResponsePacket = packet;

							if (scheduled.result === "" || scheduled.result === "no error") {
								vscode.window.showInformationMessage("Execution Succeeded ");
							} else {
								vscode.window.showWarningMessage(`Execution Failed: ${scheduled.result}`);
							}

							break;
					}
				});
			});
		}
	});

	context.subscriptions.push(connect);

	const disconnect = vscode.commands.registerCommand('rbxstu-v2.disconnect', () => {
		if (!isConnectedToRbxStu()) {
			vscode.window.showErrorMessage("The extension is not connected to RbxStu V2.");
			return;
		}

		vscode.window.showInformationMessage("Disconnecting from RbxStu V2...");
		rbxstuSocket?.close();
		rbxstuSocket = undefined;
	});

	context.subscriptions.push(disconnect);

	const execute = vscode.commands.registerCommand('rbxstu-v2.execute', () => {
		if (!isConnectedToRbxStu()) {
			vscode.window.showErrorMessage("The extension is not connected to RbxStu V2!");
			return;
		}

		if (typeof vscode.window.activeTextEditor === "undefined") {
			vscode.window.showErrorMessage("You have no document file open.");
			return;
		}

		let code = vscode.window.activeTextEditor.document.getText();
		let guid = vscode.window.activeTextEditor.document.fileName;

		rbxstuSocket?.send(JSON.stringify(globals.Packets.CreateExecutePacket(code, guid)));
	});

	context.subscriptions.push(execute);

	const block = vscode.commands.registerCommand('rbxstu-v2.block_function', () => {
		if (!isConnectedToRbxStu()) {
			vscode.window.showErrorMessage("The extension is not connected to RbxStu V2!");
			return;
		}

		const functionName = vscode.window.showInputBox({
			title: "Please write the function to block"
		});


		functionName.then((str: string | undefined) => {
			if (typeof functionName === "undefined") {
				vscode.window.showErrorMessage("You did not specify a function to block!");
				return;
			}

			rbxstuSocket?.send(JSON.stringify(globals.Packets.CreateBlockFunctionPacket(str as string, true)));
		});
	});

	context.subscriptions.push(block);

	const unblock = vscode.commands.registerCommand('rbxstu-v2.unblock_function', () => {
		if (!isConnectedToRbxStu()) {
			vscode.window.showErrorMessage("The extension is not connected to RbxStu V2!");
			return;
		}

		const functionName = vscode.window.showInputBox({
			title: "Please write the function to unblock"
		});


		functionName.then((str: string | undefined) => {
			if (typeof str === "undefined") {
				vscode.window.showErrorMessage("You did not specify a function to block!");
				return;
			}

			rbxstuSocket?.send(JSON.stringify(globals.Packets.CreateBlockFunctionPacket(str as string, false)));
		});
	});

	context.subscriptions.push(unblock);


	const safeMode = vscode.commands.registerCommand('rbxstu-v2.setsafemode', () => {
		if (!isConnectedToRbxStu()) {
			vscode.window.showErrorMessage("The extension is not connected to RbxStu V2!");
			return;
		}

		const functionName = vscode.window.showQuickPick([
			"Enable SafeMode",
			"Disable SafeMode"

		]);

		functionName.then((str: string | undefined) => {
			if (typeof str === "undefined") {
				vscode.window.showErrorMessage("No option specified.");
				return;
			}

			switch (str) {
				case "Enable SafeMode":
					rbxstuSocket?.send(JSON.stringify(globals.Packets.CreateSetSafeModePacket(true)));
					break;
				case "Disable SafeMode":
					rbxstuSocket?.send(JSON.stringify(globals.Packets.CreateSetSafeModePacket(false)));
					break;
			}
		});
	});

	context.subscriptions.push(safeMode);

	const nativeCodeGen = vscode.commands.registerCommand("rbxstu-vs.setnativecodegen", () => {
		if (!isConnectedToRbxStu()) {
			vscode.window.showErrorMessage("The extension is not connected to RbxStu V2!");
			return;
		}

		const functionName = vscode.window.showQuickPick([
			"Enable Native Code Generation",
			"Disable Native Code Generation"

		]);

		functionName.then((str: string | undefined) => {
			if (typeof str === "undefined") {
				vscode.window.showErrorMessage("No option specified.");
				return;
			}

			switch (str) {
				case "Enable Native Code Generation":
					rbxstuSocket?.send(JSON.stringify(globals.Packets.CreateSetNativeCodeGenPacket(true)));
					break;
				case "Disable Native Code Generation":
					rbxstuSocket?.send(JSON.stringify(globals.Packets.CreateSetNativeCodeGenPacket(false)));
					break;
			}
		});
	});

	context.subscriptions.push(nativeCodeGen);

	const sethwid = vscode.commands.registerCommand("rbxstu-vs.sethttp", () => {
		if (!isConnectedToRbxStu()) {
			vscode.window.showErrorMessage("The extension is not connected to RbxStu V2!");
			return;
		}

		const hardwareId = vscode.window.showInputBox({
			title: "Input New Hardware ID",
			value: "Leaving this blank will use your Hardware ID"
		});

		hardwareId.then((newHardwareId: string | undefined) => {
			const newHeader = vscode.window.showInputBox({
				title: "Input New Fingerprint",
				value: "Used in whitelists. Create using format `EXECUTOR_NAME-Fingerprint`. Example: `RbxStu-Fingerprint`"
			});

			newHeader.then((newHeader: string | undefined) => {
				rbxstuSocket?.send(JSON.stringify(globals.Packets.CreateHttpConfigurationPacket(newHardwareId, newHeader)));
			});
		});
	});

	context.subscriptions.push(sethwid);

}

// This method is called when your extension is deactivated
export function deactivate() { }
