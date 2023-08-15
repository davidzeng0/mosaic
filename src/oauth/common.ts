import { KV } from 'js-common';

export interface OpenIDConfiguration extends KV<any>{
	issuer?: string;
	authorization_endpoint?: string;
	device_authorization_endpoint?: string;
	token_endpoint?: string;
	userinfo_endpoint?: string;
	revocation_endpoint?: string;
}

export interface OpenIDError extends KV<any>{
	error?: string;
	error_description?: string;
	error_uri?: string;
}

export class OpenIDConnect{
	constructor(){

	}

	async revoke(access: string){}
}