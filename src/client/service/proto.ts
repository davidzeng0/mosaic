import { HttpContentType, HttpMethod, Json, KV, UnsupportedError } from 'js-common';
import { Reader, Writer } from 'protobufjs/minimal';
import { ServiceMethod, Transport } from '..';

import { MethodOptions, MethodOptions_IdempotencyLevel } from 'protobuf-ts/protos/google/protobuf/descriptor';
import { http } from 'protobuf-ts/protos/google/api/annotations';

export interface ProtoMessage<T = any>{
	encode(message: T, writer?: Writer): Writer;
	decode(input: Reader | Uint8Array | Array<number> | ArrayBufferLike, length?: number): T;
	fromJSON(object: any): T;
	toJSON(object: T): any;
}

export interface ProtoUnknownFields{
	readonly [tag: number]: readonly Buffer[];
}

export interface ProtoMethodOptions{
	readonly idempotencyLevel?: MethodOptions_IdempotencyLevel;
	readonly _unknownFields?: ProtoUnknownFields;
}

export interface ProtoServiceMethod{
	readonly name: string;
	readonly requestType: ProtoMessage;
	readonly requestStream: boolean;
	readonly responseType: ProtoMessage;
	readonly responseStream: boolean;
	readonly options: ProtoMethodOptions;
}

export interface ProtoServiceDefinition{
	readonly name: string;
	readonly fullName: string;
	readonly methods: KV<ProtoServiceMethod>;
}

function transportFrom(method: ProtoServiceMethod){
	let transport: KV<Transport> = {};

	transport[HttpContentType.PROTOBUF] = {
		request: HttpContentType.PROTOBUF,
		response: HttpContentType.PROTOBUF,

		encode: (message) => method.requestType.encode(message).finish(),
		decode: (message) => method.responseType.decode(message)
	};

	transport[HttpContentType.PROTOBUFFER] = {
		request: HttpContentType.PROTOBUFFER,
		response: HttpContentType.PROTOBUFFER,

		encode: (message) => method.requestType.encode(message).finish(),
		decode: (message) => method.responseType.decode(message)
	};

	transport[HttpContentType.JSON] = {
		request: HttpContentType.JSON,
		response: HttpContentType.JSON,

		encode: (message) => Json.encode(method.requestType.toJSON(message)),
		decode: (message) => method.responseType.fromJSON(Json.decode(message))
	};

	return transport;
}

export class ProtoServiceDefinition{
	private constructor(){}

	static methodsFrom(definition: ProtoServiceDefinition){
		let methods: KV<ServiceMethod> = {};

		for(let methodName in definition.methods){
			let method = definition.methods[methodName];
			let httpRule = MethodOptions.getExtension(method.options as any, http);

			if(!httpRule)
				throw new UnsupportedError(`Service method ${method.name} has no 'httpRule'`);
			let serviceMethod: Partial<ServiceMethod> = {
				name: method.name,
				scopes: [],
				transport: transportFrom(method)
			};

			if(httpRule.get){
				serviceMethod.method = HttpMethod.GET;
				serviceMethod.path = httpRule.get;
			}else if(httpRule.put){
				serviceMethod.method = HttpMethod.PUT;
				serviceMethod.path = httpRule.put;
			}else if(httpRule.post){
				serviceMethod.method = HttpMethod.POST;
				serviceMethod.path = httpRule.post;
			}else if(httpRule.delete){
				serviceMethod.method = HttpMethod.DELETE;
				serviceMethod.path = httpRule.delete;
			}else if(httpRule.patch){
				serviceMethod.method = HttpMethod.PATCH;
				serviceMethod.path = httpRule.patch;
			}else if(httpRule.custom){
				serviceMethod.method = httpRule.custom.kind;
				serviceMethod.path = httpRule.custom.path;
			}

			methods[methodName] = serviceMethod as ServiceMethod;
		}

		return methods;
	}
}