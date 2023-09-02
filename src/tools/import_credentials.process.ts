import { InvalidArgumentError, KV } from 'js-common';
import { Config, CredentialStore } from '@/index';

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';

(async function(){
	let args = yargs(hideBin(process.argv)).parseSync() as any;
	let input = args._.join(' ') || 'credentials.yaml';

	Config.use(args.config);

	let credentials = Config.loadConfigSync(input);

	let url = Config.get('mongodb/url'),
		dbName = Config.get('credentials/database');
	if(!url || !dbName)
		throw new InvalidArgumentError('No db to import to. Please set the mongodb/url and credentials/database keys in the config');
	let database = new CredentialStore['DatabaseStorageMedium'](url, dbName);

	await database.setup();

	let totalKeys = 0;

	for(let [key, value] of KV.entries(credentials.get('keys'))){
		let existing = await database.keys.findOne({key});

		totalKeys++;

		if(existing?.value == value)
			continue;
		if(existing)
			console.warn(`Overwriting existing value for ${key}: ${existing.value} -> ${value}`);
		await database.keys.updateOne({key}, {$set: {key, value: value as string}}, {upsert: true});
	}

	let totalTokens = 0;

	for(let token of credentials.get('refreshTokens')){
		await database.refreshTokens.updateOne({id: token.id}, {$set: token}, {upsert: true});

		totalTokens++;
	}

	for(let token of credentials.get('accessTokens')){
		await database.accessTokens.updateOne({id: token.id}, {$set: token}, {upsert: true});

		totalTokens++;
	}

	console.log(`Imported ${totalKeys} keys and ${totalTokens} tokens`);

	database.destroy();
})();