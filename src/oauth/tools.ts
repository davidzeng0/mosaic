import { DefaultOAuthProvider } from './provider';
import { CredentialStore } from './store';
import { Config } from '@/index';
import { KV } from 'js-common';

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';

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
}