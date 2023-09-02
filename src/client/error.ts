import { ClientError, HttpError, InternalServerError, InvalidArgumentError, NetworkError, NotFoundError, PermissionDeniedError, PreconditionFailedError, RateLimitedError, Response, ServerError, TimedOutError, UnavailableError, UnimplementedError, UnsupportedError } from 'js-common';
import { InvalidCredentialsError } from '@/oauth';

export class HttpClients{
	private constructor(){}

	static makeError(res: Response, message?: string, type?: string){
		if(type)
			message = message ? `${type}: ${message}` : type;
		if(!message)
			message = `HTTP ${res.status}: ${res.statusText}`;
		switch(res.status){
			case 400:
			case 405:
			case 413:
			case 431:
				return new InvalidArgumentError(message);
			case 401:
				return new InvalidCredentialsError(message);
			case 403:
				return new PermissionDeniedError(message);
			case 404:
				return new NotFoundError(message);
			case 412:
			case 428:
				return new PreconditionFailedError(message);
			case 418:
				return new UnsupportedError(message);
			case 429:
				return new RateLimitedError(message);
			case 500:
				return new InternalServerError(message);
			case 501:
				return new UnimplementedError(message);
			case 502:
				return new NetworkError(message);
			case 503:
				return new UnavailableError(message);
			case 504:
				return new TimedOutError(message);
			case 505:
				return new UnsupportedError(message);
		}

		if(res.status >= 400 && res.status < 500)
			throw new ClientError(message);
		else if(res.status >= 500 && res.status < 600)
			throw new ServerError(message);
		throw new HttpError(message);
	}
}