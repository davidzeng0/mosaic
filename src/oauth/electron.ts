import { GenericError } from 'js-common';
import { spawn } from 'child_process';

const electron = require('electron') as any as string;

export interface IPCMessage{
	event: string;
	data: any;
}

export function launch(path: string, options?: any){
	let child = spawn(electron, [path], {
		stdio: ['ipc', process.stdin, process.stdout]
	});

	let output: any[] = [];
	let terminated = false;

	let message = (message: any) => {
		switch(message.event){
			case 'ready':
				if(options){
					child.send({
						event: 'options',
						data: options
					});
				}

				child.send({event: 'start'});

				break;
			case 'output':
				output.push(message.data);

				break;
		}
	};

	let signalHandler = (signal: NodeJS.Signals) => {
		terminated = true;

		if(!child.killed)
			child.kill(signal);
	};

	let sigintHandler = signalHandler.bind('SIGINT');
	let sigtermHandler = signalHandler.bind('SIGTERM');

	process.on('SIGINT', sigintHandler);
	process.on('SIGTERM', sigtermHandler);

	return new Promise<any[]>((resolve, reject) => {
		let close = (code: number | null, signal: string) => {
			process.off('SIGINT', sigintHandler);
			process.off('SIGTERM', sigtermHandler);

			if(terminated)
				return;
			if(code === 0)
				resolve(output);
			else if(code !== null)
				reject(new GenericError(`Child process exited with code ${code}`));
			else
				reject(new GenericError(`Child process exited with signal ${signal}`));
		};

		child.on('message', message);
		child.on('close', close);
	});
}