import {CfValue} from './cf-functions'

type AuthorizerType = 'TOKEN' | 'COGNITO_USER_POOLS' | 'REQUEST' | 'AWS_IAM'
export function authorizer(type: AuthorizerType, authorizerId?: CfValue) {
	return {
		type,
		...!!authorizerId && {authorizerId},
	}
}

authorizer.token = function (authorizerId: CfValue) {
	return authorizer('TOKEN', authorizerId)
}

authorizer.iam = function () {
	return authorizer('AWS_IAM')
}

authorizer.userPool = function (authorizerId: CfValue) {
	return authorizer('COGNITO_USER_POOLS', authorizerId)
}