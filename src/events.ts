import {CfValue} from './cf-functions.js'

export const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const
export type HttpMethod = typeof httpMethods[number]
export type HttpEvent = {
	http: {
		method: HttpMethod
		path: string
		cors: boolean
	}
}

type HttpEventBuilder = {
	(method: HttpMethod, path: string): HttpEvent
} & {
	[key in Lowercase<HttpMethod>]: (path: string) => HttpEvent
}
export const httpEvent: HttpEventBuilder = Object.assign(
	function (method: HttpMethod, path: string): HttpEvent {
		return {
			http: {
				method,
				path,
				cors: true
			},
		}
	},
	makeHelperMethods())

function makeHelperMethods(): Record<Lowercase<HttpMethod>, (path: string) => HttpEvent> {
	return httpMethods.reduce((acc, method) => {
		acc[method.toLowerCase()] = (path: string) => httpEvent(method, path)
		return acc;
	}, {} as Record<Lowercase<HttpMethod>, (path: string) => HttpEvent>)
}

export type DynamoDBEvent = {
	stream: {
		type: 'dynamodb'
		arn: CfValue
	}
}
export function dynamodbEvent(streamArn: CfValue): DynamoDBEvent {
	return {
		stream: {
			type: 'dynamodb',
			arn: streamArn,
		}
	}
}

export type EventBridgeEvent = {
	eventBridge: {
		eventBus?: CfValue
		schedule?: string
		pattern?: {
			source?: string[] | string
			detailType?: string[] | string
			detail?: Record<string, unknown>
		}
	}
}
export type EventBridgeEventBuilder = {
	schedule(schedule: string): EventBridgeEvent
	match(pattern: EventBridgeEvent['eventBridge']['pattern']): EventBridgeEvent
	for(eventBus: string | CfValue): EventBridgeEventBuilder
}
export const eventBridgeEvent: EventBridgeEventBuilder = {
	schedule(schedule: string): EventBridgeEvent {
		return {
			eventBridge: {
				...this._eventBus && {eventBus: this._eventBus},
				schedule,
			}
		}
	},

	match(pattern: EventBridgeEvent['eventBridge']['pattern']): EventBridgeEvent {
		return {
			eventBridge: {
				...this._eventBus && {eventBus: this._eventBus},
				pattern,
			}
		}
	},

	for(eventBus: CfValue): EventBridgeEventBuilder {
		const builder = Object.create(this)
		builder._eventBus = eventBus
		return builder as EventBridgeEventBuilder
	}
}