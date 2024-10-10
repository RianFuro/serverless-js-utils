import {CfValue} from './cf-functions.js'

export type PolicyStatement = {
	Effect: 'Allow' | 'Deny'
	Action: string | string[]
	Resource?: CfValue | CfValue[]
}
export function allow(action: PolicyStatement['Action'], resource?: PolicyStatement['Resource']): PolicyStatement {
	return {
		Effect: 'Allow',
		Action: action,
		...!!resource && {Resource: resource},
	}
}

export function deny(action: PolicyStatement['Action'], resource?: PolicyStatement['Resource']): PolicyStatement {
	return {
		Effect: 'Deny',
		Action: action,
		...!!resource && {Resource: resource},
	}
}