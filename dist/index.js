'use strict';

var jsCommon = require('js-common');
var descriptor = require('protobuf-ts/protos/google/protobuf/descriptor');
var annotations = require('protobuf-ts/protos/google/api/annotations');
var _case = require('case');
var mongodb = require('mongodb');
var child_process = require('child_process');
var helpers = require('yargs/helpers');
var yargs = require('yargs');
var promises = require('fs/promises');
var fs = require('fs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var yargs__default = /*#__PURE__*/_interopDefault(yargs);

var __require=(x=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(x,{get:(a,b)=>(typeof require<"u"?require:a)[b]}):x)(function(x){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+x+'" is not supported')});function setKV(kv,from){if(!from)return kv;if(!kv)return from;for(let[key,value]of jsCommon.KV.entries(from))kv[key]=value;return kv}function setKVone(kv,key,value){return kv||(kv={}),kv[key]=value,kv}var Service=class{name;id;client;scopes;host;transport;basePath;version;methods;headers;params;options;constructor(service,client,methods,options){this.name=service.name,this.id=service.id,this.client=client,this.options={},service.scopes&&(this.scopes=service.scopes),service.basePath&&(this.basePath=service.basePath),service.version&&(this.version=service.version),this.methods=methods,options?.credentials&&(this.options.credentials=options.credentials);let headers=options?.headers,params=options?.params,{endpoint,transport}=this.selectTransport(service,options);if(this.host=endpoint?.host,this.transport=transport,headers=setKV(headers,endpoint.headers),params=setKV(params,endpoint.params),options?.clientOptions){let clientOpts=this.processClientOptions(options.clientOptions);headers=setKV(headers,clientOpts.headers),params=setKV(params,clientOpts.params),this.options=setKV(this.options,clientOpts.options);}this.headers=headers,this.params=params;}selectTransport(service,options){let endpoint,transport;if(options?.host&&(endpoint=service.endpoints.find(endpoint2=>endpoint2.host==options.host),!endpoint))throw new jsCommon.InvalidArgumentError(`Service endpoint '${options.host}' does not exist`);if(options?.transport){if(!service.endpoints.length)throw new jsCommon.InvalidArgumentError(`Cannot set transport '${options.transport}' without an endpoint`);if(endpoint){if(!endpoint.transport.includes(options.transport))throw new jsCommon.InvalidArgumentError(`Transport '${options.transport}' not supported, options are: ${endpoint.transport.join(", ")}`)}else if(endpoint=service.endpoints.find(endpoint2=>endpoint2.transport.includes(options.transport)),!endpoint)throw new jsCommon.InvalidArgumentError(`Transport '${options.transport}' not supported by any endpoint`);transport=options.transport;}return endpoint||(endpoint=service.endpoints[0]),endpoint&&!transport&&(transport=endpoint.transport[0]),{endpoint,transport}}processClientOptions(clientOptions){let headers,params,options;for(let key in clientOptions){if(!this.client.options||!(key in this.client.options))throw new jsCommon.InvalidArgumentError(`Client option '${key}' not found`);let option=this.client.options[key],value=clientOptions[key];if(option.enum&&!option.enum.includes(value))throw new jsCommon.InvalidArgumentError(`Client option '${key}' must be one of [${option.enum.join(", ")}], got '${value}'`);option.header?headers=setKVone(headers,option.header,value):option.query?params=setKVone(params,option.query,value):options=setKVone(options,key,value);}return {headers,params,options}}preflight(){if(!this.host)throw new jsCommon.InvalidArgumentError(`Service '${this}' cannot be used without a valid host`);if(!this.transport)throw new jsCommon.InvalidArgumentError(`Service '${this}' cannot be used without a valid transport`)}getFullPath(path){let fullPath=[];return this.basePath&&fullPath.push(this.basePath),this.version&&fullPath.push(this.version),fullPath.push(path),fullPath.join("/")}async transact(method,path,transport,contentType,message){let request=new ApiRequest;request.setMethod(method),request.url.setHost(this.host),request.url.setPath(path),this.params&&request.url.setParams(this.params),request.setHeader(jsCommon.HttpHeader.CONTENT_TYPE,contentType),this.headers&&request.setHeaders(this.headers);try{request.body=transport.encode(message);}catch(e){throw e instanceof jsCommon.GenericError?e:new jsCommon.SerializeError(e)}let response=await this.client.request(request,this.options);if(transport.response!==void 0){let type=response.headers.get(jsCommon.HttpHeader.CONTENT_TYPE);if(!type||type!==transport.response&&!jsCommon.Mime.typeEquals(type,transport.response))throw new jsCommon.ApiError(`Expected content type '${transport.response}' but got '${type}'`)}try{return transport.decode(response.body)}catch(e){throw e instanceof jsCommon.GenericError?e:new jsCommon.ParseError(e)}}toString(){return this.id}};var Client2=class{name;id;options;xssi;constructor(client){this.name=client.name,this.id=client.id,this.options=client.options,this.xssi=client.xssi;}request(request,options){throw new jsCommon.UnimplementedError}};function transportFrom(method){let transport={};return transport[jsCommon.HttpContentType.PROTOBUF]={request:jsCommon.HttpContentType.PROTOBUF,response:jsCommon.HttpContentType.PROTOBUF,encode:message=>method.requestType.encode(message).finish(),decode:message=>method.responseType.decode(message)},transport[jsCommon.HttpContentType.PROTOBUFFER]={request:jsCommon.HttpContentType.PROTOBUFFER,response:jsCommon.HttpContentType.PROTOBUFFER,encode:message=>method.requestType.encode(message).finish(),decode:message=>method.responseType.decode(message)},transport[jsCommon.HttpContentType.JSON]={request:jsCommon.HttpContentType.JSON,response:jsCommon.HttpContentType.JSON,encode:message=>jsCommon.Json.encode(method.requestType.toJSON(message)),decode:message=>method.responseType.fromJSON(jsCommon.Json.decode(message))},transport}var ProtoServiceDefinition=class{constructor(){}static methodsFrom(definition){let methods={};for(let methodName in definition.methods){let method=definition.methods[methodName],httpRule=descriptor.MethodOptions.getExtension(method.options,annotations.http);if(!httpRule)throw new jsCommon.UnsupportedError(`Service method ${method.name} has no 'httpRule'`);let serviceMethod={name:method.name,scopes:[],transport:transportFrom(method)};httpRule.get?(serviceMethod.method=jsCommon.HttpMethod.GET,serviceMethod.path=httpRule.get):httpRule.put?(serviceMethod.method=jsCommon.HttpMethod.PUT,serviceMethod.path=httpRule.put):httpRule.post?(serviceMethod.method=jsCommon.HttpMethod.POST,serviceMethod.path=httpRule.post):httpRule.delete?(serviceMethod.method=jsCommon.HttpMethod.DELETE,serviceMethod.path=httpRule.delete):httpRule.patch?(serviceMethod.method=jsCommon.HttpMethod.PATCH,serviceMethod.path=httpRule.patch):httpRule.custom&&(serviceMethod.method=httpRule.custom.kind,serviceMethod.path=httpRule.custom.path),methods[methodName]=serviceMethod;}return methods}};var ServiceFactory=class{static installMethod(service,prototype,name,method){prototype[name]=function(message){this.preflight();let methodName=`${service.id}->${method.name}`,path=method.path;if(path.startsWith("/")&&(path=path.substring(1)),!method.transport)throw new jsCommon.UnsupportedError(`Service method '${methodName}' has no transport`);let transport=method.transport[this.transport];if(!transport)throw new jsCommon.UnsupportedError(`Service method '${methodName}' has no transport '${this.transport}'`);let scopes=method.scopes;this.scopes&&(scopes?scopes=scopes.concat(this.scopes):scopes=this.scopes);let transact=this.transact.bind(this,method.method,this.getFullPath(path),transport,transport.request??this.transport);return prototype[name]=transact,transact(message)};}static create(service,methods){let impl=class extends Service{},prototype=impl.prototype;for(let[name,method]of jsCommon.KV.entries(methods))this.installMethod(service,prototype,name,method);return impl}};var ServiceProvider=class{clients;transports;services;constructor(){this.clients=new Map,this.transports=new Map,this.services=new Map;}methodsFrom(methods){let out={};for(let method of methods){let name=_case.camel(method.name),transport={};for(let type of method.transport){let impl=this.transports.get(type);impl||(impl=Transport2.from(type)),impl&&(transport[type]=impl);}out[name]={name:method.name,scopes:method.scopes,path:method.path,method:method.method,body:method.body,transport};}return out}registerClients(clients){for(let client of clients){let ctor=client.implementation??Client2;delete client.implementation;let instance=new ctor(client);this.clients.set(instance.id,instance);}}registerServices(services){for(let service of services){let methods={};if(service.implementation){if(service.methods)throw new jsCommon.InvalidArgumentError("Service cannot have both 'implementation' and 'methods'");let definition=service.implementation;definition.protoOverREST?methods=ProtoServiceDefinition.methodsFrom(definition.protoOverREST):definition.gRPC&&(methods=ProtoServiceDefinition.methodsFrom(definition.gRPC)),delete service.implementation;}else service.methods&&(methods=this.methodsFrom(service.methods));this.services.set(service.id,{definition:service,methods,implementation:ServiceFactory.create(service,methods)});}}registerTransports(transports){for(let transport of transports)this.transports.set(transport.id,transport.implementation);}create(id,options){let service=this.services.get(id);if(!service)throw new jsCommon.NotFoundError(`Service '${id}' not found`);let client=this.clients.get(service.definition.client);if(!client)throw new jsCommon.NotFoundError(`Client '${service.definition.client}' not found`);return new service.implementation(service.definition,client,service.methods,options)}},DefaultServiceProvider=new ServiceProvider;var Scopes={parse(scopes){return scopes.split(" ")},stringify(scopes){return scopes.join(" ")}},OAuthError=class extends jsCommon.GenericError{constructor(arg,defaultSimpleMessage="Error authenticating with service"){super(arg??"Generic OAuth error",defaultSimpleMessage);}},InvalidCredentialsError=class extends OAuthError{constructor(arg){super(arg??"Invalid credentials");}},UserDeniedError=class extends OAuthError{constructor(arg){super(arg??"Authentication rejected by user");}},UnrecognizedIDClientError=class extends OAuthError{constructor(arg){super(arg??"Unrecognized client id");}},UnauthorizedClientError=class extends OAuthError{constructor(arg){super(arg??"Unauthorized client");}},InvalidScopeError=class extends OAuthError{constructor(arg){super(arg??"Invalid scope");}};var OAuthIssuer=class{name;id;constructor(name,id){this.name=name,this.id=id;}toString(token){return token.type?`${token.type} ${token.secret}`:token.secret}};var Credentials2=class{},ApiKey=class extends Credentials2{key;constructor(key){super(),this.key=key;}};var Token=class extends Credentials2{id;issuer;expire;type;secret;metadata;constructor(args){super(),this.id=args.id,this.issuer=args.issuer,this.expire=args.expire,this.type=args.type,this.secret=args.secret,this.metadata=args.metadata;}get expired(){return this.expire===void 0?!1:Date.now()>this.expire*1e3}toString(){return this.issuer.toString(this)}},RefreshToken=class extends Token{constructor(args){super(args);}},AccessToken=class extends Token{client;scopes;refresher;refreshPromise;constructor(args){super(args),this.client=args.client,this.scopes=args.scopes,this.refresher=args.refresher;}assignToken(token){this.expire=token.expire,this.type=token.type,this.secret=token.secret,this.scopes=token.scopes,this.metadata=token.metadata;}async doRefresh(){if(!this.id)return this.assignToken(await this.issuer.refresh(this,this.refresher));await CredentialStore.synchronized(this,async token=>{token&&token.secret!=this.secret?this.assignToken(token):this.assignToken(await this.issuer.refresh(this,this.refresher));});}refresh(){if(!this.refresher)throw new InvalidCredentialsError("No refresh token");return this.refreshPromise||(this.refreshPromise=this.doRefresh(),this.refreshPromise.finally(()=>{this.refreshPromise=void 0;})),this.refreshPromise}revoke(){return this.issuer.revoke(this)}get meta(){return this.metadata??this.refresher?.metadata}};var DatabaseError=class extends jsCommon.GenericError{constructor(arg){super(arg,"Database error");}};function tokenToJson(token){let json={id:token.id,issuer:token.issuer.id,type:token.type,secret:token.secret,expire:token.expire,metadata:token.metadata};return token instanceof AccessToken&&(json.client=token.client,json.scopes=token.scopes,json.refresher=token.refresher?.id),json}function createRefreshToken(token){return new RefreshToken({id:token.id,issuer:DefaultOAuthProvider.getIssuer(token.issuer),type:token.type,secret:token.secret,expire:token.expire,metadata:token.metadata})}function createAccessToken(token,refresher){return new AccessToken({id:token.id,issuer:DefaultOAuthProvider.getIssuer(token.issuer),type:token.type,secret:token.secret,expire:token.expire,metadata:token.metadata,client:token.client,scopes:token.scopes,refresher})}var StorageMedium=class{},MemoryStorageMedium=class extends StorageMedium{keys=new Map;refreshTokens=new Map;accessTokens=new Map;locks=new Map;setKey(key,value){this.keys.set(key,value);}getKey(key){return this.keys.get(key)}deleteKey(key){this.keys.delete(key);}addToken(token){token instanceof AccessToken?this.accessTokens.set(token.id,token):this.refreshTokens.set(token.id,token);}updateToken(token){}deleteToken(token){token instanceof AccessToken?this.accessTokens.delete(token.id):this.refreshTokens.delete(token.id);}getRefreshToken(id){return this.refreshTokens.get(id)}getAccessToken(id){return this.accessTokens.get(id)}async synchronized(access,callback){let lockSuccess=!1,lockId=new mongodb.ObjectId().toHexString(),now,token;for(let i=0;i<15&&(now=Date.now(),token=this.accessTokens.get(access.id),!(!token||token.secret!=access.secret));i++){let lock=this.locks.get(access.id);if(!lock||lock.date<=now-2e4){lock={id:lockId,date:now},this.locks.set(access.id,lock),lockSuccess=!0;break}await jsCommon.Promises.resolveAfter(2e3);}let error;try{await callback(token);}catch(e){error=e;}if(lockSuccess||!token){let lock=this.locks.get(access.id),holding=lock?.id==lockId;(holding||!lock)&&(holding&&this.locks.delete(access.id),this.accessTokens.set(access.id,access));}if(error)throw error}listAllKeys(){return this.keys}listAllRefreshTokens(){return Array.from(this.refreshTokens.values()).map(token=>tokenToJson(token))}listAllAccessTokens(){return Array.from(this.accessTokens.values()).map(token=>tokenToJson(token))}},DatabaseStorageMedium=class extends StorageMedium{url;db;client;keys;refreshTokens;accessTokens;ready;shouldClose=!1;operations=0;closeTimeout;constructor(url,db){super(),this.url=url,this.db=db,this.closeTimeout=new jsCommon.Timer({initialTimeout:1e4},()=>this.destroy());}createIndex(collection,fields){let promises=[];for(let[key,value]of jsCommon.KV.entries(fields)){let options;typeof value=="object"&&(value.unique&&(options={unique:!0}),value=value.direction),promises.push(collection.createIndex({[key]:value},options));}return Promise.all(promises)}async initialize(){this.client=new mongodb.MongoClient(this.url);try{await this.client.connect();}catch(e){throw this.close(),new jsCommon.UnavailableError(e)}let db=this.client.db(this.db);this.keys=db.collection("keys"),this.refreshTokens=db.collection("refreshTokens"),this.accessTokens=db.collection("accessTokens");try{await Promise.all([this.createIndex(this.keys,{key:{direction:1,unique:!0}}),this.createIndex(this.refreshTokens,{id:{direction:1,unique:!0}}),this.createIndex(this.accessTokens,{id:{direction:1,unique:!0},refresher:1})]);}catch(e){throw this.close(),new DatabaseError(e)}this.closeTimeout.start();}close(){this.ready=void 0,this.shouldClose=!1,this.closeTimeout.stop(),this.client.close();}destroy(){this.operations?this.shouldClose=!0:this.close();}async setup(){return this.ready?(this.closeTimeout.start(),this.shouldClose=!1):this.ready=this.initialize(),this.ready}runDbOp(fn){this.operations++;let promise=this.setup().then(fn).catch(e=>{throw new DatabaseError(e)});return promise.catch(e=>{console.error(`Database operation failed: ${e.stack??e.message}`);}).finally(()=>{this.operations--,!this.operations&&this.shouldClose&&this.close();}),promise}setKey(key,value){return this.runDbOp(()=>this.keys.updateOne({key},{$set:{key,value}},{upsert:!0}))}getKey(key){return this.runDbOp(async()=>(await this.keys.findOne({key}))?.value)}deleteKey(key){return this.runDbOp(()=>this.keys.deleteOne({key}))}addToken(token){let json=tokenToJson(token);return this.runDbOp(()=>(token instanceof AccessToken?this.accessTokens:this.refreshTokens).insertOne(json))}updateToken(token){let json=tokenToJson(token);return this.runDbOp(()=>(token instanceof AccessToken?this.accessTokens:this.refreshTokens).updateOne({id:json.id},{$set:json}))}deleteToken(token){return this.runDbOp(()=>(token instanceof AccessToken?this.accessTokens:this.refreshTokens).deleteOne({id:token.id}))}getRefreshToken(id){return this.runDbOp(async()=>{let token=await this.refreshTokens.findOne({id});if(token)return createRefreshToken(token)})}getAccessToken(id){return this.runDbOp(async()=>{let token=await this.accessTokens.findOne({id});if(!token)return;let refresher;return token.refresher&&(refresher=await this.getRefreshToken(token.refresher)),createAccessToken(token,refresher)})}async synchronized(token,callback){await this.setup();let lockSuccess=!1,lockId=new mongodb.ObjectId,now,dbToken;for(let i=0;i<15;i++){now=Date.now();try{if((await this.accessTokens.updateOne({id:token.id,secret:token.secret,$or:[{lockDate:{$lte:now-2e4}},{lockId:null}]},{$set:{lockId,lockDate:now}})).matchedCount){lockSuccess=!0;break}let doc=await this.accessTokens.findOne({id:token.id});if(!doc||(dbToken=createAccessToken(doc),dbToken.secret!=token.secret))break;await jsCommon.Promises.resolveAfter(2e3);}catch(e){console.error(`Failed to acquire lock: ${e.stack??e.message}`);break}}let error;try{await callback(dbToken);}catch(e){error=e;}if(lockSuccess||!dbToken){let query;lockSuccess?query={lockId,lockDate:now}:query={lockId:null,lockDate:null};try{await this.accessTokens.updateOne({id:token.id,...query},{$set:{...tokenToJson(token),lockDate:void 0,lockId:void 0}});}catch(e){console.error(`Failed to release lock: ${e.stack??e.message}`);}}if(error)throw error}listAllKeys(){return this.runDbOp(async()=>{let kvs=await this.keys.find().toArray(),map=new Map;for(let kv of kvs)map.set(kv.key,kv.value);return map})}listAllRefreshTokens(){return this.runDbOp(()=>this.refreshTokens.find().toArray())}listAllAccessTokens(){return this.runDbOp(()=>this.accessTokens.find().toArray())}},FileStorageMedium=class extends MemoryStorageMedium{config;saving;queuedSave=!1;constructor(filename){super();try{this.config=Config.loadConfigSync(filename);}catch(e){if(!(e instanceof jsCommon.NotFoundError))throw e;this.config=new Config(filename,{});}let keys=this.config.get("keys");keys&&(this.keys=jsCommon.KV.toMap(keys)),this.loadTokens(this.refreshTokens,!0),this.loadTokens(this.accessTokens,!1);}loadTokens(map,refresh){let tokens=this.config.get(refresh?"refreshTokens":"accessTokens");if(tokens)for(let storageToken of tokens){let refresher;storageToken.refresher&&(refresher=this.refreshTokens.get(storageToken.refresher));let token=refresh?createRefreshToken(storageToken):createAccessToken(storageToken,refresher);map.set(token.id,token);}}saveImpl(){let refresh=[],access=[];for(let[_,token]of this.refreshTokens)refresh.push(tokenToJson(token));for(let[_,token]of this.accessTokens)access.push(tokenToJson(token));return this.config.set("keys",jsCommon.KV.fromMap(this.keys)),this.config.set("refreshTokens",refresh),this.config.set("accessTokens",access),this.config.save()}async save(){if(this.saving){this.queuedSave=!0;return}do{this.queuedSave=!1,this.saving=this.saveImpl();try{await this.saving;}catch(e){console.error(`Failed to save credentials: ${e.stack??e.message}`);}}while(this.queuedSave);this.saving=void 0;}setKey(key,value){super.setKey(key,value),this.save();}getKey(key){return super.getKey(key)}deleteKey(key){super.deleteKey(key);}addToken(token){super.addToken(token),this.save();}updateToken(token){super.updateToken(token),this.save();}deleteToken(token){super.deleteToken(token),this.save();}getRefreshToken(id){return super.getRefreshToken(id)}getAccessToken(id){return super.getAccessToken(id)}},CredentialStore=class{static DatabaseStorageMedium=DatabaseStorageMedium;static medium;constructor(){}static initialize(){if(this.medium)return;let url=Config.get("mongodb/url"),dbName=Config.get("credentials/database");if(url&&dbName){this.medium=new DatabaseStorageMedium(url,dbName);return}let file=Config.get("credentials/file");if(file){this.medium=new FileStorageMedium(file);return}console.warn("No database to store credentials, using memory"),this.medium=new MemoryStorageMedium;}static setKey(key,value){return this.initialize(),this.medium.setKey(key,value)}static getKey(key){return this.initialize(),this.medium.getKey(key)}static deleteKey(key){return this.initialize(),this.medium.deleteKey(key)}static addToken(token){let promise=(async()=>{if(this.initialize(),token.id)throw new jsCommon.ExistsError("Token already added");token.id=new mongodb.ObjectId().toHexString(),token instanceof AccessToken&&token.refresher&&!token.refresher.id&&await this.addToken(token.refresher),await this.medium.addToken(token);})();return promise.catch(()=>{}),promise}static updateToken(token){if(this.initialize(),!token.id)throw new jsCommon.NotFoundError("Token not added");return this.medium.updateToken(token)}static deleteToken(token){return (async()=>{if(this.initialize(),!token.id)throw new jsCommon.NotFoundError("Token not added");await this.medium.deleteToken(token),token.id=void 0;})()}static async getRefreshToken(id){this.initialize();let token=await this.medium.getRefreshToken(id);if(!token)throw new jsCommon.NotFoundError(`Refresh token with id '${id}' not found`);return token}static async getAccessToken(id){this.initialize();let token=await this.medium.getAccessToken(id);if(!token)throw new jsCommon.NotFoundError(`Access token with id '${id}' not found`);return token}static synchronized(token,callback){if(!token.id)throw new jsCommon.NotFoundError("Token not added");return this.initialize(),this.medium.synchronized(token,callback)}};var OAuthProvider=class{issuers;clients;constructor(){this.issuers=new Map,this.clients=new Map;}registerIssuers(issuers){for(let issuer of issuers){let impl=issuer.implementation,instance=new impl(issuer.name,issuer.id);this.issuers.set(instance.id,instance);}}registerClients(clients){for(let client of clients)this.clients.set(client.id,client);}getIssuer(id){let issuer=this.issuers.get(id);if(!issuer)throw new jsCommon.NotFoundError(`Issuer '${id}' not found`);return issuer}getClient(id){let client=this.clients.get(id);if(!client)throw new jsCommon.NotFoundError(`Client '${id}' not found`);return client}},DefaultOAuthProvider=new OAuthProvider;var electron=__require("electron");function launch(path,options){let child=child_process.spawn(electron,[path],{stdio:["ipc",process.stdin,process.stdout]}),output=[],terminated=!1,message=message2=>{switch(message2.event){case"ready":options&&child.send({event:"options",data:options}),child.send({event:"start"});break;case"output":output.push(message2.data);break}},signalHandler=signal=>{terminated=!0,child.killed||child.kill(signal);},sigintHandler=signalHandler.bind("SIGINT"),sigtermHandler=signalHandler.bind("SIGTERM");return process.on("SIGINT",sigintHandler),process.on("SIGTERM",sigtermHandler),new Promise((resolve,reject)=>{let close=(code,signal)=>{process.off("SIGINT",sigintHandler),process.off("SIGTERM",sigtermHandler),!terminated&&(code===0?resolve(output):reject(code!==null?new jsCommon.GenericError(`Child process exited with code ${code}`):new jsCommon.GenericError(`Child process exited with signal ${signal}`)));};child.on("message",message),child.on("close",close);})}var OAuthTools=class{static optionsFromCmdLine(){let args=yargs__default.default(helpers.hideBin(process.argv)).parseSync(),client=args._.join(" "),scopes=args.scope;return typeof scopes=="string"&&(scopes=[scopes]),Config.use(args.config),delete args.$0,delete args._,delete args.scope,delete args.config,{client,scopes,args}}static async login(options=this.optionsFromCmdLine()){let{scopes,args}=options,client=DefaultOAuthProvider.getClient(options.client),token=await DefaultOAuthProvider.getIssuer(client.config.issuer).perform(client,scopes,args);return await CredentialStore.addToken(token),token}};var storage_exports={};var HttpClients=class{constructor(){}static makeError(res,message,type){switch(type&&(message=message?`${type}: ${message}`:type),message||(message=`HTTP ${res.status}: ${res.statusText}`),res.status){case 400:case 405:case 413:case 431:return new jsCommon.InvalidArgumentError(message);case 401:return new InvalidCredentialsError(message);case 403:return new jsCommon.PermissionDeniedError(message);case 404:return new jsCommon.NotFoundError(message);case 412:case 428:return new jsCommon.PreconditionFailedError(message);case 418:return new jsCommon.UnsupportedError(message);case 429:return new jsCommon.RateLimitedError(message);case 500:return new jsCommon.InternalServerError(message);case 501:return new jsCommon.UnimplementedError(message);case 502:return new jsCommon.NetworkError(message);case 503:return new jsCommon.UnavailableError(message);case 504:return new jsCommon.TimedOutError(message);case 505:return new jsCommon.UnsupportedError(message)}throw res.status>=400&&res.status<500?new jsCommon.ClientError(message):res.status>=500&&res.status<600?new jsCommon.ServerError(message):new jsCommon.HttpError(message)}};var BinaryTransport={request:jsCommon.HttpContentType.OCTET_STREAM,response:jsCommon.HttpContentType.OCTET_STREAM,encode:message=>message,decode:message=>message};var JSONTransport={request:jsCommon.HttpContentType.JSON,response:jsCommon.HttpContentType.JSON,encode:message=>jsCommon.Json.encode(message),decode:message=>jsCommon.Json.decode(message)};var URLFormTransport={request:jsCommon.HttpContentType.URLFORM,response:jsCommon.HttpContentType.URLFORM,encode:message=>jsCommon.URLParams.toString(message),decode:message=>jsCommon.URLParams.toKV(message.toString())};var Transport2={from(type){switch(type){case jsCommon.HttpContentType.JSON:return JSONTransport;case jsCommon.HttpContentType.URLFORM:return URLFormTransport;case jsCommon.HttpContentType.OCTET_STREAM:return BinaryTransport}}};var ApiRequest=class extends jsCommon.Request{url;constructor(url){super(),this.url=new jsCommon.URLBuilder(url);}get https(){return this.url.scheme=="https"}execute(){return super.execute(this.url.href)}};var storage_exports2={};var Config=class _Config{static config;path;data;constructor(path,data){this.path=path,this.data=data;}static async read(path){let contents;try{contents=await promises.readFile(path,"utf8");}catch(error){throw error.code=="ENOENT"?new jsCommon.NotFoundError(`File not found: ${path}`):error}return jsCommon.Yaml.decode(contents)}static readSync(path){let contents;try{contents=fs.readFileSync(path,"utf8");}catch(error){throw error.code=="ENOENT"?new jsCommon.NotFoundError(`File not found: ${path}`):error}return jsCommon.Yaml.decode(contents)}static async write(path,data){await promises.writeFile(path,data===void 0?"":jsCommon.Yaml.encode(data));}static async loadConfig(path){return new _Config(path,await this.read(path))}static loadConfigSync(path){return new _Config(path,this.readSync(path))}static use(path){this.config=this.loadConfigSync(path??"mosaic_config.yaml");}static get(path){return this.config||this.use(),this.config?.get(path)}get(path){let root=this.data,split=path.split("/");for(;split.length;){if(root===void 0)return;if(typeof root!="object"||root===null)throw new jsCommon.ParseError(`Could not read config '${path}'`);root=root[split.shift()];}return root}set(path,value){let root=this.data,split=path.split("/");for(root==null&&(this.data=root={});split.length>1;){let name=split.shift();if(root[name]===void 0||root[name]===null){root=root[name]={};continue}if(typeof root[name]!="object")throw new jsCommon.ParseError(`Could not set config '${path}'`);root=root[name];}root[split.shift()]=value;}save(){return _Config.write(this.path,this.data)}};

exports.AccessToken = AccessToken;
exports.ApiKey = ApiKey;
exports.ApiRequest = ApiRequest;
exports.Client = Client2;
exports.ClientStorage = storage_exports2;
exports.Config = Config;
exports.CredentialStore = CredentialStore;
exports.Credentials = Credentials2;
exports.DatabaseError = DatabaseError;
exports.DefaultOAuthProvider = DefaultOAuthProvider;
exports.DefaultServiceProvider = DefaultServiceProvider;
exports.HttpClients = HttpClients;
exports.InvalidCredentialsError = InvalidCredentialsError;
exports.InvalidScopeError = InvalidScopeError;
exports.OAuthError = OAuthError;
exports.OAuthIssuer = OAuthIssuer;
exports.OAuthProvider = OAuthProvider;
exports.OAuthStorage = storage_exports;
exports.OAuthTools = OAuthTools;
exports.RefreshToken = RefreshToken;
exports.Scopes = Scopes;
exports.Service = Service;
exports.ServiceProvider = ServiceProvider;
exports.Token = Token;
exports.Transport = Transport2;
exports.UnauthorizedClientError = UnauthorizedClientError;
exports.UnrecognizedIDClientError = UnrecognizedIDClientError;
exports.UserDeniedError = UserDeniedError;
exports.launch = launch;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.js.map