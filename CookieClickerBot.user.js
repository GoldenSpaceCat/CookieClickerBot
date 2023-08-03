// ==UserScript==
// @name           CookieClicker Bot
// @namespace      https://github.com/GottZ/CookieClickerBot
// @version        0.4.0
// @description    cookie clicker herp derp derp
// @author         GottZ
// @match          https://orteil.dashnet.org/cookieclicker/
// @match          http://orteil.dashnet.org/cookieclicker/
// @grant          unsafeWindow
// @run-at         document-idle
// @updateURL      https://raw.githubusercontent.com/GottZ/CookieClickerBot/raw/master/CookieClickerBot.user.js
// @downloadURL    https://raw.githubusercontent.com/GottZ/CookieClickerBot/raw/master/CookieClickerBot.user.js
// ==/UserScript==

// things:
// trigger a golden cookie:
// Game.shimmerTypes.golden.time = Game.shimmerTypes.golden.maxTime - 1000
// mature lump:
// Game.lumpT = Date.now() - Game.lumpMatureAge; Game.computeLumpTimes()
// ripen lump:
// Game.lumpT = Date.now() - Game.lumpRipeAge; Game.computeLumpTimes()
// fill all stocks with max
// Object.values(Game.Objects.Bank.minigame.goods).map(good => good.stock = +good.stockMaxL.textContent.replace(/[^\d]/g, ""));

/* vim: set sw=2 ts=2 sts=2 noet nopi nospell ff=unix: */

(async () => {
    do {
        await new Promise(resolve => setTimeout(resolve, 100));
    } while (!("ObjectsById" in Game));

    //const doc = unsafeWindow.document;
    //const doc = document;
    const doc = (function(){
        try {
            return unsafeWindow.document;
        } catch (e) {
            return document;
        }
    })();

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

    const topBar = $('#storeTitle');

    //const controls = ce('div', {textContent: 'magical stuff', className: 'hoverer gzmenu'});
    //topBar.insertBefore(controls, topBar.lastElementChild);

    const controls = doc.getElementById("prefsButton");

    ["mouseover", "click", "touchstart", "touchmove"].forEach(t => {
        controls.addEventListener(t, e => {
            controls.classList.add("hoverer");
            controls.classList.add("gzmenu");
        });
    });

    const controlContainer = ce('div', {parent: controls, className: 'hoverable'});
    ce('style', {parent: doc.head, textContent: `
    .gzmenu.hoverer {
        /*position: relative;*/
        z-index: 999999;
    }
    .gzmenu .hoverable {
        top: ${controls.getBoundingClientRect().height + 1}px;
            inline-size: max-content;
    }
    .gzmenu .hoverable a:before {
        content: "☐ ";
        color: #f77;
    }
    .gzmenu .hoverable a {
        text-decoration: none;
    }
    .gzmenu .hoverable a.running:before {
        content: "☑ ";
        color: #7f7;
    }
    #lumpsAmount:after {
        content: attr(data-time);
        width: 200px;
        position: absolute;
        height: 1em;
        white-space: break-spaces;
    }
    `});

    const fscreen = (() => {
        class Fscreen {
            check() {
                if ("webkitIsFullScreen" in doc) return doc["webkitIsFullScreen"];
                if ("isFullScreen" in doc) return doc["isFullScreen"];
                if ("isFullscreen" in doc) return doc["isFullscreen"];
                return false;
            }
            toggle(state) {
                if (typeof state === "undefined") state = !this.check();
                this[state ? "enter" : "exit"]();
                return state;
            }
            exit() {
                doc.exitFullscreen();
            }
            enter() {
                doc.body.requestFullscreen();
            }
        };

        return new Fscreen();
    })();

    const autoclickButton = ce('a', {parent: controlContainer, textContent: 'autoclick', href: '#'});
    const lumpButton = ce('a', {parent: controlContainer, textContent: 'lumps', href: '#'});
    const percButton = ce('a', {parent: controlContainer, textContent: 'percs', href: '#'});
    const factsButton = ce('a', {parent: controlContainer, textContent: 'factories', href: '#'});
    const shimmerButton = ce('a', {parent: controlContainer, textContent: 'golden cookies', href: '#'});
    const farmButton = ce('a', {parent: controlContainer, textContent: 'farm stuff', href: '#'});
    const bankButton = ce('a', {parent: controlContainer, textContent: 'bank stuff', href: '#'});
    const fullscreenButton = ce('a', {parent: controlContainer, textContent: 'fullscreen', href: '#'});

    const states = {
        autoclick: false,
        lumps: false,
        percs: false,
        facts: false,
        shimmers: false,
        farm: false,
        bank: false,
        fullscreen: fscreen.check(),
    };

    Object.keys(states).forEach(name => {
        let state = states[name];
        Object.defineProperty(states, name, {
            get: () => state,
            set: x => {
                state = x;
                ({
                    autoclick: autoclickButton,
                    lumps: lumpButton,
                    percs: percButton,
                    facts: factsButton,
                    shimmers: shimmerButton,
                    farm: farmButton,
                    bank: bankButton,
                    fullscreen: fullscreenButton
                })
                [name].classList.toggle('running', state !== false);
            }
        });
    });

    fullscreenButton.addEventListener('click', function (e) {
        states.fullscreen = fscreen.toggle();
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
                const r = cookie.getBoundingClientRect();
                const oX = Game.mouseX;
                const oY = Game.mouseY;
                Game.mouseX = r.x + r.width / 2;
                Game.mouseY = r.y + r.height / 2;
                Game.ClickCookie({detail:1, preventDefault:()=>{}});
                Game.mouseX = oX;
                Game.mouseY = oY;
            }, 67);
        }
    });

    const runLumps = () => {
        if (!states.lumps) return;
        setTimeout(runLumps, 1000/Game.fps);
        const element = $('#lumpsAmount');
        if (!element) return;
        const time = (Game.lumpT + Game.lumpRipeAge) - Date.now();
        if (time <= 0) {
            Game.clickLump();
            Game.computeLumpTimes();
        }
        element.dataset.time = '    next: ' + Game.sayTime(time / Game.fps, -1);
    };

    lumpButton.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        states.lumps = !states.lumps;
        if (states.lumps) runLumps();
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
                const ele = $$("#upgrades .upgrade.enabled");
                let i = ele.length;
                while(i--) {
                    /*if (   ~ele[i].onclick.toString().indexOf("[69]")
                        || ~ele[i].onclick.toString().indexOf("[73]")
                        || ~ele[i].onclick.toString().indexOf("[74]")
                        || ~ele[i].onclick.toString().indexOf("[84]")
                        || ~ele[i].onclick.toString().indexOf("[85]")
                    ) {
                        continue;
                    } else {*/
                        ele[i].click();
                    /*    return;
                    }*/
                }
            }, 1000);
        }
    });

    let calculated;
    //const Game = unsafeWindow.Game;

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

    const barMaxWidth = 236;

    let nextFactoryBgr = "";
    setTimeout(async () => {
        const url = getComputedStyle(Game.ObjectsById[0].l).backgroundImage.replace(/^url\("/, "").replace(/"\)$/, "");
        const i = new Image();
        i.src = url;
        await new Promise(done => i.onload = done);
        const can = doc.createElement("canvas");
        can.width = i.width;
        can.height = i.height;
        const ctx = can.getContext("2d");
        ctx.drawImage(i, 0, 0);
        ctx.globalCompositeOperation = "multiply";
        // ctx.globalCompositeOperation = "copy";
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#007cfc";
        ctx.fillRect(0, 0, can.width, can.height);
        nextFactoryBgr = can.toDataURL();
    }, 0);

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

                calculated[0].factory.l.style.backgroundImage = `url(${nextFactoryBgr})`;
                if (calculated[0].active) calculated[0].factory.l.click();
                //if (calculated[0].active) calculated[0].factory.buy(1);
            }, 100);
        }
    });

    {
        const push = shimmer => {
            if (states.shimmers) {
                setTimeout(() => {
                    shimmer.l.click();
                }, 0);
            }
            console.log(JSON.stringify(shimmer));
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
    };

    {
        const farm = {};
        const func = () => {
            const minigame = Game.Objects.Farm.minigame;
            [...document.getElementById("gardenPlot").querySelectorAll("div[id^=gardenTileIcon]")]
            .filter(x=>x.style.display == "block")
            .filter(x=>x.style.opacity < 1)
            .map(n=>[...n.id.match(/-(\d+)-(\d+)$/)].slice(1).map(x=>+x))
            .filter(coord => {
                const [type, maturity] = minigame.getTile(...coord);
                const plant = minigame.plantsById[type -1];
                return !("immortal" in plant && plant.immortal);
            })
            .forEach(coord => minigame.clickTile(...coord));
        }
        farmButton.addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (!Game.Objects.Farm.minigameLoaded) {
                return;
            }
            states.farm = !states.farm;

            const minigame = Game.Objects.Farm.minigame;

            if (!states.farm) {
                minigame.logic = farm.logic;
                return;
            }

            farm.logic = minigame.logic;
            minigame.logic = () => {
                return farm.logic.call(Game.Objects.Farm.minigame);
                func();
            }
            func();
        });
    };

    {
        const bank = {};
        bankButton.addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (!Game.Objects.Bank.minigameLoaded) {
                return;
            }
            states.bank = !states.bank;

            const minigame = Game.Objects.Bank.minigame;
            const parent = minigame.goodsById[0].l.parentNode;

            if (!states.bank) {
                minigame.tick = bank.tick;
                parent.firstChild.style.width = "";
                parent.style.display = "";
                parent.style.flexWrap = "";
                parent.style.justifyContent = "";
                return;
            }

            bank.tick = minigame.tick;
            parent.firstChild.style.width = "100%";
            parent.style.display = "flex";
            parent.style.flexWrap = "wrap";
            parent.style.justifyContent = "center";
            minigame.tick = () => {
                bank.tick();
                [...minigame.goodsById].sort((a,b) => a.val - b.val).map((x, i) => x.l.style.order = i+1);
            }
            [...minigame.goodsById].sort((a,b) => a.val - b.val).map((x, i) => x.l.style.order = i+1);
        });
    };

})();
