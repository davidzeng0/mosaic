import { Scopes } from './defs';
import { OAuthIssuer } from './oauth';

export interface Metadata{
	email?: string;
	profile?: string;

	[key: string]: string | undefined;
}

export interface RefreshToken{
	issuer: string;
	id: string;
	type?: string;
	secret: string;
	expire?: number;
	metadata?: Metadata;
}

export interface AccessToken{
	issuer: string;
	id: string;
	client: string;
	type?: string;
	secret: string;
	scopes: Scopes;
	expire?: number;
	refresher?: string;
	metadata?: Metadata;
}

export interface Issuer{
	name: string;
	id: string;
	implementation: typeof OAuthIssuer;
}