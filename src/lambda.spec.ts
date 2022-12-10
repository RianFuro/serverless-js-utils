import {authorizer} from './lambda'

describe('authorizer.token', () => {
	it('should return a token authorizer', () => {
		expect(authorizer.token('arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/some-lambda-arn/invocations')).toMatchObject({
			type: 'TOKEN',
			authorizerId: 'arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/some-lambda-arn/invocations'
		})
	})
})

describe('authorizer.iam', () => {
	it('should return an IAM authorizer', () => {
		expect(authorizer.iam()).toMatchObject({
			type: 'AWS_IAM'
		})
	})
})

describe('authorizer.userPools', () => {
	it('should return a user pools authorizer', () => {
		expect(authorizer.userPool('arn:aws:cognito-idp:us-east-1:123456789012:userpool/us-east-1_123456789')).toMatchObject({
			type: 'COGNITO_USER_POOLS',
			authorizerId: 'arn:aws:cognito-idp:us-east-1:123456789012:userpool/us-east-1_123456789'
		})
	})
})