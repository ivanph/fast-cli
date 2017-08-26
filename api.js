'use strict';
/* eslint-env browser */
const puppeteer = require('puppeteer');
const Observable = require('zen-observable');

function init(page, observer, prevSpeed) {
	page.evaluate(() => {
		const $ = document.querySelector.bind(document);

		return {
			speed: Number($('#speed-value').textContent),
			unit: $('#speed-units').textContent.trim(),
			// Somehow it didn't work with `Boolean($('#speed-value.succeeded'))`
			isDone: document.querySelectorAll('.succeeded').length > 0
		};
	})
	.then(result => {
		if (result.speed > 0 && result.speed !== prevSpeed) {
			observer.next(result);
		}

		if (result.isDone) {
			page.close();
			observer.complete();
		} else {
			setTimeout(init, 100, page, observer, result.speed);
		}
	})
	.catch(err => observer.error(err));
}

module.exports = () => new Observable(observer => {
	puppeteer.launch()
		.then(browser => browser.newPage())
		.then(page => page.goto('https://fast.com').then(() => {
			init(page, observer);
		}))
		.catch(err => observer.error(err));
});
