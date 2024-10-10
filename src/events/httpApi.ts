import {CfValue} from '../cf-functions.js'

export type HttpApiEvent = HttpApiEventDefinition | HttpApiEventWildcard
type HttpApiEventDefinition = {
	httpApi: {
		method: string
		path: string,
		cors: boolean,
		authorizer?:
			| { type: 'aws_iam' }
			| { type: 'request', functionArn: CfValue }
			| { type: 'jwt', identitySource: string, issuerUrl: string, audience: string[] }
	}
}
type HttpApiEventWildcard = { httpApi: '*' }
type AuthorizerType = HttpApiEventDefinition['httpApi']['authorizer']['type']

export function httpApiEvent(methodOrAction: '*'): HttpApiEventBuilder<HttpApiEventWildcard>
export function httpApiEvent(methodOrAction: string, path?: string): HttpApiEventBuilder<HttpApiEventDefinition>
export function httpApiEvent(methodOrAction: string, path?: string): HttpApiEventBuilder<HttpApiEvent> {
	if (methodOrAction === '*') return Object.setPrototypeOf({ httpApi: '*' }, eventPrototype)

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

export type HttpApiEventBuilder<T extends HttpApiEvent> = {
	configure(config: Partial<HttpApiEventDefinition['httpApi']>): HttpApiEventBuilder<T>
	readonly authorizer: {
		(type: AuthorizerType, data?: any): HttpApiEventBuilder<T>
		request(functionArn: CfValue): HttpApiEventBuilder<T>
		iam(): HttpApiEventBuilder<T>
		jwt(identitySource: string, issuerUrl: string, audience: string[]): HttpApiEventBuilder<T>
	}
} & T
const eventPrototype = Object.create(Object, {
	configure: {
		value(this: HttpApiEventBuilder<HttpApiEvent>, config: Partial<HttpApiEventDefinition['httpApi']>): HttpApiEventBuilder<HttpApiEventDefinition> {
			Object.assign(this.httpApi, config)
			return this as HttpApiEventBuilder<HttpApiEventDefinition>
		}
	},

	authorizer: {
		get(this: HttpApiEventBuilder<HttpApiEvent>) {
			const setAuthorizer = (type: AuthorizerType, data?: any) => this.configure({authorizer: {type, ...data}})
			return Object.assign(
				setAuthorizer,
				{
					iam: () => setAuthorizer('aws_iam'),
					jwt: (identitySource: string, issuerUrl: string, audience: string[]) => setAuthorizer('jwt', {identitySource, issuerUrl, audience}),
					request: (functionArn: CfValue) => setAuthorizer('request', {functionArn})
				})
		}
	}
})
