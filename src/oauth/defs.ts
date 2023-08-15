import { GenericError } from 'js-common';

export type Scope = string;
export type Scopes = Scope[];

export const Scopes = {
	parse(scopes: string){
		return scopes.split(' ') as Scopes;
	},

	stringify(scopes: Scopes){
		return scopes.join(' ');
	}
};

export class OAuthError extends GenericError{
	constructor(arg?: any, defaultSimpleMessage = 'Error authenticating with service'){
		super(arg ?? 'Generic OAuth error', defaultSimpleMessage);
	}
}

export class InvalidCredentialsError extends OAuthError{
	constructor(arg?: any){
		super(arg ?? 'Invalid credentials');
	}
}

export class UserDeniedError extends OAuthError{
	constructor(arg?: any){
		super(arg ?? 'Authentication rejected by user');
	}
}

export class UnrecognizedIDClientError extends OAuthError{
	constructor(arg?: any){
		super(arg ?? 'Unrecognized client id');
	}
}

export class UnauthorizedClientError extends OAuthError{
	constructor(arg?: any){
		super(arg ?? 'Unauthorized client');
	}
}

export class InvalidScopeError extends OAuthError{
	constructor(arg?: any){
		super(arg ?? 'Invalid scope');
	}
}

export interface OAuthConfig{
	issuer: string; /* OAuth 2.0 Issuer ID */
	url?: string; /* URL for public OAuth APIs */
}

export interface OAuthClient{
	config: OAuthConfig;
	id: string; /* client id */
	secret?: string;
	redirectUri?: string;

	[key: string]: any;
}