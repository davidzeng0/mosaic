import { ExistsError, GenericError, KV, NotFoundError, Promises, Timer } from 'js-common';
import { DefaultOAuthProvider, AccessToken, RefreshToken, Token } from '.';
import { Collection, Db, MongoClient, ObjectId } from 'mongodb';
import { Config } from 'protobuf-ts';
import * as Storage from './storage';

class DatabaseError extends GenericError{
	constructor(arg?: any){
		super(arg, 'Database error');
	}
}

function tokenToJson(token: RefreshToken): Storage.RefreshToken;
function tokenToJson(token: AccessToken): Storage.AccessToken;

function tokenToJson(token: RefreshToken | AccessToken){
	let json: KV<any> = {
		id: token.id,
		issuer: token.issuer.id,
		type: token.type,
		secret: token.secret,
		expire: token.expire,
		metadata: token.metadata
	};

	if(token instanceof AccessToken){
		json.client = token.client;
		json.scopes = token.scopes;
		json.refresher = token.refresher?.id;
	}

	return json;
}

function createRefreshToken(token: Storage.RefreshToken){
	return new RefreshToken({
		id: token.id,
		issuer: DefaultOAuthProvider.getIssuer(token.issuer),
		type: token.type,
		secret: token.secret,
		expire: token.expire,
		metadata: token.metadata
	});
}

function createAccessToken(token: Storage.AccessToken, refresher?: RefreshToken){
	return new AccessToken({
		id: token.id,
		issuer: DefaultOAuthProvider.getIssuer(token.issuer),
		type: token.type,
		secret: token.secret,
		expire: token.expire,
		metadata: token.metadata,
		client: token.client,
		scopes: token.scopes,
		refresher
	});
}

abstract class StorageMedium{
	abstract setKey(key: string, value: string): void | Promise<void>;
	abstract getKey(key: string): string | undefined | Promise<string | undefined>;
	abstract deleteKey(key: string): void | Promise<void>;

	abstract addToken(token: Token): void | Promise<void>;
	abstract updateToken(token: Token): void | Promise<void>;
	abstract deleteToken(token: Token): void | Promise<void>;

	abstract getRefreshToken(id: string): RefreshToken | undefined | Promise<RefreshToken | undefined>;
	abstract getAccessToken(id: string): AccessToken | undefined | Promise<AccessToken | undefined>;

	abstract synchronized(access: AccessToken, callback: (token?: AccessToken) => void | Promise<void>): void | Promise<void>;

	abstract listAllKeys(): Map<string, string> | Promise<Map<string, string>>;
	abstract listAllRefreshTokens(): Storage.RefreshToken[] | Promise<Storage.RefreshToken[]>;
	abstract listAllAccessTokens(): Storage.AccessToken[] | Promise<Storage.AccessToken[]>;
}

interface Lock{
	date: number;
	id: string;
}

class MemoryStorageMedium extends StorageMedium{
	keys = new Map<string, string>();
	refreshTokens = new Map<string, RefreshToken>();
	accessTokens = new Map<string, AccessToken>();
	locks = new Map<string, Lock>();

	override setKey(key: string, value: string){
		this.keys.set(key, value);
	}

	override getKey(key: string){
		return this.keys.get(key);
	}

	override deleteKey(key: string){
		this.keys.delete(key);
	}

	override addToken(token: Token){
		if(token instanceof AccessToken)
			this.accessTokens.set(token.id!, token);
		else
			this.refreshTokens.set(token.id!, token);
	}

	override updateToken(token: Token){
		void token;
	}

	override deleteToken(token: Token){
		if(token instanceof AccessToken)
			this.accessTokens.delete(token.id!);
		else
			this.refreshTokens.delete(token.id!);
	}

	override getRefreshToken(id: string){
		return this.refreshTokens.get(id);
	}

	override getAccessToken(id: string){
		return this.accessTokens.get(id);
	}

	override async synchronized(access: AccessToken, callback: (token?: AccessToken | undefined) => void | Promise<void>){
		let lockSuccess = false;
		let lockId = new ObjectId().toHexString();
		let now;
		let token;

		for(let i = 0; i < 15; i++){
			now = Date.now();
			token = this.accessTokens.get(access.id!);

			if(!token)
				break;
			if(token.secret != access.secret)
				break;
			let lock = this.locks.get(access.id!);

			if(!lock || lock.date <= now - 20_000){
				lock = {
					id: lockId,
					date: now
				};

				this.locks.set(access.id!, lock);

				lockSuccess = true;

				break;
			}

			await Promises.resolveAfter(2_000);
		}

		let error;

		try{
			await callback(token);
		}catch(e){
			error = e;
		}

		if(lockSuccess || !token){
			let lock = this.locks.get(access.id!);
			let holding = lock?.id == lockId;

			if(holding || !lock){
				if(holding)
					this.locks.delete(access.id!);
				this.accessTokens.set(access.id!, access);
			}
		}

		if(error)
			throw error;
	}

	override listAllKeys(){
		return this.keys;
	}

	override listAllRefreshTokens(){
		return Array.from(this.refreshTokens.values()).map(token => tokenToJson(token));
	}

	override listAllAccessTokens(){
		return Array.from(this.accessTokens.values()).map(token => tokenToJson(token) as Storage.AccessToken);
	}
}

export class DatabaseStorageMedium extends StorageMedium{
	url;
	db;

	client!: MongoClient;
	keys!: Collection<{key: string, value: string}>;
	refreshTokens!: Collection<Storage.RefreshToken>;
	accessTokens!: Collection<Storage.AccessToken>;

	ready?: Promise<void>;
	shouldClose = false;
	operations = 0;
	closeTimeout;

	constructor(url: string, db: string){
		super();
		this.url = url;
		this.db = db;

		this.closeTimeout = new Timer({initialTimeout: 10_000}, () => this.destroy());
	}

	createIndex(collection: Collection<any>, fields: KV<number | {direction: number, unique?: true}>){
		let promises = [];

		for(let [key, value] of KV.entries(fields)){
			let options;

			if(typeof value == 'object'){
				if(value.unique)
					options = {unique: true};
				value = value.direction;
			}

			promises.push(collection.createIndex({[key]: value}, options));
		}

		return Promise.all(promises);
	}

	async initialize(){
		this.client = new MongoClient(this.url);

		try{
			await this.client.connect();
		}catch(e){
			this.close();

			throw new DatabaseError(e);
		}

		let db = this.client.db(this.db);

		this.keys = db.collection('keys');
		this.refreshTokens = db.collection('refreshTokens');
		this.accessTokens = db.collection('accessTokens');

		try{
			await Promise.all([
				this.createIndex(this.keys, {key: {direction: 1, unique: true}}),
				this.createIndex(this.refreshTokens, {id: {direction: 1, unique: true}}),
				this.createIndex(this.accessTokens, {id: {direction: 1, unique: true}, refresher: 1})
			]);
		}catch(e){
			this.close();

			throw new DatabaseError(e);
		}

		this.closeTimeout.start();
	}

	close(){
		this.ready = undefined;
		this.shouldClose = false;
		this.closeTimeout.stop();
		this.client.close();
	}

	destroy(){
		if(this.operations)
			this.shouldClose = true;
		else
			this.close();
	}

	async setup(){
		if(!this.ready)
			this.ready = this.initialize();
		else{
			this.closeTimeout.start();
			this.shouldClose = false;
		}

		return this.ready;
	}

	runDbOp<T>(fn: () => Promise<T>){
		this.operations++;

		let promise = this.setup().then(fn).catch((e) => {
			throw new DatabaseError(e);
		});

		promise.catch((e) => {
			console.error(`Database operation failed: ${e.stack ?? e.message}`);
		}).finally(() => {
			this.operations--;

			if(!this.operations && this.shouldClose)
				this.close();
		});

		return promise;
	}

	override setKey(key: string, value: string){
		return this.runDbOp(
			() => this.keys.updateOne({key}, {$set: {key, value}}, {upsert: true})
		) as any;
	}

	override getKey(key: string){
		return this.runDbOp(
			async () => (await this.keys.findOne({key}))?.value
		);
	}

	override deleteKey(key: string){
		return this.runDbOp(
			() => this.keys.deleteOne({key})
		) as any;
	}

	override addToken(token: Token){
		let json = tokenToJson(token);

		return this.runDbOp(() => {
			let collection = token instanceof AccessToken ? this.accessTokens : this.refreshTokens;

			return collection!.insertOne(json as any);
		}) as any;
	}

	override updateToken(token: Token){
		let json = tokenToJson(token);

		return this.runDbOp(() => {
			let collection = token instanceof AccessToken ? this.accessTokens : this.refreshTokens;

			return collection!.updateOne({id: json.id}, {$set: json})
		}) as any;
	}

	override deleteToken(token: Token){
		return this.runDbOp(() => {
			let collection = token instanceof AccessToken ? this.accessTokens : this.refreshTokens;

			return collection!.deleteOne({id: token.id});
		}) as any;
	}

	override getRefreshToken(id: string){
		return this.runDbOp(async () => {
			let token = await this.refreshTokens.findOne({id});

			if(!token)
				return undefined;
			return createRefreshToken(token);
		});
	}

	override getAccessToken(id: string){
		return this.runDbOp(async () => {
			let token = await this.accessTokens.findOne({id});

			if(!token)
				return undefined;
			let refresher;

			if(token.refresher)
				refresher = await this.getRefreshToken(token.refresher);
			return createAccessToken(token, refresher);
		});
	}

	override async synchronized(token: AccessToken, callback: (token?: AccessToken) => void | Promise<void>){
		await this.setup();

		let lockSuccess = false;
		let lockId = new ObjectId();
		let now;

		let dbToken;

		for(let i = 0; i < 15; i++){
			now = Date.now();

			try{
				let update = await this.accessTokens!.updateOne({
					id: token.id,
					secret: token.secret,
					$or: [{
						lockDate: {$lte: now - 20_000}
					}, {
						lockId: null
					}]
				}, {
					$set: {
						lockId,
						lockDate: now
					}
				});

				if(update.matchedCount){
					lockSuccess = true;

					break;
				}

				let doc = await this.accessTokens!.findOne({id: token.id});

				if(!doc)
					break;
				dbToken = createAccessToken(doc);

				if(dbToken.secret != token.secret)
					break;
				await Promises.resolveAfter(2_000);
			}catch(e: any){
				console.error(`Failed to acquire lock: ${e.stack ?? e.message}`);

				break;
			}
		}

		let error;

		try{
			await callback(dbToken);
		}catch(e){
			error = e;
		}

		if(lockSuccess || !dbToken){
			let query;

			if(lockSuccess){
				query = {
					lockId,
					lockDate: now
				};
			}else{
				query = {
					lockId: null,
					lockDate: null
				};
			}

			try{
				await this.accessTokens!.updateOne({id: token.id, ...query}, {$set: {
					...tokenToJson(token),
					lockDate: undefined,
					lockId: undefined
				}});
			}catch(e: any){
				console.error(`Failed to release lock: ${e.stack ?? e.message}`);
			}
		}

		if(error)
			throw error;
	}

	override listAllKeys(){
		return this.runDbOp(async () => {
			let kvs = await this.keys.find().toArray();
			let map = new Map<string, string>();

			for(let kv of kvs)
				map.set(kv.key, kv.value);
			return map;
		});
	}

	override listAllRefreshTokens(){
		return this.runDbOp(() => {
			return this.refreshTokens.find().toArray();
		});
	}

	override listAllAccessTokens(){
		return this.runDbOp(() => {
			return this.accessTokens.find().toArray();
		});
	}
}

class FileStorageMedium extends MemoryStorageMedium{
	config;

	saving?: Promise<void>;
	queuedSave = false;

	constructor(filename: string){
		super();

		try{
			this.config = Config.loadConfigSync(filename);
		}catch(e){
			if(!(e instanceof NotFoundError))
				throw e;
			this.config = new Config(filename, {});
		}

		let keys = this.config.get('keys') as KV<string> | undefined;

		if(keys)
			this.keys = KV.toMap(keys);
		this.loadTokens(this.refreshTokens, true);
		this.loadTokens(this.accessTokens, false);
	}

	loadTokens(map: Map<string, any>, refresh: boolean){
		let tokens = this.config.get(refresh ? 'refreshTokens' : 'accessTokens') as any[] | undefined;

		if(!tokens)
			return;
		for(let storageToken of tokens){
			let refresher;

			if(storageToken.refresher)
				refresher = this.refreshTokens.get(storageToken.refresher);
			let token = refresh ? createRefreshToken(storageToken) : createAccessToken(storageToken, refresher);

			map.set(token.id!, token);
		}
	}

	saveImpl(){
		let refresh = [], access = [];

		for(let [_, token] of this.refreshTokens)
			refresh.push(tokenToJson(token));
		for(let [_, token] of this.accessTokens)
			access.push(tokenToJson(token));
		this.config.set('keys', KV.fromMap(this.keys));
		this.config.set('refreshTokens', refresh);
		this.config.set('accessTokens', access);

		return this.config.save();
	}

	async save(){
		if(this.saving){
			this.queuedSave = true;

			return;
		}

		do{
			this.queuedSave = false;
			this.saving = this.saveImpl();

			try{
				await this.saving;
			}catch(e: any){
				console.error(`Failed to save credentials: ${e.stack ?? e.message}`);
			}
		}while(this.queuedSave);

		this.saving = undefined;
	}

	override setKey(key: string, value: string){
		super.setKey(key, value);
		this.save();
	}

	override getKey(key: string){
		return super.getKey(key);
	}

	override deleteKey(key: string){
		super.deleteKey(key);
	}

	override addToken(token: Token){
		super.addToken(token);
		this.save();
	}

	override updateToken(token: Token){
		super.updateToken(token);
		this.save();
	}

	override deleteToken(token: Token){
		super.deleteToken(token);
		this.save();
	}

	override getRefreshToken(id: string){
		return super.getRefreshToken(id);
	}

	override getAccessToken(id: string){
		return super.getAccessToken(id);
	}
}

export class Store{
	private static medium: StorageMedium;

	private constructor(){}

	private static initialize(){
		if(this.medium)
			return;
		let url = Config.get('mongodb/url');
		let dbName = Config.get('credentials/database');

		if(url && dbName){
			this.medium = new DatabaseStorageMedium(url, dbName);

			return;
		}

		let file = Config.get('credentials/file');

		if(file){
			this.medium = new FileStorageMedium(file);

			return;
		}

		console.warn('No database to store credentials, using memory');

		this.medium = new MemoryStorageMedium();
	}

	static setKey(key: string, value: string){
		this.initialize();

		return this.medium.setKey(key, value);
	}

	static getKey(key: string){
		this.initialize();

		return this.medium.getKey(key);
	}

	static deleteKey(key: string){
		this.initialize();

		return this.medium.deleteKey(key);
	}

	static addToken(token: Token){
		let promise = (async() => {
			this.initialize();

			if(token.id)
				throw new ExistsError('Token already added');
			token.id = new ObjectId().toHexString();

			if(token instanceof AccessToken && token.refresher && !token.refresher.id)
				await this.addToken(token.refresher);
			await this.medium.addToken(token);
		})();

		promise.catch(() => {});

		return promise;
	}

	static updateToken(token: Token){
		this.initialize();

		if(!token.id)
			throw new NotFoundError('Token not added');
		return this.medium.updateToken(token);
	}

	static deleteToken(token: Token){
		let promise = (async() => {
			this.initialize();

			if(!token.id)
				throw new NotFoundError('Token not added');
			await this.medium.deleteToken(token);

			token.id = undefined;
		})();

		return promise;
	}

	static async getRefreshToken(id: string){
		this.initialize();

		let token = await this.medium.getRefreshToken(id);

		if(!token)
			throw new NotFoundError(`Refresh token with id '${id}' not found`);
		return token;
	}

	static async getAccessToken(id: string){
		this.initialize();

		let token = await this.medium.getAccessToken(id);

		if(!token)
			throw new NotFoundError(`Access token with id '${id}' not found`);
		return token;
	}

	static synchronized(token: AccessToken, callback: (token?: AccessToken) => void | Promise<void>){
		if(!token.id)
			throw new NotFoundError('Token not added');
		this.initialize();

		return this.medium.synchronized(token, callback);
	}
}