"use strict";

/* =========================================================
   CANVAS
========================================================= */

const canvas = document.getElementById("game");
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

const pressed = {
    z: false,
    x: false,
    c: false,

    up: false,
    down: false,
    left: false,
    right: false
};


/* =========================================================
   KEYBOARD
========================================================= */

window.addEventListener("keydown", function(e) {

    let k = e.key.toLowerCase();

    if (e.key === "ArrowUp" || k === "w") {
        keys.up = true;
    }

    if (e.key === "ArrowDown" || k === "s") {
        keys.down = true;
    }

    if (e.key === "ArrowLeft" || k === "a") {
        keys.left = true;
    }

    if (e.key === "ArrowRight" || k === "d") {
        keys.right = true;
    }

    if (k === "z") {
        keys.z = true;
    }

    if (k === "x") {
        keys.x = true;
    }

    if (k === "c") {
        keys.c = true;
    }

    e.preventDefault();

}, { passive: false });


window.addEventListener("keyup", function(e) {

    let k = e.key.toLowerCase();

    if (e.key === "ArrowUp" || k === "w") {
        keys.up = false;
    }

    if (e.key === "ArrowDown" || k === "s") {
        keys.down = false;
    }

    if (e.key === "ArrowLeft" || k === "a") {
        keys.left = false;
    }

    if (e.key === "ArrowRight" || k === "d") {
        keys.right = false;
    }

    if (k === "z") {
        keys.z = false;
    }

    if (k === "x") {
        keys.x = false;
    }

    if (k === "c") {
        keys.c = false;
    }

    e.preventDefault();

}, { passive: false });


/* =========================================================
   MOBILE BUTTONS
========================================================= */

document.querySelectorAll(".joy").forEach(function(button) {

    const key = button.dataset.key;

    button.addEventListener("pointerdown", function(e) {

        e.preventDefault();

        keys[key] = true;

        button.setPointerCapture(e.pointerId);

    });

    button.addEventListener("pointerup", function(e) {

        e.preventDefault();

        keys[key] = false;

    });

    button.addEventListener("pointercancel", function() {

        keys[key] = false;

    });

});


document.querySelectorAll(".action-button").forEach(function(button) {

    const key = button.dataset.key;

    button.addEventListener("pointerdown", function(e) {

        e.preventDefault();

        keys[key] = true;

        button.setPointerCapture(e.pointerId);

    });

    button.addEventListener("pointerup", function(e) {

        e.preventDefault();

        keys[key] = false;

    });

    button.addEventListener("pointercancel", function() {

        keys[key] = false;

    });

});


/* =========================================================
   FULLSCREEN
========================================================= */

const fullscreenButton =
    document.getElementById("fullscreen-button");

fullscreenButton.addEventListener("pointerdown", async function(e) {

    e.preventDefault();

    try {

        if (!document.fullscreenElement) {

            await document.documentElement.requestFullscreen();

        } else {

            await document.exitFullscreen();

        }

    } catch(error) {

        console.log(error);

    }

});


/* =========================================================
   GAME STATE
========================================================= */

const game = {

    screen: "menu",

    room: "room1",

    menuIndex: 0,

    saveIndex: 0,

    message: "",

    messageTimer: 0,

    battle: null

};


/* =========================================================
   PLAYER
========================================================= */

const player = {

    x: 150,
    y: 120,

    width: 10,
    height: 14,

    speed: 1.4

};


/* =========================================================
   PARTY
========================================================= */

const party = [

    {
        name: "ДЕЛЬТА",
        hp: 100,
        maxHP: 100,
        atk: 16
    },

    {
        name: "НЕМКА",
        hp: 90,
        maxHP: 90,
        atk: 13
    },

    {
        name: "ЛИЧИ",
        hp: 80,
        maxHP: 80,
        atk: 14
    },

    {
        name: "ПАНКЕЙК",
        hp: 75,
        maxHP: 75,
        atk: 11
    },

    {
        name: "КАШТАН",
        hp: 110,
        maxHP: 110,
        atk: 12
    }

];


/* =========================================================
   ROOMS
========================================================= */

const rooms = {

    room1: {

        name: "КОМНАТА",

        floor: "#181818",

        walls: [

            { x: 0, y: 0, w: 320, h: 8 },
            { x: 0, y: 172, w: 320, h: 8 },
            { x: 0, y: 0, w: 8, h: 180 },
            { x: 312, y: 0, w: 8, h: 180 },

            { x: 65, y: 55, w: 80, h: 10 },
            { x: 210, y: 55, w: 50, h: 10 }

        ],

        exit: {
            x: 294,
            y: 75,
            w: 18,
            h: 30
        },

        pizza: {
            x: 105,
            y: 65
        }

    },

    room2: {

        name: "ТЁМНАЯ КОМНАТА",

        floor: "#0d0d14",

        walls: [

            { x: 0, y: 0, w: 320, h: 8 },
            { x: 0, y: 172, w: 320, h: 8 },
            { x: 0, y: 0, w: 8, h: 180 },
            { x: 312, y: 0, w: 8, h: 180 }

        ],

        exit: {
            x: 8,
            y: 75,
            w: 18,
            h: 30
        }

    }

};


/* =========================================================
   COLLISION
========================================================= */

function collision(a, b) {

    return (

        a.x < b.x + b.w &&
        a.x + a.width > b.x &&
        a.y < b.y + b.h &&
        a.y + a.height > b.y

    );

}


function canMove(x, y) {

    const test = {

        x: x,
        y: y,

        width: player.width,
        height: player.height

    };

    const room = rooms[game.room];

    for (const wall of room.walls) {

        if (collision(test, wall)) {
            return false;
        }

    }

    return true;

}


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

function updatePlayer() {

    let dx = 0;
    let dy = 0;

    if (keys.up) {
        dy -= player.speed;
    }

    if (keys.down) {
        dy += player.speed;
    }

    if (keys.left) {
        dx -= player.speed;
    }

    if (keys.right) {
        dx += player.speed;
    }

    if (dx !== 0 && dy !== 0) {

        dx *= 0.707;
        dy *= 0.707;

    }

    if (canMove(player.x + dx, player.y)) {
        player.x += dx;
    }

    if (canMove(player.x, player.y + dy)) {
        player.y += dy;
    }

}


/* =========================================================
   DISTANCE
========================================================= */

function distance(x1, y1, x2, y2) {

    const dx = x1 - x2;
    const dy = y1 - y2;

    return Math.sqrt(dx * dx + dy * dy);

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(text) {

    game.message = text;
    game.messageTimer = 150;

}


/* =========================================================
   SAVE SYSTEM
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
        "blood_glow_save_" + slot,
        JSON.stringify(data)
    );

    showMessage("ИГРА СОХРАНЕНА");


}


function loadGame(slot) {

    const raw = localStorage.getItem(
        "blood_glow_save_" + slot
    );

    if (!raw) {

        showMessage("ФАЙЛ ПУСТ");

        return;

    }

    try {

        const data = JSON.parse(raw);

        game.room = data.room || "room1";

        player.x = Number.isFinite(data.x)
            ? data.x
            : 150;

        player.y = Number.isFinite(data.y)
            ? data.y
            : 120;

        if (Array.isArray(data.party)) {

            data.party.forEach(function(saved, i) {

                if (party[i] && Number.isFinite(saved.hp)) {

                    party[i].hp =
                        Math.max(
                            0,
                            Math.min(
                                party[i].maxHP,
                                saved.hp
                            )
                        );

                }

            });

        }

        game.screen = "explore";

        showMessage("ИГРА ЗАГРУЖЕНА");

    } catch(error) {

        console.log(error);

        showMessage("ОШИБКА ФАЙЛА");

    }

}


/* =========================================================
   MAIN MENU
========================================================= */

function updateMainMenu() {

    if (keyPressed("up")) {

        game.menuIndex--;

        if (game.menuIndex < 0) {
            game.menuIndex = 2;
        }

    }

    if (keyPressed("down")) {

        game.menuIndex++;

        if (game.menuIndex > 2) {
            game.menuIndex = 0;
        }

    }

    if (keyPressed("z")) {

        if (game.menuIndex === 0) {

            newGame();

        }

        if (game.menuIndex === 1) {

            game.screen = "saves";

        }

        if (game.menuIndex === 2) {

            const raw =
                localStorage.getItem(
                    "blood_glow_save_0"
                );

            if (raw) {

                loadGame(0);

            } else {

                newGame();

            }

        }

    }

}


function newGame() {

    game.room = "room1";

    player.x = 150;
    player.y = 120;

    party.forEach(function(p) {

        p.hp = p.maxHP;

    });

    game.screen = "explore";

    showMessage("НОВАЯ ИГРА");

}


/* =========================================================
   SAVE MENU
========================================================= */

function updateSaveMenu() {

    if (keyPressed("up")) {

        game.saveIndex--;

        if (game.saveIndex < 0) {
            game.saveIndex = 2;
        }

    }

    if (keyPressed("down")) {

        game.saveIndex++;

        if (game.saveIndex > 2) {
            game.saveIndex = 0;
        }

    }

    if (keyPressed("z")) {

        const slot = game.saveIndex;

        const raw =
            localStorage.getItem(
                "blood_glow_save_" + slot
            );

        if (raw) {

            loadGame(slot);

        } else {

            saveGame(slot);

        }

    }

    if (keyPressed("x")) {

        game.screen = "menu";

    }

}


/* =========================================================
   EXPLORE
========================================================= */

function updateExplore() {

    updatePlayer();

    const room = rooms[game.room];

    if (collision(player, room.exit)) {

        if (game.room === "room1") {

            game.room = "room2";

            player.x = 30;
            player.y = 90;

        } else {

            game.room = "room1";

            player.x = 275;
            player.y = 90;

        }

    }


    /* ПИЦЦА */

    if (room.pizza) {

        const p = room.pizza;

        if (
            distance(
                player.x,
                player.y,
                p.x + 15,
                p.y + 10
            ) < 25
        ) {

            if (keyPressed("z")) {

                game.screen = "saves";

                game.saveIndex = 0;

            }

        }

    }


    /* БОЙ */

    if (
        game.room === "room2" &&
        player.x > 130 &&
        player.x < 190 &&
        player.y > 60 &&
        player.y < 120
    ) {

        if (keyPressed("z")) {

            startBattle();

        }

    }


    /* C = MENU */

    if (keyPressed("c")) {

        game.screen = "menu";

        game.menuIndex = 0;

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

            hp: 250,
            maxHP: 250,

            atk: 12

        },

        actor: 0,

        menu: 0,

        mercy: 0,

        rd: 0,

        phase: "menu",

        defend: false,

        bullets: [],

        soul: {

            x: 160,
            y: 130,

            size: 4,

            speed: 2.5,

            invincible: 0

        },

        attackTimer: 0,

        message: "Что будет делать ДЕЛЬТА?"

    };

}


/* =========================================================
   BATTLE UPDATE
========================================================= */

function updateBattle() {

    const b = game.battle;

    if (!b) {
        return;
    }


    /* ---------------- MENU ---------------- */

    if (b.phase === "menu") {

        if (keyPressed("left")) {

            b.menu--;

            if (b.menu < 0) {
                b.menu = 3;
            }

        }

        if (keyPressed("right")) {

            b.menu++;

            if (b.menu > 3) {
                b.menu = 0;
            }

        }

        if (keyPressed("z")) {

            battleChoose();

        }

        return;

    }


    /* ---------------- ACT ---------------- */

    if (b.phase === "act") {

        if (keyPressed("x")) {

            b.phase = "menu";

            return;

        }

        if (keyPressed("up")) {

            b.act = (b.act || 0) - 1;

            if (b.act < 0) {
                b.act = 2;
            }

        }

        if (keyPressed("down")) {

            b.act = (b.act || 0) + 1;

            if (b.act > 2) {
                b.act = 0;
            }

        }

        if (keyPressed("z")) {

            useAct();

        }

        return;

    }


    /* ---------------- ITEM ---------------- */

    if (b.phase === "item") {

        if (keyPressed("x")) {

            b.phase = "menu";

            return;

        }

        if (keyPressed("z")) {

            const p = party[b.actor];

            p.hp = Math.min(
                p.maxHP,
                p.hp + 30
            );

            b.message =
                p.name + " восстановил 30 HP.";

            nextTurn();

        }

        return;

    }


    /* ---------------- MERCY ---------------- */

    if (b.phase === "mercy") {

        if (keyPressed("x")) {

            b.phase = "menu";

            return;

        }

        if (keyPressed("z")) {

            if (b.mercy >= 100) {

                b.enemy.hp = 0;

                b.phase = "victory";

                b.message =
                    "ТЕНЕВОЙ ЗВЕРЬ ПОЩАЖЁН.";

            } else {

                b.message =
                    "ПОЩАДА ЕЩЁ НЕ ГОТОВА.";

                nextTurn();

            }

        }

        return;

    }


    /* ---------------- ENEMY ---------------- */

    if (b.phase === "enemy") {

        updateEnemyAttack();

        return;

    }


    /* ---------------- VICTORY ---------------- */

    if (b.phase === "victory") {

        if (keyPressed("z")) {

            game.screen = "explore";
            game.battle = null;

            player.x = 150;
            player.y = 120;

        }

        return;

    }


    /* ---------------- DEFEAT ---------------- */

    if (b.phase === "defeat") {

        if (keyPressed("z")) {

            party.forEach(function(p) {
                p.hp = p.maxHP;
            });

            game.screen = "explore";
            game.battle = null;

        }

    }

}


/* =========================================================
   BATTLE CHOICE
========================================================= */

function battleChoose() {

    const b = game.battle;

    const p = party[b.actor];


    /* FIGHT */

    if (b.menu === 0) {

        const damage =
            p.atk +
            Math.floor(Math.random() * 6);

        b.enemy.hp =
            Math.max(
                0,
                b.enemy.hp - damage
            );

        b.mercy =
            Math.min(
                100,
                b.mercy + 8
            );

        b.message =
            p.name +
            " атакует! -" +
            damage +
            " HP";

        if (b.enemy.hp <= 0) {

            b.phase = "victory";

            b.message =
                "ВРАГ ПОБЕЖДЁН!";

            return;

        }

        nextTurn();

    }


    /* ACT */

    else if (b.menu === 1) {

        b.phase = "act";
        b.act = 0;

    }


    /* ITEM */

    else if (b.menu === 2) {

        b.phase = "item";

    }


    /* DEFEND */

    else if (b.menu === 3) {

        /*
           ВАЖНО:
           Защита НЕ увеличивает RD.
        */

        b.defend = true;

        b.message =
            p.name +
            " защищается.";

        nextTurn();

    }

}


/* =========================================================
   ACT
========================================================= */

function useAct() {

    const b = game.battle;

    if (b.act === 0) {

        b.mercy =
            Math.min(
                100,
                b.mercy + 20
            );

        b.message =
            "ДЕЛЬТА поговорил со зверем.";

    }

    else if (b.act === 1) {

        b.mercy =
            Math.min(
                100,
                b.mercy + 30
            );

        b.message =
            "Вы изучили врага.";

    }

    else {

        b.mercy =
            Math.min(
                100,
                b.mercy + 25
            );

        b.message =
            "Враг немного успокоился.";

    }

    nextTurn();

}


/* =========================================================
   NEXT TURN
========================================================= */

function nextTurn() {

    const b = game.battle;

    b.actor++;

    if (b.actor >= party.length) {

        b.actor = 0;

        startEnemyAttack();

    } else {

        b.phase = "menu";

        b.menu = 0;

        b.defend = false;

        b.message =
            "ХОД: " +
            party[b.actor].name;

    }

}


/* =========================================================
   RD ATTACK
========================================================= */

function startEnemyAttack() {

    const b = game.battle;

    b.phase = "enemy";

    b.attackTimer = 0;

    b.bullets = [];

    b.soul.x = 160;
    b.soul.y = 130;

    /*
       RD НЕ сбрасываем мгновенно.
       Оно постепенно заполняется.
    */

}


/* =========================================================
   ENEMY ATTACK UPDATE
========================================================= */

function updateEnemyAttack() {

    const b = game.battle;

    /*
       RD растёт во время опасности.
       Защита его НЕ увеличивает.
    */

    b.rd += 0.35;

    if (b.rd > 100) {
        b.rd = 100;
    }


    /*
       Когда RD заполнена —
       начинается атака.
    */

    if (b.rd >= 100) {

        createBullets();

        damageParty();

        b.rd = 0;

        b.phase = "menu";

        b.menu = 0;

        b.message =
            "АТАКА ЗАКОНЧЕНА. ХОД ДЕЛЬТЫ.";

        return;

    }


    updateSoul();

    updateBullets();

}


/* =========================================================
   CREATE BULLETS
========================================================= */

function createBullets() {

    const b = game.battle;

    b.bullets = [];

    for (let i = 0; i < 8; i++) {

        b.bullets.push({

            x: 60 + Math.random() * 200,

            y: 90 + Math.random() * 60,

            vx: (Math.random() - .5) * 1.5,

            vy: .7 + Math.random() * 1.4,

            size: 3

        });

    }

}


/* =========================================================
   SOUL
========================================================= */

function updateSoul() {

    const b = game.battle;

    const s = b.soul;

    if (keys.up) {
        s.y -= s.speed;
    }

    if (keys.down) {
        s.y += s.speed;
    }

    if (keys.left) {
        s.x -= s.speed;
    }

    if (keys.right) {
        s.x += s.speed;
    }

    s.x = Math.max(
        55,
        Math.min(
            265,
            s.x
        )
    );

    s.y = Math.max(
        92,
        Math.min(
            157,
            s.y
        )
    );

}


/* =========================================================
   BULLETS
========================================================= */

function updateBullets() {

    const b = game.battle;

    if (!b.bullets) {
        return;
    }

    b.bullets.forEach(function(ball) {

        ball.x += ball.vx;
        ball.y += ball.vy;

        if (
            ball.x < 50 ||
            ball.x > 270
        ) {
            ball.vx *= -1;
        }

        if (ball.y > 160) {
            ball.y = 90;
        }

        const dx =
            ball.x - b.soul.x;

        const dy =
            ball.y - b.soul.y;

        const d =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (
            d <
            ball.size + b.soul.size
        ) {

            if (b.soul.invincible <= 0) {

                party[b.actor].hp -= 5;

                if (
                    party[b.actor].hp < 0
                ) {
                    party[b.actor].hp = 0;
                }

                b.soul.invincible = 30;

            }

        }

    });


    if (b.soul.invincible > 0) {
        b.soul.invincible--;
    }

}


/* =========================================================
   DAMAGE
========================================================= */

function damageParty() {

    const b = game.battle;

    let damage = 10;

    /*
       Если игрок выбрал защиту,
       урон уменьшается.
    */

    if (b.defend) {
        damage = 4;
    }

    const target = party[b.actor];

    target.hp =
        Math.max(
            0,
            target.hp - damage
        );

    if (target.hp <= 0) {

        let alive = false;

        party.forEach(function(p) {

            if (p.hp > 0) {
                alive = true;
            }

        });

        if (!alive) {

            b.phase = "defeat";

            b.message =
                "ОТРЯД ПОБЕЖДЁН.";

        }

    }

}


/* =========================================================
   DRAW MENU
========================================================= */

function drawMainMenu() {

    ctx.fillStyle = "#050505";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.strokeStyle = "#777";

    ctx.strokeRect(
        25,
        18,
        270,
        145
    );


    ctx.fillStyle = "#fff";

    ctx.font = "14px monospace";

    ctx.fillText(
        "BLOOD GLOW",
        91,
        45
    );


    ctx.font = "8px monospace";

    ctx.fillText(
        "RPG",
        149,
        57
    );


    const items = [

        "НОВАЯ ИГРА",
        "ФАЙЛЫ СОХРАНЕНИЯ",
        "ПРОДОЛЖИТЬ"

    ];


    items.forEach(function(text, i) {

        const y =
            82 + i * 23;

        if (
            i === game.menuIndex
        ) {

            ctx.fillStyle = "#fff";

            ctx.fillText(
                "▶",
                65,
                y
            );

        }

        ctx.fillStyle = "#fff";

        ctx.fillText(
            text,
            85,
            y
        );

    });


    ctx.font = "6px monospace";

    ctx.fillText(
        "Z — выбрать",
        120,
        150
    );

}


/* =========================================================
   DRAW SAVE MENU
========================================================= */

function drawSaveMenu() {

    ctx.fillStyle = "#050505";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        25,
        15,
        270,
        150
    );


    ctx.fillStyle = "#fff";

    ctx.font = "10px monospace";

    ctx.fillText(
        "ФАЙЛЫ СОХРАНЕНИЯ",
        75,
        35
    );


    for (let i = 0; i < 3; i++) {

        const y =
            65 + i * 28;

        if (
            i === game.saveIndex
        ) {

            ctx.fillText(
                "▶",
                43,
                y
            );

        }

        ctx.font = "7px monospace";

        ctx.fillText(
            "ФАЙЛ " + (i + 1),
            60,
            y
        );


        const raw =
            localStorage.getItem(
                "blood_glow_save_" + i
            );


        if (raw) {

            try {

                const data =
                    JSON.parse(raw);

                ctx.font = "5px monospace";

                ctx.fillText(
                    data.time || "СОХРАНЕНО",
                    145,
                    y
                );

            } catch {

                ctx.fillText(
                    "ОШИБКА",
                    145,
                    y
                );

            }

        } else {

            ctx.font = "5px monospace";

            ctx.fillText(
                "ПУСТО",
                145,
                y
            );

        }

    }


    ctx.font = "6px monospace";

    ctx.fillText(
        "Z — сохранить / загрузить",
        45,
        150
    );

    ctx.fillText(
        "X — назад",
        220,
        150
    );

}


/* =========================================================
   DRAW ROOM
========================================================= */

function drawRoom() {

    const room =
        rooms[game.room];

    ctx.fillStyle =
        room.floor;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* FLOOR */

    ctx.fillStyle = "#222";

    for (
        let y = 12;
        y < 172;
        y += 16
    ) {

        for (
            let x = 12;
            x < 312;
            x += 16
        ) {

            ctx.fillRect(
                x,
                y,
                1,
                1
            );

        }

    }


    /* WALLS */

    ctx.fillStyle = "#555";

    room.walls.forEach(function(w) {

        ctx.fillRect(
            w.x,
            w.y,
            w.w,
            w.h
        );

    });


    /* EXIT */

    ctx.fillStyle = "#632f2f";

    ctx.fillRect(
        room.exit.x,
        room.exit.y,
        room.exit.w,
        room.exit.h
    );


    /* PIZZA */

    if (room.pizza) {

        drawPizzaTable(
            room.pizza.x,
            room.pizza.y
        );

    }


    /* PLAYER */

    drawCharacter(
        player.x,
        player.y,
        "#fff"
    );


    ctx.fillStyle = "#fff";

    ctx.font = "6px monospace";

    ctx.fillText(
        room.name,
        12,
        18
    );


    if (room.pizza) {

        if (
            distance(
                player.x,
                player.y,
                room.pizza.x + 15,
                room.pizza.y + 10
            ) < 25
        ) {

            ctx.fillStyle = "#000";

            ctx.fillRect(
                65,
                25,
                190,
                18
            );

            ctx.strokeStyle = "#fff";

            ctx.strokeRect(
                65,
                25,
                190,
                18
            );

            ctx.fillStyle = "#fff";

            ctx.fillText(
                "Z — СОХРАНИТЬ ИГРУ",
                94,
                37
            );

        }

    }


    if (game.room === "room2") {

        ctx.fillStyle = "#fff";

        ctx.font = "6px monospace";

        ctx.fillText(
            "Z — начать бой",
            125,
            45
        );

    }

}


/* =========================================================
   PIZZA TABLE
========================================================= */

function drawPizzaTable(x, y) {

    /* table */

    ctx.fillStyle = "#4b2918";

    ctx.fillRect(
        x,
        y + 8,
        32,
        12
    );


    ctx.fillStyle = "#81502e";

    ctx.fillRect(
        x + 2,
        y + 5,
        28,
        8
    );


    /* legs */

    ctx.fillStyle = "#32190f";

    ctx.fillRect(
        x + 4,
        y + 17,
        4,
        7
    );

    ctx.fillRect(
        x + 24,
        y + 17,
        4,
        7
    );


    /* plate */

    ctx.fillStyle = "#ddd";

    ctx.fillRect(
        x + 7,
        y + 2,
        19,
        5
    );


    /* pizza */

    ctx.fillStyle = "#d87b27";

    ctx.fillRect(
        x + 9,
        y + 1,
        15,
        5
    );


    /* cheese */

    ctx.fillStyle = "#ffd84c";

    ctx.fillRect(
        x + 11,
        y + 2,
        11,
        3
    );


    /* pepperoni */

    ctx.fillStyle = "#9e3030";

    ctx.fillRect(
        x + 13,
        y + 2,
        2,
        2
    );

    ctx.fillRect(
        x + 19,
        y + 3,
        2,
        2
    );


    /* save stars */

    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";

    ctx.fillText(
        "*",
        x - 5,
        y + 5
    );

    ctx.fillText(
        "*",
        x + 32,
        y + 7
    );

}


/* =========================================================
   CHARACTER
========================================================= */

function drawCharacter(x, y, color) {

    x = Math.round(x);
    y = Math.round(y);

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
   BATTLE DRAW
========================================================= */

function drawBattle() {

    const b = game.battle;

    ctx.fillStyle = "#050505";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* enemy area */

    ctx.strokeStyle = "#777";

    ctx.strokeRect(
        20,
        8,
        280,
        60
    );


    drawEnemy(
        160,
        40
    );


    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";

    ctx.fillText(
        b.enemy.name,
        27,
        20
    );


    ctx.fillText(
        "HP",
        215,
        20
    );


    drawBar(
        235,
        15,
        55,
        6,
        b.enemy.hp,
        b.enemy.maxHP
    );


    /* message */

    ctx.font = "6px monospace";

    ctx.fillStyle = "#fff";

    drawWrapped(
        b.message,
        30,
        80,
        130,
        8
    );


    /* RD */

    drawRDBar();


    /* enemy attack */

    if (b.phase === "enemy") {

        drawAttackArea();

    }


    /* party */

    drawParty();


    /* menu */

    drawBattleMenu();


    if (b.phase === "victory") {

        drawCenterText(
            "ПОБЕДА!",
            105
        );

        ctx.font = "7px monospace";

        ctx.fillText(
            "Z — продолжить",
            105,
            125
        );

    }


    if (b.phase === "defeat") {

        drawCenterText(
            "ОТРЯД ПОБЕЖДЁН",
            105
        );

        ctx.font = "7px monospace";

        ctx.fillText(
            "Z — восстановиться",
            95,
            125
        );

    }

}


/* =========================================================
   RD BAR
========================================================= */

function drawRDBar() {

    const b = game.battle;

    const x = 280;
    const y = 65;

    const w = 15;
    const h = 100;


    /*
       ЧЁРНЫЙ ФОН
    */

    ctx.fillStyle = "#111";

    ctx.fillRect(
        x,
        y,
        w,
        h
    );


    /*
       РАМКА
    */

    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        x,
        y,
        w,
        h
    );


    /*
       ЗАПОЛНЕНИЕ СНИЗУ ВВЕРХ
    */

    const amount =
        Math.max(
            0,
            Math.min(
                100,
                b.rd
            )
        ) / 100;


    ctx.fillStyle = "#d6d6d6";

    ctx.fillRect(
        x + 2,
        y + h - 2 - (h - 4) * amount,
        w - 4,
        (h - 4) * amount
    );


    /*
       ТЕКСТ
    */

    ctx.save();

    ctx.translate(
        x + 12,
        y + h
    );

    ctx.rotate(
        -Math.PI / 2
    );

    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";

    ctx.fillText(
        "RD " + Math.floor(b.rd) + "%",
        0,
        0
    );

    ctx.restore();


    /*
       ПОДСКАЗКА
    */

    if (b.phase === "enemy") {

        ctx.fillStyle = "#fff";

        ctx.font = "5px monospace";

        ctx.fillText(
            "АТАКА",
            270,
            55
        );

    }

}


/* =========================================================
   PARTY
========================================================= */

function drawParty() {

    const b = game.battle;

    party.forEach(function(p, i) {

        const y =
            103 + i * 12;


        if (
            i === b.actor &&
            b.phase === "menu"
        ) {

            ctx.fillStyle = "#fff";

            ctx.font = "6px monospace";

            ctx.fillText(
                "▶",
                3,
                y
            );

        }


        ctx.fillStyle = "#fff";

        ctx.font = "5.5px monospace";

        ctx.fillText(
            p.name,
            12,
            y
        );


        ctx.fillText(
            "HP",
            72,
            y
        );


        drawBar(
            88,
            y - 5,
            30,
            5,
            p.hp,
            p.maxHP
        );


        ctx.fillText(
            p.hp + "/" + p.maxHP,
            122,
            y
        );

    });

}


/* =========================================================
   BATTLE MENU
========================================================= */

function drawBattleMenu() {

    const b = game.battle;

    if (
        b.phase === "enemy" ||
        b.phase === "victory" ||
        b.phase === "defeat"
    ) {
        return;
    }


    if (b.phase === "menu") {

        const labels = [

            "АТАКА",
            "ACT",
            "ITEM",
            "ЗАЩИТА"

        ];


        labels.forEach(function(label, i) {

            const x =
                165 + (i % 2) * 55;

            const y =
                112 + Math.floor(i / 2) * 24;


            if (i === b.menu) {

                ctx.strokeStyle = "#fff";

                ctx.strokeRect(
                    x - 7,
                    y - 9,
                    52,
                    16
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


    if (b.phase === "act") {

        ctx.fillStyle = "#fff";

        ctx.font = "7px monospace";

        ctx.fillText(
            "ACT",
            175,
            108
        );


        const acts = [

            "ПОГОВОРИТЬ",
            "ОСМОТРЕТЬ",
            "УСПОКОИТЬ"

        ];


        acts.forEach(function(text, i) {

            const y =
                121 + i * 12;

            if (i === b.act) {

                ctx.fillText(
                    "▶",
                    165,
                    y
                );

            }

            ctx.fillText(
                text,
                175,
                y
            );

        });

    }


    if (b.phase === "item") {

        ctx.fillStyle = "#fff";

        ctx.font = "7px monospace";

        ctx.fillText(
            "ITEM",
            175,
            108
        );

        ctx.fillText(
            "POTION +30 HP",
            175,
            125
        );

        ctx.fillText(
            "Z — использовать",
            175,
            142
        );

        ctx.fillText(
            "X — назад",
            175,
            155
        );

    }


    if (b.phase === "mercy") {

        ctx.fillStyle = "#fff";

        ctx.font = "7px monospace";

        ctx.fillText(
            "ПОЩАДА",
            175,
            108
        );

        ctx.fillText(
            "RD НЕ РАСТЁТ",
            175,
            122
        );

        ctx.fillText(
            b.mercy >= 100
                ? "ГОТОВО!"
                : "Нужно 100%",
            175,
            136
        );

        ctx.fillText(
            "Z — выбрать",
            175,
            151
        );

    }

}


/* =========================================================
   ATTACK AREA
========================================================= */

function drawAttackArea() {

    const b = game.battle;

    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        45,
        88,
        215,
        72
    );


    if (b.bullets) {

        b.bullets.forEach(function(ball) {

            ctx.fillStyle = "#fff";

            ctx.fillRect(
                ball.x - ball.size,
                ball.y - ball.size,
                ball.size * 2,
                ball.size * 2
            );

        });

    }


    /*
       soul
    */

    ctx.fillStyle = "#ff3333";

    ctx.fillRect(
        b.soul.x - 3,
        b.soul.y - 3,
        6,
        6
    );


    ctx.fillStyle = "#fff";

    ctx.font = "5px monospace";

    ctx.fillText(
        "УКЛОНЯЙСЯ!",
        125,
        96
    );

}


/* =========================================================
   ENEMY
========================================================= */

function drawEnemy(x, y) {

    ctx.fillStyle = "#111";

    ctx.fillRect(
        x - 20,
        y - 20,
        40,
        42
    );


    ctx.fillStyle = "#6633aa";

    ctx.fillRect(
        x - 15,
        y - 17,
        30,
        31
    );


    ctx.fillStyle = "#fff";

    ctx.fillRect(
        x - 9,
        y - 8,
        5,
        5
    );

    ctx.fillRect(
        x + 4,
        y - 8,
        5,
        5
    );

}


/* =========================================================
   BAR
========================================================= */

function drawBar(
    x,
    y,
    w,
    h,
    value,
    max
) {

    ctx.fillStyle = "#222";

    ctx.fillRect(
        x,
        y,
        w,
        h
    );


    let amount = 0;

    if (max > 0) {

        amount =
            Math.max(
                0,
                Math.min(
                    1,
                    value / max
                )
            );

    }


    ctx.fillStyle = "#fff";

    ctx.fillRect(
        x,
        y,
        w * amount,
        h
    );

}


/* =========================================================
   CENTER TEXT
========================================================= */

function drawCenterText(text, y) {

    ctx.fillStyle = "#fff";

    ctx.font = "10px monospace";

    ctx.fillText(
        text,
        160 - ctx.measureText(text).width / 2,
        y
    );

}


/* =========================================================
   WRAPPED TEXT
========================================================= */

function drawWrapped(
    text,
    x,
    y,
    width,
    lineHeight
) {

    const words =
        text.split(" ");

    let line = "";

    for (
        let i = 0;
        i < words.length;
        i++
    ) {

        const test =
            line +
            words[i] +
            " ";

        if (
            ctx.measureText(test).width > width &&
            line !== ""
        ) {

            ctx.fillText(
                line,
                x,
                y
            );

            line =
                words[i] + " ";

            y += lineHeight;

        } else {

            line = test;

        }

    }

    ctx.fillText(
        line,
        x,
        y
    );

}


/* =========================================================
   MESSAGE
========================================================= */

function drawMessage() {

    if (
        !game.message ||
        game.messageTimer <= 0
    ) {
        return;
    }


    ctx.fillStyle = "rgba(0,0,0,.85)";

    ctx.fillRect(
        40,
        25,
        240,
        22
    );


    ctx.strokeStyle = "#777";

    ctx.strokeRect(
        40,
        25,
        240,
        22
    );


    ctx.fillStyle = "#fff";

    ctx.font = "6px monospace";

    ctx.fillText(
        game.message,
        50,
        39
    );

}


/* =========================================================
   INPUT EDGE
========================================================= */

function keyPressed(key) {

    return (
        keys[key] &&
        !pressed[key]
    );

}


/* =========================================================
   UPDATE
========================================================= */

function update() {

    if (game.screen === "menu") {

        updateMainMenu();

    }

    else if (game.screen === "saves") {

        updateSaveMenu();

    }

    else if (game.screen === "explore") {

        updateExplore();

    }

    else if (game.screen === "battle") {

        updateBattle();

    }


    if (game.messageTimer > 0) {

        game.messageTimer--;

    }


    /*
       Запоминаем состояние кнопок
    */

    pressed.z = keys.z;
    pressed.x = keys.x;
    pressed.c = keys.c;

    pressed.up = keys.up;
    pressed.down = keys.down;
    pressed.left = keys.left;
    pressed.right = keys.right;

}


/* =========================================================
   DRAW
========================================================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    if (game.screen === "menu") {

        drawMainMenu();

    }

    else if (game.screen === "saves") {

        drawSaveMenu();

    }

    else if (game.screen === "explore") {

        drawRoom();

    }

    else if (game.screen === "battle") {

        drawBattle();

    }


    if (
        game.screen === "explore" ||
        game.screen === "battle"
    ) {

        drawMessage();

    }

}


/* =========================================================
   LOOP
========================================================= */

function loop() {

    update();

    draw();

    requestAnimationFrame(loop);

}


/* =========================================================
   START
========================================================= */

loop();
