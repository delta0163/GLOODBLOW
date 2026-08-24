"use strict";

/* =====================================================
   CANVAS
===================================================== */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = 320;
const H = 180;


/* =====================================================
   IMAGES
===================================================== */

const images = {};

const imageFiles = {
    wasteland: "images/wasteland.png",
    path: "images/path.png",

    delta: "images/delta.png",
    deltaLeft: "images/deltaleft.png",
    deltaRight: "images/deltaright.png",
    deltaBack: "images/deltaback.png",

    error: "images/error.png"
};

let loadedImages = 0;
const totalImages = Object.keys(imageFiles).length;

for (const name in imageFiles) {

    const img = new Image();

    img.src = imageFiles[name];

    img.onload = function () {
        loadedImages++;
    };

    img.onerror = function () {
        console.warn(
            "Не удалось загрузить:",
            imageFiles[name]
        );
    };

    images[name] = img;
}


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

    const key = e.key.toLowerCase();

    if (
        e.key === "ArrowUp" ||
        key === "w"
    ) {
        keys.up = true;
    }

    if (
        e.key === "ArrowDown" ||
        key === "s"
    ) {
        keys.down = true;
    }

    if (
        e.key === "ArrowLeft" ||
        key === "a"
    ) {
        keys.left = true;
    }

    if (
        e.key === "ArrowRight" ||
        key === "d"
    ) {
        keys.right = true;
    }

    if (key === "z") {
        keys.z = true;
    }

    if (key === "x") {
        keys.x = true;
    }

    if (key === "c") {
        keys.c = true;
    }

    e.preventDefault();

}, { passive: false });


window.addEventListener("keyup", function(e) {

    const key = e.key.toLowerCase();

    if (
        e.key === "ArrowUp" ||
        key === "w"
    ) {
        keys.up = false;
    }

    if (
        e.key === "ArrowDown" ||
        key === "s"
    ) {
        keys.down = false;
    }

    if (
        e.key === "ArrowLeft" ||
        key === "a"
    ) {
        keys.left = false;
    }

    if (
        e.key === "ArrowRight" ||
        key === "d"
    ) {
        keys.right = false;
    }

    if (key === "z") {
        keys.z = false;
    }

    if (key === "x") {
        keys.x = false;
    }

    if (key === "c") {
        keys.c = false;
    }

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


document.querySelectorAll(".action").forEach(button => {

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
    .getElementById("fullscreen")
    .addEventListener("pointerdown", async e => {

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


/* =====================================================
   GAME
===================================================== */

const game = {

    mode: "explore",

    cameraX: 0,
    cameraY: 0,

    dialogueIndex: 0,

    started: false,

    teamJoined: false,

    encounterTimer: 0,

    encounterMin: 900,

    encounterMax: 1500,

    battle: null

};


/* =====================================================
   PLAYER
===================================================== */

const player = {

    x: 1280,

    y: 1280,

    speed: 2.2,

    direction: "down",

    width: 60,

    height: 75

};


/* =====================================================
   TEAM
===================================================== */

const team = [

    {
        name: "ЛИЧИ",
        x: 1130,
        y: 520
    },

    {
        name: "ПАНКЕЙК",
        x: 1210,
        y: 520
    },

    {
        name: "КАШТАН",
        x: 1290,
        y: 520
    },

    {
        name: "ШАРЛОТА",
        x: 1370,
        y: 520
    }

];


/* =====================================================
   DIALOGUE
===================================================== */

const storyDialogue = [

    {
        name: "ЛИЧИ",
        text:
        "Надо проверить Немку... Она изменилась."
    },

    {
        name: "ЛИЧИ",
        text:
        "Последний раз, когда мы пытались поговорить с ней, она была какой-то странной."
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
        "Надеюсь, мы успеем поговорить с ней до того, как всё станет ещё хуже."
    },

    {
        name: "КАШТАН",
        text:
        "Тогда не будем терять время."
    },

    {
        name: "ШАРЛОТА",
        text:
        "Держитесь рядом. Пустошь сегодня выглядит особенно нестабильно."
    }

];


/* =====================================================
   START
===================================================== */

function startGame() {

    game.started = true;

    player.x = 1280;
    player.y = 1240;

    game.cameraX = player.x - W / 2;
    game.cameraY = player.y - H / 2;

}


/* =====================================================
   DISTANCE
===================================================== */

function distance(a, b) {

    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.sqrt(dx * dx + dy * dy);

}


/* =====================================================
   DIALOGUE
===================================================== */

function startTeamDialogue() {

    game.mode = "dialogue";

    game.dialogueIndex = 0;

}


function updateDialogue() {

    if (pressed.z) {

        game.dialogueIndex++;

        if (
            game.dialogueIndex >=
            storyDialogue.length
        ) {

            game.mode = "explore";

            game.teamJoined = true;

        }

    }

}


/* =====================================================
   PLAYER MOVEMENT
===================================================== */

function updatePlayer() {

    if (game.mode !== "explore")
        return;

    let dx = 0;
    let dy = 0;

    if (keys.up) {

        dy -= player.speed;

        player.direction = "back";

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

    if (dx !== 0 && dy !== 0) {

        dx *= .707;
        dy *= .707;

    }

    player.x += dx;
    player.y += dy;


    /* ГРАНИЦЫ ЛОКАЦИИ */

    player.x =
        Math.max(
            80,
            Math.min(
                2480,
                player.x
            )
        );

    player.y =
        Math.max(
            80,
            Math.min(
                1360,
                player.y
            )
        );

}


/* =====================================================
   CAMERA
===================================================== */

function updateCamera() {

    const targetX =
        player.x - W / 2;

    const targetY =
        player.y - H / 2;


    game.cameraX +=
        (targetX - game.cameraX) * .08;

    game.cameraY +=
        (targetY - game.cameraY) * .08;


    game.cameraX =
        Math.max(
            0,
            Math.min(
                2560 - W,
                game.cameraX
            )
        );


    game.cameraY =
        Math.max(
            0,
            Math.min(
                1440 - H,
                game.cameraY
            )
        );

}


/* =====================================================
   RANDOM ENCOUNTERS
===================================================== */

function updateEncounters() {

    if (game.mode !== "explore")
        return;

    if (!game.teamJoined)
        return;

    game.encounterTimer++;

    if (
        game.encounterTimer >
        game.encounterMin
    ) {

        if (
            Math.random() < 0.002
        ) {

            startBattle();

            game.encounterTimer = 0;

            game.encounterMin =
                900 +
                Math.floor(
                    Math.random() * 700
                );

        }

    }

}


/* =====================================================
   BATTLE
===================================================== */

function startBattle() {

    game.mode = "battle";

    game.battle = {

        phase: "menu",

        menu: 0,

        mercy: 0,

        soul: {

            x: 160,

            y: 135,

            speed: 2.4,

            size: 5,

            invincible: 0

        },

        enemy: {

            hp: 250,

            maxHP: 250

        },

        bullets: [],

        attackTimer: 0

    };

}


/* =====================================================
   BATTLE UPDATE
===================================================== */

function updateBattle() {

    const b = game.battle;

    if (!b)
        return;


    if (b.phase === "menu") {

        if (keys.left && !b.leftLock) {

            b.menu--;

            if (b.menu < 0)
                b.menu = 3;

            b.leftLock = true;

        }

        if (!keys.left)
            b.leftLock = false;


        if (keys.right && !b.rightLock) {

            b.menu++;

            if (b.menu > 3)
                b.menu = 0;

            b.rightLock = true;

        }

        if (!keys.right)
            b.rightLock = false;


        if (pressed.z) {

            if (b.menu === 0) {

                b.enemy.hp -= 20;

                if (b.enemy.hp <= 0) {

                    b.enemy.hp = 0;

                    b.phase = "victory";

                } else {

                    startEnemyAttack();

                }

            }


            else if (b.menu === 1) {

                b.mercy =
                    Math.min(
                        100,
                        b.mercy + 25
                    );

                startEnemyAttack();

            }


            else if (b.menu === 2) {

                b.phase = "item";

            }


            else if (b.menu === 3) {

                b.mercy =
                    Math.min(
                        100,
                        b.mercy + 10
                    );

                startEnemyAttack();

            }

        }

    }


    else if (b.phase === "item") {

        if (pressed.z) {

            b.phase = "menu";

        }

        if (pressed.x) {

            b.phase = "menu";

        }

    }


    else if (b.phase === "enemy") {

        updateSoul();

        updateBullets();

        b.attackTimer--;

        if (b.attackTimer <= 0) {

            b.phase = "menu";

        }

    }


    else if (b.phase === "victory") {

        if (pressed.z || pressed.x) {

            game.mode = "explore";

            game.battle = null;

        }

    }

}


/* =====================================================
   ENEMY ATTACK
===================================================== */

function startEnemyAttack() {

    const b = game.battle;

    b.phase = "enemy";

    b.attackTimer = 420;

    b.bullets = [];


    for (let i = 0; i < 8; i++) {

        b.bullets.push({

            x:
                65 +
                Math.random() * 190,

            y:
                88 +
                Math.random() * 70,

            dx:
                (Math.random() - .5) * .7,

            dy:
                (Math.random() - .5) * .7,

            size: 3

        });

    }

}


/* =====================================================
   SOUL
===================================================== */

function updateSoul() {

    const b = game.battle;

    const soul = b.soul;

    if (keys.up)
        soul.y -= soul.speed;

    if (keys.down)
        soul.y += soul.speed;

    if (keys.left)
        soul.x -= soul.speed;

    if (keys.right)
        soul.x += soul.speed;


    soul.x =
        Math.max(
            55,
            Math.min(
                265,
                soul.x
            )
        );


    soul.y =
        Math.max(
            88,
            Math.min(
                160,
                soul.y
            )
        );


    if (soul.invincible > 0)
        soul.invincible--;

}


/* =====================================================
   BULLETS
===================================================== */

function updateBullets() {

    const b = game.battle;

    const soul = b.soul;


    for (const bullet of b.bullets) {

        bullet.x += bullet.dx;
        bullet.y += bullet.dy;


        if (
            bullet.x < 52 ||
            bullet.x > 268
        ) {

            bullet.dx *= -1;

        }

        if (
            bullet.y < 84 ||
            bullet.y > 164
        ) {

            bullet.dy *= -1;

        }


        const dx =
            bullet.x - soul.x;

        const dy =
            bullet.y - soul.y;

        const d =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            d <
            bullet.size +
            soul.size
        ) {

            if (
                soul.invincible <= 0
            ) {

                soul.invincible = 45;

            }

        }

    }

}


/* =====================================================
   DRAW BACKGROUND
===================================================== */

function drawWorld() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    if (
        images.wasteland.complete &&
        images.wasteland.naturalWidth
    ) {

        ctx.drawImage(
            images.wasteland,

            Math.floor(game.cameraX),
            Math.floor(game.cameraY),

            W,
            H,

            0,
            0,
            W,
            H
        );

    }


    /* ТРОПИНКА */

    if (
        images.path.complete &&
        images.path.naturalWidth
    ) {

        ctx.drawImage(
            images.path,

            Math.floor(game.cameraX),
            Math.floor(game.cameraY),

            W,
            H,

            0,
            0,
            W,
            H
        );

    }

}


/* =====================================================
   DRAW DELTA
===================================================== */

function getDeltaImage() {

    if (player.direction === "left")
        return images.deltaLeft;

    if (player.direction === "right")
        return images.deltaRight;

    if (player.direction === "back")
        return images.deltaBack;

    return images.delta;

}


function drawDelta() {

    const img = getDeltaImage();

    if (
        !img.complete ||
        !img.naturalWidth
    )
        return;


    const screenX =
        player.x -
        game.cameraX;

    const screenY =
        player.y -
        game.cameraY;


    ctx.drawImage(
        img,

        screenX - 30,
        screenY - 40,

        60,
        75
    );

}


/* =====================================================
   DRAW TEAM
===================================================== */

function drawTeam() {

    if (game.teamJoined)
        return;


    for (const member of team) {

        const img =
            images.delta;


        if (
            !img.complete ||
            !img.naturalWidth
        )
            continue;


        const x =
            member.x -
            game.cameraX;

        const y =
            member.y -
            game.cameraY;


        ctx.drawImage(
            img,
            x - 20,
            y - 25,
            40,
            50
        );

    }

}


/* =====================================================
   DRAW STORY DIALOGUE
===================================================== */

function drawDialogue() {

    ctx.fillStyle =
        "rgba(0,0,0,.55)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle = "#000";

    ctx.fillRect(
        10,
        105,
        300,
        62
    );


    ctx.strokeStyle = "#fff";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        10,
        105,
        300,
        62
    );


    const line =
        storyDialogue[
            game.dialogueIndex
        ];


    ctx.fillStyle = "#fff";

    ctx.font = "8px monospace";

    ctx.fillText(
        line.name,
        22,
        120
    );


    ctx.font = "7px monospace";

    drawText(
        line.text,
        22,
        136,
        275,
        9
    );


    ctx.font = "6px monospace";

    ctx.fillText(
        "Z — далее",
        235,
        158
    );

}


/* =====================================================
   TEXT WRAP
===================================================== */

function drawText(
    text,
    x,
    y,
    maxWidth,
    lineHeight
) {

    const words =
        text.split(" ");

    let line = "";

    for (let i = 0; i < words.length; i++) {

        const test =
            line +
            words[i] +
            " ";

        if (
            ctx.measureText(test).width >
            maxWidth
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


/* =====================================================
   BATTLE DRAW
===================================================== */

function drawBattle() {

    ctx.fillStyle = "#050505";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    const b = game.battle;


    /* ВРАГ */

    if (
        images.error.complete &&
        images.error.naturalWidth
    ) {

        ctx.drawImage(
            images.error,
            125,
            8,
            70,
            70
        );

    }


    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";

    ctx.fillText(
        "ОШИБКА СИСТЕМЫ",
        18,
        15
    );


    /* HP ВРАГА */

    ctx.fillText(
        "HP",
        225,
        15
    );


    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        245,
        9,
        55,
        7
    );


    ctx.fillStyle = "#fff";

    ctx.fillRect(
        246,
        10,
        53 *
        (b.enemy.hp /
        b.enemy.maxHP),
        5
    );


    /* БОЕВАЯ ОБЛАСТЬ */

    ctx.strokeStyle = "#fff";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        48,
        82,
        224,
        80
    );


    /* ПУЛИ */

    if (b.phase === "enemy") {

        for (const bullet of b.bullets) {

            ctx.fillStyle = "#fff";

            ctx.fillRect(
                bullet.x - 3,
                bullet.y - 3,
                6,
                6
            );

        }


        /* ДУША */

        ctx.fillStyle = "#ff3333";

        ctx.fillRect(
            b.soul.x - 4,
            b.soul.y - 4,
            8,
            8
        );

    }


    /* МЕНЮ */

    ctx.font = "7px monospace";

    const options = [

        "FIGHT",
        "ACT",
        "ITEM",
        "MERCY"

    ];


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const x =
            10 + i * 78;


        const y = 172;


        if (
            b.menu === i &&
            b.phase === "menu"
        ) {

            ctx.strokeStyle = "#fff";

            ctx.strokeRect(
                x - 4,
                y - 10,
                66,
                15
            );

        }


        ctx.fillStyle = "#fff";

        ctx.fillText(
            options[i],
            x,
            y
        );

    }


    /* ПОЩАДА */

    ctx.fillStyle = "#fff";

    ctx.font = "6px monospace";

    ctx.fillText(
        "RD",
        275,
        30
    );


    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        275,
        35,
        35,
        6
    );


    ctx.fillStyle = "#ffd83d";

    ctx.fillRect(
        276,
        36,
        33 *
        (b.mercy / 100),
        4
    );


    /* ЗАЩИТА */

    if (b.phase === "menu") {

        ctx.fillStyle = "#aaa";

        ctx.font = "5px monospace";

        ctx.fillText(
            "▲▼ выбор   Z действие",
            78,
            70
        );

    }


    if (b.phase === "victory") {

        ctx.fillStyle = "#fff";

        ctx.font = "11px monospace";

        ctx.fillText(
            "ПОБЕДА!",
            125,
            75
        );

        ctx.font = "6px monospace";

        ctx.fillText(
            "Z — продолжить",
            112,
            90
        );

    }

}


/* =====================================================
   DRAW HUD
===================================================== */

function drawHUD() {

    ctx.fillStyle =
        "rgba(0,0,0,.55)";

    ctx.fillRect(
        5,
        5,
        100,
        18
    );


    ctx.fillStyle = "#fff";

    ctx.font = "6px monospace";

    ctx.fillText(
        "ЦИФРОВАЯ ПУСТОШЬ",
        10,
        17
    );

}


/* =====================================================
   UPDATE
===================================================== */

function update() {

    if (!game.started) {

        if (pressed.z) {

            startGame();

        }

    }

    else if (
        game.mode === "explore"
    ) {

        updatePlayer();

        updateCamera();

        updateEncounters();


        if (
            !game.teamJoined
        ) {

            const target = {
                x: 1280,
                y: 520
            };


            if (
                distance(
                    player,
                    target
                ) < 70
            ) {

                startTeamDialogue();

            }

        }

    }


    else if (
        game.mode === "dialogue"
    ) {

        updateDialogue();

    }


    else if (
        game.mode === "battle"
    ) {

        updateBattle();

    }


    /* C пока возвращает игрока
       в исследование */

    if (
        pressed.c &&
        game.mode === "explore"
    ) {

        /* меню можно добавить здесь */

    }


    pressed.z = keys.z;
    pressed.x = keys.x;
    pressed.c = keys.c;

}


/* =====================================================
   DRAW
===================================================== */

function draw() {

    if (!game.started) {

        ctx.fillStyle = "#000";

        ctx.fillRect(
            0,
            0,
            W,
            H
        );


        ctx.fillStyle = "#fff";

        ctx.font = "14px monospace";

        ctx.fillText(
            "BLOOD GLOW",
            100,
            70
        );


        ctx.font = "7px monospace";

        ctx.fillText(
            "ЦИФРОВАЯ ПУСТОШЬ",
            100,
            84
        );


        ctx.fillText(
            "Z — НАЧАТЬ",
            118,
            115
        );


        return;

    }


    if (
        game.mode === "battle"
    ) {

        drawBattle();

        return;

    }


    drawWorld();

    drawTeam();

    drawDelta();

    drawHUD();


    if (
        game.mode === "dialogue"
    ) {

        drawDialogue();

    }

}


/* =====================================================
   LOOP
===================================================== */

function loop() {

    update();

    draw();

    requestAnimationFrame(loop);

}

loop();
