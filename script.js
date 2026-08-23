"use strict";

/* =====================================================
   CANVAS
===================================================== */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = 640;
const H = 360;


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

    const k = e.key.toLowerCase();

    if (e.key === "ArrowUp" || k === "w")
        keys.up = true;

    if (e.key === "ArrowDown" || k === "s")
        keys.down = true;

    if (e.key === "ArrowLeft" || k === "a")
        keys.left = true;

    if (e.key === "ArrowRight" || k === "d")
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

    if (e.key === "ArrowUp" || k === "w")
        keys.up = false;

    if (e.key === "ArrowDown" || k === "s")
        keys.down = false;

    if (e.key === "ArrowLeft" || k === "a")
        keys.left = false;

    if (e.key === "ArrowRight" || k === "d")
        keys.right = false;

    if (k === "z")
        keys.z = false;

    if (k === "x")
        keys.x = false;

    if (k === "c")
        keys.c = false;

    e.preventDefault();

}, { passive: false });


/* =====================================================
   MOBILE BUTTONS
===================================================== */

document.querySelectorAll(".joy").forEach(button => {

    const key = button.dataset.key;

    button.addEventListener("pointerdown", e => {

        e.preventDefault();

        keys[key] = true;

        button.setPointerCapture(e.pointerId);

    });

    button.addEventListener("pointerup", e => {

        e.preventDefault();

        keys[key] = false;

    });

    button.addEventListener("pointercancel", () => {

        keys[key] = false;

    });

});


document.querySelectorAll(".action-button").forEach(button => {

    const key = button.dataset.key;

    button.addEventListener("pointerdown", e => {

        e.preventDefault();

        keys[key] = true;

        button.setPointerCapture(e.pointerId);

    });

    button.addEventListener("pointerup", e => {

        e.preventDefault();

        keys[key] = false;

    });

    button.addEventListener("pointercancel", () => {

        keys[key] = false;

    });

});


/* =====================================================
   FULLSCREEN
===================================================== */

document
    .getElementById("fullscreen-button")
    .addEventListener("pointerdown", async e => {

        e.preventDefault();

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
   GAME
===================================================== */

const game = {

    mode: "battle",

    selectedCommand: 0,

    selectedMagic: 0,

    message: "ТЕНЕВОЙ ЗВЕРЬ появился!",

    mercy: 35,

    enemyHP: 250,

    enemyMaxHP: 250,

    playerTurn: 0

};


/* =====================================================
   PARTY
===================================================== */

const party = [

    {
        name: "ДЕЛЬТА",
        hp: 90,
        maxHP: 90,
        atk: 14,
        color: "#ffffff"
    },

    {
        name: "НЕМКА",
        hp: 100,
        maxHP: 100,
        atk: 11,
        color: "#ff5555"
    },

    {
        name: "ЛИЧИ",
        hp: 80,
        maxHP: 80,
        atk: 13,
        color: "#55aaff"
    },

    {
        name: "ПАНКЕЙК",
        hp: 70,
        maxHP: 70,
        atk: 10,
        color: "#55dd66"
    },

    {
        name: "КАШТАН",
        hp: 110,
        maxHP: 110,
        atk: 12,
        color: "#cc8844"
    }

];


/* =====================================================
   COMMANDS
===================================================== */

const commands = [
    "АТАКА",
    "ДЕЙСТВИЕ",
    "ПРЕДМЕТ",
    "ПОЩАДА"
];


/* =====================================================
   MAGIC
===================================================== */

const magic = [

    {
        name: "ИСКРА",
        cost: 8
    },

    {
        name: "ЛЕЧЕНИЕ",
        cost: 12
    },

    {
        name: "ОГНЕННЫЙ ВСПЛЕСК",
        cost: 18
    }

];


/* =====================================================
   BATTLE UPDATE
===================================================== */

function updateBattle() {

    /* MAGIC MENU */

    if (game.mode === "magic") {

        if (pressed("up")) {

            game.selectedMagic--;

            if (game.selectedMagic < 0)
                game.selectedMagic = magic.length - 1;

        }

        if (pressed("down")) {

            game.selectedMagic++;

            if (game.selectedMagic >= magic.length)
                game.selectedMagic = 0;

        }

        if (pressed("x")) {

            game.mode = "battle";

        }

        if (pressed("z")) {

            useMagic();

        }

        return;
    }


    /* NORMAL BATTLE MENU */

    if (pressed("left")) {

        game.selectedCommand--;

        if (game.selectedCommand < 0)
            game.selectedCommand = commands.length - 1;

    }

    if (pressed("right")) {

        game.selectedCommand++;

        if (game.selectedCommand >= commands.length)
            game.selectedCommand = 0;

    }


    if (pressed("z")) {

        selectCommand();

    }


    /* C opens magic for Kashatan */

    if (
        pressed("c") &&
        party[game.playerTurn].name === "КАШТАН"
    ) {

        game.mode = "magic";

        game.selectedMagic = 0;

        game.message = "Выбери заклинание.";

    }

}


/* =====================================================
   COMMAND
===================================================== */

function selectCommand() {

    const command =
        commands[game.selectedCommand];

    const actor =
        party[game.playerTurn];


    if (command === "АТАКА") {

        const damage =
            actor.atk +
            Math.floor(Math.random() * 7);

        game.enemyHP =
            Math.max(
                0,
                game.enemyHP - damage
            );

        game.mercy =
            Math.min(
                100,
                game.mercy + 8
            );

        game.message =
            actor.name +
            " атакует!  -" +
            damage +
            " HP";

        nextTurn();

    }


    else if (command === "ДЕЙСТВИЕ") {

        game.mercy =
            Math.min(
                100,
                game.mercy + 22
            );

        game.message =
            actor.name +
            " выполняет действие.";

        nextTurn();

    }


    else if (command === "ПРЕДМЕТ") {

        actor.hp =
            Math.min(
                actor.maxHP,
                actor.hp + 25
            );

        game.message =
            actor.name +
            " восстановил 25 HP.";

        nextTurn();

    }


    else if (command === "ПОЩАДА") {

        if (game.mercy >= 100) {

            game.enemyHP = 0;

            game.message =
                "ТЕНЕВОЙ ЗВЕРЬ был пощажён!";

        }

        else {

            game.message =
                "Пощада ещё не готова.";

        }

        nextTurn();

    }

}


/* =====================================================
   MAGIC
===================================================== */

function useMagic() {

    const actor =
        party[game.playerTurn];

    const spell =
        magic[game.selectedMagic];


    if (spell.name === "ИСКРА") {

        game.enemyHP =
            Math.max(
                0,
                game.enemyHP - 28
            );

        game.mercy =
            Math.min(
                100,
                game.mercy + 12
            );

        game.message =
            "КАШТАН использует ИСКРУ!";

    }


    else if (spell.name === "ЛЕЧЕНИЕ") {

        actor.hp =
            Math.min(
                actor.maxHP,
                actor.hp + 40
            );

        game.message =
            "КАШТАН использует ЛЕЧЕНИЕ!";

    }


    else if (
        spell.name === "ОГНЕННЫЙ ВСПЛЕСК"
    ) {

        game.enemyHP =
            Math.max(
                0,
                game.enemyHP - 55
            );

        game.mercy =
            Math.min(
                100,
                game.mercy + 5
            );

        game.message =
            "КАШТАН выпускает ОГНЕННЫЙ ВСПЛЕСК!";

    }


    game.mode = "battle";

    nextTurn();

}


/* =====================================================
   NEXT TURN
===================================================== */

function nextTurn() {

    if (game.enemyHP <= 0) {

        game.message =
            "ПОБЕДА!";

        game.mode = "victory";

        return;

    }


    game.playerTurn++;

    if (game.playerTurn >= party.length)
        game.playerTurn = 0;

}


/* =====================================================
   VICTORY
===================================================== */

function updateVictory() {

    if (pressed("z")) {

        game.enemyHP =
            game.enemyMaxHP;

        game.mercy = 35;

        game.playerTurn = 0;

        game.mode = "battle";

        game.message =
            "Новый бой начинается.";

    }

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
   DRAW
===================================================== */

function draw() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    if (game.mode === "battle") {

        drawBattle();

    }

    else if (game.mode === "magic") {

        drawBattle();

        drawMagic();

    }

    else if (game.mode === "victory") {

        drawBattle();

        drawVictory();

    }

}


/* =====================================================
   BATTLE DRAW
===================================================== */

function drawBattle() {

    /* BACKGROUND */

    ctx.fillStyle = "#000";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* ENEMY BOX */

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;

    ctx.strokeRect(
        120,
        20,
        400,
        110
    );


    /* ENEMY */

    drawEnemy();


    ctx.fillStyle = "#fff";

    ctx.font = "18px monospace";

    ctx.fillText(
        "ТЕНЕВОЙ ЗВЕРЬ",
        145,
        47
    );


    /* ENEMY HP */

    ctx.font = "15px monospace";

    ctx.fillText(
        "HP",
        390,
        47
    );

    drawBar(
        425,
        35,
        70,
        12,
        game.enemyHP,
        game.enemyMaxHP
    );


    /* MESSAGE */

    ctx.fillStyle = "#fff";

    ctx.font = "14px monospace";

    ctx.fillText(
        game.message,
        135,
        153
    );


    /* RD / MERCY */

    drawMercy();


    /* PARTY */

    drawParty();


    /* COMMANDS */

    drawCommands();

}


/* =====================================================
   ENEMY
===================================================== */

function drawEnemy() {

    ctx.fillStyle = "#522477";

    ctx.fillRect(
        285,
        62,
        75,
        55
    );


    ctx.fillStyle = "#fff";

    ctx.fillRect(
        300,
        77,
        10,
        10
    );

    ctx.fillRect(
        335,
        77,
        10,
        10
    );


    ctx.fillStyle = "#000";

    ctx.fillRect(
        315,
        100,
        25,
        6
    );

}


/* =====================================================
   PARTY
===================================================== */

function drawParty() {

    const actor =
        party[game.playerTurn];


    ctx.fillStyle = actor.color;

    ctx.font = "18px monospace";

    ctx.fillText(
        "▶ " + actor.name,
        35,
        225
    );


    ctx.fillStyle = "#fff";

    ctx.font = "14px monospace";

    ctx.fillText(
        "HP",
        35,
        250
    );


    drawBar(
        70,
        238,
        100,
        14,
        actor.hp,
        actor.maxHP
    );


    ctx.fillText(
        actor.hp +
        "/" +
        actor.maxHP,
        180,
        250
    );


    /* КОМАНДА */

    ctx.font = "13px monospace";

    ctx.fillStyle = "#aaa";

    ctx.fillText(
        "КОМАНДА: " + actor.name,
        35,
        280
    );


    /* MAGIC HINT */

    if (actor.name === "КАШТАН") {

        ctx.fillStyle = "#cc8844";

        ctx.fillText(
            "C — МАГИЯ",
            35,
            305
        );

    }

}


/* =====================================================
   COMMAND MENU
===================================================== */

function drawCommands() {

    const startX = 270;
    const startY = 210;

    commands.forEach((command, i) => {

        const row =
            Math.floor(i / 2);

        const col =
            i % 2;

        const x =
            startX + col * 150;

        const y =
            startY + row * 55;


        if (i === game.selectedCommand) {

            ctx.strokeStyle = "#fff";

            ctx.lineWidth = 3;

            ctx.strokeRect(
                x - 12,
                y - 27,
                130,
                40
            );

        }


        ctx.fillStyle = "#fff";

        ctx.font = "16px monospace";

        ctx.fillText(
            command,
            x,
            y
        );

    });

}


/* =====================================================
   MAGIC MENU
===================================================== */

function drawMagic() {

    /* затемнение */

    ctx.fillStyle = "rgba(0,0,0,.85)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* окно */

    ctx.strokeStyle = "#fff";

    ctx.lineWidth = 3;

    ctx.strokeRect(
        170,
        65,
        300,
        220
    );


    ctx.fillStyle = "#cc8844";

    ctx.font = "20px monospace";

    ctx.fillText(
        "МАГИЯ КАШТАНА",
        205,
        100
    );


    magic.forEach((spell, i) => {

        const y =
            140 + i * 42;


        if (i === game.selectedMagic) {

            ctx.fillStyle = "#fff";

            ctx.font = "18px monospace";

            ctx.fillText(
                "▶",
                195,
                y
            );

        }


        ctx.fillStyle = "#fff";

        ctx.font = "16px monospace";

        ctx.fillText(
            spell.name,
            225,
            y
        );


        ctx.fillStyle = "#aaa";

        ctx.font = "12px monospace";

        ctx.fillText(
            spell.cost + " MP",
            390,
            y
        );

    });


    ctx.fillStyle = "#aaa";

    ctx.font = "12px monospace";

    ctx.fillText(
        "Z — выбрать     X — назад",
        220,
        265
    );

}


/* =====================================================
   MERCY / RD
===================================================== */

function drawMercy() {

    const x = 535;
    const y = 175;

    ctx.fillStyle = "#222";

    ctx.fillRect(
        x,
        y,
        55,
        130
    );


    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        x,
        y,
        55,
        130
    );


    const height =
        126 *
        (game.mercy / 100);


    ctx.fillStyle = "#ffd83d";

    ctx.fillRect(
        x + 4,
        y + 126 - height,
        47,
        height
    );


    ctx.fillStyle = "#fff";

    ctx.font = "11px monospace";

    ctx.save();

    ctx.translate(
        x + 42,
        y + 120
    );

    ctx.rotate(
        -Math.PI / 2
    );

    ctx.fillText(
        "RD / ПОЩАДА",
        0,
        0
    );

    ctx.restore();


    ctx.font = "11px monospace";

    ctx.fillText(
        Math.floor(game.mercy) + "%",
        x + 12,
        y + 145
    );

}


/* =====================================================
   BAR
===================================================== */

function drawBar(
    x,
    y,
    width,
    height,
    value,
    max
) {

    ctx.fillStyle = "#222";

    ctx.fillRect(
        x,
        y,
        width,
        height
    );


    const amount =
        Math.max(
            0,
            Math.min(
                1,
                value / max
            )
        );


    ctx.fillStyle = "#fff";

    ctx.fillRect(
        x,
        y,
        width * amount,
        height
    );


    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        x,
        y,
        width,
        height
    );

}


/* =====================================================
   VICTORY
===================================================== */

function drawVictory() {

    ctx.fillStyle = "rgba(0,0,0,.85)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle = "#fff";

    ctx.font = "32px monospace";

    ctx.fillText(
        "ПОБЕДА!",
        235,
        165
    );


    ctx.font = "15px monospace";

    ctx.fillText(
        "Теневой зверь исчез.",
        205,
        200
    );


    ctx.fillText(
        "Z — продолжить",
        230,
        245
    );

}


/* =====================================================
   LOOP
===================================================== */

function loop() {

    update();

    draw();


    oldKeys.up = keys.up;
    oldKeys.down = keys.down;
    oldKeys.left = keys.left;
    oldKeys.right = keys.right;

    oldKeys.z = keys.z;
    oldKeys.x = keys.x;
    oldKeys.c = keys.c;


    requestAnimationFrame(loop);

}


function update() {

    if (game.mode === "battle") {

        updateBattle();

    }

    else if (game.mode === "magic") {

        updateBattle();

    }

    else if (game.mode === "victory") {

        updateVictory();

    }

}


loop();
