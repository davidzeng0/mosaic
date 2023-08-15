import { HttpContentType, Json } from 'js-common';

export const JSONTransport = {
	request: HttpContentType.JSON,
	response: HttpContentType.JSON,

	encode: (message: any) => Json.encode(message),
	decode: (message: Buffer) => Json.decode(message)
};