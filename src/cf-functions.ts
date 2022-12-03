export type CfValue = string | Ref | GetAtt | ImportValue | Join | Sub

export type Ref = { Ref: string }
export function ref(name: string): Ref {
	return { Ref: name }
}

export type GetAtt = { 'Fn::GetAtt': [string, string | Ref] }
export function getAtt(name: string, attribute?: string | Ref): GetAtt {
	if (attribute === undefined) {
		const firstDot = name.indexOf('.')
		if (firstDot === -1) throw new Error(`Invalid resource name: ${name}`)

		;[name, attribute] = [
			name.substring(0, firstDot),
			name.substring(firstDot + 1)
		]
	}
	return { 'Fn::GetAtt': [name, attribute] }
}

export type ImportValue = { 'Fn::ImportValue': string | Ref | Join | Sub }
export function importValue(value: ImportValue['Fn::ImportValue']): ImportValue {
	return { 'Fn::ImportValue': value }
}

export type Join = { 'Fn::Join': [string, (string | Ref | ImportValue | Sub)[]] }
export function join(delimiter: string, list: Join['Fn::Join'][1]): Join {
	return { 'Fn::Join': [delimiter, list] }
}

export type SubParameters = { [key: string]: string | Ref | ImportValue | Join }
export type Sub = { 'Fn::Sub': string | [string, SubParameters] }
export function sub(template: string, variables?: SubParameters): Sub {
	return { 'Fn::Sub': variables ? [template, variables] : template }
}