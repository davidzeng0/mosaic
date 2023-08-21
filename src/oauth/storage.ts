import { Scopes } from './defs';
import { OAuthIssuer } from './oauth';

export interface Metadata{
	email?: string;
	profile?: string;

	[key: string]: string | undefined;
}

export interface RefreshToken{
	id?: string;
	issuer: string;
	type?: string;
	secret: string;
	expire?: number;
	metadata?: Metadata;
}

export interface AccessToken{
	id?: string;
	issuer: string;
	type?: string;
	secret: string;
	expire?: number;
	metadata?: Metadata;
	client: string;
	scopes: Scopes;
	refresher?: string;
}

export interface Issuer{
	name: string;
	id: string;
	implementation: typeof OAuthIssuer;
}