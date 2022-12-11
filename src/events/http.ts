import {CfValue} from '../cf-functions.js'

export const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const
export type HttpMethod = typeof httpMethods[number]
export type AuthorizerType = 'TOKEN' | 'COGNITO_USER_POOLS' | 'REQUEST' | 'AWS_IAM'

export type HttpEvent = {
	http: {
		method: HttpMethod
		path: string
		cors: boolean
		authorizer?: {type: AuthorizerType; authorizerId?: CfValue}
	}
} & HttpEventBuilder

type HttpEventFactory = {
	(action: `${HttpMethod} ${string}`): HttpEvent
	(method: HttpMethod, path: string): HttpEvent
} & {
	[key in Lowercase<HttpMethod>]: (path: string) => HttpEvent
}
export const httpEvent: HttpEventFactory = Object.assign(
	function (methodOrAction: string, path?: string): HttpEvent {
		let method
		if (path === undefined) {
			[method, path] = methodOrAction.split(' ')
		} else {
			method = methodOrAction
		}

		return Object.setPrototypeOf({
			http: {
				method,
				path,
				cors: true
			},
		}, eventPrototype)
	},
	makeHelperMethods())

function makeHelperMethods(): Record<Lowercase<HttpMethod>, (path: string) => HttpEvent> {
	return httpMethods.reduce((acc, method) => {
		acc[method.toLowerCase()] = (path: string) => httpEvent(method, path)
		return acc;
	}, {} as Record<Lowercase<HttpMethod>, (path: string) => HttpEvent>)
}

type HttpEventConfiguration = Omit<HttpEvent['http'], 'method' | 'path'>
type HttpEventBuilder = {
	configure(config: Partial<HttpEventConfiguration>): HttpEvent
	readonly authorizer: {
		(type: AuthorizerType, authorizerId?: CfValue): HttpEvent
		token(authorizerId: CfValue): HttpEvent
		iam(): HttpEvent
		userPool(authorizerId: CfValue): HttpEvent
	}
}
const eventPrototype = Object.create(Object, {
	configure: {
		value: function (this: HttpEvent, config: Partial<HttpEventConfiguration>): HttpEvent {
			Object.assign(this.http, config)
			return this
		}
	},

	authorizer: {
		get(this: HttpEvent) {
			const setAuthorizer = (type: AuthorizerType, authorizerId?: CfValue) => this.configure({authorizer: {type, ...authorizerId && {authorizerId}}})
			return Object.assign(
				setAuthorizer,
				{
					token: (authorizerId: CfValue) => setAuthorizer('TOKEN', authorizerId),
					iam: () => setAuthorizer('AWS_IAM'),
					userPool: (authorizerId: CfValue) => setAuthorizer('COGNITO_USER_POOLS', authorizerId)
				})
		}
	}
})