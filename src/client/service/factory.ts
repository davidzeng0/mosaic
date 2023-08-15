import { ApiError, GenericError, HttpHeader, InvalidArgumentError, KV, Mime, ParseError, SerializeError, UnsupportedError } from 'js-common';
import { Service, ServiceMethod } from '../service';
import { ApiRequest } from '../request';
import * as Storage from '../storage';

function createMethod(service: Storage.Service, method: ServiceMethod){
	let name = `${service.id}->${method.name}`;
	let path = method.path;

	if(path.startsWith('/'))
		path = path.substring(1);
	return async function(this: Service, message: any): Promise<any>{
		if(!this.host)
			throw new InvalidArgumentError(`Service method '${name}' called without a host`);
		if(!this.transport)
			throw new InvalidArgumentError(`Service method '${name}' called without a transport`);
		if(!method.transport)
			throw new UnsupportedError(`Service method '${name}' has no transport`);
		let transport = method.transport[this.transport];

		if(!transport)
			throw new UnsupportedError(`Service method '${name}' has no transport '${this.transport}'`);
		let scopes = method.scopes;

		if(this.scopes){
			if(scopes)
				scopes = scopes.concat(this.scopes);
			else
				scopes = this.scopes;
		}

		let request = new ApiRequest();

		request.url.setHost(this.host);
		request.setMethod(method.method);

		if(this.basePath)
			request.url.addPath(this.basePath);
		if(this.version)
			request.url.addPath(this.version);
		request.url.addPath(path);

		if(this.params)
			request.url.setParams(this.params);
		request.setHeader(HttpHeader.CONTENT_TYPE, transport.request ?? this.transport);

		if(this.headers)
			request.setHeaders(this.headers);
		try{
			request.body = transport.encode(message);
		}catch(e){
			if(!(e instanceof GenericError))
				throw new SerializeError(e);
			throw e;
		}

		let response = await this.client.request(request, this.options);

		if(transport.response !== undefined){
			let type = response.headers.get(HttpHeader.CONTENT_TYPE);

			if(!type || (type !== transport.response && !Mime.typeEquals(type, transport.response)))
				throw new ApiError(`Expected content type '${transport.response}' but got '${type}'`);
		}

		try{
			return transport.decode(response.body);
		}catch(e){
			if(!(e instanceof GenericError))
				throw new ParseError(e);
			throw e;
		}
	};
}

export class ServiceFactory{
	static create(service: Storage.Service, methods: KV<ServiceMethod>): typeof Service{
		let impl = class GeneratedService extends Service{};
		let prototype = impl.prototype as any;

		for(let [name, method] of KV.entries(methods))
			prototype[name] = createMethod(service, method);
		return impl;
	}
}