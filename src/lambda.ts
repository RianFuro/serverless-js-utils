import {LambdaEvent} from './events'

export * from './events'

export function lambda(handler: string): LambdaFunction {
	return Object.setPrototypeOf({handler}, functionHandlerPrototype)
}

type LambdaFunction = FunctionBuilder & LambdaFunctionConfiguration
type LambdaFunctionConfiguration = {
	handler: string
	timeout?: number
	memorySize?: number
	runtime?: string
	name?: string
	description?: string
	provisionedConcurrency?: number
	reservedConcurrency?: number
	tracing?: 'Active' | 'PassThrough'
	environment?: {
		[key: string]: string
	}
}
type FunctionBuilder = {
	configure: (config: object) => LambdaFunction
	on: (events: LambdaEvent[] | LambdaEvent) => LambdaFunction
}
const functionHandlerPrototype: FunctionBuilder = Object.create(Object, {
	configure: {
		value: function (config: Omit<LambdaFunctionConfiguration, 'handler'>) {
			return Object.assign(this, config)
		}
	},
	on: {
		value: function (events: LambdaEvent[] | LambdaEvent) {
			if (!Array.isArray(events)) events = [events]
			return Object.assign(this, {events})
		}
	}
})