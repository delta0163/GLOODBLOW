"use strict";


/* =====================================================
   CANVAS
===================================================== */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const SCREEN_W = 320;
const SCREEN_H = 180;


/* =====================================================
   WORLD
===================================================== */

const WORLD_W = 2560;
const WORLD_H = 1440;


/* =====================================================
   IMAGES
===================================================== */

const images = {

    background: new Image(),

    path: new Image(),

    delta: new Image(),

    deltaLeft: new Image(),

    deltaRight: new Image(),

    deltaBack: new Image(),

    error: new Image()

};

images.background.src = "images/background.png";
images.path.src = "images/path.png";

images.delta.src = "images/delta.png";

images.deltaLeft.src = "images/deltalef.png";
images.deltaRight.src = "images/deltaright.png";
images.deltaBack.src = "images/deltabach.png";

images.error.src = "images/error.png";


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

}, { passive:false });


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

}, { passive:false });


/* =====================================================
   MOBILE CONTROLS
===================================================== */

document.querySelectorAll(".joy").forEach(button => {

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


document.querySelectorAll(".action-button").forEach(button => {

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


/* =====================================================
   FULLSCREEN
===================================================== */

document
    .getElementById("fullscreen-button")
    .addEventListener("pointerdown", async function(e) {

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

    started: true,

    dialogue: false,

    dialogueIndex: 0,

    cameraX: 0,

    cameraY: 0,

    message: "",

    messageTimer: 0

};


/* =====================================================
   PLAYER
===================================================== */

const player = {

    x: 320,

    y: 700,

    width: 24,

    height: 34,

    speed: 2.2,

    direction: "down",

    moving: false

};


/* =====================================================
   CAMERA
===================================================== */

const camera = {

    x: 0,

    y: 0,

    smooth: 0.08

};


/* =====================================================
   DIALOGUE
===================================================== */

const dialogue = [

    {
        name: "ЛИЧИ",

        text:
        "Надо проверить Немку... " +
        "она изменилась."
    },

    {
        name: "ЛИЧИ",

        text:
        "Последний раз, когда мы " +
        "пытались поговорить с ней, " +
        "она была странной."
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
        name: "ЛИЧИ",

        text:
        "Только держитесь рядом. " +
        "В этой части пустоши " +
        "система часто даёт сбои."
    },

    {
        name: "ДЕЛЬТА",

        text:
        "Понял."
    }

];


/* =====================================================
   START POSITION
===================================================== */

function resetPlayer() {

    player.x = 320;
    player.y = 700;

    player.direction = "down";

}


/* =====================================================
   COLLISION
===================================================== */

function keepPlayerInsideWorld() {

    player.x = Math.max(
        20,
        Math.min(
            WORLD_W - player.width - 20,
            player.x
        )
    );

    player.y = Math.max(
        20,
        Math.min(
            WORLD_H - player.height - 20,
            player.y
        )
    );

}


/* =====================================================
   PLAYER UPDATE
===================================================== */

function updatePlayer() {

    if (game.dialogue)
        return;

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

    player.moving =
        dx !== 0 ||
        dy !== 0;


    if (dx !== 0 && dy !== 0) {

        dx *= 0.707;
        dy *= 0.707;

    }

    player.x += dx;
    player.y += dy;

    keepPlayerInsideWorld();

}


/* =====================================================
   CAMERA UPDATE
===================================================== */

function updateCamera() {

    const targetX =
        player.x +
        player.width / 2 -
        SCREEN_W / 2;

    const targetY =
        player.y +
        player.height / 2 -
        SCREEN_H / 2;


    camera.x +=
        (targetX - camera.x) *
        camera.smooth;

    camera.y +=
        (targetY - camera.y) *
        camera.smooth;


    camera.x = Math.max(
        0,
        Math.min(
            WORLD_W - SCREEN_W,
            camera.x
        )
    );

    camera.y = Math.max(
        0,
        Math.min(
            WORLD_H - SCREEN_H,
            camera.y
        )
    );


    game.cameraX = camera.x;
    game.cameraY = camera.y;

}


/* =====================================================
   SPRITE
===================================================== */

function getPlayerSprite() {

    if (player.direction === "left") {

        return images.deltaLeft;

    }

    if (player.direction === "right") {

        return images.deltaRight;

    }

    if (player.direction === "up") {

        return images.deltaBack;

    }

    return images.delta;

}


/* =====================================================
   DRAW PLAYER
===================================================== */

function drawPlayer() {

    const sprite =
        getPlayerSprite();


    const screenX =
        Math.round(
            player.x -
            camera.x
        );

    const screenY =
        Math.round(
            player.y -
            camera.y
        );


    if (
        sprite.complete &&
        sprite.naturalWidth > 0
    ) {

        ctx.drawImage(

            sprite,

            screenX,
            screenY,

            player.width,
            player.height

        );

    }

    else {

        /* запасной вариант,
           если картинка ещё не загрузилась */

        ctx.fillStyle = "#ffffff";

        ctx.fillRect(
            screenX + 5,
            screenY,
            14,
            20
        );

        ctx.fillStyle = "#222";

        ctx.fillRect(
            screenX + 7,
            screenY + 4,
            3,
            3
        );

        ctx.fillRect(
            screenX + 14,
            screenY + 4,
            3,
            3
        );

    }

}


/* =====================================================
   DRAW WORLD
===================================================== */

function drawWorld() {

    /*
       ВАЖНО:

       Мы НЕ растягиваем всю карту
       2560x1440 на экран.

       Камера берёт только участок
       вокруг Дельты.
    */


    ctx.clearRect(
        0,
        0,
        SCREEN_W,
        SCREEN_H
    );


    /* ==========================
       BACKGROUND
    ========================== */

    if (
        images.background.complete &&
        images.background.naturalWidth > 0
    ) {

        ctx.drawImage(

            images.background,

            Math.round(camera.x),
            Math.round(camera.y),

            SCREEN_W,
            SCREEN_H,

            0,
            0,

            SCREEN_W,
            SCREEN_H

        );

    }

    else {

        ctx.fillStyle = "#11151a";

        ctx.fillRect(
            0,
            0,
            SCREEN_W,
            SCREEN_H
        );

    }


    /* ==========================
       PATH
    ========================== */

    if (
        images.path.complete &&
        images.path.naturalWidth > 0
    ) {

        ctx.drawImage(

            images.path,

            Math.round(camera.x),
            Math.round(camera.y),

            SCREEN_W,
            SCREEN_H,

            0,
            0,

            SCREEN_W,
            SCREEN_H

        );

    }


    /* ==========================
       PLAYER
    ========================== */

    drawPlayer();


    /* ==========================
       UI
    ========================== */

    drawLocationUI();

}


/* =====================================================
   LOCATION UI
===================================================== */

function drawLocationUI() {

    ctx.fillStyle = "rgba(0,0,0,.55)";

    ctx.fillRect(
        5,
        5,
        105,
        18
    );


    ctx.fillStyle = "#fff";

    ctx.font = "6px monospace";

    ctx.fillText(
        "ЦИФРОВАЯ ПУСТОШЬ",
        11,
        16
    );


    if (game.messageTimer > 0) {

        ctx.fillStyle =
            "rgba(0,0,0,.8)";

        ctx.fillRect(
            65,
            145,
            190,
            22
        );

        ctx.strokeStyle =
            "#ffffff";

        ctx.strokeRect(
            65,
            145,
            190,
            22
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.font =
            "6px monospace";

        ctx.fillText(
            game.message,
            76,
            158
        );

    }

}


/* =====================================================
   DIALOGUE
===================================================== */

function startDialogue() {

    game.dialogue = true;

    game.dialogueIndex = 0;

}


function updateDialogue() {

    if (
        keys.z &&
        !pressed.z
    ) {

        game.dialogueIndex++;

        if (
            game.dialogueIndex >=
            dialogue.length
        ) {

            game.dialogue = false;

            game.dialogueIndex = 0;

        }

    }


    if (
        keys.x &&
        !pressed.x
    ) {

        game.dialogue = false;

        game.dialogueIndex = 0;

    }

}


/* =====================================================
   DRAW DIALOGUE
===================================================== */

function drawDialogue() {

    const d =
        dialogue[
            game.dialogueIndex
        ];


    /* затемнение */

    ctx.fillStyle =
        "rgba(0,0,0,.45)";

    ctx.fillRect(
        0,
        0,
        SCREEN_W,
        SCREEN_H
    );


    /* окно */

    ctx.fillStyle =
        "#050505";

    ctx.fillRect(
        12,
        105,
        296,
        62
    );


    ctx.strokeStyle =
        "#ffffff";

    ctx.lineWidth = 1;

    ctx.strokeRect(
        12,
        105,
        296,
        62
    );


    /* имя */

    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "8px monospace";

    ctx.fillText(
        d.name,
        23,
        119
    );


    /* текст */

    ctx.font =
        "7px monospace";


    const words =
        d.text.split(" ");

    let line = "";

    let y = 133;


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
            ctx.measureText(test).width > 260
        ) {

            ctx.fillText(
                line,
                23,
                y
            );

            line =
                words[i] + " ";

            y += 10;

        }

        else {

            line = test;

        }

    }


    ctx.fillText(
        line,
        23,
        y
    );


    ctx.fillStyle =
        "#aaa";

    ctx.font =
        "5px monospace";

    ctx.fillText(
        "Z — далее    X — пропустить",
        185,
        160
    );

}


/* =====================================================
   INTRO
===================================================== */

function updateIntro() {

    /*
       При первом запуске Z начинает
       разговор команды.
    */

    if (
        keys.z &&
        !pressed.z
    ) {

        startDialogue();

    }

}


/* =====================================================
   MAIN UPDATE
===================================================== */

function update() {

    if (game.dialogue) {

        updateDialogue();

    }

    else {

        updatePlayer();

        updateCamera();

        updateIntro();

    }


    if (game.messageTimer > 0) {

        game.messageTimer--;

    }


    pressed.z = keys.z;
    pressed.x = keys.x;
    pressed.c = keys.c;

}


/* =====================================================
   DRAW
===================================================== */

function draw() {

    drawWorld();


    if (game.dialogue) {

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


/* =====================================================
   START
===================================================== */

resetPlayer();

updateCamera();

loop();
