import * as fn from './cf-functions'

describe('ref', function () {
	it('should return a Ref definition', function () {
		expect(fn.ref('MyResource')).toEqual({ Ref: 'MyResource' })
	})
})

describe('getAtt', function () {
	it('should return a GetAtt definition', function () {
		expect(fn.getAtt('MyResource', 'Arn')).toEqual({ 'Fn::GetAtt': ['MyResource', 'Arn'] })
	})

	it('should split the resource name on the dot if it\'s the only parameter', function () {
		expect(fn.getAtt('MyResource.Arn')).toEqual({ 'Fn::GetAtt': ['MyResource', 'Arn'] })
		expect(fn.getAtt('MyElb.SourceSecurityGroup.OwnerAlias')).toEqual({ 'Fn::GetAtt': ['MyElb', 'SourceSecurityGroup.OwnerAlias'] })
	})

	it('fails if the resource name is not in the format "Resource.Attribute"', function () {
		expect(() => fn.getAtt('MyResource')).toThrow()
	})

	it('accepts a Ref for the attribute', function () {
		expect(fn.getAtt('MyResource', fn.ref('MyAttribute'))).toEqual({ 'Fn::GetAtt': ['MyResource', { Ref: 'MyAttribute' }] })
	})
})

describe('importValue', function () {
	it('should return an ImportValue definition', function () {
		expect(fn.importValue('MyValue')).toEqual({ 'Fn::ImportValue': 'MyValue' })
	})

	it('should accept a Ref for the value', function () {
		expect(fn.importValue(fn.ref('MyValue'))).toEqual({ 'Fn::ImportValue': { Ref: 'MyValue' } })
	})

	it('should accept a Join for the value', function () {
		expect(fn.importValue(fn.join('-', ['My', 'Value'])))
		.toEqual({ 'Fn::ImportValue': { 'Fn::Join': ['-', ['My', 'Value']] } })
	})

	it('should accept a Sub for the value', function () {
		expect(fn.importValue(fn.sub('arn:aws:s3:${AWS::Region}')))
		.toEqual({ 'Fn::ImportValue': { 'Fn::Sub': 'arn:aws:s3:${AWS::Region}' } })
	})
})

describe('join', function () {
	it('should return a Join definition', function () {
		expect(fn.join(' ', ['a', 'b', 'c']))
		.toEqual({ 'Fn::Join': [' ', ['a', 'b', 'c']] })
	})

	it('should accept a Ref as a list element', function () {
		expect(fn.join(' ', ['a', fn.ref('MyResource')]))
		.toEqual({ 'Fn::Join': [' ', ['a', { Ref: 'MyResource' }]] })
	})

	it('should accept an ImportValue as a list element', function () {
		expect(fn.join(' ', ['a', fn.importValue('MyValue')]))
		.toEqual({ 'Fn::Join': [' ', ['a', { 'Fn::ImportValue': 'MyValue' }]] })
	})

	it('should accept a Sub as a list element', function () {
		expect(fn.join(' ', ['a', fn.sub('arn:aws:s3:${AWS::Region}')]))
		.toEqual({ 'Fn::Join': [' ', ['a', { 'Fn::Sub': 'arn:aws:s3:${AWS::Region}' }]] })
	})
})

describe('sub', function () {
	it('should return a Sub definition', function () {
		expect(fn.sub('arn:aws:s3:${AWS::Region}:${AWS::AccountId}:bucket/*'))
		.toEqual({ 'Fn::Sub': 'arn:aws:s3:${AWS::Region}:${AWS::AccountId}:bucket/*' })
	})

	it('should accept a Ref as a variable', function () {
		expect(fn.sub('Hello, ${name}!', {name: fn.ref('MyName')}))
		.toEqual({'Fn::Sub': ['Hello, ${name}!', {name: {Ref: 'MyName'}}]})
	})

	it('should accept an ImportValue as a variable', function () {
		expect(fn.sub('Hello, ${name}!', {name: fn.importValue('MyName')}))
		.toEqual({'Fn::Sub': ['Hello, ${name}!', {name: {'Fn::ImportValue': 'MyName'}}]})
	})

	it('should accept a Join as a variable', function () {
		expect(fn.sub('Hello, ${name}!', {name: fn.join('-', ['My', 'Name'])}))
		.toEqual({'Fn::Sub': ['Hello, ${name}!', {name: {'Fn::Join': ['-', ['My', 'Name']]}}]})
	})
})