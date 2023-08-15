import { KV, Response, UnimplementedError } from 'js-common';
import { ApiRequest } from './request';
import * as Storage from './storage';

export class Client{
	readonly name;
	readonly id;
	readonly options?: KV<Storage.ClientOption>;
	readonly xssi?: KV;

	constructor(client: Storage.Client){
		this.name = client.name;
		this.id = client.id;
		this.options = client.options;
		this.xssi = client.xssi;
	}

	request(request: ApiRequest, options?: KV<any>): Promise<Response>{
		void request;
		void options;

		throw new UnimplementedError();
	}
}