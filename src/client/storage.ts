import { KV } from 'js-common';
import { Scopes } from '@/oauth';
import { ProtoServiceDefinition } from './service/proto';
import * as client from './client';
import * as transport from './transport';

export interface ServiceEndpoint{
	host: string;
	transport: string[];
	headers?: KV<any>;
	params?: KV<any>;
}

export interface Transport{
	name: string;
	id: string;
	implementation: transport.Transport;
}

export interface ServiceMethod{
	name: string;
	scopes?: Scopes;
	path: string;
	method: string;
	body?: string;
	transport: string[];
}

export interface Service{
	name: string;
	id: string;
	client: string;
	scopes?: Scopes;
	endpoints: ServiceEndpoint[];
	basePath?: string;
	version?: string;
	implementation?: ProtoServiceDefinition;
	methods?: ServiceMethod[];
}

export interface ClientOption{
	header?: string;
	query?: string;
	default?: any;
	enum?: any[];
}

export interface Client{
	name: string;
	id: string;
	options?: KV<ClientOption>;
	xssi?: KV;
	implementation?: typeof client.Client;
}