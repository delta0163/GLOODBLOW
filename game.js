"use strict";

/* =========================================================
   PIXEL RPG
   Первая версия:
   - комната
   - игрок
   - 4 напарника
   - движение
   - столкновения
   - NPC
   - переход между комнатами
   - диалог
   - полноэкранный режим
========================================================= */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = canvas.width;
const H = canvas.height;


/* =========================================================
   ИГРА
========================================================= */

const game = {

    room: "room1",

    mode: "explore",

    dialogue: null,

    dialogueIndex: 0,

    dialogueTimer: 0,

    transition: 0,

    time: 0

};


/* =========================================================
   УПРАВЛЕНИЕ
========================================================= */

const keys = {

    up: false,
    down: false,
    left: false,
    right: false,

    interact: false

};


/* =========================================================
   КЛАВИАТУРА
========================================================= */

window.addEventListener("keydown", e => {

    if (
        e.key === "ArrowUp" ||
        e.key.toLowerCase() === "w"
    ) {
        keys.up = true;
    }

    if (
        e.key === "ArrowDown" ||
        e.key.toLowerCase() === "s"
    ) {
        keys.down = true;
    }

    if (
        e.key === "ArrowLeft" ||
        e.key.toLowerCase() === "a"
    ) {
        keys.left = true;
    }

    if (
        e.key === "ArrowRight" ||
        e.key.toLowerCase() === "d"
    ) {
        keys.right = true;
    }

    if (
        e.key === "z" ||
        e.key === "Enter" ||
        e.key === " "
    ) {
        keys.interact = true;
    }

    e.preventDefault();

}, { passive: false });


window.addEventListener("keyup", e => {

    if (
        e.key === "ArrowUp" ||
        e.key.toLowerCase() === "w"
    ) {
        keys.up = false;
    }

    if (
        e.key === "ArrowDown" ||
        e.key.toLowerCase() === "s"
    ) {
        keys.down = false;
    }

    if (
        e.key === "ArrowLeft" ||
        e.key.toLowerCase() === "a"
    ) {
        keys.left = false;
    }

    if (
        e.key === "ArrowRight" ||
        e.key.toLowerCase() === "d"
    ) {
        keys.right = false;
    }

    if (
        e.key === "z" ||
        e.key === "Enter" ||
        e.key === " "
    ) {
        keys.interact = false;
    }

});


/* =========================================================
   ТАЧ-КНОПКИ
========================================================= */

document.querySelectorAll(".control, .action").forEach(button => {

    const key = button.dataset.key;

    function start(e) {

        e.preventDefault();

        keys[key] = true;

    }

    function stop(e) {

        e.preventDefault();

        keys[key] = false;

    }

    button.addEventListener("pointerdown", start);
    button.addEventListener("pointerup", stop);
    button.addEventListener("pointercancel", stop);
    button.addEventListener("pointerleave", stop);

});


/* =========================================================
   ПОЛНОЭКРАННЫЙ РЕЖИМ
========================================================= */

async function enterFullscreen() {

    try {

        if (!document.fullscreenElement) {

            await document.documentElement.requestFullscreen();

        }

    } catch (error) {

        console.log("Fullscreen недоступен:", error);

    }

}


document.getElementById("fullscreen-hint")
    .addEventListener("click", enterFullscreen);

canvas.addEventListener("pointerdown", enterFullscreen);


/* =========================================================
   ИГРОК
========================================================= */

const player = {

    x: 145,

    y: 120,

    width: 10,

    height: 14,

    speed: 1.4,

    direction: "down",

    moving: false

};


/* =========================================================
   НАПАРНИКИ
========================================================= */

const party = [

    {
        name: "Напарник 1",
        x: 130,
        y: 120,
        width: 10,
        height: 14,
        color: "#ff4d4d"
    },

    {
        name: "Напарник 2",
        x: 115,
        y: 120,
        width: 10,
        height: 14,
        color: "#4da6ff"
    },

    {
        name: "Напарник 3",
        x: 100,
        y: 120,
        width: 10,
        height: 14,
        color: "#66ff66"
    },

    {
        name: "Напарник 4",
        x: 85,
        y: 120,
        width: 10,
        height: 14,
        color: "#cc66ff"
    }

];


/* =========================================================
   КОМНАТЫ
========================================================= */

const rooms = {

    room1: {

        name: "Начальная комната",

        floor: "#181818",

        walls: [

            {
                x: 0,
                y: 0,
                w: 320,
                h: 8
            },

            {
                x: 0,
                y: 172,
                w: 320,
                h: 8
            },

            {
                x: 0,
                y: 0,
                w: 8,
                h: 180
            },

            {
                x: 312,
                y: 0,
                w: 8,
                h: 180
            },

            {
                x: 55,
                y: 45,
                w: 80,
                h: 10
            },

            {
                x: 200,
                y: 45,
                w: 60,
                h: 10
            },

            {
                x: 55,
                y: 45,
                w: 10,
                h: 60
            },

            {
                x: 255,
                y: 45,
                w: 10,
                h: 60
            }

        ],

        npc: {

            x: 225,

            y: 110,

            width: 10,

            height: 14,

            color: "#ffff66",

            name: "Странный человек"

        },

        exit: {

            x: 295,

            y: 75,

            w: 17,

            h: 30,

            target: "room2"

        }

    },


    room2: {

        name: "Тёмная комната",

        floor: "#0d1018",

        walls: [

            {
                x: 0,
                y: 0,
                w: 320,
                h: 8
            },

            {
                x: 0,
                y: 172,
                w: 320,
                h: 8
            },

            {
                x: 0,
                y: 0,
                w: 8,
                h: 180
            },

            {
                x: 312,
                y: 0,
                w: 8,
                h: 180
            }

        ],

        npc: {

            x: 160,

            y: 65,

            width: 10,

            height: 14,

            color: "#ff66cc",

            name: "Таинственная девушка"

        },

        exit: {

            x: 8,

            y: 75,

            w: 17,

            h: 30,

            target: "room1"

        }

    }

};


/* =========================================================
   ДИАЛОГИ
========================================================= */

const dialogues = {

    "Странный человек": [

        "Эй...",

        "Вы четверо тоже его сопровождаете?",

        "Странно.",

        "Вам лучше идти дальше.",

        "Впереди вас ждёт кое-что интересное..."

    ],

    "Таинственная девушка": [

        "Вы наконец пришли.",

        "Я ждала именно вас.",

        "Но сначала...", 

        "вам нужно кое-что узнать."

    ]

};


/* =========================================================
   COLLISION
========================================================= */

function rectsOverlap(a, b) {

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

        if (rectsOverlap(test, wall)) {

            return false;

        }

    }

    return true;

}


/* =========================================================
   ДВИЖЕНИЕ ИГРОКА
========================================================= */

function updatePlayer() {

    if (game.mode !== "explore") {
        return;
    }

    let dx = 0;
    let dy = 0;

    if (keys.up) {
        dy -= player.speed;
        player.direction = "up";
    }

    if (keys.down) {
        dy += player.speed;
        player.direction = "down";
    }

    if (keys.left) {
        dx -= player.speed;
        player.direction = "left";
    }

    if (keys.right) {
        dx += player.speed;
        player.direction = "right";
    }

    player.moving = dx !== 0 || dy !== 0;

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
   ДВИЖЕНИЕ НАПАРНИКОВ
========================================================= */

function updateParty() {

    if (game.mode !== "explore") {
        return;
    }

    const positions = [

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

    party.forEach((member, index) => {

        const target = positions[index];

        const dx = target.x - member.x;
        const dy = target.y - member.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 2) {

            member.x += dx * 0.08;
            member.y += dy * 0.08;

        }

    });

}


/* =========================================================
   NPC
========================================================= */

function updateNPC() {

    if (game.mode !== "explore") {
        return;
    }

    const npc = rooms[game.room].npc;

    const dx = player.x - npc.x;
    const dy = player.y - npc.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 25 && keys.interact) {

        startDialogue(npc.name);

        keys.interact = false;

    }

}


/* =========================================================
   ДИАЛОГ
========================================================= */

function startDialogue(name) {

    if (!dialogues[name]) {
        return;
    }

    game.mode = "dialogue";

    game.dialogue = dialogues[name];

    game.dialogueIndex = 0;

}


function updateDialogue() {

    if (game.mode !== "dialogue") {
        return;
    }

    if (keys.interact) {

        game.dialogueIndex++;

        keys.interact = false;

        if (
            game.dialogueIndex >=
            game.dialogue.length
        ) {

            game.dialogue = null;

            game.dialogueIndex = 0;

            game.mode = "explore";

        }

    }

}


/* =========================================================
   ПЕРЕХОДЫ
========================================================= */

function checkExit() {

    if (game.mode !== "explore") {
        return;
    }

    const room = rooms[game.room];

    const exit = room.exit;

    if (rectsOverlap(player, exit)) {

        game.room = exit.target;

        game.transition = 20;

        if (game.room === "room1") {

            player.x = 275;
            player.y = 90;

        } else {

            player.x = 30;
            player.y = 90;

        }

        party.forEach((member, index) => {

            member.x = player.x - 15 * (index + 1);

            member.y = player.y;

        });

    }

}


/* =========================================================
   РИСОВАНИЕ КОМНАТЫ
========================================================= */

function drawRoom() {

    const room = rooms[game.room];

    ctx.fillStyle = room.floor;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    /* Пол */

    ctx.fillStyle = "#202020";

    for (let y = 10; y < 172; y += 16) {

        for (let x = 10; x < 312; x += 16) {

            ctx.fillRect(
                x,
                y,
                1,
                1
            );

        }

    }

    /* Стены */

    ctx.fillStyle = "#555";

    room.walls.forEach(wall => {

        ctx.fillRect(
            wall.x,
            wall.y,
            wall.w,
            wall.h
        );

    });

    /* Выход */

    ctx.fillStyle = "#663333";

    ctx.fillRect(
        room.exit.x,
        room.exit.y,
        room.exit.w,
        room.exit.h
    );

}


/* =========================================================
   РИСОВАНИЕ NPC
========================================================= */

function drawNPC() {

    const npc = rooms[game.room].npc;

    drawCharacter(
        npc.x,
        npc.y,
        npc.color
    );

}


/* =========================================================
   РИСОВАНИЕ ПЕРСОНАЖА
========================================================= */

function drawCharacter(x, y, color) {

    ctx.fillStyle = "#000";

    ctx.fillRect(
        x - 1,
        y - 1,
        12,
        16
    );

    ctx.fillStyle = color;

    /* Голова */

    ctx.fillRect(
        x + 2,
        y,
        6,
        6
    );

    /* Тело */

    ctx.fillRect(
        x + 1,
        y + 6,
        8,
        7
    );

    /* Ноги */

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
   ИГРОК
========================================================= */

function drawPlayer() {

    drawCharacter(
        player.x,
        player.y,
        "#ffffff"
    );

}


/* =========================================================
   НАПАРНИКИ
========================================================= */

function drawParty() {

    party.forEach(member => {

        drawCharacter(
            Math.round(member.x),
            Math.round(member.y),
            member.color
        );

    });

}


/* =========================================================
   ИМЯ КОМНАТЫ
========================================================= */

function drawRoomName() {

    ctx.font = "6px monospace";

    ctx.fillStyle = "#fff";

    ctx.fillText(
        rooms[game.room].name,
        12,
        18
    );

}


/* =========================================================
   ПОДСКАЗКА NPC
========================================================= */

function drawNPCPrompt() {

    if (game.mode !== "explore") {
        return;
    }

    const npc = rooms[game.room].npc;

    const dx = player.x - npc.x;
    const dy = player.y - npc.y;

    const distance =
        Math.sqrt(dx * dx + dy * dy);

    if (distance < 25) {

        ctx.fillStyle = "#000";

        ctx.fillRect(
            105,
            145,
            110,
            18
        );

        ctx.strokeStyle = "#fff";

        ctx.strokeRect(
            105,
            145,
            110,
            18
        );

        ctx.fillStyle = "#fff";

        ctx.font = "6px monospace";

        ctx.fillText(
            "A — поговорить",
            118,
            156
        );

    }

}


/* =========================================================
   ДИАЛОГОВОЕ ОКНО
========================================================= */

function drawDialogue() {

    if (game.mode !== "dialogue") {
        return;
    }

    const text =
        game.dialogue[
            game.dialogueIndex
        ];

    /* Затемнение */

    ctx.fillStyle = "rgba(0,0,0,0.35)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    /* Окно */

    ctx.fillStyle = "#000";

    ctx.fillRect(
        15,
        115,
        290,
        52
    );

    ctx.strokeStyle = "#fff";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        15,
        115,
        290,
        52
    );

    /* Текст */

    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";

    drawWrappedText(
        text,
        25,
        135,
        270,
        10
    );

    ctx.font = "6px monospace";

    ctx.fillText(
        "A / ENTER",
        250,
        158
    );

}


function drawWrappedText(
    text,
    x,
    y,
    maxWidth,
    lineHeight
) {

    const words = text.split(" ");

    let line = "";

    for (let i = 0; i < words.length; i++) {

        const testLine =
            line + words[i] + " ";

        const width =
            ctx.measureText(testLine).width;

        if (
            width > maxWidth &&
            i > 0
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

            line = testLine;

        }

    }

    ctx.fillText(
        line,
        x,
        y
    );

}


/* =========================================================
   ПЕРЕХОД ЭКРАНА
========================================================= */

function drawTransition() {

    if (game.transition <= 0) {
        return;
    }

    ctx.fillStyle = "#000";

    ctx.globalAlpha =
        game.transition / 20;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    ctx.globalAlpha = 1;

    game.transition--;

}


/* =========================================================
   ОБНОВЛЕНИЕ
========================================================= */

function update() {

    game.time++;

    if (game.mode === "explore") {

        updatePlayer();

        updateParty();

        updateNPC();

        checkExit();

    }

    if (game.mode === "dialogue") {

        updateDialogue();

    }

}


/* =========================================================
   РИСОВАНИЕ
========================================================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );

    drawRoom();

    drawNPC();

    drawParty();

    drawPlayer();

    drawRoomName();

    drawNPCPrompt();

    drawDialogue();

    drawTransition();

}


/* =========================================================
   ИГРОВОЙ ЦИКЛ
========================================================= */

function gameLoop() {

    update();

    draw();

    requestAnimationFrame(gameLoop);

}


gameLoop();
