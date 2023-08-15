import { HttpContentType } from 'js-common';

export const BinaryTransport = {
	request: HttpContentType.OCTET_STREAM,
	response: HttpContentType.OCTET_STREAM,

	encode: (message: any) => message,
	decode: (message: Buffer) => message
};