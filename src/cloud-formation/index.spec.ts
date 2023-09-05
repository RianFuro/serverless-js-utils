import {resource, dynamoDb} from './index.js'

describe('resource', () => {
	it('should return a resource definition', () => {
		const res = resource('AWS::S3::Bucket', {});

		expect(res).toMatchObject({
			Type: 'AWS::S3::Bucket',
			Properties: {},
		});
	});

	it('should allow to define properties', () => {
		const res = resource('AWS::S3::Bucket', {
			BucketName: 'MyBucket',
		})

		expect(res).toMatchObject({
			Type: 'AWS::S3::Bucket',
			Properties: {
				BucketName: 'MyBucket',
			},
		});
	});

	describe('DynamoDB::Table', () => {
		it('returns a DynamoDB::Table resource', () => {
			const res = dynamoDb.table({
				TableName: 'test',
			})

			expect(res).toMatchObject({
				Type: 'AWS::DynamoDB::Table',
				Properties: {
					TableName: 'test',
				}
			})
		})

		it('has builder', () => {
			// @ts-ignore
			const res =
				dynamoDb.table()
					.name('test')
					.key(['PK', 'string'], ['SK', 'string'])
					.gsi('GSI1', {pk: ['GSI1-PK', 'string'], sk: ['GSI1-SK', 'string']})

			expect(res).toMatchObject({
				Type: 'AWS::DynamoDB::Table',
				Properties: {
					TableName: 'test',
					AttributeDefinition: [
						{AttributeName: 'PK', AttributeType: 'S'},
						{AttributeName: 'SK', AttributeType: 'S'},
						{AttributeName: 'GSI1-PK', AttributeType: 'S'},
						{AttributeName: 'GSI1-SK', AttributeType: 'S'},
					],
					KeySchema: [
						{AttributeName: 'PK', KeyType: 'HASH'},
						{AttributeName: 'SK', KeyType: 'RANGE'},
					],
					GlobalSecondaryIndexes: [
						{
							IndexName: 'GSI1',
							KeySchema: [
								{AttributeName: 'GSI1-PK', KeyType: 'HASH'},
								{AttributeName: 'GSI1-SK', KeyType: 'RANGE'},
							],
						}
					],
				},
			})
		})

		it('sets default types for key schema', () => {
			// @ts-ignore
			const res =
				dynamoDb.table()
					.name('test')
					.key('PK', 'SK')
					.gsi('GSI1', {pk: 'GSI1-PK', sk: 'GSI1-SK'})

			expect(res).toMatchObject({
				Type: 'AWS::DynamoDB::Table',
				Properties: {
					TableName: 'test',
					AttributeDefinition: [
						{AttributeName: 'PK', AttributeType: 'S'},
						{AttributeName: 'SK', AttributeType: 'S'},
						{AttributeName: 'GSI1-PK', AttributeType: 'S'},
						{AttributeName: 'GSI1-SK', AttributeType: 'S'},
					],
					KeySchema: [
						{AttributeName: 'PK', KeyType: 'HASH'},
						{AttributeName: 'SK', KeyType: 'RANGE'},
					],
					GlobalSecondaryIndexes: [
						{
							IndexName: 'GSI1',
							KeySchema: [
								{AttributeName: 'GSI1-PK', KeyType: 'HASH'},
								{AttributeName: 'GSI1-SK', KeyType: 'RANGE'},
							],
						}
					],
				},
			})
		})

		it('can set default patterns', () => {
			const res =
				dynamoDb.table()
					.withDefaults('key', 'gsi1', 'stream', 'billing')

			expect(res).toMatchObject({
				Type: 'AWS::DynamoDB::Table',
				Properties: {
					AttributeDefinition: [
						{AttributeName: 'PK', AttributeType: 'S'},
						{AttributeName: 'SK', AttributeType: 'S'},
						{AttributeName: 'GSI1-PK', AttributeType: 'S'},
						{AttributeName: 'GSI1-SK', AttributeType: 'S'},
					],
					KeySchema: [
						{AttributeName: 'PK', KeyType: 'HASH'},
						{AttributeName: 'SK', KeyType: 'RANGE'},
					],
					GlobalSecondaryIndexes: [
						{
							IndexName: 'GSI1',
							KeySchema: [
								{AttributeName: 'GSI1-PK', KeyType: 'HASH'},
								{AttributeName: 'GSI1-SK', KeyType: 'RANGE'},
							],
						}
					],
					BillingMode: 'PAY_PER_REQUEST',
					StreamSpecification: {
						StreamViewType: 'NEW_AND_OLD_IMAGES'
					}
				}
			})
		})
	})
})


