import { CfValue } from "../cf-functions.js";

export type Resource<TKey extends string, TProperties = Resources[TKey]> = {
	Type: TKey
	Properties: TProperties
}

export type Resources = {
	'AWS::ApiGateway::Authorizer': {
		AuthorizerResultTtlInSeconds?: number
		AuthorizerUri?: string
		AuthorizerCredentials?: string
		IdentitySource?: string
		IdentityValidationExpression?: string
		Name?: string
		ProviderARNs?: string[]
		RestApiId: string
		Type: string
	},

	'AWS::DynamoDB::Table': {
		TableName?: string
		AttributeDefinitions: {
			AttributeName: string
			AttributeType: string // TODO: enumerate
		}[]
		KeySchema: {
			AttributeName: string
			KeyType: string // TODO: enumerate
		}[]
		GlobalSecondaryIndexes: {
			IndexName: string
			Projection: {
				ProjectionType: string // TODO: enumerate
			}
			KeySchema: {
				AttributeName: string
				KeyType: string // TODO: enumerate
			}[]
		}[]
		BillingMode?: 'PROVISIONED' | 'PAY_PER_REQUEST'
		TimeToLiveSpecification: {
			AttributeName: string
			Enabled: boolean
		}
		StreamSpecification: {
			StreamViewType: 'KEYS_ONLY' | 'NEW_IMAGE' | 'OLD_IMAGE' | 'NEW_AND_OLD_IMAGES'
		}
	},

	'AWS::SQS::Queue': {
		ContentBasedDeduplication?: boolean,
		DeduplicationScope?: string,
		DelaySeconds?: number,
		FifoQueue?: boolean,
		FifoThroughputLimit?: string,
		KmsDataKeyReusePeriodSeconds?: number,
		KmsMasterKeyId?: string,
		MaximumMessageSize?: number,
		MessageRetentionPeriod?: number,
		QueueName?: string,
		ReceiveMessageWaitTimeSeconds?: number,
		RedriveAllowPolicy?: any,
		RedrivePolicy?: any,
		SqsManagedSseEnabled?: boolean,
		Tags?: any[],
		VisibilityTimeout?: number
	},

	[key: string]: Record<string, any>
}

export function resource<TKey extends string>(type: TKey, properties: Resources[TKey]): Resource<TKey> {
	return {
		Type: type,
		Properties: properties,
	}
}

export const apiGateway = {
	authorizer(properties: Resources['AWS::ApiGateway::Authorizer']): Resource<'AWS::ApiGateway::Authorizer'> {
		return resource('AWS::ApiGateway::Authorizer', properties)
	}
}

export const dynamoDb = {
	table: function table(properties: Partial<Resources['AWS::DynamoDB::Table']> = {}): DynamoDbTableProxyHandle {
		return new DynamoDbTableProxyHandle(properties)
	},
}

class DynamoDbTableProxyHandle {
	readonly Type: 'AWS::DynamoDB::Table'
	readonly Properties: Partial<Resources['AWS::DynamoDB::Table']>

	constructor(initialProperties: Partial<Resources['AWS::DynamoDB::Table']> = {}) {
		this.Type = 'AWS::DynamoDB::Table'
		this.Properties = initialProperties

		if (!this.Properties.AttributeDefinitions) {
			this.Properties.AttributeDefinitions = []
		}
	}
}
interface DynamoDbTableProxyHandle {
	name(tableName: string): DynamoDbTableProxyHandle
	key(pk: KeyDefinition, sk?: KeyDefinition): DynamoDbTableProxyHandle
	gsi(indexName: string, keySchema: {pk: KeyDefinition, sk?: KeyDefinition}, projectionType?: ProjectionType): DynamoDbTableProxyHandle
	stream(viewType?: Resources['AWS::DynamoDB::Table']['StreamSpecification']['StreamViewType']): DynamoDbTableProxyHandle
	payPerRequest(): DynamoDbTableProxyHandle
	ttl(field?: string): DynamoDbTableProxyHandle
	withDefaults(...defaultPatterns: DefaultPattern[]): DynamoDbTableProxyHandle
}
export type BillingMode = Resources['AWS::DynamoDB::Table']['BillingMode']
export type ProjectionType = Resources['AWS::DynamoDB::Table']['GlobalSecondaryIndexes'][number]['Projection']['ProjectionType']
export type KeyDefinition = [string, 'string' | 'number'] | string
type GsiNumbers = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
export type DefaultPattern = 'key' | `gsi${GsiNumbers}` | 'billing' | 'stream' | 'ttl'

Object.defineProperties(DynamoDbTableProxyHandle.prototype, {
	name: {
		value(tableName: CfValue) {
			this.Properties.TableName = tableName
			return this
		}
	},
	key: {
		value(pk: KeyDefinition, sk?: KeyDefinition) {
			if (typeof pk === 'string') pk = [pk, 'string']
			if (typeof sk === 'string') sk = [sk, 'string']

			this.Properties.AttributeDefinitions.push(
				{AttributeName: pk[0], AttributeType: attributeTypeMap[pk[1]]},
			)
			this.Properties.KeySchema = [
				{AttributeName: pk[0], KeyType: 'HASH'},
			]

			if (sk) {
				this.Properties.AttributeDefinitions.push(
					{AttributeName: sk[0], AttributeType: attributeTypeMap[sk[1]]},
				)
				this.Properties.KeySchema.push(
					{AttributeName: sk[0], KeyType: 'RANGE'},
				)
			}

			return this
		}
	},
	gsi: {
		value(indexName: string, keySchema: {pk: KeyDefinition, sk?: KeyDefinition}, projectionType: ProjectionType = 'ALL') {
			if (!this.Properties.GlobalSecondaryIndexes) {
				this.Properties.GlobalSecondaryIndexes = []
			}

			let {pk, sk} = keySchema
			if (typeof pk === 'string') pk = [pk, 'string']
			if (typeof sk === 'string') sk = [sk, 'string']

			const gsi = {
				IndexName: indexName,
				KeySchema: [
					{AttributeName: pk[0], KeyType: 'HASH'},
				],
				Projection: {
					ProjectionType: projectionType
				}
			}

			if (!this.Properties.AttributeDefinitions.find(attr => attr.AttributeName === pk[0]))
				this.Properties.AttributeDefinitions.push(
					{AttributeName: pk[0], AttributeType: attributeTypeMap[pk[1]]},
				)

			if (sk) {
				gsi.KeySchema.push(
					{AttributeName: sk[0], KeyType: 'RANGE'},
				)

				if (!this.Properties.AttributeDefinitions.find(attr => attr.AttributeName === sk[0]))
					this.Properties.AttributeDefinitions.push(
						{AttributeName: sk[0], AttributeType: attributeTypeMap[sk[1]]},
					)
			}

			this.Properties.GlobalSecondaryIndexes.push(gsi)
			return this
		}
	},
	stream: {
		value(viewType: Resources['AWS::DynamoDB::Table']['StreamSpecification']['StreamViewType'] = 'NEW_AND_OLD_IMAGES') {
			this.Properties.StreamSpecification = {
				StreamViewType: viewType
			}

			return this
		}
	},
	payPerRequest: {
		value() {
			this.Properties.BillingMode = 'PAY_PER_REQUEST'
			return this
		}
	},
	ttl: {
		value(field: string = 'ttl') {
			this.Properties.TimeToLiveSpecification = {
				AttributeName: field,
				Enabled: true,
			}
			return this
		}
	},
	withDefaults: {
		value(this: DynamoDbTableProxyHandle, ...defaultPatterns: DefaultPattern[]) {
			for (const pattern of defaultPatterns) {
				if (pattern === 'key') this.key('PK', 'SK')
				if (pattern === 'stream') this.stream()
				if (pattern === 'billing') this.payPerRequest()
				if (pattern === 'ttl') this.ttl()
				if (pattern.startsWith('gsi')) {
					const indexNumber = Number(pattern.slice(3))
					const indexName = `GSI${indexNumber}`
					this.gsi(indexName, {pk: `${indexName}-PK`, sk: `${indexName}-SK`})
				}
			}

			return this
		}
	}
})

const attributeTypeMap: Record<'string' | 'number', string> = {
	string: 'S',
	number: 'N'
}

export const sqs = {
	queue(properties: Resources['AWS::SQS::Queue']): Resource<'AWS::SQS::Queue'> {
		return resource('AWS::SQS::Queue', properties)
	}
}
