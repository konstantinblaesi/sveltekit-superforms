import type { ValidationAdapter } from '$lib/adapters/adapters.js';
import { zod } from '$lib/adapters/zod.js';
import { superValidate } from '$lib/superValidate.js';
import { stringify } from 'devalue';
import { describe, expect, test } from 'vitest';
import { z } from 'zod';

async function validate(
	data: unknown,
	schema: ValidationAdapter<Record<string, unknown>>,
	strict = false
) {
	const formInput = new FormData();

	formInput.set('__superform_json', stringify(data));
	try {
		return await superValidate(formInput, schema, { strict });
	} catch (err) {
		console.error(err);
		//
		throw err;
	}
}

describe('Default discriminated union values 1', () => {
	const schema = z.discriminatedUnion('type', [
		z.object({ type: z.literal('empty') }),
		z.object({ type: z.literal('extra'), options: z.string().array() })
	]);

	test('Union with schema 1', async () => {
		const form = await validate({ type: 'empty' }, zod(schema));
		expect(form.valid).toBe(true);
		expect(form.data).toEqual({ type: 'empty' });
	});

	test('Union with schema 2', async () => {
		const form = await validate({ type: 'extra' }, zod(schema), true);
		expect(form.valid).toBe(false);
		expect(form.data).toEqual({ type: 'extra', options: [] });
	});
});

describe('Default discriminated union values 2', () => {
	const ZodSchema = z.object({
		addresses: z.object({
			additional: z.discriminatedUnion('type', [
				z.object({
					type: z.literal('poBox'),
					name: z.string().min(1, 'min len').max(10, 'max len')
				}),
				z.object({
					type: z.literal('none')
				})
			])
		})
	});
	const FormSchema = zod(ZodSchema);
	type FormSchema = (typeof FormSchema)['defaults'];

	test('Bad', async () => {
		const data = {
			addresses: {
				additional: {
					type: 'poBox',
					name: ''
				}
			}
		} satisfies FormSchema;
		await validate(data, FormSchema);
	});

	test('Bad when using default on union schema', async () => {
		// ! default value on *nested* discriminated union does not work ?
		const ZodSchema2 = z.object({
			addresses: z.object({
				additional: z.discriminatedUnion('type', [
					z.object({
						type: z.literal('poBox'),
						name: z.string().min(1, 'min len').max(10, 'max len')
					}),
					z.object({
						type: z.literal('none')
					})
				]).default({
					type: 'none'
				})
			})
		});
		const data = {
			addresses: {
				additional: {
					type: 'poBox',
					name: ''
				}
			}
		} satisfies FormSchema;
		await validate(data, zod(ZodSchema2));
	})

	test('Good', async () => {
		const data = {
			addresses: {
				additional: {
					type: 'none'
				}
			}
		} satisfies FormSchema;
		await validate(data, FormSchema);
	});
});
