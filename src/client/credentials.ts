export class Credentials{}

export class ApiKey extends Credentials{
	readonly key;

	constructor(key: string){
		super();

		this.key = key;
	}
}