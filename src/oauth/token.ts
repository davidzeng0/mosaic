import { Credentials } from '@/client/credentials';
import { Store, OAuthIssuer, InvalidCredentialsError, Scopes } from '.';
import * as Storage from './storage';

export class Token extends Credentials{
	private static counter = 0;

	static createId(){
		let buffer = Buffer.alloc(12);

		buffer.writeBigUInt64BE(BigInt(Date.now()), 0);
		buffer.writeUint32BE(this.counter, 8);

		this.counter++;

		if(this.counter >= 2 ** 31 - 1)
			this.counter = 0;
		return buffer.toString('hex');
	}

	readonly type;
	readonly secret;
	readonly issuer;
	readonly id;
	readonly expire;
	readonly metadata;

	constructor(args: {
		issuer: OAuthIssuer
		id?: string;
		type?: string;
		secret: string;
		expire?: number;
		metadata?: Storage.Metadata;
	}){
		super();
		this.issuer = args.issuer;
		this.id = args.id ?? Token.createId();
		this.expire = args.expire;
		this.type = args.type;
		this.secret = args.secret;
		this.metadata = args.metadata;
	}

	override toString(){
		if(this.type)
			return `${this.type} ${this.secret}`;
		return this.secret;
	}
}

export class RefreshToken extends Token{
	constructor(args: {
		issuer: OAuthIssuer
		id?: string;
		type?: string;
		secret: string;
		expire?: number;
		metadata?: Storage.Metadata;
	}){
		super(args);
	}
}

export class AccessToken extends Token{
	readonly client;
	readonly scopes;
	readonly refresher;
	private refreshPromise?: Promise<void>;

	constructor(args: {
		issuer: OAuthIssuer,
		id?: string;
		client: string;
		type?: string;
		secret: string;
		scopes: Scopes;
		expire?: number;
		refresher?: RefreshToken,
		metadata?: Storage.Metadata;
	}){
		super(args);

		this.client = args.client;
		this.scopes = args.scopes;
		this.refresher = args.refresher;
	}

	private async doRefresh(){
		let token = await this.issuer.refresh(this, this.refresher!);

		Object.assign(this, {
			expire: token.expire,
			type: token.type,
			secret: token.secret,
			scopes: token.scopes
		});

		Store.updated(this);
	}

	get expired(){
		if(this.expire === undefined)
			return false;
		return Date.now() > this.expire * 1000;
	}

	refresh(){
		if(!this.refresher)
			throw new InvalidCredentialsError('No refresh token');
		if(!this.refreshPromise){
			this.refreshPromise = this.doRefresh();

			this.refreshPromise.finally(() => {
				this.refreshPromise = undefined;
			});
		}

		return this.refreshPromise;
	}

	revoke(){
		return this.issuer.revoke(this);
	}

	get meta(){
		return this.metadata ?? this.refresher?.metadata;
	}
}