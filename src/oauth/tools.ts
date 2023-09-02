import { DefaultOAuthProvider } from './provider';
import { CredentialStore } from './store';
import { Config } from '@/index';
import { GenericError, KV } from 'js-common';
import { spawn } from 'child_process';

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';

const electron = require('electron') as any as string;

export interface OAuthElectronIPCMessage{
	ready?: true;
	start?: true;
	output?: any;
	options?: KV<any>;
}

export class OAuthTools{
	private static optionsFromCmdLine(){
		let args = yargs(hideBin(process.argv)).parseSync() as any;
		let client = args._.join(' ');
		let scopes = args.scope;

		if(typeof scopes == 'string')
			scopes = [scopes];
		Config.use(args.config);

		delete args.$0;
		delete args._;
		delete args.scope;
		delete args.config;

		return {
			client,
			scopes,
			args
		};
	}

	static async login(options: {
		client: string;
		scopes: string[];
		args: KV<any>;
	} = this.optionsFromCmdLine()){
		let {scopes, args} = options;

		let client = DefaultOAuthProvider.getClient(options.client);
		let issuer = DefaultOAuthProvider.getIssuer(client.config.issuer);
		let token = await issuer.perform(client, scopes, args);

		await CredentialStore.addToken(token);

		return token;
	}

	static launchElectronApplication(path: string, options?: KV<any>){
		let child = spawn(electron, [path], {
			stdio: ['ipc', process.stdin, process.stdout]
		});

		let output: any[] = [];
		let terminated = false;

		let message = (data: any) => {
			let message = data as OAuthElectronIPCMessage;

			if(message.ready){
				child.send({
					options
				});

				child.send({start: true});
			}else if(message.output !== undefined){
				output.push(message.output);
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
}