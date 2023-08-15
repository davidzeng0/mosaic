import { DefaultOAuthProvider } from './provider';
import { Config } from 'protobuf-ts';

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';

export function login(){
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

	return issuer.perform(authClient, scopes, args);
}