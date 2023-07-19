import {resource} from './index.js'

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
})
