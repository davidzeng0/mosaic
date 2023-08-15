import { Request, Response, URLBuilder } from 'js-common';

export class ApiRequest extends Request{
	readonly url;

	constructor(){
		super();
		this.url = new URLBuilder();
	}

	get https(){
		return this.url.scheme == 'https';
	}

	override execute(): Promise<Response>{
		return super.execute(this.url.href);
	}
}