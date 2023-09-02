import { KV, UnsupportedError } from 'js-common';
import { Service, ServiceMethod } from '../service';
import { Transport } from '../transport';
import * as Storage from '../storage';

export class ServiceFactory{
	private static bindTransact(method: string, path: string, transport: Transport, contentType: string | undefined){
		return function(this: Service, message: any){
			this.transact(method, path, transport, contentType, message);
		};
	}

	private static installMethod(service: Storage.Service, prototype: KV<any>, name: string, method: ServiceMethod){
		prototype[name] = function(this: Service, message: any){
			this.preflight();

			let methodName = `${service.id}->${method.name}`;
			let path = method.path;

			if(path.startsWith('/'))
				path = path.substring(1);
			if(!method.transport)
				throw new UnsupportedError(`Service method '${methodName}' has no transport`);
			let transport = method.transport[this.transport!];

			if(!transport)
				throw new UnsupportedError(`Service method '${methodName}' has no transport '${this.transport}'`);
			let scopes = method.scopes;

			if(this.scopes){
				if(scopes)
					scopes = scopes.concat(this.scopes);
				else
					scopes = this.scopes;
			}

			let transact = ServiceFactory.bindTransact(
				method.method,
				this.getFullPath(path),
				transport,
				transport.request ?? this.transport
			);

			prototype[name] = transact;

			return transact.call(this, message);
		};
	}

	static create(service: Storage.Service, methods: KV<ServiceMethod>): typeof Service{
		let impl = class GeneratedService extends Service{};
		let prototype = impl.prototype as any;

		for(let [name, method] of KV.entries(methods))
			this.installMethod(service, prototype, name, method);
		return impl;
	}
}