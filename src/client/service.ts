import { InvalidArgumentError, KV } from 'js-common';
import { Client, Credentials, Transport } from '.';
import { Scopes } from '@/oauth';
import * as Storage from './storage';

export interface ServiceMethod{
	name: string;
	scopes?: Scopes;
	path: string;
	method: string;
	body?: string;
	transport?: KV<Transport>;
}

export interface ServiceOptions{
	credentials?: Credentials[];
	clientOptions?: KV<any>;
	headers?: KV<any>;
	params?: KV<any>; /* url query params */
	host?: string;
	transport?: string;
}

function setKV(kv: KV<any> | undefined, from: KV<any> | undefined){
	if(!from)
		return kv;
	if(!kv)
		return from;
	for(let [key, value] of KV.entries(from))
		kv[key] = value;
	return kv;
}

function setKVone(kv: KV<any> | undefined, key: string, value: any){
	if(!kv)
		kv = {};
	kv[key] = value;

	return kv;
}

export class Service{
	readonly name;
	readonly id;
	readonly client;
	readonly scopes;
	readonly host;
	readonly transport;
	readonly basePath;
	readonly version;
	readonly methods;
	readonly headers;
	readonly params;
	readonly options: KV<any>;

	constructor(service: Storage.Service, client: Client, methods: KV<ServiceMethod>, options?: ServiceOptions){
		this.name = service.name;
		this.id = service.id;
		this.client = client;
		this.options = {};

		if(service.scopes)
			this.scopes = service.scopes;
		if(service.basePath)
			this.basePath = service.basePath;
		if(service.version)
			this.version = service.version;
		this.methods = methods;

		if(options?.credentials)
			this.options.credentials = options.credentials;
		let headers = options?.headers;
		let params = options?.params;

		let {endpoint, transport} = this.selectTransport(service, options);

		this.host = endpoint?.host;
		this.transport = transport;

		headers = setKV(headers, endpoint.headers);
		params = setKV(params, endpoint.params);

		if(options?.clientOptions){
			let clientOpts = this.processClientOptions(options.clientOptions);

			headers = setKV(headers, clientOpts.headers);
			params = setKV(params, clientOpts.params);

			this.options = setKV(this.options, clientOpts.options)!;
		}

		this.headers = headers;
		this.params = params;
	}

	private selectTransport(service: Storage.Service, options?: {
		host?: string;
		transport?: string;
	}){
		let endpoint: Storage.ServiceEndpoint | undefined;
		let transport: string | undefined;

		if(options?.host){
			endpoint = service.endpoints.find(endpoint => endpoint.host == options.host);

			if(!endpoint)
				throw new InvalidArgumentError(`Service endpoint '${options.host}' does not exist`);
		}

		if(options?.transport){
			if(!service.endpoints.length)
				throw new InvalidArgumentError(`Cannot set transport '${options.transport}' without an endpoint`);
			if(!endpoint){
				endpoint = service.endpoints.find(endpoint => endpoint.transport.includes(options.transport!));

				if(!endpoint)
					throw new InvalidArgumentError(`Transport '${options.transport}' not supported by any endpoint`);
			}else if(!endpoint.transport.includes(options.transport)){
				throw new InvalidArgumentError(`Transport '${options.transport}' not supported, options are: ${endpoint.transport.join(', ')}`)
			}

			transport = options.transport;
		}

		if(!endpoint)
			endpoint = service.endpoints[0];
		if(endpoint && !transport)
			transport = endpoint.transport[0];
		return {
			endpoint,
			transport,
		};
	}

	private processClientOptions(clientOptions: KV<any>){
		let headers;
		let params;
		let options;

		for(let key in clientOptions){
			if(!this.client.options || !(key in this.client.options))
				throw new InvalidArgumentError(`Client option '${key}' not found`);
			let option = this.client.options[key];
			let value = clientOptions[key];

			if(option.enum && !option.enum.includes(value))
				throw new InvalidArgumentError(`Client option '${key}' must be one of [${option.enum.join(', ')}], got '${value}'`);
			if(option.header)
				headers = setKVone(headers, option.header, value);
			else if(option.query)
				params = setKVone(params, option.query, value);
			else
				options = setKVone(options, key, value);
		}

		return {
			headers,
			params,
			options
		};
	}
}