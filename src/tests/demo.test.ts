import { zod } from "$lib/adapters/zod.js";
import { superValidate } from "$lib/superValidate.js";
import { describe, test } from 'vitest';
import { z } from "zod";


describe("Demo", () => {
    test("Bad", async () => {
        const schema = zod(
            z.object({
                addresses: z.object({
                    additional: z.discriminatedUnion('type', [
                        z.object({
                            type: z.literal('poBox'),
                            name: z.string().min(1, 'err min len').max(10, 'err max len')
                        }),
                        z.object({
                            type: z.literal('none'),
                        }),
                    ]).default({ type: 'none' })
                })
            })
        )

        const formInput = new FormData()
        formInput.set(
            '__superform_json',
            JSON.stringify([
                {
                    addresses: 1
                },
                {
                    additional: 2
                },
                {
                    type: 3,
                    name: 4
                },
                'poBox',
                ''
            ])
        )
        try {
            await superValidate(formInput, schema)
        } catch (err) {
            console.error(err)
            //
            throw err
        }
    })

    test("Good", async () => {
        const schema = zod(
            z.object({
                addresses: z.object({
                    additional: z.discriminatedUnion('type', [
                        z.object({
                            type: z.literal('poBox'),
                            name: z.string().min(1, 'err min len').max(10, 'err max len')
                        }),
                        z.object({
                            type: z.literal('none'),
                        }),
                    ]).default({ type: 'poBox', name: '' })
                })
            })
        )

        const formInput = new FormData()
        formInput.set(
            '__superform_json',
            JSON.stringify([
                {
                    addresses: 1
                },
                {
                    additional: 2
                },
                {
                    type: 3,
                    name: 4
                },
                'poBox',
                ''
            ])
        )
        try {
            await superValidate(formInput, schema)
        } catch (err) {
            console.error(err)
            throw err
        }
    })
})