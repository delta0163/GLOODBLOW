"use strict";

/* =====================================================
   CANVAS
===================================================== */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const W = 320;
const H = 180;

ctx.imageSmoothingEnabled = false;


/* =====================================================
   INPUT
===================================================== */

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


/* =====================================================
   KEYBOARD
===================================================== */

window.addEventListener("keydown", function(e) {

    const key = e.key.toLowerCase();

    if (key === "arrowup" || key === "w")
        keys.up = true;

    if (key === "arrowdown" || key === "s")
        keys.down = true;

    if (key === "arrowleft" || key === "a")
        keys.left = true;

    if (key === "arrowright" || key === "d")
        keys.right = true;

    if (key === "z")
        keys.z = true;

    if (key === "x")
        keys.x = true;

    if (key === "c")
        keys.c = true;

    e.preventDefault();

}, false);


window.addEventListener("keyup", function(e) {

    const key = e.key.toLowerCase();

    if (key === "arrowup" || key === "w")
        keys.up = false;

    if (key === "arrowdown" || key === "s")
        keys.down = false;

    if (key === "arrowleft" || key === "a")
        keys.left = false;

    if (key === "arrowright" || key === "d")
        keys.right = false;

    if (key === "z")
        keys.z = false;

    if (key === "x")
        keys.x = false;

    if (key === "c")
        keys.c = false;

    e.preventDefault();

}, false);


/* =====================================================
   MOBILE BUTTONS
===================================================== */

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

    button.addEventListener("pointerleave", function() {

        if (button.hasPointerCapture &&
            button.hasPointerCapture()) {

            keys[key] = false;
        }

    });

});


/* =====================================================
   FULLSCREEN
===================================================== */

document.getElementById("fullscreen")
    .addEventListener("click", async function() {

        try {

            if (!document.fullscreenElement) {

                await document.documentElement.requestFullscreen();

            } else {

                await document.exitFullscreen();

            }

        } catch (error) {

            console.log(error);

        }

    });


/* =====================================================
   GAME STATE
===================================================== */

const game = {

    screen: "menu",

    menu: 0,

    room: "start",

    message: "",

    messageTimer: 0,

    battle: null

};


/* =====================================================
   PLAYER
===================================================== */

const player = {

    x: 155,
    y: 115,

    speed: 1.4,

    size: 10

};


/* =====================================================
   PARTY
===================================================== */

const party = [

    {
        name: "ДЕЛЬТА",
        hp: 100,
        maxHP: 100,
        atk: 15,
        def: 10
    },

    {
        name: "НЕМКА",
        hp: 100,
        maxHP: 100,
        atk: 12,
        def: 11
    },

    {
        name: "ЛИЧИ",
        hp: 90,
        maxHP: 90,
        atk: 14,
        def: 8
    },

    {
        name: "ПАНКЕЙК",
        hp: 80,
        maxHP: 80,
        atk: 10,
        def: 13
    },

    {
        name: "КАШТАН",
        hp: 120,
        maxHP: 120,
        atk: 13,
        def: 15
    }

];


/* =====================================================
   START SCREEN
===================================================== */

function drawStart() {

    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#fff";

    ctx.font = "18px monospace";

    ctx.textAlign = "center";

    ctx.fillText(
        "BLOOD GLOW",
        160,
        35
    );

    ctx.font = "10px monospace";

    ctx.fillText(
        "RPG",
        160,
        50
    );


    const items = [
        "НОВАЯ ИГРА",
        "ЗАГРУЗИТЬ",
        "ВЫХОД"
    ];


    items.forEach(function(text, i) {

        const y = 80 + i * 22;

        if (game.menu === i) {

            ctx.fillText(
                "▶",
                105,
                y
            );

        }

        ctx.fillText(
            text,
            160,
            y
        );

    });


    ctx.font = "6px monospace";

    ctx.fillText(
        "↑ ↓ — выбор     Z — подтвердить",
        160,
        160
    );

    ctx.textAlign = "left";

}


/* =====================================================
   MENU UPDATE
===================================================== */

function updateMenu() {

    if (pressed("up")) {

        game.menu--;

        if (game.menu < 0)
            game.menu = 2;

    }

    if (pressed("down")) {

        game.menu++;

        if (game.menu > 2)
            game.menu = 0;

    }

    if (pressed("z")) {

        if (game.menu === 0) {

            newGame();

        }

        if (game.menu === 1) {

            loadGame();

        }

        if (game.menu === 2) {

            game.message =
                "Спасибо за игру!";

        }

    }

}


/* =====================================================
   NEW GAME
===================================================== */

function newGame() {

    player.x = 155;
    player.y = 115;

    party.forEach(function(p) {

        p.hp = p.maxHP;

    });

    game.room = "start";

    game.screen = "world";

    showMessage(
        "ДЕЛЬТА: Нужно идти дальше..."
    );

}


/* =====================================================
   WORLD
===================================================== */

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


    if (dx !== 0 && dy !== 0) {

        dx *= 0.707;
        dy *= 0.707;

    }


    player.x += dx;
    player.y += dy;


    player.x = Math.max(
        12,
        Math.min(
            308,
            player.x
        )
    );

    player.y = Math.max(
        25,
        Math.min(
            155,
            player.y
        )
    );


    /* C — главное меню */

    if (pressed("c")) {

        game.screen = "menu";
        game.menu = 0;

    }


    /* Z возле выхода */

    if (
        player.x > 270 &&
        pressed("z")
    ) {

        startBattle();

    }


    /* Стол с пиццей */

    if (
        player.x > 100 &&
        player.x < 190 &&
        player.y > 55 &&
        player.y < 100 &&
        pressed("z")
    ) {

        saveGame();

        showMessage(
            "Ты отдохнул у стола с пиццей."
        );

    }

}


/* =====================================================
   WORLD DRAW
===================================================== */

function drawWorld() {

    ctx.fillStyle = "#171717";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* пол */

    ctx.fillStyle = "#222";

    for (
        let x = 10;
        x < 310;
        x += 16
    ) {

        for (
            let y = 20;
            y < 165;
            y += 16
        ) {

            ctx.fillRect(
                x,
                y,
                1,
                1
            );

        }

    }


    /* стены */

    ctx.fillStyle = "#555";

    ctx.fillRect(0, 0, 320, 8);
    ctx.fillRect(0, 165, 320, 15);
    ctx.fillRect(0, 0, 8, 180);
    ctx.fillRect(312, 0, 8, 180);


    /* выход */

    ctx.fillStyle = "#772222";

    ctx.fillRect(
        285,
        65,
        27,
        45
    );


    ctx.fillStyle = "#fff";

    ctx.font = "6px monospace";

    ctx.fillText(
        "ВЫХОД",
        285,
        60
    );


    /* стол */

    drawPizzaTable(
        125,
        65
    );


    /* игрок */

    drawPlayer();


    /* подсказка */

    ctx.fillStyle = "#fff";

    ctx.font = "6px monospace";

    ctx.fillText(
        "Z — действие",
        12,
        20
    );

    ctx.fillText(
        "C — меню",
        12,
        30
    );


    if (
        player.x > 270
    ) {

        ctx.fillText(
            "Z — начать бой",
            225,
            125
        );

    }

}


/* =====================================================
   PLAYER DRAW
===================================================== */

function drawPlayer() {

    ctx.fillStyle = "#000";

    ctx.fillRect(
        player.x - 6,
        player.y - 8,
        12,
        16
    );


    ctx.fillStyle = "#fff";

    ctx.fillRect(
        player.x - 4,
        player.y - 7,
        8,
        7
    );


    ctx.fillStyle = "#aaa";

    ctx.fillRect(
        player.x - 5,
        player.y,
        10,
        7
    );

}


/* =====================================================
   PIZZA TABLE
===================================================== */

function drawPizzaTable(x, y) {

    /* ножки */

    ctx.fillStyle = "#3b2115";

    ctx.fillRect(
        x + 5,
        y + 18,
        5,
        12
    );

    ctx.fillRect(
        x + 50,
        y + 18,
        5,
        12
    );


    /* стол */

    ctx.fillStyle = "#70401f";

    ctx.fillRect(
        x,
        y,
        60,
        20
    );


    ctx.fillStyle = "#9a5b2d";

    ctx.fillRect(
        x + 2,
        y + 2,
        56,
        6
    );


    /* тарелка */

    ctx.fillStyle = "#ddd";

    ctx.fillRect(
        x + 17,
        y + 5,
        25,
        9
    );


    /* пицца */

    ctx.fillStyle = "#d77a25";

    ctx.beginPath();

    ctx.moveTo(
        x + 20,
        y + 6
    );

    ctx.lineTo(
        x + 39,
        y + 6
    );

    ctx.lineTo(
        x + 30,
        y + 13
    );

    ctx.closePath();

    ctx.fill();


    /* сыр */

    ctx.fillStyle = "#ffd84d";

    ctx.fillRect(
        x + 25,
        y + 7,
        8,
        3
    );


    /* пепперони */

    ctx.fillStyle = "#a52d2d";

    ctx.fillRect(
        x + 27,
        y + 8,
        2,
        2
    );

    ctx.fillRect(
        x + 34,
        y + 7,
        2,
        2
    );


    /* звёздочки */

    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";

    ctx.fillText("*", x - 6, y + 4);
    ctx.fillText("*", x + 58, y + 8);

}


/* =====================================================
   BATTLE
===================================================== */

function startBattle() {

    game.screen = "battle";

    game.battle = {

        enemy: {
            name: "ТЕНЕВОЙ ЗВЕРЬ",
            hp: 300,
            maxHP: 300
        },

        actor: 0,

        menu: 0,

        phase: "menu",

        /* РД */

        rd: 0,

        rdMax: 100,

        defending: false,

        soul: {
            x: 160,
            y: 130,
            speed: 2
        },

        bullets: [],

        timer: 0,

        message:
            "ХОД ДЕЛЬТЫ"

    };


    createBullets();

}


/* =====================================================
   BULLETS
===================================================== */

function createBullets() {

    const b = game.battle;

    b.bullets = [];

    for (
        let i = 0;
        i < 8;
        i++
    ) {

        b.bullets.push({

            x: 60 + Math.random() * 200,

            y: 90 + Math.random() * 60,

            vx:
                (Math.random() - 0.5) * 0.8,

            vy:
                0.5 + Math.random() * 1.2,

            size: 3

        });

    }

}


/* =====================================================
   BATTLE UPDATE
===================================================== */

function updateBattle() {

    const b = game.battle;


    if (!b)
        return;


    /* ===================================
       МЕНЮ БОЯ
    =================================== */

    if (b.phase === "menu") {

        if (pressed("left")) {

            b.menu--;

            if (b.menu < 0)
                b.menu = 3;

        }

        if (pressed("right")) {

            b.menu++;

            if (b.menu > 3)
                b.menu = 0;

        }


        if (pressed("z")) {

            battleAction();

        }

    }


    /* ===================================
       ЗАЩИТА / ИГРОВАЯ АТАКА
    =================================== */

    if (b.phase === "enemy") {

        updateEnemyAttack();

    }


    /* ===================================
       ПОБЕДА
    =================================== */

    if (b.phase === "victory") {

        if (pressed("z")) {

            game.screen = "world";
            game.battle = null;

        }

    }


    /* ===================================
       ПОРАЖЕНИЕ
    =================================== */

    if (b.phase === "defeat") {

        if (pressed("z")) {

            party.forEach(function(p) {

                p.hp = p.maxHP;

            });

            game.screen = "world";
            game.battle = null;

        }

    }

}


/* =====================================================
   BATTLE ACTION
===================================================== */

function battleAction() {

    const b = game.battle;

    const actor =
        party[b.actor];


    /* FIGHT */

    if (b.menu === 0) {

        const damage =
            actor.atk +
            Math.floor(
                Math.random() * 6
            );


        b.enemy.hp -= damage;


        /* РД растёт от атаки */

        b.rd = Math.min(
            b.rdMax,
            b.rd + 20
        );


        b.defending = false;


        b.message =
            actor.name +
            " атакует! -" +
            damage;


        if (b.enemy.hp <= 0) {

            b.enemy.hp = 0;

            b.phase = "victory";

            b.message =
                "ТЕНЕВОЙ ЗВЕРЬ ПОБЕЖДЁН!";

            return;

        }


        nextActor();

    }


    /* ACT */

    else if (b.menu === 1) {

        b.rd = Math.min(
            100,
            b.rd + 30
        );


        b.message =
            actor.name +
            " изучил врага.";

        nextActor();

    }


    /* ITEM */

    else if (b.menu === 2) {

        actor.hp =
            Math.min(
                actor.maxHP,
                actor.hp + 25
            );


        b.message =
            actor.name +
            " восстановил HP.";

        nextActor();

    }


    /* ЗАЩИТА */

    else if (b.menu === 3) {

        /*
           Главное:
           защита НЕ увеличивает РД.
        */

        b.defending = true;

        b.message =
            actor.name +
            " защищается.";

        nextActor();

    }

}


/* =====================================================
   NEXT ACTOR
===================================================== */

function nextActor() {

    const b = game.battle;

    b.actor++;


    if (
        b.actor >= party.length
    ) {

        b.actor = 0;

        startEnemyAttack();

    }

    else {

        b.phase = "menu";

        b.menu = 0;

        b.defending = false;

        b.message =
            "ХОД " +
            party[b.actor].name;

    }

}


/* =====================================================
   ENEMY ATTACK
===================================================== */

function startEnemyAttack() {

    const b = game.battle;

    b.phase = "enemy";

    b.timer = 500;

    b.soul.x = 160;
    b.soul.y = 130;

    createBullets();

}


/* =====================================================
   UPDATE ENEMY ATTACK
===================================================== */

function updateEnemyAttack() {

    const b = game.battle;


    /* движение души */

    if (keys.up)
        b.soul.y -= b.soul.speed;

    if (keys.down)
        b.soul.y += b.soul.speed;

    if (keys.left)
        b.soul.x -= b.soul.speed;

    if (keys.right)
        b.soul.x += b.soul.speed;


    b.soul.x =
        Math.max(
            55,
            Math.min(
                265,
                b.soul.x
            )
        );


    b.soul.y =
        Math.max(
            90,
            Math.min(
                155,
                b.soul.y
            )
        );


    /* пули */

    b.bullets.forEach(function(bullet) {

        bullet.x += bullet.vx;
        bullet.y += bullet.vy;


        if (
            bullet.y > 158
        ) {

            bullet.y = 90;

            bullet.x =
                55 +
                Math.random() * 210;

        }


        const dx =
            bullet.x -
            b.soul.x;

        const dy =
            bullet.y -
            b.soul.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance <
            bullet.size + 4
        ) {

            hitPlayer();

            bullet.y = 90;

            bullet.x =
                55 +
                Math.random() * 210;

        }

    });


    b.timer--;


    if (b.timer <= 0) {

        b.phase = "menu";

        b.actor = 0;

        b.menu = 0;

        b.defending = false;

        b.message =
            "ХОД ДЕЛЬТЫ";

    }

}


/* =====================================================
   HIT PLAYER
===================================================== */

function hitPlayer() {

    const b = game.battle;

    const actor =
        party[b.actor];


    let damage = 12;


    /*
       Если была защита —
       урон уменьшается.

       РД при защите НЕ растёт.
    */

    if (b.defending) {

        damage = 5;

    }


    actor.hp =
        Math.max(
            0,
            actor.hp - damage
        );


    b.message =
        actor.name +
        " получил " +
        damage +
        " урона!";


    checkDefeat();

}


/* =====================================================
   DEFEAT
===================================================== */

function checkDefeat() {

    let alive = false;


    party.forEach(function(p) {

        if (p.hp > 0)
            alive = true;

    });


    if (!alive) {

        game.battle.phase = "defeat";

    }

}


/* =====================================================
   BATTLE DRAW
===================================================== */

function drawBattle() {

    const b = game.battle;


    ctx.fillStyle = "#050505";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* враг */

    ctx.strokeStyle = "#777";

    ctx.strokeRect(
        20,
        8,
        280,
        58
    );


    ctx.fillStyle = "#8b35a8";

    ctx.fillRect(
        142,
        22,
        36,
        30
    );


    ctx.fillStyle = "#fff";

    ctx.fillRect(
        148,
        29,
        5,
        5
    );

    ctx.fillRect(
        167,
        29,
        5,
        5
    );


    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";

    ctx.fillText(
        b.enemy.name,
        27,
        19
    );


    /* HP врага */

    ctx.fillText(
        "HP",
        225,
        19
    );

    drawBar(
        245,
        13,
        45,
        6,
        b.enemy.hp,
        b.enemy.maxHP
    );


    /* РД */

    drawRD();


    /* сообщение */

    ctx.fillStyle = "#fff";

    ctx.font = "6px monospace";

    ctx.fillText(
        b.message,
        20,
        80
    );


    /* сторона */

    drawParty();


    /* поле атаки */

    if (
        b.phase === "enemy"
    ) {

        drawAttackBox();

    }


    /* меню */

    if (
        b.phase === "menu"
    ) {

        drawBattleMenu();

    }


    if (
        b.phase === "victory"
    ) {

        ctx.fillStyle = "#fff";

        ctx.font = "12px monospace";

        ctx.textAlign = "center";

        ctx.fillText(
            "ПОБЕДА!",
            160,
            115
        );

        ctx.font = "7px monospace";

        ctx.fillText(
            "Z — продолжить",
            160,
            130
        );

        ctx.textAlign = "left";

    }


    if (
        b.phase === "defeat"
    ) {

        ctx.fillStyle = "#fff";

        ctx.font = "10px monospace";

        ctx.textAlign = "center";

        ctx.fillText(
            "ОТРЯД ПОБЕЖДЁН",
            160,
            115
        );

        ctx.font = "7px monospace";

        ctx.fillText(
            "Z — восстановиться",
            160,
            130
        );

        ctx.textAlign = "left";

    }

}


/* =====================================================
   РД BAR
===================================================== */

function drawRD() {

    const b = game.battle;

    const x = 200;
    const y = 35;

    const w = 95;
    const h = 9;


    /* фон */

    ctx.fillStyle = "#181818";

    ctx.fillRect(
        x,
        y,
        w,
        h
    );


    /* рамка */

    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        x,
        y,
        w,
        h
    );


    /* заполнение */

    ctx.fillStyle = "#ffcc33";

    ctx.fillRect(
        x + 1,
        y + 1,
        (w - 2) *
        (b.rd / b.rdMax),
        h - 2
    );


    ctx.fillStyle = "#fff";

    ctx.font = "5px monospace";

    ctx.fillText(
        "РД " +
        Math.floor(b.rd) +
        "%",
        x,
        y - 3
    );


    /*
       Предупреждение,
       когда РД почти заполнен.
    */

    if (b.rd >= 80) {

        ctx.fillStyle = "#ff5555";

        ctx.font = "5px monospace";

        ctx.fillText(
            "АТАКА БЛИЗКО",
            200,
            52
        );

    }

}


/* =====================================================
   PARTY DRAW
===================================================== */

function drawParty() {

    const b = game.battle;


    party.forEach(function(p, i) {

        const y = 102 + i * 12;


        if (
            i === b.actor &&
            b.phase === "menu"
        ) {

            ctx.fillStyle = "#fff";

            ctx.fillText(
                "▶",
                3,
                y
            );

        }


        ctx.fillStyle =
            p.hp > 0
                ? "#fff"
                : "#555";


        ctx.font = "5px monospace";

        ctx.fillText(
            p.name,
            11,
            y
        );


        ctx.fillStyle = "#333";

        ctx.fillRect(
            58,
            y - 5,
            35,
            5
        );


        ctx.fillStyle = "#fff";

        ctx.fillRect(
            58,
            y - 5,
            35 *
            (p.hp / p.maxHP),
            5
        );


        ctx.fillStyle = "#fff";

        ctx.fillText(
            p.hp + "/" + p.maxHP,
            98,
            y
        );

    });

}


/* =====================================================
   BATTLE MENU
===================================================== */

function drawBattleMenu() {

    const labels = [
        "АТАКА",
        "ACT",
        "ITEM",
        "ЗАЩИТА"
    ];


    labels.forEach(function(label, i) {

        const x =
            170 +
            (i % 2) * 65;

        const y =
            105 +
            Math.floor(i / 2) * 25;


        if (
            game.battle.menu === i
        ) {

            ctx.strokeStyle = "#fff";

            ctx.strokeRect(
                x - 7,
                y - 9,
                58,
                17
            );

        }


        ctx.fillStyle = "#fff";

        ctx.font = "6px monospace";

        ctx.fillText(
            label,
            x,
            y + 2
        );

    });

}


/* =====================================================
   ATTACK BOX
===================================================== */

function drawAttackBox() {

    const b = game.battle;


    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
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


    /* душа */

    ctx.fillStyle = "#ff3333";

    ctx.fillRect(
        b.soul.x - 4,
        b.soul.y - 4,
        8,
        8
    );

}


/* =====================================================
   SIMPLE BAR
===================================================== */

function drawBar(
    x,
    y,
    w,
    h,
    value,
    max
) {

    ctx.fillStyle = "#333";

    ctx.fillRect(
        x,
        y,
        w,
        h
    );


    ctx.fillStyle = "#fff";

    ctx.fillRect(
        x,
        y,
        w *
        Math.max(
            0,
            value / max
        ),
        h
    );

}


/* =====================================================
   SAVE
===================================================== */

function saveGame() {

    const data = {

        x: player.x,
        y: player.y,

        party: party.map(function(p) {

            return {
                hp: p.hp
            };

        })

    };


    try {

        localStorage.setItem(
            "blood_glow_save",
            JSON.stringify(data)
        );

        showMessage(
            "ИГРА СОХРАНЕНА"
        );

    } catch (error) {

        showMessage(
            "ОШИБКА СОХРАНЕНИЯ"
        );

    }

}


/* =====================================================
   LOAD
===================================================== */

function loadGame() {

    try {

        const raw =
            localStorage.getItem(
                "blood_glow_save"
            );


        if (!raw) {

            showMessage(
                "ФАЙЛ СОХРАНЕНИЯ ПУСТ"
            );

            return;

        }


        const data =
            JSON.parse(raw);


        player.x =
            data.x || 155;

        player.y =
            data.y || 115;


        if (data.party) {

            data.party.forEach(
                function(saved, i) {

                    if (party[i]) {

                        party[i].hp =
                            saved.hp;

                    }

                }
            );

        }


        game.screen = "world";

        showMessage(
            "ИГРА ЗАГРУЖЕНА"
        );

    } catch (error) {

        console.log(error);

        showMessage(
            "ОШИБКА ФАЙЛА"
        );

    }

}


/* =====================================================
   MESSAGE
===================================================== */

function showMessage(text) {

    game.message = text;

    game.messageTimer = 180;

}


/* =====================================================
   PRESSED
===================================================== */

function pressed(key) {

    return (
        keys[key] &&
        !oldKeys[key]
    );

}


/* =====================================================
   UPDATE
===================================================== */

function update() {

    if (
        game.screen === "menu"
    ) {

        updateMenu();

    }


    else if (
        game.screen === "world"
    ) {

        updateWorld();

    }


    else if (
        game.screen === "battle"
    ) {

        updateBattle();

    }


    if (
        game.messageTimer > 0
    ) {

        game.messageTimer--;

    }


    /* запоминаем клавиши */

    Object.keys(keys).forEach(function(key) {

        oldKeys[key] = keys[key];

    });

}


/* =====================================================
   DRAW
===================================================== */

function draw() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    if (
        game.screen === "menu"
    ) {

        drawStart();

    }


    else if (
        game.screen === "world"
    ) {

        drawWorld();

    }


    else if (
        game.screen === "battle"
    ) {

        drawBattle();

    }


    /* сообщение поверх игры */

    if (
        game.messageTimer > 0 &&
        game.screen !== "menu"
    ) {

        ctx.fillStyle = "rgba(0,0,0,0.8)";

        ctx.fillRect(
            45,
            145,
            230,
            20
        );


        ctx.strokeStyle = "#fff";

        ctx.strokeRect(
            45,
            145,
            230,
            20
        );


        ctx.fillStyle = "#fff";

        ctx.font = "6px monospace";

        ctx.textAlign = "center";

        ctx.fillText(
            game.message,
            160,
            158
        );

        ctx.textAlign = "left";

    }

}


/* =====================================================
   MAIN LOOP
===================================================== */

function loop() {

    update();

    draw();

    requestAnimationFrame(loop);

}


/* =====================================================
   START
===================================================== */

loop();
