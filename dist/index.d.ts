import { GenericError, KV, Request, URLBuilder, Response, Payload, NotFoundError, UnsupportedError, UnimplementedError, InvalidArgumentError, PermissionDeniedError, PreconditionFailedError, RateLimitedError, InternalServerError, NetworkError, UnavailableError, TimedOutError } from 'js-common';
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
    issuer: string;
    id: string;
    type?: string;
    secret: string;
    expire?: number;
    metadata?: Metadata;
}
interface AccessToken$1 {
    issuer: string;
    id: string;
    client: string;
    type?: string;
    secret: string;
    scopes: Scopes;
    expire?: number;
    refresher?: string;
    metadata?: Metadata;
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

declare class Token extends Credentials {
    private static counter;
    static createId(): string;
    readonly type: string | undefined;
    readonly secret: string;
    readonly issuer: OAuthIssuer;
    readonly id: string;
    readonly expire: number | undefined;
    readonly metadata: Metadata | undefined;
    constructor(args: {
        issuer: OAuthIssuer;
        id?: string;
        type?: string;
        secret: string;
        expire?: number;
        metadata?: Metadata;
    });
    toString(): string;
}
declare class RefreshToken extends Token {
    constructor(args: {
        issuer: OAuthIssuer;
        id?: string;
        type?: string;
        secret: string;
        expire?: number;
        metadata?: Metadata;
    });
}
declare class AccessToken extends Token {
    readonly client: string;
    readonly scopes: Scopes;
    readonly refresher: RefreshToken | undefined;
    private refreshPromise?;
    constructor(args: {
        issuer: OAuthIssuer;
        id?: string;
        client: string;
        type?: string;
        secret: string;
        scopes: Scopes;
        expire?: number;
        refresher?: RefreshToken;
        metadata?: Metadata;
    });
    private doRefresh;
    get expired(): boolean;
    refresh(): Promise<void>;
    revoke(): Promise<void>;
    get meta(): Metadata | undefined;
}

declare function login(): Promise<AccessToken>;

declare class Store {
    private constructor();
    private static config?;
    private static saving?;
    private static queuedSave;
    private static refreshTokens;
    private static accessTokens;
    private static initialize;
    static setKey(path: string, value: any): void;
    static getKey(path: string): any;
    static add(token: AccessToken | RefreshToken): void;
    static updated(token: AccessToken | RefreshToken): void;
    static getRefreshToken(id: string): RefreshToken;
    static getAccessToken(id: string): AccessToken;
    private static saveTokens;
    private static save;
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

type index$1_AccessToken = AccessToken;
declare const index$1_AccessToken: typeof AccessToken;
declare const index$1_DefaultOAuthProvider: typeof DefaultOAuthProvider;
type index$1_IPCMessage = IPCMessage;
type index$1_InvalidCredentialsError = InvalidCredentialsError;
declare const index$1_InvalidCredentialsError: typeof InvalidCredentialsError;
type index$1_InvalidScopeError = InvalidScopeError;
declare const index$1_InvalidScopeError: typeof InvalidScopeError;
type index$1_OAuthClient = OAuthClient;
type index$1_OAuthConfig = OAuthConfig;
type index$1_OAuthError = OAuthError;
declare const index$1_OAuthError: typeof OAuthError;
type index$1_OAuthIssuer = OAuthIssuer;
declare const index$1_OAuthIssuer: typeof OAuthIssuer;
type index$1_OAuthOptions = OAuthOptions;
type index$1_OAuthProvider = OAuthProvider;
declare const index$1_OAuthProvider: typeof OAuthProvider;
type index$1_RefreshToken = RefreshToken;
declare const index$1_RefreshToken: typeof RefreshToken;
type index$1_Scope = Scope;
declare const index$1_Scopes: typeof Scopes;
type index$1_Store = Store;
declare const index$1_Store: typeof Store;
type index$1_Token = Token;
declare const index$1_Token: typeof Token;
type index$1_UnauthorizedClientError = UnauthorizedClientError;
declare const index$1_UnauthorizedClientError: typeof UnauthorizedClientError;
type index$1_UnrecognizedIDClientError = UnrecognizedIDClientError;
declare const index$1_UnrecognizedIDClientError: typeof UnrecognizedIDClientError;
type index$1_UserDeniedError = UserDeniedError;
declare const index$1_UserDeniedError: typeof UserDeniedError;
declare const index$1_launch: typeof launch;
declare const index$1_login: typeof login;
declare namespace index$1 {
  export {
    index$1_AccessToken as AccessToken,
    index$1_DefaultOAuthProvider as DefaultOAuthProvider,
    index$1_IPCMessage as IPCMessage,
    index$1_InvalidCredentialsError as InvalidCredentialsError,
    index$1_InvalidScopeError as InvalidScopeError,
    index$1_OAuthClient as OAuthClient,
    index$1_OAuthConfig as OAuthConfig,
    index$1_OAuthError as OAuthError,
    index$1_OAuthIssuer as OAuthIssuer,
    index$1_OAuthOptions as OAuthOptions,
    index$1_OAuthProvider as OAuthProvider,
    index$1_RefreshToken as RefreshToken,
    index$1_Scope as Scope,
    index$1_Scopes as Scopes,
    storage$1 as Storage,
    index$1_Store as Store,
    index$1_Token as Token,
    index$1_UnauthorizedClientError as UnauthorizedClientError,
    index$1_UnrecognizedIDClientError as UnrecognizedIDClientError,
    index$1_UserDeniedError as UserDeniedError,
    index$1_launch as launch,
    index$1_login as login,
  };
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
    constructor();
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
interface Service$1 {
    name: string;
    id: string;
    client: string;
    scopes?: Scopes;
    endpoints: ServiceEndpoint[];
    basePath?: string;
    version?: string;
    implementation?: ProtoServiceDefinition;
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
type storage_Transport = Transport;
declare namespace storage {
  export {
    storage_Client as Client,
    storage_ClientOption as ClientOption,
    Service$1 as Service,
    storage_ServiceEndpoint as ServiceEndpoint,
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

declare class HttpStatus {
    private constructor();
    static errorFrom(res: Response, message?: string, type?: string): InvalidCredentialsError | NotFoundError | UnsupportedError | UnimplementedError | InvalidArgumentError | PermissionDeniedError | PreconditionFailedError | RateLimitedError | InternalServerError | NetworkError | UnavailableError | TimedOutError;
}

type index_ApiKey = ApiKey;
declare const index_ApiKey: typeof ApiKey;
type index_ApiRequest = ApiRequest;
declare const index_ApiRequest: typeof ApiRequest;
type index_Credentials = Credentials;
declare const index_Credentials: typeof Credentials;
declare const index_DefaultServiceProvider: typeof DefaultServiceProvider;
type index_HttpStatus = HttpStatus;
declare const index_HttpStatus: typeof HttpStatus;
type index_Service = Service;
declare const index_Service: typeof Service;
type index_ServiceMethod = ServiceMethod;
type index_ServiceOptions = ServiceOptions;
type index_ServiceProvider = ServiceProvider;
declare const index_ServiceProvider: typeof ServiceProvider;
declare namespace index {
  export {
    index_ApiKey as ApiKey,
    index_ApiRequest as ApiRequest,
    Client$1 as Client,
    index_Credentials as Credentials,
    index_DefaultServiceProvider as DefaultServiceProvider,
    index_HttpStatus as HttpStatus,
    index_Service as Service,
    index_ServiceMethod as ServiceMethod,
    index_ServiceOptions as ServiceOptions,
    index_ServiceProvider as ServiceProvider,
    storage as Storage,
    Transport$1 as Transport,
  };
}

export { index as Client, index$1 as OAuth };
