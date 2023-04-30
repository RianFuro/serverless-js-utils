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
		AttributeDefinition: {
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
		BillingMode?: string // TODO: enumerate
		StreamSpecification: {
			StreamViewType: string // TODO: enumerate
		}
	}

	[key: string]: Record<string, any>
}

export function resource<TKey extends string>(type: TKey, properties?: Resources[TKey]): Resource<TKey> {
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
	table(properties: Resources['AWS::DynamoDB::Table']): Resource<'AWS::DynamoDB::Table'> {
		return resource('AWS::DynamoDB::Table', properties)
	}
}