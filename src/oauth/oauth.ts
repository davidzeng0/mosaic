import { OAuthClient, Scopes, AccessToken, RefreshToken, Token } from '.';

export interface OAuthOptions{
	noUI?: boolean;
	email?: string;
	password?: string;

	[key: string]: any;
}

export abstract class OAuthIssuer{
	readonly name;
	readonly id;

	constructor(name: string, id: string){
		this.name = name;
		this.id = id;
	}

	abstract perform(client: OAuthClient, scopes: Scopes, options?: OAuthOptions): Promise<AccessToken>;
	abstract exchange(code: string, client: OAuthClient): Promise<AccessToken>;
	abstract refresh(access: AccessToken, refresh: RefreshToken): Promise<AccessToken>;
	abstract revoke(access: AccessToken): Promise<void>;

	toString(token: Token){
		if(token.type)
			return `${token.type} ${token.secret}`;
		return token.secret;
	}
}