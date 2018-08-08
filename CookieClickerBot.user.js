// ==UserScript==
// @name           CookieClicker Bot
// @namespace      https://github.com/GottZ/CookieClickerBot
// @version        0.2
// @description    cookie clicker herp derp derp
// @author         GottZ
// @match          http://orteil.dashnet.org/cookieclicker/
// @grant          unsafeWindow
// @run-at         document-idle
// @updateURL      https://raw.githubusercontent.com/GottZ/CookieClickerBot/raw/master/CookieClickerBot.user.js
// @downloadURL    https://raw.githubusercontent.com/GottZ/CookieClickerBot/raw/master/CookieClickerBot.user.js
// ==/UserScript==

/* vim: set sw=2 ts=2 sts=2 noet nopi nospell ff=unix: */

const doc = unsafeWindow.document;

const $ = function (q) {
	return doc.querySelector(q);
};
const $$ = function (q) {
	return doc.querySelectorAll(q);
};

const ce = (tag, opts) => {
	const node = doc.createElement(tag);

	if (!opts) return node;

	for (let key in opts) {
		if (key == "parent" || key == "style") continue;
		node[key] = opts[key];
	}

	if (opts.parent) {
		opts.parent.appendChild(node);
	}

	if (opts.style) {
		Object.keys(opts.style).forEach(key => {node.style[key] = opts.style[key]});
	}

	return node;
};

const topBar = $('#topBar');

const controls = ce('div', {textContent: 'magical stuff', className: 'hoverer cheatmenu'});
topBar.insertBefore(controls, topBar.lastElementChild);

const controlContainer = ce('div', {parent: controls, className: 'hoverable'});
ce('style', {parent: doc.head, textContent: `
.cheatmenu.hoverer {
	position: relative;
	z-index: 999999;
}
.cheatmenu .hoverable a:before {
	content: "☐ ";
	color: #f77;
}
.cheatmenu .hoverable a.running:before {
	content: "☑ ";
	color: #7f7;
}`});

const autoclickButton = ce('a', {parent: controlContainer, textContent: 'autoclick', href: '#'});
const percButton = ce('a', {parent: controlContainer, textContent: 'percs', href: '#'});
const factsButton = ce('a', {parent: controlContainer, textContent: 'factories', href: '#'});
const shimmerButton = ce('a', {parent: controlContainer, textContent: 'shimmers', href: '#'});

const states = {
    autoclick: false,
    percs: false,
    facts: false,
    shimmers: false
};

Object.keys(states).forEach(name => {
    let state = states[name];
    Object.defineProperty(states, name, {
        get: () => state,
        set: x => {
            state = x;
            ({
                autoclick: autoclickButton,
                percs: percButton,
                facts: factsButton,
                shimmers: shimmerButton
            })
            [name].classList.toggle('running', state !== false);
        }
    });
});

const cookie = $('#bigCookie');

autoclickButton.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (states.autoclick) {
        clearInterval(states.autoclick);
        states.autoclick = false;
    }
    else {
        states.autoclick = setInterval(_=> {
            for (let i = 0; i < 10; i++) cookie.click();
        }, 1);
    }
});

percButton.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (states.percs) {
        clearInterval(states.percs);
        states.percs = false;
    }
    else {
        states.percs = setInterval(_=> {
            const ele = $$("#store .upgrade.enabled");
            let i = ele.length;
            while(i--) {
                if (   ~ele[i].onclick.toString().indexOf("[69]")
                    || ~ele[i].onclick.toString().indexOf("[73]")
                    || ~ele[i].onclick.toString().indexOf("[74]")
                    || ~ele[i].onclick.toString().indexOf("[84]")
                    || ~ele[i].onclick.toString().indexOf("[85]")
                ) {
                    continue;
                } else {
                    ele[i].click();
                    return;
                }
            }
        }, 1000);
    }
});

let calculated;
const Game = unsafeWindow.Game;

setTimeout(_=>{
    Game.ObjectsById.forEach(factory => {
        factory.l.gzBar = ce('div', {parent: factory.l, style: {
            position: 'absolute',
            top: '6px',
            left: '64px',
            height: '3px',
            width: '0px',
            backgroundColor: '#000'
        }});
    });
},2000);

const barMaxWidth = 236;

factsButton.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (states.facts) {
        clearInterval(states.facts);
        states.facts = false;
    }
    else {
        states.facts = setInterval(_=> {
            calculated = [];
            Game.ObjectsById.forEach(function (f) {
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

            const min = calculated[calculated.length -1].worth;
            const max = calculated[0].worth - min;

            calculated.forEach(c => {
                c.factory.l.gzBar.style.width = (barMaxWidth * (c.worth - min) / max).toFixed(0) + 'px';
            });

            calculated[0].factory.l.style.background = '#777';
            if (calculated[0].active) calculated[0].factory.l.click();
            //if (calculated[0].active) calculated[0].factory.buy(1);
        }, 1000);
    }
});

setTimeout(()=>{
    const push = shimmer => {
        if (states.shimmers) {
            setTimeout(() => {
                shimmer.l.click();
                console.log(JSON.stringify(shimmer));
            }, 0);
        }
        return Array.prototype.push.call(Game.shimmers, shimmer);
    };

    Object.defineProperty(Game.shimmers, 'push', {
        enumerable: false,
        get: () => push
    });

    shimmerButton.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        states.shimmers = !states.shimmers;
    });
}, 2000);
