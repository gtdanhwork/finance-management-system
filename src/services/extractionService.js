import dotenv from 'dotenv';
dotenv.config();

import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

console.log('API Key loaded:', !!process.env.ANTHROPIC_API_KEY);

import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';
import pool from '../configs/db.js';

const extractTextFromFile = async (filePath, mimeType) => {
	if (mimeType === 'application/pdf') {
		const { createRequire } = await import('module');
		const require = createRequire(import.meta.url);
		const pdfParse = require('pdf-parse');

		const normalizedPath = path.resolve(filePath);

		if (!fs.existsSync(normalizedPath)) {
			throw new Error(`File not found at path: ${normalizedPath}`);
		}

		const buffer = fs.readFileSync(normalizedPath);
		console.log('Buffer size:', buffer.length);

		const data = await pdfParse(buffer);
		return data.text;
	} else if (['image/jpeg', 'image/png]'].includes(mimeType)) {
		const result = await Tesseract.recognize(filePath, 'eng');
		return result.data.text;
	}

	throw new Error(`Unsupported file type: ${mimeType}`);
};

const extractDataWithClaude = async (rawText, fileType) => {
	const prompt = `You are a financial document parser.

I will give you raw text extracted from a ${fileType}.
Your job is to extract all financial line items from it.

Return ONLY a raw JSON array with no markdown, no code fences, no explanation. Start your response with [ and end with ].

Each item in the array should have:
- description (string): what the item is
- amount (number): the monetary value, positive for income, negative for expenses
- currency (string): e.g. "USD", "VND", "EUR" — default to "USD" if unclear
- item_date (string): date in YYYY-MM-DD format, or null if not found
- category (string): one of "income", "expense", "transfer", or "unknown"

Here is the document text:
---
${rawText}
---

Return only the JSON array.`;

	const message = await client.messages.create({
		model: 'claude-haiku-4-5-20251001',
		max_tokens: 1024,
		messages: [{ role: 'user', content: prompt }],
	});

	const responseText = message.content[0].text;

	try {
		// ✅ Strip markdown code fences before parsing
		const cleaned = responseText
			.replace(/```json/g, '')
			.replace(/```/g, '')
			.trim();
		return JSON.parse(cleaned);
	} catch (error) {
		throw new Error('Claude returned invalid JSON: ' + responseText);
	}
};

const saveExtractedItems = async (fileId, items) => {
	const saved = [];
	for (const item of items) {
		const result = await pool.query(
			`
            INSERT INTO extracted_items (file_id, description, amount, currency, item_date, category, raw_data) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
			[
				fileId,
				item.description || null,
				item.amount || null,
				item.currency || 'USD',
				item.item_date || null,
				item.category || 'unknown',
				JSON.stringify(item),
			],
		);
		saved.push(result.rows[0]);
	}

	return saved;
};

const processFile = async (fileId, filePath, mimeType, fileType) => {
	if (!fs.existsSync(filePath)) {
		throw new Error(`File not found at path: ${filePath}`);
	}
	try {
		await pool.query(
			`UPDATE uploaded_files SET status = 'processing' WHERE id = $1`,
			[fileId],
		);

		const rawText = await extractTextFromFile(filePath, mimeType);
		const items = await extractDataWithClaude(rawText, fileType);
		const saved = await saveExtractedItems(fileId, items);

		await pool.query(
			`UPDATE uploaded_files SET status = 'done' WHERE id = $1`,
			[fileId],
		);

		return saved;
	} catch (error) {
		await pool.query(
			`UPDATE uploaded_files SET status = 'error' WHERE id = $1`,
			[fileId],
		);
		throw error;
	}
};

export default processFile;
