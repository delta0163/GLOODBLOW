"use strict";

/* =====================================================
   CANVAS
===================================================== */

const canvas = document.getElementById("game");
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

const pressed = {
    z: false,
    x: false,
    c: false
};


/* =====================================================
   KEYBOARD
===================================================== */

window.addEventListener("keydown", function(e) {

    const k = e.key.toLowerCase();

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

    const k = e.key.toLowerCase();

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


/* =====================================================
   MOBILE CONTROLS
===================================================== */

document.querySelectorAll(".joy").forEach(function(button) {

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

        keys[key] = false;

    });

});


document.querySelectorAll(".action-button").forEach(function(button) {

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

});


/* =====================================================
   FULLSCREEN
===================================================== */

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

    } catch (error) {

        console.log("Fullscreen:", error);

    }

});


/* =====================================================
   GAME STATE
===================================================== */

const game = {

    state: "explore",

    dialogue: null,

    dialogueIndex: 0,

    menuIndex: 0,

    stepTimer: 0,

    glitchTimer: 0,

    introFinished: false,

    messageTimer: 0

};


/* =====================================================
   PLAYER
===================================================== */

const player = {

    x: 155,
    y: 125,

    width: 9,
    height: 13,

    speed: 1.35

};


/* =====================================================
   TEAM
===================================================== */

const team = [

    {
        name: "ЛИЧИ",
        color: "#55aaff",
        x: 135,
        y: 125
    },

    {
        name: "ПАНКЕЙК",
        color: "#55dd66",
        x: 120,
        y: 125
    },

    {
        name: "КАШТАН",
        color: "#cc8844",
        x: 105,
        y: 125
    },

    {
        name: "ШАРЛОТА",
        color: "#ff66cc",
        x: 90,
        y: 125
    }

];


/* =====================================================
   WORLD
===================================================== */

const world = {

    width: 1800,

    ground: "#101722",

    obstacles: [

        {
            x: 0,
            y: 0,
            w: 1800,
            h: 8
        },

        {
            x: 0,
            y: 172,
            w: 1800,
            h: 8
        },

        {
            x: 0,
            y: 0,
            w: 8,
            h: 180
        },

        {
            x: 1792,
            y: 0,
            w: 8,
            h: 180
        },

        {
            x: 280,
            y: 45,
            w: 70,
            h: 9
        },

        {
            x: 560,
            y: 115,
            w: 90,
            h: 9
        },

        {
            x: 870,
            y: 48,
            w: 80,
            h: 9
        },

        {
            x: 1200,
            y: 110,
            w: 100,
            h: 9
        }

    ]

};


/* =====================================================
   CAMERA
===================================================== */

let cameraX = 0;


/* =====================================================
   COLLISION
===================================================== */

function collision(x, y) {

    const rect = {

        x: x,
        y: y,

        w: player.width,
        h: player.height

    };

    for (const o of world.obstacles) {

        if (
            rect.x < o.x + o.w &&
            rect.x + rect.w > o.x &&
            rect.y < o.y + o.h &&
            rect.y + rect.h > o.y
        ) {

            return true;

        }

    }

    return false;

}


/* =====================================================
   DIALOGUE
===================================================== */

function startIntroDialogue() {

    game.state = "dialogue";

    game.dialogue = [

        {
            name: "ЛИЧИ",

            text:
            "Надо проверить Немку... она изменилась."
        },

        {
            name: "ЛИЧИ",

            text:
            "Последний раз, когда мы пытались поговорить с ней, она была странной."
        },

        {
            name: "ДЕЛЬТА",

            text:
            "Так мы идём?"
        },

        {
            name: "ЛИЧИ",

            text:
            "Да."
        },

        {
            name: "ПАНКЕЙК",

            text:
            "Тогда не будем терять время."
        },

        {
            name: "КАШТАН",

            text:
            "Надеюсь, мы ошибаемся насчёт неё."
        },

        {
            name: "ШАРЛОТА",

            text:
            "Лучше убедиться самим."
        }

    ];

    game.dialogueIndex = 0;

}


/* =====================================================
   DIALOGUE UPDATE
===================================================== */

function updateDialogue() {

    if (keys.z && !pressed.z) {

        game.dialogueIndex++;

        if (
            game.dialogueIndex >=
            game.dialogue.length
        ) {

            game.state = "explore";

            game.introFinished = true;

        }

    }

    if (keys.x && !pressed.x) {

        game.state = "explore";

        game.introFinished = true;

    }

}


/* =====================================================
   PLAYER UPDATE
===================================================== */

function updatePlayer() {

    if (game.state !== "explore") {
        return;
    }

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

    if (!collision(player.x + dx, player.y)) {

        player.x += dx;

    }

    if (!collision(player.x, player.y + dy)) {

        player.y += dy;

    }

    player.x =
        Math.max(
            10,
            Math.min(
                world.width - 20,
                player.x
            )
        );

    player.y =
        Math.max(
            12,
            Math.min(
                155,
                player.y
            )
        );


    if (dx !== 0 || dy !== 0) {

        game.stepTimer++;

    }

}


/* =====================================================
   TEAM FOLLOW
===================================================== */

function updateTeam() {

    if (game.state !== "explore") {
        return;
    }

    const targets = [

        {
            x: player.x - 15,
            y: player.y
        },

        {
            x: player.x - 30,
            y: player.y
        },

        {
            x: player.x - 45,
            y: player.y
        },

        {
            x: player.x - 60,
            y: player.y
        }

    ];

    team.forEach(function(member, index) {

        const target = targets[index];

        const dx = target.x - member.x;
        const dy = target.y - member.y;

        member.x += dx * 0.08;
        member.y += dy * 0.08;

    });

}


/* =====================================================
   RANDOM GLITCHES
===================================================== */

let glitches = [];


function updateGlitches() {

    if (game.state !== "explore") {
        return;
    }

    game.glitchTimer++;

    /*
       Враг появляется нечасто.
       Минимум примерно 12 секунд.
    */

    if (
        game.glitchTimer > 700 &&
        Math.random() < 0.004
    ) {

        createGlitch();

        game.glitchTimer = 0;

    }

}


function createGlitch() {

    const distance =
        100 +
        Math.random() * 260;

    const side =
        Math.random() < 0.5
            ? -1
            : 1;

    glitches.push({

        x: player.x + distance * side,

        y: 30 + Math.random() * 115,

        life: 500,

        phase: 0

    });

}


/* =====================================================
   GLITCH UPDATE
===================================================== */

function updateGlitchObjects() {

    glitches.forEach(function(g) {

        g.life--;

        g.phase += 0.15;

    });

    glitches =
        glitches.filter(function(g) {

            return g.life > 0;

        });

}


/* =====================================================
   CAMERA
===================================================== */

function updateCamera() {

    cameraX =
        player.x - 160;

    cameraX =
        Math.max(
            0,
            Math.min(
                world.width - W,
                cameraX
            )
        );

}


/* =====================================================
   MENU
===================================================== */

function updateMenu() {

    if (keys.x && !pressed.x) {

        game.state = "explore";

    }

    if (keys.up && !game.upLock) {

        game.menuIndex--;

        if (game.menuIndex < 0) {
            game.menuIndex = 3;
        }

        game.upLock = true;

    }

    if (!keys.up) {
        game.upLock = false;
    }


    if (keys.down && !game.downLock) {

        game.menuIndex++;

        if (game.menuIndex > 3) {
            game.menuIndex = 0;
        }

        game.downLock = true;

    }

    if (!keys.down) {
        game.downLock = false;
    }

}


/* =====================================================
   MENU DRAW
===================================================== */

function drawMenu() {

    ctx.fillStyle = "rgba(0,0,0,.94)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    ctx.strokeStyle = "#ffffff";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        25,
        15,
        270,
        150
    );

    ctx.fillStyle = "#ffffff";

    ctx.font = "12px monospace";

    ctx.fillText(
        "BLOOD GLOW",
        45,
        35
    );

    const options = [

        "ITEM",
        "STATUS",
        "SAVE",
        "SETTINGS"

    ];

    options.forEach(function(text, i) {

        const y = 60 + i * 22;

        if (i === game.menuIndex) {

            ctx.fillText(
                "▶",
                50,
                y
            );

        }

        ctx.fillText(
            text,
            70,
            y
        );

    });

    ctx.font = "6px monospace";

    ctx.fillText(
        "C / X — закрыть",
        40,
        153
    );

}


/* =====================================================
   DRAW BACKGROUND
===================================================== */

function drawBackground() {

    ctx.fillStyle = world.ground;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    /* цифровая сетка */

    for (
        let x = -cameraX % 16;
        x < W;
        x += 16
    ) {

        ctx.fillStyle = "#17202e";

        ctx.fillRect(
            x,
            10,
            1,
            160
        );

    }

    for (
        let y = 10;
        y < 170;
        y += 16
    ) {

        ctx.fillStyle = "#17202e";

        ctx.fillRect(
            0,
            y,
            W,
            1
        );

    }


    /* случайные цифровые символы */

    ctx.font = "5px monospace";

    for (let i = 0; i < 50; i++) {

        const x =
            (i * 71 - cameraX * 0.5) %
            world.width;

        const xx =
            ((x + world.width) %
            world.width);

        const y =
            20 + ((i * 37) % 140);

        ctx.fillStyle =
            i % 2 === 0
                ? "#283d4e"
                : "#1e303e";

        ctx.fillText(
            i % 3 === 0 ? "0" : "1",
            xx,
            y
        );

    }

}


/* =====================================================
   DRAW OBSTACLES
===================================================== */

function drawObstacles() {

    world.obstacles.forEach(function(o) {

        const x = o.x - cameraX;

        if (x + o.w < 0 || x > W) {
            return;
        }

        ctx.fillStyle = "#293544";

        ctx.fillRect(
            x,
            o.y,
            o.w,
            o.h
        );

        ctx.fillStyle = "#3c4d60";

        ctx.fillRect(
            x,
            o.y,
            o.w,
            2
        );

    });

}


/* =====================================================
   CHARACTER
===================================================== */

function drawCharacter(x, y, color) {

    x = Math.round(x - cameraX);
    y = Math.round(y);

    /* тень */

    ctx.fillStyle = "#050609";

    ctx.fillRect(
        x - 2,
        y + 12,
        13,
        3
    );

    /* тело */

    ctx.fillStyle = color;

    ctx.fillRect(
        x + 1,
        y + 5,
        8,
        8
    );

    /* голова */

    ctx.fillRect(
        x + 2,
        y,
        6,
        6
    );

    /* ноги */

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


/* =====================================================
   DRAW GLITCH
===================================================== */

function drawGlitch(g) {

    const x =
        Math.round(g.x - cameraX);

    const y =
        Math.round(g.y);

    if (
        x < -30 ||
        x > W + 30
    ) {
        return;
    }

    const flicker =
        Math.sin(g.phase) > 0
            ? 1
            : 0;

    ctx.fillStyle =
        flicker
            ? "#ff3366"
            : "#66ccff";

    ctx.fillRect(
        x - 7,
        y - 9,
        14,
        18
    );

    ctx.fillStyle = "#000";

    ctx.fillRect(
        x - 5,
        y - 5,
        3,
        3
    );

    ctx.fillRect(
        x + 2,
        y - 5,
        3,
        3
    );

    /* глитчевые полосы */

    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
        x - 12,
        y + 5,
        24,
        2
    );

    ctx.fillRect(
        x - 8,
        y - 13,
        15,
        1
    );

}


/* =====================================================
   DRAW WORLD
===================================================== */

function drawWorld() {

    drawBackground();

    drawObstacles();


    /* глитчи */

    glitches.forEach(function(g) {

        drawGlitch(g);

    });


    /* команда */

    team.forEach(function(member) {

        drawCharacter(
            member.x,
            member.y,
            member.color
        );

    });


    /* Дельта */

    drawCharacter(
        player.x,
        player.y,
        "#ffffff"
    );


    /* название */

    ctx.fillStyle = "#ffffff";

    ctx.font = "7px monospace";

    ctx.fillText(
        "ЦИФРОВАЯ ПУСТОШЬ",
        10,
        16
    );


    /* подсказка */

    if (!game.introFinished) {

        ctx.fillStyle = "#ffffff";

        ctx.font = "6px monospace";

        ctx.fillText(
            "Подойдите к команде и нажмите Z",
            70,
            165
        );

    }

}


/* =====================================================
   DIALOGUE DRAW
===================================================== */

function drawDialogue() {

    /* затемнение */

    ctx.fillStyle = "rgba(0,0,0,.65)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* окно */

    ctx.fillStyle = "#050505";

    ctx.fillRect(
        10,
        105,
        300,
        62
    );

    ctx.strokeStyle = "#ffffff";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        10,
        105,
        300,
        62
    );


    const d =
        game.dialogue[
            game.dialogueIndex
        ];


    ctx.fillStyle = "#ffffff";

    ctx.font = "8px monospace";

    ctx.fillText(
        d.name,
        22,
        120
    );


    ctx.font = "7px monospace";

    drawTextWrapped(
        d.text,
        22,
        137,
        275,
        9
    );


    ctx.font = "5px monospace";

    ctx.fillText(
        "Z — далее",
        240,
        160
    );


    ctx.fillText(
        "X — пропустить",
        165,
        160
    );

}


/* =====================================================
   WRAPPED TEXT
===================================================== */

function drawTextWrapped(
    text,
    x,
    y,
    width,
    lineHeight
) {

    const words = text.split(" ");

    let line = "";

    for (let i = 0; i < words.length; i++) {

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

    if (line !== "") {

        ctx.fillText(
            line,
            x,
            y
        );

    }

}


/* =====================================================
   UPDATE
===================================================== */

function update() {

    if (game.state === "explore") {

        updatePlayer();

        updateTeam();

        updateGlitches();

        updateGlitchObjects();

        updateCamera();


        /*
           Z рядом с командой —
           начало первого диалога.
        */

        if (
            !game.introFinished &&
            keys.z &&
            !pressed.z
        ) {

            const dx =
                player.x - team[0].x;

            const dy =
                player.y - team[0].y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            if (distance < 40) {

                startIntroDialogue();

            }

        }


        /* C — меню */

        if (
            keys.c &&
            !pressed.c
        ) {

            game.state = "menu";

            game.menuIndex = 0;

        }

    }


    else if (game.state === "dialogue") {

        updateDialogue();

    }


    else if (game.state === "menu") {

        updateMenu();

    }


    /* запоминаем нажатия */

    pressed.z = keys.z;
    pressed.x = keys.x;
    pressed.c = keys.c;

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


    if (game.state === "explore") {

        drawWorld();

    }

    else if (game.state === "dialogue") {

        drawWorld();

        drawDialogue();

    }

    else if (game.state === "menu") {

        drawWorld();

        drawMenu();

    }

}


/* =====================================================
   GAME LOOP
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
