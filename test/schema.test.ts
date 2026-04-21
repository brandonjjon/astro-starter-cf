import { expect, test } from 'vitest';
import { z } from 'astro/zod';

// Example: verify a schema behaves. Replace with real tests as you add logic.
test('email schema rejects invalid', () => {
	const schema = z.string().email();
	expect(schema.safeParse('not-an-email').success).toBe(false);
	expect(schema.safeParse('ok@example.com').success).toBe(true);
});
