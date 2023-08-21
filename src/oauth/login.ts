import { DefaultOAuthProvider } from './provider';
import { Config } from 'protobuf-ts';
import { Store } from './store';

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';

export async function login(){
	let args = yargs(hideBin(process.argv)).parseSync() as any;
	let client = args._.join(' ');

	let authClient = DefaultOAuthProvider.getClient(client);
	let issuer = DefaultOAuthProvider.getIssuer(authClient.config.issuer);
	let scopes = args.scope;

	if(typeof scopes == 'string')
		scopes = [scopes];
	Config.use(args.config ?? 'config.yaml');

	delete args.$0;
	delete args._;
	delete args.scope;
	delete args.config;

	let token = await issuer.perform(authClient, scopes, args);

	await Store.addToken(token);

	return token;
}