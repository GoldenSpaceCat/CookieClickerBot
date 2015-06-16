// ==UserScript==
// @name           CookieClicker Bot
// @namespace      https://github.com/GottZ/CookieClickerBot
// @version        0.1
// @description    cookie clicker herp derp derp
// @author         GottZ
// @match          http://orteil.dashnet.org/cookieclicker/
// @grant          unsafeWindow
// @grant          GM_registerMenuCommand
// @grant          GM_unregisterMenuCommand
// @updateURL      https://raw.githubusercontent.com/GottZ/CookieClickerBot/raw/master/CookieClickerBot.user.js
// @downloadURL    https://raw.githubusercontent.com/GottZ/CookieClickerBot/raw/master/CookieClickerBot.user.js
// ==/UserScript==

/* vim: set sw=2 ts=2 sts=2 noet nopi nospell ff=unix: */

var doc = unsafeWindow.document;

var $ = function (q) {
	return doc.querySelector(q);
};
var $$ = function (q) {
	return doc.querySelectorAll(q);
};

var autoclick = function () {
	GM_unregisterMenuCommand(autoclick.button);
	var cookie = $("#bigCookie");
	var gold = $("#goldenCookie");

	setInterval(function () {
		for (var i = 0; i < 10; i++) cookie.click();
	}, 10);

	setInterval(function () {
		if (gold.style.display != "none")
			gold.click();
	}, 1000);
};

autoclick.button = GM_registerMenuCommand("autoclick", autoclick);



var percs = function () {
	GM_unregisterMenuCommand(percs.button);

	setInterval(function () {
		var ele = $$("#store .upgrade.enabled");
		var i = ele.length;
		while(i--) {
			if (~ele[i].onclick.toString().indexOf("[69]") || ~ele[i].onclick.toString().indexOf("[73]") ||  ~ele[i].onclick.toString().indexOf("[74]") || ~ele[i].onclick.toString().indexOf("[84]") || ~ele[i].onclick.toString().indexOf("[85]"))
				continue;
			else {
				ele[i].click();
				return;
			}
		}
	}, 1000);
};

percs.button = GM_registerMenuCommand("percs", percs);

var calculated;

var factories = function () {
	GM_unregisterMenuCommand(factories.button);

	var Game = unsafeWindow.Game;

	var facts = [];
	for (var i = 0; i < 11; i++) {
		facts.push(Game.ObjectsById[i]);
	}

	setInterval(function () {
		calculated = [];
		facts.forEach(function (f) {
			f.l.style.background = null;
			var obj = {
				factory: f,
				name: f.name,
				active: Game.cookies - f.price > 0,
				cps: (f.amount == 0 ? f.storedCps : f.storedTotalCps/f.amount)*Game.globalCpsMult,
				price: f.price
			};

			obj.value = obj.price/Game.cookiesPs;
			obj.worth = obj.cps / obj.value;

			calculated.push(obj);
		});

		calculated.sort(function (x, y) {
			return x.worth < y.worth ? 1 : x.worth > y.worth ? -1 : 0;
		});

		calculated[0].factory.l.style.background = "#777";
		if (calculated[0].active) calculated[0].factory.l.click();
		//if (calculated[0].active) calculated[0].factory.buy(1);
	}, 1000);
};

factories.button = GM_registerMenuCommand("factories", factories);

GM_registerMenuCommand("calculated", function () {
	console.log(calculated);
});

