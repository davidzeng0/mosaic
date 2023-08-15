import { HttpContentType, URLParams } from 'js-common';

export const URLFormTransport = {
	request: HttpContentType.URLFORM,
	response: HttpContentType.URLFORM,

	encode: (message: any) => URLParams.toString(message),
	decode: (message: Buffer) => URLParams.toKV(message.toString())
};