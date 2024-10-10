import {CfValue} from '../cf-functions.js'
import {HttpEvent} from './http.js'
import {HttpApiEvent} from './httpApi.js'

export * from './http.js'
export * from './httpApi.js'

export type LambdaEvent =
	| HttpEvent
	| HttpApiEvent
	| DynamoDBEvent
	| EventBridgeEvent
	| IoTEvent
	| SQSEvent


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

export type IoTEvent = {
	iot: {
		sql: string
	}
}
export type IoTEventBuidler = (sql: string, version?: string) => IoTEvent

export const iotEvent: IoTEventBuidler = (sql: string, version?: string) => ({
	iot: {
		sql,
		sqlVersion: version ?? 'beta',
	}
})


export type SQSEvent = {
	sqs: {
		arn: CfValue
	}
}
export type SQSEventBuilder = (queueArn: CfValue) => SQSEvent

export const sqsEvent: SQSEventBuilder = (queueArn: CfValue) => ({
	sqs: {
		arn: queueArn,
	}
})
