import { Config, CredentialStore, OAuthStorage } from '@/index';
import { InvalidArgumentError, NotFoundError } from 'js-common';

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';

(async function(){
	let args = yargs(hideBin(process.argv)).parseSync() as any;
	let output = args._.join(' ') || 'credentials.yaml';

	Config.use(args.config);

	let credentials;

	try{
		credentials = Config.loadConfigSync(output);
	}catch(e){
		if(!(e instanceof NotFoundError))
			throw e;
		credentials = new Config(output, {});
	}

	let url = Config.get('mongodb/url'),
		dbName = Config.get('credentials/database');
	if(!url || !dbName)
		throw new InvalidArgumentError('No db to export from. Please set the mongodb/url and credentials/database keys in the config');
	let database = new CredentialStore['DatabaseStorageMedium'](url, dbName)

	let keys = await database.listAllKeys();
	let refresh = await database.listAllRefreshTokens();
	let access = await database.listAllAccessTokens();

	if(!credentials.get('keys'))
		credentials.set('keys', {});
	if(!credentials.get('refreshTokens'))
		credentials.set('refreshTokens', []);
	if(!credentials.get('accessTokens'))
		credentials.set('accessTokens', []);
	for(let [key, value] of keys){
		let existing = credentials.get('keys')[key];

		if(existing == value)
			continue;
		if(existing)
			console.warn(`Overwriting existing value for ${key}: ${existing} -> ${value}`);
		credentials.get('keys')[key] = value;
	}

	let refreshTokens = new Map<string, OAuthStorage.RefreshToken>();

	for(let token of credentials.get('refreshTokens'))
		refreshTokens.set(token.id, {...token, _id: undefined});
	for(let token of refresh)
		refreshTokens.set(token.id!, {...token, _id: undefined} as any);
	credentials.set('refreshTokens', Array.from(refreshTokens.values()));

	let accessTokens = new Map<string, OAuthStorage.AccessToken>();

	for(let token of credentials.get('accessTokens'))
		accessTokens.set(token.id, {...token, _id: undefined});
	for(let token of access)
		accessTokens.set(token.id!, {...token, _id: undefined} as any);
	credentials.set('accessTokens', Array.from(accessTokens.values()));

	console.log(`Exported ${keys.size} keys and ${refresh.length + access.length} tokens`);

	database.destroy();

	await credentials.save();
})();