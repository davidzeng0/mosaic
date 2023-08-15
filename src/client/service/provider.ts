import { InvalidArgumentError, KV, NotFoundError } from 'js-common';
import { Service, ServiceMethod, ServiceOptions, Client, Transport } from '..';
import { ProtoServiceDefinition } from './proto';
import { ServiceFactory } from './factory';
import { camel } from 'case';
import * as Storage from '../storage';

interface ServiceEntry{
	definition: Storage.Service;
	methods: KV<ServiceMethod>;
	implementation: typeof Service;
}

export class ServiceProvider{
	private clients;
	private transports;
	private services;

	constructor(){
		this.clients = new Map<string, Client>();
		this.transports = new Map<string, Transport>();
		this.services = new Map<string, ServiceEntry>();
	}

	private methodsFrom(methods: Storage.ServiceMethod[]){
		let out: KV<ServiceMethod> = {};

		for(let method of methods){
			let name = camel(method.name);
			let transport: KV<Transport> = {};

			for(let type of method.transport){
				let impl = this.transports.get(type);

				if(!impl)
					impl = Transport.from(type);
				if(impl)
					transport[type] = impl;
			}

			out[name] = {
				name: method.name,
				scopes: method.scopes,
				path: method.path,
				method: method.method,
				body: method.body,
				transport
			};
		}

		return out;
	}

	registerClients(clients: Storage.Client[]){
		for(let client of clients){
			let ctor = client.implementation ?? Client;

			delete client.implementation;

			let instance = new ctor(client as any);

			this.clients.set(instance.id, instance);
		}
	}

	registerServices(services: Storage.Service[]){
		for(let service of services){
			let methods: KV<ServiceMethod> = {};

			if(service.implementation){
				if(service.methods)
					throw new InvalidArgumentError(`Service cannot have both 'implementation' and 'methods'`);
				let definition = service.implementation;

				methods = ProtoServiceDefinition.methodsFrom(definition);

				delete service.implementation;
			}else if(service.methods){
				methods = this.methodsFrom(service.methods);
			}

			this.services.set(service.id, {
				definition: service as any,
				methods,
				implementation: ServiceFactory.create(service as any, methods)
			});
		}
	}

	registerTransports(transports: Storage.Transport[]){
		for(let transport of transports)
			this.transports.set(transport.id, transport.implementation);
	}

	create(id: string, options?: ServiceOptions): any{
		let service = this.services.get(id);

		if(!service)
			throw new NotFoundError(`Service '${id}' not found`);
		let client = this.clients.get(service.definition.client);

		if(!client)
			throw new NotFoundError(`Client '${service.definition.client}' not found`);
		return new service.implementation(service.definition, client, service.methods, options);
	}
}

export const DefaultServiceProvider = new ServiceProvider();