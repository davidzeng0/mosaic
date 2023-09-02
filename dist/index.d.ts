import { GenericError, KV, Request, URLBuilder, Response, Payload, UnavailableError, NotFoundError, UnsupportedError, UnimplementedError, InvalidArgumentError, PermissionDeniedError, PreconditionFailedError, RateLimitedError, InternalServerError, NetworkError, TimedOutError } from 'js-common';
import { Writer, Reader } from 'protobufjs/minimal';
import { MethodOptions_IdempotencyLevel } from 'protobuf-ts/protos/google/protobuf/descriptor';

type Scope = string;
type Scopes = Scope[];
declare const Scopes: {
    parse(scopes: string): Scopes;
    stringify(scopes: Scopes): string;
};
declare class OAuthError extends GenericError {
    constructor(arg?: any, defaultSimpleMessage?: string);
}
declare class InvalidCredentialsError extends OAuthError {
    constructor(arg?: any);
}
declare class UserDeniedError extends OAuthError {
    constructor(arg?: any);
}
declare class UnrecognizedIDClientError extends OAuthError {
    constructor(arg?: any);
}
declare class UnauthorizedClientError extends OAuthError {
    constructor(arg?: any);
}
declare class InvalidScopeError extends OAuthError {
    constructor(arg?: any);
}
interface OAuthConfig {
    issuer: string;
    url?: string;
}
interface OAuthClient {
    config: OAuthConfig;
    id: string;
    secret?: string;
    redirectUri?: string;
    [key: string]: any;
}

interface OAuthOptions {
    noUI?: boolean;
    email?: string;
    password?: string;
    [key: string]: any;
}
declare abstract class OAuthIssuer {
    readonly name: string;
    readonly id: string;
    constructor(name: string, id: string);
    abstract perform(client: OAuthClient, scopes: Scopes, options?: OAuthOptions): Promise<AccessToken>;
    abstract exchange(code: string, client: OAuthClient): Promise<AccessToken>;
    abstract refresh(access: AccessToken, refresh: RefreshToken): Promise<AccessToken>;
    abstract revoke(access: AccessToken): Promise<void>;
    toString(token: Token): string;
}

declare class Credentials {
}
declare class ApiKey extends Credentials {
    readonly key: string;
    constructor(key: string);
}

interface Metadata {
    email?: string;
    profile?: string;
    [key: string]: string | undefined;
}
interface RefreshToken$1 {
    id?: string;
    issuer: string;
    type?: string;
    secret: string;
    expire?: number;
    metadata?: Metadata;
}
interface AccessToken$1 {
    id?: string;
    issuer: string;
    type?: string;
    secret: string;
    expire?: number;
    metadata?: Metadata;
    client: string;
    scopes: Scopes;
    refresher?: string;
}
interface Issuer {
    name: string;
    id: string;
    implementation: typeof OAuthIssuer;
}

type storage$1_Issuer = Issuer;
type storage$1_Metadata = Metadata;
declare namespace storage$1 {
  export {
    AccessToken$1 as AccessToken,
    storage$1_Issuer as Issuer,
    storage$1_Metadata as Metadata,
    RefreshToken$1 as RefreshToken,
  };
}

interface TokenInit {
    id?: string;
    issuer: OAuthIssuer;
    type?: string;
    secret: string;
    expire?: number;
    metadata?: Metadata;
}
declare class Token extends Credentials {
    id: string | undefined;
    issuer: OAuthIssuer;
    expire: number | undefined;
    type: string | undefined;
    secret: string;
    metadata: Metadata | undefined;
    constructor(args: TokenInit);
    get expired(): boolean;
    toString(): string;
}
declare class RefreshToken extends Token {
    constructor(args: TokenInit);
}
interface AccessTokenInit extends TokenInit {
    client: string;
    scopes: Scopes;
    refresher?: RefreshToken;
}
declare class AccessToken extends Token {
    client: string;
    scopes: Scopes;
    refresher: RefreshToken | undefined;
    private refreshPromise?;
    constructor(args: AccessTokenInit);
    private assignToken;
    private doRefresh;
    refresh(): Promise<any>;
    revoke(): Promise<void>;
    get meta(): Metadata | undefined;
}

declare class DatabaseError extends GenericError {
    constructor(arg?: any);
}
declare class CredentialStore {
    private static DatabaseStorageMedium;
    private static medium;
    private constructor();
    private static initialize;
    static setKey(key: string, value: string): void | Promise<void>;
    static getKey(key: string): string | Promise<string | undefined> | undefined;
    static deleteKey(key: string): void | Promise<void>;
    static addToken(token: Token): Promise<void>;
    static updateToken(token: Token): void | Promise<void>;
    static deleteToken(token: Token): Promise<void>;
    static getRefreshToken(id: string): Promise<RefreshToken>;
    static getAccessToken(id: string): Promise<AccessToken>;
    static synchronized(token: AccessToken, callback: (token?: AccessToken) => void | Promise<void>): void | Promise<void>;
}

declare class OAuthProvider {
    private issuers;
    private clients;
    constructor();
    registerIssuers(issuers: Issuer[]): void;
    registerClients(clients: OAuthClient[]): void;
    getIssuer(id: string): OAuthIssuer;
    getClient(id: string): OAuthClient;
}
declare const DefaultOAuthProvider: OAuthProvider;

interface IPCMessage {
    event: string;
    data: any;
}
declare function launch(path: string, options?: any): Promise<any[]>;

declare class OAuthTools {
    private static optionsFromCmdLine;
    static login(options?: {
        client: string;
        scopes: string[];
        args: KV<any>;
    }): Promise<AccessToken>;
}

interface ProtoMessage<T = any> {
    encode(message: T, writer?: Writer): Writer;
    decode(input: Reader | Uint8Array | Array<number> | ArrayBufferLike, length?: number): T;
    fromJSON(object: any): T;
    toJSON(object: T): any;
}
interface ProtoUnknownFields {
    readonly [tag: number]: readonly Buffer[];
}
interface ProtoMethodOptions {
    readonly idempotencyLevel?: MethodOptions_IdempotencyLevel;
    readonly _unknownFields?: ProtoUnknownFields;
}
interface ProtoServiceMethod {
    readonly name: string;
    readonly requestType: ProtoMessage;
    readonly requestStream: boolean;
    readonly responseType: ProtoMessage;
    readonly responseStream: boolean;
    readonly options: ProtoMethodOptions;
}
interface ProtoServiceDefinition {
    readonly name: string;
    readonly fullName: string;
    readonly methods: KV<ProtoServiceMethod>;
}
declare class ProtoServiceDefinition {
    private constructor();
    static methodsFrom(definition: ProtoServiceDefinition): KV<ServiceMethod>;
}

declare class ApiRequest extends Request {
    readonly url: URLBuilder;
    constructor(url?: string);
    get https(): boolean;
    execute(): Promise<Response>;
}

declare class Client$1 {
    readonly name: string;
    readonly id: string;
    readonly options?: KV<ClientOption>;
    readonly xssi?: KV;
    constructor(client: Client);
    request(request: ApiRequest, options?: KV<any>): Promise<Response>;
}

interface Transport$1 {
    readonly request?: string;
    readonly response?: string;
    encode(message: any): Payload;
    decode(message: Buffer): any;
}
declare const Transport$1: {
    from(type: string): Transport$1 | undefined;
};

interface ServiceEndpoint {
    host: string;
    transport: string[];
    headers?: KV<any>;
    params?: KV<any>;
}
interface Transport {
    name: string;
    id: string;
    implementation: Transport$1;
}
interface ServiceMethod$1 {
    name: string;
    scopes?: Scopes;
    path: string;
    method: string;
    body?: string;
    transport: string[];
}
interface ServiceImplementation {
    protoOverREST?: ProtoServiceDefinition;
    gRPC?: ProtoServiceDefinition;
}
interface Service$1 {
    name: string;
    id: string;
    client: string;
    scopes?: Scopes;
    endpoints: ServiceEndpoint[];
    basePath?: string;
    version?: string;
    implementation?: ServiceImplementation;
    methods?: ServiceMethod$1[];
}
interface ClientOption {
    header?: string;
    query?: string;
    default?: any;
    enum?: any[];
}
interface Client {
    name: string;
    id: string;
    options?: KV<ClientOption>;
    xssi?: KV;
    implementation?: typeof Client$1;
}

type storage_Client = Client;
type storage_ClientOption = ClientOption;
type storage_ServiceEndpoint = ServiceEndpoint;
type storage_ServiceImplementation = ServiceImplementation;
type storage_Transport = Transport;
declare namespace storage {
  export {
    storage_Client as Client,
    storage_ClientOption as ClientOption,
    Service$1 as Service,
    storage_ServiceEndpoint as ServiceEndpoint,
    storage_ServiceImplementation as ServiceImplementation,
    ServiceMethod$1 as ServiceMethod,
    storage_Transport as Transport,
  };
}

interface ServiceMethod {
    name: string;
    scopes?: Scopes;
    path: string;
    method: string;
    body?: string;
    transport?: KV<Transport$1>;
}
interface ServiceOptions {
    credentials?: Credentials[];
    clientOptions?: KV<any>;
    headers?: KV<any>;
    params?: KV<any>;
    host?: string;
    transport?: string;
}
declare class Service {
    readonly name: string;
    readonly id: string;
    readonly client: Client$1;
    readonly scopes: Scopes | undefined;
    readonly host: string;
    readonly transport: string | undefined;
    readonly basePath: string | undefined;
    readonly version: string | undefined;
    readonly methods: KV<ServiceMethod>;
    readonly headers: KV<any> | undefined;
    readonly params: KV<any> | undefined;
    readonly options: KV<any>;
    constructor(service: Service$1, client: Client$1, methods: KV<ServiceMethod>, options?: ServiceOptions);
    private selectTransport;
    private processClientOptions;
    protected preflight(): void;
    protected getFullPath(path: string): string;
    protected transact(method: string, path: string, transport: Transport$1, contentType: string | undefined, message: any): Promise<any>;
    toString(): string;
}

declare class ServiceProvider {
    private clients;
    private transports;
    private services;
    constructor();
    private methodsFrom;
    registerClients(clients: Client[]): void;
    registerServices(services: Service$1[]): void;
    registerTransports(transports: Transport[]): void;
    create(id: string, options?: ServiceOptions): any;
}
declare const DefaultServiceProvider: ServiceProvider;

declare class HttpClients {
    private constructor();
    static makeError(res: Response, message?: string, type?: string): InvalidCredentialsError | UnavailableError | NotFoundError | UnsupportedError | UnimplementedError | InvalidArgumentError | PermissionDeniedError | PreconditionFailedError | RateLimitedError | InternalServerError | NetworkError | TimedOutError;
}

declare class Config {
    private static config;
    private path;
    private data;
    constructor(path: string, data: any);
    static read(path: string): Promise<any>;
    static readSync(path: string): any;
    static write(path: string, data: any): Promise<void>;
    static loadConfig(path: string): Promise<Config>;
    static loadConfigSync(path: string): Config;
    static use(path?: string): void;
    static get(path: string): any;
    get(path: string): any;
    set(path: string, value: any): void;
    save(): Promise<void>;
}

export { AccessToken, ApiKey, ApiRequest, Client$1 as Client, storage as ClientStorage, Config, CredentialStore, Credentials, DatabaseError, DefaultOAuthProvider, DefaultServiceProvider, HttpClients, IPCMessage, InvalidCredentialsError, InvalidScopeError, OAuthClient, OAuthConfig, OAuthError, OAuthIssuer, OAuthOptions, OAuthProvider, storage$1 as OAuthStorage, OAuthTools, RefreshToken, Scope, Scopes, Service, ServiceMethod, ServiceOptions, ServiceProvider, Token, Transport$1 as Transport, UnauthorizedClientError, UnrecognizedIDClientError, UserDeniedError, launch };
