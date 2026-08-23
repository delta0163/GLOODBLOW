"use strict";

/* =========================================================
   CANVAS
========================================================= */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const W = 320;
const H = 180;

ctx.imageSmoothingEnabled = false;


/* =========================================================
   INPUT
========================================================= */

const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    z: false,
    x: false,
    c: false
};

const oldKeys = {
    up: false,
    down: false,
    left: false,
    right: false,
    z: false,
    x: false,
    c: false
};


/* =========================================================
   KEYBOARD
========================================================= */

window.addEventListener("keydown", function(e) {

    const k = e.key.toLowerCase();

    if (k === "w" || e.key === "ArrowUp")
        keys.up = true;

    if (k === "s" || e.key === "ArrowDown")
        keys.down = true;

    if (k === "a" || e.key === "ArrowLeft")
        keys.left = true;

    if (k === "d" || e.key === "ArrowRight")
        keys.right = true;

    if (k === "z")
        keys.z = true;

    if (k === "x")
        keys.x = true;

    if (k === "c")
        keys.c = true;

    e.preventDefault();

}, { passive: false });


window.addEventListener("keyup", function(e) {

    const k = e.key.toLowerCase();

    if (k === "w" || e.key === "ArrowUp")
        keys.up = false;

    if (k === "s" || e.key === "ArrowDown")
        keys.down = false;

    if (k === "a" || e.key === "ArrowLeft")
        keys.left = false;

    if (k === "d" || e.key === "ArrowRight")
        keys.right = false;

    if (k === "z")
        keys.z = false;

    if (k === "x")
        keys.x = false;

    if (k === "c")
        keys.c = false;

    e.preventDefault();

}, { passive: false });


/* =========================================================
   MOBILE BUTTONS
========================================================= */

document.querySelectorAll("[data-key]").forEach(function(button) {

    const key = button.dataset.key;

    button.addEventListener("pointerdown", function(e) {

        e.preventDefault();

        keys[key] = true;

        try {
            button.setPointerCapture(e.pointerId);
        } catch (_) {}

    });

    button.addEventListener("pointerup", function(e) {

        e.preventDefault();

        keys[key] = false;

    });

    button.addEventListener("pointercancel", function() {

        keys[key] = false;

    });

    button.addEventListener("pointerleave", function(e) {

        if (e.buttons === 0)
            keys[key] = false;

    });

});


/* =========================================================
   FULLSCREEN
========================================================= */

document.getElementById("fullscreen").addEventListener("click", function() {

    if (!document.fullscreenElement) {

        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(function(){});
        }

    } else {

        if (document.exitFullscreen) {
            document.exitFullscreen().catch(function(){});
        }

    }

});


/* =========================================================
   GAME STATE
========================================================= */

const game = {

    screen: "title",

    room: 1,

    menu: 0,

    saveSlot: 0,

    message: "",

    messageTimer: 0,

    battle: null

};


/* =========================================================
   PLAYER
========================================================= */

const player = {

    x: 160,

    y: 120,

    speed: 1.5,

    size: 10

};


/* =========================================================
   PARTY
========================================================= */

const party = [

    {
        name: "ДЕЛЬТА",
        hp: 90,
        maxHp: 90,
        color: "#ffffff",
        atk: 15
    },

    {
        name: "НЕМКА",
        hp: 100,
        maxHp: 100,
        color: "#ff5555",
        atk: 12
    },

    {
        name: "ЛИЧИ",
        hp: 80,
        maxHp: 80,
        color: "#55aaff",
        atk: 13
    },

    {
        name: "ПАНКЕЙК",
        hp: 75,
        maxHp: 75,
        color: "#55dd66",
        atk: 10
    },

    {
        name: "КАШТАН",
        hp: 110,
        maxHp: 110,
        color: "#cc8844",
        atk: 14
    }

];


/* =========================================================
   SAVE DATA
========================================================= */

function saveGame(slot) {

    const data = {

        room: game.room,

        x: player.x,

        y: player.y,

        party: party.map(function(p) {
            return {
                hp: p.hp
            };
        }),

        time: new Date().toLocaleString()

    };

    localStorage.setItem(
        "bloodGlowSave" + slot,
        JSON.stringify(data)
    );

    game.message = "ИГРА СОХРАНЕНА";
    game.messageTimer = 120;
}


function loadGame(slot) {

    const data = localStorage.getItem(
        "bloodGlowSave" + slot
    );

    if (!data) {

        game.message = "ФАЙЛ ПУСТ";
        game.messageTimer = 120;

        return;
    }

    try {

        const save = JSON.parse(data);

        game.room = save.room || 1;

        player.x = save.x || 160;
        player.y = save.y || 120;

        if (save.party) {

            save.party.forEach(function(p, i) {

                if (party[i]) {
                    party[i].hp = Math.max(
                        0,
                        Math.min(
                            party[i].maxHp,
                            p.hp
                        )
                    );
                }

            });

        }

        game.screen = "world";

        game.message = "ИГРА ЗАГРУЖЕНА";
        game.messageTimer = 120;

    } catch (error) {

        console.error(error);

        game.message = "ОШИБКА СОХРАНЕНИЯ";
        game.messageTimer = 120;

    }

}


/* =========================================================
   PIZZA SAVE POINT
========================================================= */

const pizza = {

    x: 150,

    y: 55,

    width: 35,

    height: 25

};


function pizzaDistance() {

    const dx =
        player.x -
        (pizza.x + pizza.width / 2);

    const dy =
        player.y -
        (pizza.y + pizza.height / 2);

    return Math.sqrt(
        dx * dx +
        dy * dy
    );

}


/* =========================================================
   START
========================================================= */

function startGame() {

    game.screen = "world";

    player.x = 160;
    player.y = 120;

}


/* =========================================================
   WORLD
========================================================= */

function updateWorld() {

    let dx = 0;
    let dy = 0;

    if (keys.up)
        dy -= player.speed;

    if (keys.down)
        dy += player.speed;

    if (keys.left)
        dx -= player.speed;

    if (keys.right)
        dx += player.speed;

    player.x += dx;
    player.y += dy;

    player.x = Math.max(15, Math.min(305, player.x));
    player.y = Math.max(20, Math.min(155, player.y));


    /* Z у пиццы */

    if (
        pizzaDistance() < 30 &&
        keys.z &&
        !oldKeys.z
    ) {

        game.screen = "save";

    }


    /* C — меню */

    if (
        keys.c &&
        !oldKeys.c
    ) {

        game.screen = "menu";

    }


    /* Выход вправо */

    if (player.x > 298) {

        startBattle();

        player.x = 280;

    }

}


/* =========================================================
   TITLE
========================================================= */

function updateTitle() {

    if (keys.z && !oldKeys.z) {

        startGame();

    }

}


/* =========================================================
   MENU
========================================================= */

const menuItems = [
    "ПРОДОЛЖИТЬ",
    "СОХРАНЕНИЯ",
    "СТАТУС",
    "ВЫХОД"
];


function updateMenu() {

    if (
        keys.up &&
        !oldKeys.up
    ) {

        game.menu--;

        if (game.menu < 0)
            game.menu = menuItems.length - 1;

    }


    if (
        keys.down &&
        !oldKeys.down
    ) {

        game.menu++;

        if (game.menu >= menuItems.length)
            game.menu = 0;

    }


    if (
        keys.z &&
        !oldKeys.z
    ) {

        if (game.menu === 0) {

            game.screen = "world";

        }

        if (game.menu === 1) {

            game.screen = "save";

        }

        if (game.menu === 2) {

            game.screen = "status";

        }

        if (game.menu === 3) {

            game.screen = "title";

        }

    }


    if (
        keys.x &&
        !oldKeys.x
    ) {

        game.screen = "world";

    }

}


/* =========================================================
   STATUS
========================================================= */

function updateStatus() {

    if (
        keys.x &&
        !oldKeys.x
    ) {

        game.screen = "menu";

    }

}


/* =========================================================
   SAVE MENU
========================================================= */

function updateSaveMenu() {

    if (
        keys.up &&
        !oldKeys.up
    ) {

        game.saveSlot--;

        if (game.saveSlot < 0)
            game.saveSlot = 2;

    }


    if (
        keys.down &&
        !oldKeys.down
    ) {

        game.saveSlot++;

        if (game.saveSlot > 2)
            game.saveSlot = 0;

    }


    if (
        keys.z &&
        !oldKeys.z
    ) {

        const key =
            "bloodGlowSave" +
            game.saveSlot;

        if (
            localStorage.getItem(key)
        ) {

            loadGame(game.saveSlot);

        } else {

            saveGame(game.saveSlot);

        }

    }


    if (
        keys.x &&
        !oldKeys.x
    ) {

        game.screen = "world";

    }

}


/* =========================================================
   BATTLE
========================================================= */

function startBattle() {

    game.screen = "battle";

    game.battle = {

        enemy: {

            name: "ТЕНЕВОЙ ЗВЕРЬ",

            hp: 200,

            maxHp: 200,

            atk: 12

        },

        actor: 0,

        action: 0,

        phase: "menu",

        rd: 0,

        defending: false,

        soulX: 160,

        soulY: 135,

        bullets: [],

        timer: 0,

        text: "ТЕНЕВОЙ ЗВЕРЬ ПРИБЛИЖАЕТСЯ..."

    };

}


/* =========================================================
   BATTLE UPDATE
========================================================= */

function updateBattle() {

    const b = game.battle;

    if (!b)
        return;


    /* -------------------------------------
       ГЛАВНОЕ БОЕВОЕ МЕНЮ
    ------------------------------------- */

    if (b.phase === "menu") {

        if (
            keys.left &&
            !oldKeys.left
        ) {

            b.action--;

            if (b.action < 0)
                b.action = 3;

        }


        if (
            keys.right &&
            !oldKeys.right
        ) {

            b.action++;

            if (b.action > 3)
                b.action = 0;

        }


        if (
            keys.z &&
            !oldKeys.z
        ) {

            /* FIGHT */

            if (b.action === 0) {

                const actor = party[b.actor];

                const damage =
                    actor.atk +
                    Math.floor(Math.random() * 6);

                b.enemy.hp -= damage;

                b.text =
                    actor.name +
                    " атакует! -" +
                    damage +
                    " HP";

                /* атака заполняет RD */

                b.rd += 25;

                b.rd = Math.min(100, b.rd);

                b.defending = false;

                nextActor();

            }


            /* ACT */

            else if (b.action === 1) {

                b.rd += 15;

                b.rd = Math.min(100, b.rd);

                b.text =
                    "ДЕЛЬТА пытается понять врага.";

                nextActor();

            }


            /* ITEM */

            else if (b.action === 2) {

                const actor = party[b.actor];

                actor.hp = Math.min(
                    actor.maxHp,
                    actor.hp + 25
                );

                b.text =
                    actor.name +
                    " восстановил HP.";

                nextActor();

            }


            /* DEFEND */

            else if (b.action === 3) {

                /*
                   ЗАЩИТА:

                   RD НЕ РАСТЁТ.
                */

                b.defending = true;

                b.text =
                    party[b.actor].name +
                    " защищается!";

                nextActor();

            }

        }

    }


    /* -------------------------------------
       АТАКА ВРАГА
    ------------------------------------- */

    if (b.phase === "enemy") {

        updateEnemyAttack();

    }


    /* -------------------------------------
       ПОБЕДА
    ------------------------------------- */

    if (b.phase === "victory") {

        if (
            keys.z &&
            !oldKeys.z
        ) {

            game.screen = "world";
            game.battle = null;

        }

    }


    /* -------------------------------------
       ПОРАЖЕНИЕ
    ------------------------------------- */

    if (b.phase === "defeat") {

        if (
            keys.z &&
            !oldKeys.z
        ) {

            party.forEach(function(p) {
                p.hp = p.maxHp;
            });

            game.screen = "world";
            game.battle = null;

        }

    }


    /* -------------------------------------
       X — назад
    ------------------------------------- */

    if (
        keys.x &&
        !oldKeys.x &&
        b.phase === "menu"
    ) {

        game.screen = "world";
        game.battle = null;

    }

}


/* =========================================================
   NEXT ACTOR
========================================================= */

function nextActor() {

    const b = game.battle;

    if (b.enemy.hp <= 0) {

        b.enemy.hp = 0;

        b.phase = "victory";

        b.text =
            "ТЕНЕВОЙ ЗВЕРЬ ПОБЕЖДЁН!";

        return;

    }


    b.actor++;

    if (b.actor >= party.length) {

        b.actor = 0;

        startEnemyAttack();

    }

}


/* =========================================================
   ENEMY ATTACK
========================================================= */

function startEnemyAttack() {

    const b = game.battle;

    b.phase = "enemy";

    b.timer = 360;

    b.bullets = [];

    for (let i = 0; i < 8; i++) {

        b.bullets.push({

            x: 60 + Math.random() * 200,

            y: 90 + Math.random() * 60,

            vx: (Math.random() - .5) * .8,

            vy: 1 + Math.random(),

            size: 3

        });

    }

}


/* =========================================================
   ENEMY ATTACK UPDATE
========================================================= */

function updateEnemyAttack() {

    const b = game.battle;

    b.timer--;


    if (keys.up)
        b.soulY -= 2;

    if (keys.down)
        b.soulY += 2;

    if (keys.left)
        b.soulX -= 2;

    if (keys.right)
        b.soulX += 2;


    b.soulX =
        Math.max(
            58,
            Math.min(
                262,
                b.soulX
            )
        );

    b.soulY =
        Math.max(
            92,
            Math.min(
                155,
                b.soulY
            )
        );


    b.bullets.forEach(function(bullet) {

        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        if (bullet.y > 158) {

            bullet.y = 90;

            bullet.x =
                60 +
                Math.random() * 200;

        }


        const dx =
            bullet.x -
            b.soulX;

        const dy =
            bullet.y -
            b.soulY;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (distance < 7) {

            const target =
                party[b.actor];

            /*
               Если защищается,
               урон уменьшается.
            */

            let damage = 10;

            if (b.defending)
                damage = 4;

            target.hp -= damage;

            target.hp =
                Math.max(
                    0,
                    target.hp
                );

            b.soulX = 160;
            b.soulY = 135;

        }

    });


    if (b.timer <= 0) {

        b.phase = "menu";

        b.defending = false;

        b.text =
            "ХОД " +
            party[b.actor].name;

    }


    let alive = false;

    party.forEach(function(p) {

        if (p.hp > 0)
            alive = true;

    });


    if (!alive) {

        b.phase = "defeat";

    }

}


/* =========================================================
   DRAW HELPERS
========================================================= */

function text(text, x, y, size = 7) {

    ctx.fillStyle = "#fff";
    ctx.font = size + "px monospace";
    ctx.fillText(text, x, y);

}


function box(x, y, w, h) {

    ctx.fillStyle = "#050505";
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

}


function hpBar(x, y, w, h, hp, max) {

    ctx.fillStyle = "#222";
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = "#eee";

    const value =
        Math.max(0, Math.min(1, hp / max));

    ctx.fillRect(
        x,
        y,
        w * value,
        h
    );

}


/* =========================================================
   DRAW TITLE
========================================================= */

function drawTitle() {

    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, W, H);

    text(
        "BLOOD GLOW",
        92,
        55,
        18
    );

    text(
        "RPG",
        142,
        75,
        12
    );

    text(
        "Z — НАЧАТЬ ИГРУ",
        100,
        115,
        8
    );

    text(
        "Мобильная версия",
        112,
        135,
        6
    );

}


/* =========================================================
   DRAW WORLD
========================================================= */

function drawWorld() {

    ctx.fillStyle = "#171717";
    ctx.fillRect(0, 0, W, H);


    /* пол */

    for (let y = 15; y < 170; y += 15) {

        for (let x = 10; x < 315; x += 15) {

            ctx.fillStyle = "#222";

            ctx.fillRect(x, y, 1, 1);

        }

    }


    /* стены */

    ctx.fillStyle = "#555";

    ctx.fillRect(0, 0, 320, 8);
    ctx.fillRect(0, 172, 320, 8);
    ctx.fillRect(0, 0, 8, 180);
    ctx.fillRect(312, 0, 8, 180);


    /* дверь */

    ctx.fillStyle = "#733333";

    ctx.fillRect(
        300,
        65,
        12,
        35
    );


    /* стол */

    ctx.fillStyle = "#63391f";

    ctx.fillRect(
        142,
        47,
        52,
        30
    );

    ctx.fillStyle = "#8b522e";

    ctx.fillRect(
        145,
        45,
        46,
        23
    );


    /* пицца */

    drawPizza();


    /* игрок */

    drawCharacter(
        player.x,
        player.y,
        "#fff"
    );


    text(
        "КОМНАТА 1",
        15,
        20,
        7
    );


    if (pizzaDistance() < 35) {

        box(
            75,
            135,
            170,
            22
        );

        text(
            "Z — СОХРАНИТЬСЯ У ПИЦЦЫ",
            87,
            149,
            6
        );

    }


    if (game.messageTimer > 0) {

        box(
            90,
            25,
            140,
            20
        );

        text(
            game.message,
            105,
            38,
            6
        );

        game.messageTimer--;

    }

}


/* =========================================================
   PIZZA
========================================================= */

function drawPizza() {

    /* тарелка */

    ctx.fillStyle = "#ddd";

    ctx.fillRect(
        153,
        50,
        30,
        13
    );


    /* тесто */

    ctx.fillStyle = "#d58a35";

    ctx.fillRect(
        157,
        48,
        22,
        13
    );


    /* сыр */

    ctx.fillStyle = "#ffd85a";

    ctx.fillRect(
        159,
        50,
        18,
        9
    );


    /* пепперони */

    ctx.fillStyle = "#a83232";

    ctx.fillRect(161, 52, 3, 3);
    ctx.fillRect(170, 54, 3, 3);


    /* звёзды */

    text("*", 147, 53, 7);
    text("*", 183, 58, 7);

}


/* =========================================================
   CHARACTER
========================================================= */

function drawCharacter(x, y, color) {

    x = Math.floor(x);
    y = Math.floor(y);

    ctx.fillStyle = "#000";

    ctx.fillRect(
        x - 1,
        y - 1,
        12,
        16
    );

    ctx.fillStyle = color;

    ctx.fillRect(
        x + 2,
        y,
        6,
        6
    );

    ctx.fillRect(
        x + 1,
        y + 6,
        8,
        7
    );

    ctx.fillRect(
        x + 1,
        y + 13,
        3,
        2
    );

    ctx.fillRect(
        x + 6,
        y + 13,
        3,
        2
    );

}


/* =========================================================
   DRAW MENU
========================================================= */

function drawMenu() {

    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, W, H);

    box(20, 10, 280, 160);

    text(
        "ГЛАВНОЕ МЕНЮ",
        90,
        30,
        10
    );


    menuItems.forEach(function(item, i) {

        const y = 55 + i * 23;

        if (i === game.menu) {

            text(
                "▶",
                55,
                y,
                8
            );

        }

        text(
            item,
            75,
            y,
            8
        );

    });


    text(
        "↑ ↓ — выбор",
        35,
        157,
        6
    );

    text(
        "Z — выбрать",
        220,
        157,
        6
    );

}


/* =========================================================
   DRAW STATUS
========================================================= */

function drawStatus() {

    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, W, H);

    box(20, 10, 280, 160);

    text(
        "СТАТУС ОТРЯДА",
        90,
        30,
        10
    );


    party.forEach(function(p, i) {

        const y = 52 + i * 21;

        ctx.fillStyle = p.color;

        ctx.font = "7px monospace";

        ctx.fillText(
            p.name,
            40,
            y
        );

        text(
            "HP " +
            p.hp +
            "/" +
            p.maxHp,
            135,
            y,
            6
        );

        hpBar(
            205,
            y - 6,
            60,
            6,
            p.hp,
            p.maxHp
        );

    });


    text(
        "X — назад",
        220,
        157,
        6
    );

}


/* =========================================================
   DRAW SAVE
========================================================= */

function drawSave() {

    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, W, H);

    box(20, 10, 280, 160);

    text(
        "СОХРАНЕНИЯ",
        105,
        30,
        10
    );


    for (let i = 0; i < 3; i++) {

        const y = 60 + i * 30;

        if (i === game.saveSlot) {

            ctx.strokeStyle = "#fff";

            ctx.strokeRect(
                45,
                y - 10,
                230,
                20
            );

            text(
                "▶",
                51,
                y + 3,
                7
            );

        }


        text(
            "ФАЙЛ " + (i + 1),
            70,
            y,
            7
        );


        const data =
            localStorage.getItem(
                "bloodGlowSave" + i
            );


        if (data) {

            text(
                "ЗАНЯТ",
                200,
                y,
                6
            );

        } else {

            text(
                "ПУСТО",
                200,
                y,
                6
            );

        }

    }


    text(
        "Z — сохранить / загрузить",
        55,
        150,
        6
    );

    text(
        "X — назад",
        220,
        150,
        6
    );

}


/* =========================================================
   DRAW BATTLE
========================================================= */

function drawBattle() {

    const b = game.battle;

    ctx.fillStyle = "#030303";
    ctx.fillRect(0, 0, W, H);


    /* враг */

    box(20, 8, 280, 60);

    text(
        b.enemy.name,
        30,
        20,
        7
    );


    /* враг */

    ctx.fillStyle = "#6633aa";

    ctx.fillRect(
        145,
        28,
        30,
        28
    );

    ctx.fillStyle = "#fff";

    ctx.fillRect(
        151,
        35,
        5,
        5
    );

    ctx.fillRect(
        164,
        35,
        5,
        5
    );


    text(
        "HP",
        215,
        20,
        6
    );

    hpBar(
        235,
        15,
        50,
        6,
        b.enemy.hp,
        b.enemy.maxHp
    );


    /* сообщение */

    text(
        b.text,
        25,
        80,
        6
    );


    /* ======================================
       RD ШКАЛА СПРАВА
    ====================================== */

    drawRD();


    /* ======================================
       БОЕВАЯ ЗОНА
    ====================================== */

    if (b.phase === "enemy") {

        box(
            50,
            88,
            220,
            70
        );


        b.bullets.forEach(function(bullet) {

            ctx.fillStyle = "#fff";

            ctx.fillRect(
                bullet.x - 2,
                bullet.y - 2,
                4,
                4
            );

        });


        ctx.fillStyle = "#ff3333";

        ctx.fillRect(
            b.soulX - 3,
            b.soulY - 3,
            6,
            6
        );


        text(
            "ЗАЩИТА: " +
            (b.defending ? "ON" : "OFF"),
            10,
            95,
            5
        );

        return;

    }


    if (b.phase === "victory") {

        text(
            "ПОБЕДА!",
            125,
            110,
            12
        );

        text(
            "Z — продолжить",
            105,
            130,
            7
        );

        return;

    }


    if (b.phase === "defeat") {

        text(
            "ОТРЯД ПОБЕЖДЁН",
            88,
            110,
            9
        );

        text(
            "Z — восстановиться",
            98,
            130,
            6
        );

        return;

    }


    /* партия */

    party.forEach(function(p, i) {

        const y = 105 + i * 11;

        if (i === b.actor) {

            text(
                "▶",
                4,
                y,
                6
            );

        }

        ctx.fillStyle = p.color;
        ctx.font = "5px monospace";

        ctx.fillText(
            p.name,
            12,
            y
        );

        text(
            p.hp + "/" + p.maxHp,
            72,
            y,
            5
        );

    });


    /* меню */

    const actions = [
        "FIGHT",
        "ACT",
        "ITEM",
        "DEFEND"
    ];


    actions.forEach(function(a, i) {

        const x =
            i < 2
            ? 165
            : 230;

        const y =
            i % 2 === 0
            ? 105
            : 130;


        if (i === b.action) {

            ctx.strokeStyle = "#fff";

            ctx.strokeRect(
                x - 7,
                y - 8,
                58,
                16
            );

        }

        text(
            a,
            x,
            y + 2,
            6
        );

    });

}


/* =========================================================
   RD
========================================================= */

function drawRD() {

    const b = game.battle;

    const x = 300;
    const y = 75;
    const w = 12;
    const h = 90;


    /* фон */

    ctx.fillStyle = "#222";

    ctx.fillRect(
        x,
        y,
        w,
        h
    );


    /* заполнение снизу вверх */

    const amount =
        h *
        (b.rd / 100);


    ctx.fillStyle = "#ff4444";

    ctx.fillRect(
        x,
        y + h - amount,
        w,
        amount
    );


    /* рамка */

    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        x,
        y,
        w,
        h
    );


    text(
        "R",
        304,
        72,
        5
    );

    text(
        "D",
        304,
        174,
        5
    );


    text(
        Math.floor(b.rd) + "%",
        278,
        82,
        5
    );


    /*
       Когда шкала полностью
       заполнилась — можно
       использовать особое действие.
    */

    if (b.rd >= 100) {

        ctx.fillStyle = "#ffd83d";

        ctx.fillRect(
            x - 2,
            y - 3,
            w + 4,
            3
        );

    }

}


/* =========================================================
   DRAW
========================================================= */

function draw() {

    if (game.screen === "title") {

        drawTitle();

    }

    else if (game.screen === "world") {

        drawWorld();

    }

    else if (game.screen === "menu") {

        drawMenu();

    }

    else if (game.screen === "status") {

        drawStatus();

    }

    else if (game.screen === "save") {

        drawSave();

    }

    else if (game.screen === "battle") {

        drawBattle();

    }

}


/* =========================================================
   INPUT MEMORY
========================================================= */

function rememberKeys() {

    oldKeys.up = keys.up;
    oldKeys.down = keys.down;
    oldKeys.left = keys.left;
    oldKeys.right = keys.right;

    oldKeys.z = keys.z;
    oldKeys.x = keys.x;
    oldKeys.c = keys.c;

}


/* =========================================================
   MAIN LOOP
========================================================= */

function update() {

    if (game.screen === "title")
        updateTitle();

    else if (game.screen === "world")
        updateWorld();

    else if (game.screen === "menu")
        updateMenu();

    else if (game.screen === "status")
        updateStatus();

    else if (game.screen === "save")
        updateSaveMenu();

    else if (game.screen === "battle")
        updateBattle();


    rememberKeys();
}


function loop() {

    update();

    draw();

    requestAnimationFrame(loop);

}


/* =========================================================
   START
========================================================= */

try {

    draw();
    loop();

} catch (error) {

    console.error(
        "Blood Glow ошибка:",
        error
    );

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#fff";
    ctx.font = "8px monospace";

    ctx.fillText(
        "ОШИБКА ИГРЫ",
        110,
        80
    );

    ctx.fillText(
        "Проверь script.js",
        95,
        95
    );

    }
