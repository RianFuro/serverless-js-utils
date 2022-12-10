import {lambda} from './lambda'
import {httpEvent} from './events'

describe('lambda', () => {
	it('should return a lambda function definition', () => {
		expect(lambda('handler.func')).toMatchObject({
			handler: 'handler.func'
		})
	})

	it('should allow configuring the function', () => {
		expect(lambda('handler.func').configure({timeout: 10})).toMatchObject({
			handler: 'handler.func',
			timeout: 10
		})
	})

	it('should allow setting events to trigger the function', () => {
		expect(lambda('handler.func').on(httpEvent('GET', '/path'))).toMatchObject({
			handler: 'handler.func',
			events: [{http: {method: 'GET', path: '/path'}}]
		})
	})
})