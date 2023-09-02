import { NotFoundError, ParseError, Yaml } from 'js-common';
import { readFile, writeFile } from 'fs/promises';
import { readFileSync } from 'fs';

export class Config{
	private static config: Config;

	private path;
	private data;
	constructor(path: string, data: any){
		this.path = path;
		this.data = data;
	}

	static async read(path: string){
		let contents;

		try{
			contents = await readFile(path, 'utf8');
		}catch(error){
			if((error as any).code == 'ENOENT')
				throw new NotFoundError(`File not found: ${path}`);
			throw error;
		}

		return Yaml.decode(contents);
	}

	static readSync(path: string){
		let contents;

		try{
			contents = readFileSync(path, 'utf8');
		}catch(error){
			if((error as any).code == 'ENOENT')
				throw new NotFoundError(`File not found: ${path}`);
			throw error;
		}

		return Yaml.decode(contents);
	}

	static async write(path: string, data: any){
		await writeFile(path, data === undefined ? '' : Yaml.encode(data));
	}

	static async loadConfig(path: string){
		return new Config(path, await this.read(path));
	}

	static loadConfigSync(path: string){
		return new Config(path, this.readSync(path));
	}

	static use(path?: string){
		this.config = this.loadConfigSync(path ?? 'mosaic_config.yaml');
	}

	static get(path: string){
		if(!this.config)
			this.use();
		return this.config?.get(path);
	}

	get(path: string){
		let root = this.data;
		let split = path.split('/');

		while(split.length){
			if(root === undefined)
				return undefined;
			if(typeof root != 'object' || root === null)
				throw new ParseError(`Could not read config '${path}'`);
			root = root[split.shift()!];
		}

		return root;
	}

	set(path: string, value: any){
		let root = this.data;
		let split = path.split('/');

		if(root === undefined || root === null)
			this.data = root = {};
		while(split.length > 1){
			let name = split.shift()!;

			if(root[name] === undefined || root[name] === null){
				root = root[name] = {};

				continue;
			}

			if(typeof root[name] != 'object')
				throw new ParseError(`Could not set config '${path}'`);
			root = root[name];
		}

		root[split.shift()!] = value;
	}

	save(){
		return Config.write(this.path, this.data);
	}
}