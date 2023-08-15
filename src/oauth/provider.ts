import { NotFoundError } from 'js-common';
import { OAuthIssuer, OAuthClient } from '.';
import * as Storage from './storage';

export class OAuthProvider{
	private issuers;
	private clients;

	constructor(){
		this.issuers = new Map<string, OAuthIssuer>();
		this.clients = new Map<string, OAuthClient>();
	}

	registerIssuers(issuers: Storage.Issuer[]){
		for(let issuer of issuers){
			let impl = issuer.implementation as any;
			let instance = new impl(issuer.name, issuer.id);

			this.issuers.set(instance.id, instance);
		}
	}

	registerClients(clients: OAuthClient[]){
		for(let client of clients)
			this.clients.set(client.id, client);
	}

	getIssuer(id: string): OAuthIssuer{
		let issuer = this.issuers.get(id);

		if(!issuer)
			throw new NotFoundError(`Issuer '${id}' not found`);
		return issuer;
	}

	getClient(id: string): OAuthClient{
		let client = this.clients.get(id);

		if(!client)
			throw new NotFoundError(`Client '${id}' not found`);
		return client;
	}
}

export const DefaultOAuthProvider = new OAuthProvider();