import {dynamodbEvent, eventBridgeEvent, httpEvent, httpMethods} from './events'
import * as fn from './cf-functions.js'

describe('httpEvent', () => {
	it('should return an http event definition', () => {
		const event = httpEvent('GET', '/users');

		expect(event).toMatchObject({
			http: {
				method: 'GET',
				path: '/users',
			}
		})
	})

	it('has a shortcut for all http methods', () => {
		for (const method of httpMethods) {
			const event = httpEvent[method.toLowerCase()]('/users');

			expect(event).toMatchObject({
				http: {
					method,
					path: '/users',
				}
			})
		}
	})

	it('enables cors by default', () => {
		const event = httpEvent('GET', '/users');
		expect(event.http.cors).toBe(true)
	})

	it('allows disabling cors', () => {
		const event = httpEvent('GET', '/users').configure({cors: false});
		expect(event.http.cors).toBe(false)
	})

	it('allows setting the authorizer', () => {
		const tokenAuthorizedEvent = httpEvent('GET', '/users')
			.authorizer.token('arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/some-lambda-arn/invocations');
		expect(tokenAuthorizedEvent.http.authorizer).toEqual({
			type: 'TOKEN',
			authorizerId: 'arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/some-lambda-arn/invocations',
		})

		const iamAuthorizedEvent = httpEvent('GET', '/users').authorizer.iam();
		expect(iamAuthorizedEvent.http.authorizer).toEqual({
			type: 'AWS_IAM'
		})

		const userPoolAuthorizedEvent = httpEvent('GET', '/users')
			.authorizer.userPool('arn:aws:cognito-idp:us-east-1:123456789012:userpool/us-east-1_123456789');
		expect(userPoolAuthorizedEvent.http.authorizer).toEqual({
			type: 'COGNITO_USER_POOLS',
			authorizerId: 'arn:aws:cognito-idp:us-east-1:123456789012:userpool/us-east-1_123456789',
		})

		const customAuthorizedEvent = httpEvent('GET', '/users')
			.authorizer('REQUEST', 'arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/some-lambda-arn/invocations')
		expect(customAuthorizedEvent.http.authorizer).toEqual({
			type: 'REQUEST',
			authorizerId: 'arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/some-lambda-arn/invocations',
		})
	})
})

describe('dynamodbEvent', () => {
	it('should return a dynamodb event definition', () => {
		const event = dynamodbEvent(fn.getAtt('UsersTable.StreamArn'));

		expect(event).toMatchObject({
			stream: {
				type: 'dynamodb',
				arn: { 'Fn::GetAtt': ['UsersTable', 'StreamArn'] },
			}
		})
	})
})

describe('eventBridgeEvent', function () {
	it('should return a scheduled event definition', function () {
		const event = eventBridgeEvent.schedule('rate(1 minute)');

		expect(event).toMatchObject({
			eventBridge: {
				schedule: 'rate(1 minute)',
			}
		})
	})

	it('can be used like a builder to specify the event bus', function () {
		const event = eventBridgeEvent.for('my-event-bus').schedule('rate(1 minute)');

		expect(event).toMatchObject({
			eventBridge: {
				eventBus: 'my-event-bus',
				schedule: 'rate(1 minute)',
			}
		})
	})

	it('can match on an event pattern', function () {
		const event = eventBridgeEvent.match({
			source: ['aws.ec2'],
			detailType: ['EC2 Instance State-change Notification'],
			detail: { state: ['pending'] },
		})

		expect(event).toMatchObject({
			eventBridge: {
				pattern: {
					source: ['aws.ec2'],
					detailType: ['EC2 Instance State-change Notification'],
					detail: { state: ['pending'] },
				}
			}
		})
	})
})