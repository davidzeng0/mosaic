import { GenericError, NotFoundError } from 'js-common';
import { DefaultOAuthProvider, AccessToken, RefreshToken } from '.';
import { Config } from 'protobuf-ts';
import * as Storage from './storage';

export class Store{
	private constructor(){}

	private static config?: Config;
	private static saving?: Promise<void>;
	private static queuedSave = false;
	private static refreshTokens: RefreshToken[] = [];
	private static accessTokens: AccessToken[] = [];

	private static initialize(){
		if(this.config)
			return;
		let path = Config.get('credentials');

		if(!path)
			throw new GenericError('Cannot use credentials store without storage path');
		try{
			this.config = Config.loadConfigSync(path);
		}catch(e){
			if(!(e instanceof NotFoundError))
				throw e;
			this.config = new Config(path, {});
		}

		let refresh, access;

		refresh = this.config.get('refreshTokens') as Storage.RefreshToken[] | undefined;

		if(refresh){
			for(let token of refresh){
				this.refreshTokens.push(new RefreshToken({
					...token,
					issuer: DefaultOAuthProvider.getIssuer(token.issuer)
				}));
			}
		}

		access = this.config.get('accessTokens') as Storage.AccessToken[] | undefined;

		if(access){
			for(let token of access){
				let refresher;

				if(token.refresher)
					refresher = this.getRefreshToken(token.refresher);
				this.accessTokens.push(new AccessToken({
					...token,
					issuer: DefaultOAuthProvider.getIssuer(token.issuer),
					refresher
				}));
			}
		}
	}

	static setKey(path: string, value: any){
		this.initialize();
		this.config!.set(path, value);
		this.save();
	}

	static getKey(path: string){
		this.initialize();

		return this.config!.get(path);
	}

	static add(token: AccessToken | RefreshToken){
		this.initialize();

		if(token instanceof AccessToken)
			this.accessTokens.push(token);
		else
			this.refreshTokens.push(token);
		this.saveTokens();
	}

	static updated(token: AccessToken | RefreshToken){
		this.initialize();
		this.saveTokens();
	}

	static getRefreshToken(id: string){
		this.initialize();

		let token = this.refreshTokens.find(token => token.id == id);

		if(!token)
			throw new NotFoundError(`Refresh token with id '${id}' not found`);
		return token;
	}

	static getAccessToken(id: string){
		this.initialize();

		let token = this.accessTokens.find(token => token.id == id);

		if(!token)
			throw new NotFoundError(`Access token with id '${id}' not found`);
		return token;
	}

	private static async saveTokens(){
		let refresh: Storage.RefreshToken[] = [];
		let access: Storage.AccessToken[] = [];

		for(let token of this.refreshTokens){
			refresh.push({
				issuer: token.issuer.id,
				id: token.id,
				type: token.type,
				secret: token.secret,
				expire: token.expire,
				metadata: token.metadata
			});
		}

		for(let token of this.accessTokens){
			access.push({
				issuer: token.issuer.id,
				id: token.id,
				client: token.client,
				type: token.type,
				secret: token.secret,
				scopes: token.scopes,
				expire: token.expire,
				refresher: token.refresher ? token.refresher.id : undefined,
				metadata: token.metadata
			});
		}

		this.config!.set('refreshTokens', refresh);
		this.config!.set('accessTokens', access);
		this.config!.save();
	}

	private static async save(){
		if(!this.config)
			return;
		if(this.saving){
			this.queuedSave = true;

			return;
		}

		do{
			this.queuedSave = false;
			this.saving = this.config.save();

			try{
				await this.saving;
			}catch(e){
				console.error(e);
			}
		}while(this.queuedSave);

		this.saving = undefined;
	}
}