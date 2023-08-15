import { HttpContentType, Payload } from 'js-common';
import { BinaryTransport } from './transport/binary';
import { JSONTransport } from './transport/json';
import { URLFormTransport } from './transport/urlform';

export interface Transport{
	readonly request?: string; /* request content type */
	readonly response?: string; /* response content type */

	encode(message: any): Payload; /* encode request */
	decode(message: Buffer): any; /* decode response */
}

export const Transport = {
	from(type: string): Transport | undefined{
		switch(type){
			case HttpContentType.JSON:
				return JSONTransport;
			case HttpContentType.URLFORM:
				return URLFormTransport;
			case HttpContentType.OCTET_STREAM:
				return BinaryTransport;
		}

		return undefined;
	}
};