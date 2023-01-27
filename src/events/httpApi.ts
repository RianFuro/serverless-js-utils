import {CfValue} from '../cf-functions.js'

export type HttpApiEvent = {
	httpApi: {
		method: string
		path: string,
		cors: boolean,
		authorizer?:
			| {type: 'AWS_IAM'}
			| {type: 'REQUEST', functionArn: CfValue}
			| {type: 'JWT', identitySource: string, issuerUrl: string, audience: string[]}
	}
} & HttpApiEventBuilder
type AuthorizerType = HttpApiEvent['httpApi']['authorizer']['type']

export function httpApiEvent(methodOrAction: string, path?: string): HttpApiEvent {
	let method
	if (path === undefined) [method, path] = methodOrAction.split(' ')
	else method = methodOrAction

	return Object.setPrototypeOf({
		httpApi: {
			method,
			path,
			cors: true
		}
	}, eventPrototype)
}

export type HttpApiEventBuilder = {
	configure(config: Partial<HttpApiEvent['httpApi']>): HttpApiEvent
	readonly authorizer: {
		(type: AuthorizerType, data?: any): HttpApiEvent
		request(functionArn: CfValue): HttpApiEvent
		iam(): HttpApiEvent
		jwt(identitySource: string, issuerUrl: string, audience: string[]): HttpApiEvent
	}
}
const eventPrototype = Object.create(Object, {
	configure: {
		value(this: HttpApiEvent, config: Partial<HttpApiEvent['httpApi']>): HttpApiEvent {
			Object.assign(this.httpApi, config)
			return this
		}
	},

	authorizer: {
		get(this: HttpApiEvent) {
			const setAuthorizer = (type: AuthorizerType, data?: any) => this.configure({authorizer: {type, ...data}})
			return Object.assign(
				setAuthorizer,
				{
					iam: () => setAuthorizer('AWS_IAM'),
					jwt: (identitySource: string, issuerUrl: string, audience: string[]) => setAuthorizer('JWT', {identitySource, issuerUrl, audience}),
					request: (functionArn: CfValue) => setAuthorizer('REQUEST', {functionArn})
				})
		}
	}
})
