import {allow, deny} from './policies.js'
import * as fn from './cf-functions.js'

for (const [effect, sut] of Object.entries({Allow: allow, Deny: deny})) {
	describe(effect.toLowerCase(), () => {
		it('should return a policy statement', () => {
			expect(sut('dynamodb:PutItem')).toMatchObject({
				Action: 'dynamodb:PutItem',
				Effect: effect
			})

			expect(sut(['dynamodb:PutItem', 'dynamodb:GetItem'])).toMatchObject({
				Action: ['dynamodb:PutItem', 'dynamodb:GetItem'],
				Effect: effect
			})
		})

		it(`should allow specifying a resource`, () => {
			expect(sut('dynamodb:PutItem', 'arn:aws:dynamodb:us-east-1:123456789012:table/Users')).toMatchObject({
				Action: 'dynamodb:PutItem',
				Effect: effect,
				Resource: 'arn:aws:dynamodb:us-east-1:123456789012:table/Users',
			})

			expect(sut('dynamodb:PutItem', ['arn:aws:dynamodb:us-east-1:123456789012:table/Users', 'arn:aws:dynamodb:us-east-1:123456789012:table/Posts'])).toMatchObject({
				Action: 'dynamodb:PutItem',
				Effect: effect,
				Resource: ['arn:aws:dynamodb:us-east-1:123456789012:table/Users', 'arn:aws:dynamodb:us-east-1:123456789012:table/Posts'],
			})
		})

		it(`should allow specifying a resource with a token`, () => {
			expect(sut('dynamodb:PutItem', fn.getAtt('UsersTable.Arn'))).toMatchObject({
				Action: 'dynamodb:PutItem',
				Effect: effect,
				Resource: { 'Fn::GetAtt': ['UsersTable', 'Arn'] },
			})
		})
	})
}

