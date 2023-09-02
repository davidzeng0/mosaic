import { Credentials } from '@/client/credentials';
import { CredentialStore, OAuthIssuer, InvalidCredentialsError, Scopes } from '.';
import { ConcurrentPromise } from 'js-common';
import * as Storage from './storage';

interface TokenInit{
	id?: string;
	issuer: OAuthIssuer
	type?: string;
	secret: string;
	expire?: number;
	metadata?: Storage.Metadata;
}

export class Token extends Credentials{
	id;
	issuer;
	expire;
	type;
	secret;
	metadata;

	constructor(args: TokenInit){
		super();
		this.id = args.id;
		this.issuer = args.issuer;
		this.expire = args.expire;
		this.type = args.type;
		this.secret = args.secret;
		this.metadata = args.metadata;
	}

	get expired(){
		if(this.expire === undefined)
			return false;
		return Date.now() > this.expire * 1000;
	}

	override toString(){
		return this.issuer.toString(this);
	}
}

export class RefreshToken extends Token{
	constructor(args: TokenInit){
		super(args);
	}
}

interface AccessTokenInit extends TokenInit{
	client: string;
	scopes: Scopes;
	refresher?: RefreshToken;
}

export class AccessToken extends Token{
	client;
	scopes;
	refresher;

	private refreshTask = new ConcurrentPromise(() => this.doRefresh());

	constructor(args: AccessTokenInit){
		super(args);

		this.client = args.client;
		this.scopes = args.scopes;
		this.refresher = args.refresher;
	}

	private assignToken(token: AccessToken){
		this.expire = token.expire;
		this.type = token.type;
		this.secret = token.secret;
		this.scopes = token.scopes;
		this.metadata = token.metadata;
	}

	private async doRefresh(){
		if(!this.id)
			return this.assignToken(await this.issuer.refresh(this, this.refresher!));
		await CredentialStore.synchronized(this, async (token) => {
			if(token && token.secret != this.secret)
				this.assignToken(token);
			else
				this.assignToken(await this.issuer.refresh(this, this.refresher!));
		});
	}

	refresh(){
		if(!this.refresher)
			throw new InvalidCredentialsError('No refresh token');
		return this.refreshTask.run();
	}

	revoke(){
		return this.issuer.revoke(this);

	}

	get meta(){
		return this.metadata ?? this.refresher?.metadata;
	}
}