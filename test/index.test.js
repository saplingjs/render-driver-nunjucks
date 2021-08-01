import test from 'ava';
import path from 'path';
import { fileURLToPath } from 'url';

import SaplingError from '@sapling/sapling/lib/SaplingError.js';

import Nunjucks from '../index.js';


const __dirname = path.dirname(fileURLToPath(import.meta.url));


test.before(t => {
	t.context.nunjucks = new Nunjucks({
		config: {
			production: false
		}
	}, path.join(__dirname, '_data'));
});


test('renders a plain view', async t => {
	const html = await t.context.nunjucks.render('plain.html');

	t.is(html, '<strong>This is a template.</strong>');
});

test('renders a view with data tag without spaces', async t => {
	const html = await t.context.nunjucks.render('tight.html', { template: 'view' });

	t.is(html, '<strong>This is a view.</strong>');
});

test('renders a view with data tag with spaces', async t => {
	const html = await t.context.nunjucks.render('loose.html', { template: 'view' });

	t.is(html, '<strong>This is a view.</strong>');
});

test('renders a view with data tag with safe filter', async t => {
	const html = await t.context.nunjucks.render('safe.html', { template: 'view' });

	t.is(html, '<strong>This is a view.</strong>');
});

test('returns an error for non-existant view', async t => {
	const html = await t.context.nunjucks.render('nonexistant.html', { template: 'view' });

	t.true(html instanceof SaplingError);
});

test('registers tags', async t => {
	t.plan(2);

	await t.context.nunjucks.registerTags({
		async get() {
			t.pass();
		}
	});

	const html = await t.context.nunjucks.render('get.html', { template: 'view' });

	t.is(html, '\n\n<strong>Hello</strong>');
});
