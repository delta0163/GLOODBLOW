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

    const key = e.key.toLowerCase();

    if (e.key === "ArrowUp" || key === "w")
        keys.up = true;

    if (e.key === "ArrowDown" || key === "s")
        keys.down = true;

    if (e.key === "ArrowLeft" || key === "a")
        keys.left = true;

    if (e.key === "ArrowRight" || key === "d")
        keys.right = true;

    if (key === "z")
        keys.z = true;

    if (key === "x")
        keys.x = true;

    if (key === "c")
        keys.c = true;

    e.preventDefault();

}, { passive:false });


window.addEventListener("keyup", function(e) {

    const key = e.key.toLowerCase();

    if (e.key === "ArrowUp" || key === "w")
        keys.up = false;

    if (e.key === "ArrowDown" || key === "s")
        keys.down = false;

    if (e.key === "ArrowLeft" || key === "a")
        keys.left = false;

    if (e.key === "ArrowRight" || key === "d")
        keys.right = false;

    if (key === "z")
        keys.z = false;

    if (key === "x")
        keys.x = false;

    if (key === "c")
        keys.c = false;

    e.preventDefault();

}, { passive:false });


/* =====================================================
   MOBILE CONTROLS
===================================================== */

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


document.querySelectorAll(".action").forEach(function(button) {

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

document.getElementById("fullscreen")
    .addEventListener("pointerdown", async function(e) {

        e.preventDefault();

        try {

            if (!document.fullscreenElement) {

                await document.documentElement.requestFullscreen();

            } else {

                await document.exitFullscreen();

            }

        } catch(err) {

            console.log(err);

        }

    });


/* =====================================================
   GAME STATE
===================================================== */

const game = {

    screen: "title",

    saveSlot: 0,

    room: "bedroom",

    dialogue: null,

    dialogueIndex: 0,

    transition: 0,

    menuIndex: 0,

    introStep: 0

};


/* =====================================================
   PLAYER
===================================================== */

const player = {

    x: 150,

    y: 120,

    speed: 1.4,

    width: 9,

    height: 13

};


/* =====================================================
   ROOMS
===================================================== */

const rooms = {

    bedroom: {

        name: "КОМНАТА ДЕЛЬТЫ",

        floor: "#151515"

    },

    street: {

        name: "УЛИЦА",

        floor: "#20242a"

    },

    library: {

        name: "БИБЛИОТЕКА",

        floor: "#17130f"

    }

};


/* =====================================================
   SAVE SYSTEM
===================================================== */

function saveGame(slot) {

    const data = {

        room: game.room,

        playerX: player.x,

        playerY: player.y,

        introStep: game.introStep,

        savedAt: new Date().toLocaleString()

    };

    localStorage.setItem(
        "bloodGlow_save_" + slot,
        JSON.stringify(data)
    );

}


function loadGame(slot) {

    const raw = localStorage.getItem(
        "bloodGlow_save_" + slot
    );

    if (!raw)
        return false;

    try {

        const data = JSON.parse(raw);

        game.room =
            data.room || "bedroom";

        player.x =
            data.playerX ?? 150;

        player.y =
            data.playerY ?? 120;

        game.introStep =
            data.introStep ?? 0;

        return true;

    } catch(error) {

        return false;

    }

}


/* =====================================================
   START NEW GAME
===================================================== */

function startNewGame() {

    game.room = "bedroom";

    player.x = 150;
    player.y = 120;

    game.introStep = 0;

    game.dialogue = null;

    game.dialogueIndex = 0;

    game.screen = "intro";

}


/* =====================================================
   TITLE SCREEN
===================================================== */

function updateTitle() {

    if (keys.z && !pressed.z) {

        game.screen = "save";

        game.saveSlot = 0;

    }

}


/* =====================================================
   TITLE DRAW
===================================================== */

function drawTitle() {

    ctx.fillStyle = "#050505";

    ctx.fillRect(0,0,W,H);


    ctx.fillStyle = "#fff";

    ctx.textAlign = "center";

    ctx.font = "18px monospace";

    ctx.fillText(
        "BLOOD GLOW",
        W/2,
        48
    );


    ctx.font = "7px monospace";

    ctx.fillStyle = "#aaa";

    ctx.fillText(
        "A DARK STORY",
        W/2,
        61
    );


    ctx.font = "9px monospace";

    ctx.fillStyle = "#fff";

    if (
        Math.floor(Date.now()/500)%2 === 0
    ) {

        ctx.fillText(
            "▶ НАЧАТЬ",
            W/2,
            105
        );

    } else {

        ctx.fillText(
            "  НАЧАТЬ",
            W/2,
            105
        );

    }


    ctx.font = "6px monospace";

    ctx.fillStyle = "#777";

    ctx.fillText(
        "Z — выбрать",
        W/2,
        140
    );


    ctx.textAlign = "left";

}


/* =====================================================
   SAVE SCREEN
===================================================== */

function updateSaveScreen() {

    if (keys.up && !pressed.up) {

        game.saveSlot--;

        if (game.saveSlot < 0)
            game.saveSlot = 2;

    }


    if (keys.down && !pressed.down) {

        game.saveSlot++;

        if (game.saveSlot > 2)
            game.saveSlot = 0;

    }


    if (keys.z && !pressed.z) {

        const exists = localStorage.getItem(
            "bloodGlow_save_" + game.saveSlot
        );

        if (exists) {

            loadGame(game.saveSlot);

            game.screen = "world";

        } else {

            startNewGame();

            saveGame(game.saveSlot);

        }

    }


    if (keys.x && !pressed.x) {

        game.screen = "title";

    }

}


function drawSaveScreen() {

    ctx.fillStyle = "#030303";

    ctx.fillRect(0,0,W,H);


    ctx.strokeStyle = "#fff";

    ctx.lineWidth = 1;

    ctx.strokeRect(
        35,
        18,
        250,
        140
    );


    ctx.fillStyle = "#fff";

    ctx.textAlign = "center";

    ctx.font = "10px monospace";

    ctx.fillText(
        "СОХРАНЕНИЕ",
        W/2,
        36
    );


    for (let i=0; i<3; i++) {

        const y = 65 + i*28;

        if (i === game.saveSlot) {

            ctx.strokeStyle = "#fff";

            ctx.strokeRect(
                55,
                y-11,
                210,
                20
            );

            ctx.fillStyle = "#fff";

            ctx.font = "7px monospace";

            ctx.fillText(
                "▶",
                65,
                y+3
            );

        }


        ctx.fillStyle = "#fff";

        ctx.font = "7px monospace";

        ctx.fillText(
            "ФАЙЛ " + (i+1),
            110,
            y+3
        );


        const raw = localStorage.getItem(
            "bloodGlow_save_" + i
        );

        ctx.fillStyle = "#888";

        ctx.font = "5px monospace";

        if (raw) {

            try {

                const data = JSON.parse(raw);

                ctx.fillText(
                    data.savedAt || "СОХРАНЕНО",
                    200,
                    y+3
                );

            } catch {

                ctx.fillText(
                    "ОШИБКА",
                    200,
                    y+3
                );

            }

        } else {

            ctx.fillText(
                "ПУСТО",
                200,
                y+3
            );

        }

    }


    ctx.fillStyle = "#aaa";

    ctx.font = "6px monospace";

    ctx.fillText(
        "Z — выбрать файл",
        W/2,
        145
    );

    ctx.fillText(
        "X — назад",
        W/2,
        155
    );


    ctx.textAlign = "left";

}


/* =====================================================
   INTRO
===================================================== */

const introText = [

    "..."

];


function updateIntro() {

    if (keys.z && !pressed.z) {

        game.introStep++;

        if (game.introStep >= 1) {

            game.screen = "world";

            game.room = "bedroom";

            player.x = 150;

            player.y = 120;

            saveGame(game.saveSlot);

        }

    }

}


/* =====================================================
   BEDROOM
===================================================== */

function drawBedroom() {

    ctx.fillStyle = "#101010";

    ctx.fillRect(0,0,W,H);


    /* стены */

    ctx.fillStyle = "#272727";

    ctx.fillRect(
        0,
        0,
        W,
        15
    );

    ctx.fillRect(
        0,
        165,
        W,
        15
    );

    ctx.fillRect(
        0,
        0,
        10,
        H
    );

    ctx.fillRect(
        310,
        0,
        10,
        H
    );


    /* пол */

    ctx.fillStyle = "#191919";

    ctx.fillRect(
        10,
        80,
        300,
        85
    );


    /* кровать */

    ctx.fillStyle = "#3b2525";

    ctx.fillRect(
        105,
        35,
        100,
        45
    );


    ctx.fillStyle = "#654343";

    ctx.fillRect(
        112,
        40,
        86,
        32
    );


    /* подушка */

    ctx.fillStyle = "#b7b0a5";

    ctx.fillRect(
        116,
        43,
        28,
        17
    );


    /* одеяло */

    ctx.fillStyle = "#333b55";

    ctx.fillRect(
        143,
        43,
        50,
        29
    );


    /* дверь */

    ctx.fillStyle = "#553b27";

    ctx.fillRect(
        275,
        55,
        25,
        65
    );


    ctx.fillStyle = "#111";

    ctx.fillRect(
        278,
        58,
        19,
        59
    );


    /* окно */

    ctx.fillStyle = "#222c3b";

    ctx.fillRect(
        25,
        30,
        45,
        35
    );


    ctx.strokeStyle = "#777";

    ctx.strokeRect(
        25,
        30,
        45,
        35
    );


    /* ДЕЛЬТА */

    drawPlayer(
        player.x,
        player.y
    );


    ctx.fillStyle = "#fff";

    ctx.font = "6px monospace";

    ctx.fillText(
        "КОМНАТА ДЕЛЬТЫ",
        15,
        23
    );


    ctx.fillStyle = "#aaa";

    ctx.fillText(
        "Z — взаимодействовать",
        205,
        158
    );

}


/* =====================================================
   STREET
===================================================== */

function drawStreet() {

    ctx.fillStyle = "#1d2228";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* небо */

    ctx.fillStyle = "#121820";

    ctx.fillRect(
        0,
        0,
        W,
        70
    );


    /* дома */

    ctx.fillStyle = "#30343b";

    ctx.fillRect(
        0,
        45,
        75,
        70
    );

    ctx.fillRect(
        245,
        40,
        75,
        75
    );


    /* окна */

    ctx.fillStyle = "#6d6b4d";

    for (let y=55; y<95; y+=20) {

        ctx.fillRect(
            15,
            y,
            12,
            8
        );

        ctx.fillRect(
            50,
            y,
            12,
            8
        );

        ctx.fillRect(
            260,
            y,
            12,
            8
        );

        ctx.fillRect(
            295,
            y,
            12,
            8
        );

    }


    /* дорога */

    ctx.fillStyle = "#121212";

    ctx.fillRect(
        0,
        115,
        W,
        65
    );


    /* тротуар */

    ctx.fillStyle = "#4b4b4b";

    ctx.fillRect(
        0,
        105,
        W,
        10
    );


    /* дорога */

    ctx.fillStyle = "#d0c37a";

    for (let x=15; x<320; x+=45) {

        ctx.fillRect(
            x,
            145,
            24,
            2
        );

    }


    /* библиотека */

    ctx.fillStyle = "#4b3529";

    ctx.fillRect(
        110,
        35,
        100,
        70
    );


    ctx.fillStyle = "#76543b";

    ctx.fillRect(
        118,
        43,
        84,
        40
    );


    ctx.fillStyle = "#fff";

    ctx.font = "8px monospace";

    ctx.textAlign = "center";

    ctx.fillText(
        "БИБЛИОТЕКА",
        160,
        63
    );

    ctx.textAlign = "left";


    /* дверь */

    ctx.fillStyle = "#241812";

    ctx.fillRect(
        148,
        75,
        24,
        30
    );


    drawPlayer(
        player.x,
        player.y
    );


    ctx.fillStyle = "#fff";

    ctx.font = "6px monospace";

    ctx.fillText(
        "УЛИЦА",
        12,
        18
    );

}


/* =====================================================
   LIBRARY
===================================================== */

function drawLibrary() {

    ctx.fillStyle = "#16110e";

    ctx.fillRect(0,0,W,H);


    /* стены */

    ctx.fillStyle = "#3c2a20";

    ctx.fillRect(
        0,
        0,
        W,
        12
    );


    /* пол */

    ctx.fillStyle = "#201813";

    ctx.fillRect(
        0,
        75,
        W,
        105
    );


    /* шкафы */

    for (let x=20; x<300; x+=55) {

        ctx.fillStyle = "#543827";

        ctx.fillRect(
            x,
            25,
            42,
            55
        );


        ctx.fillStyle = "#b27b4d";

        for (let y=31; y<72; y+=9) {

            ctx.fillRect(
                x+5,
                y,
                32,
                3
            );

        }

    }


    /* стол */

    ctx.fillStyle = "#5b3a25";

    ctx.fillRect(
        95,
        105,
        130,
        35
    );


    ctx.fillStyle = "#8b5a36";

    ctx.fillRect(
        90,
        100,
        140,
        10
    );


    drawPlayer(
        player.x,
        player.y
    );


    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";

    ctx.fillText(
        "БИБЛИОТЕКА",
        12,
        18
    );

}


/* =====================================================
   PLAYER
===================================================== */

function drawPlayer(x,y) {

    x = Math.round(x);
    y = Math.round(y);


    /* тень */

    ctx.fillStyle = "#000";

    ctx.fillRect(
        x-3,
        y+11,
        15,
        4
    );


    /* голова */

    ctx.fillStyle = "#e6c0a0";

    ctx.fillRect(
        x,
        y-5,
        8,
        8
    );


    /* волосы */

    ctx.fillStyle = "#222";

    ctx.fillRect(
        x,
        y-6,
        8,
        3
    );


    /* тело */

    ctx.fillStyle = "#eeeeee";

    ctx.fillRect(
        x-1,
        y+3,
        10,
        9
    );


    /* ноги */

    ctx.fillStyle = "#222";

    ctx.fillRect(
        x,
        y+12,
        3,
        4
    );

    ctx.fillRect(
        x+6,
        y+12,
        3,
        4
    );

}


/* =====================================================
   MOVEMENT
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


    /* границы */

    player.x = Math.max(
        15,
        Math.min(
            305,
            player.x
        )
    );


    player.y = Math.max(
        20,
        Math.min(
            160,
            player.y
        )
    );


    /* =========================
       ИЗ ДОМА НА УЛИЦУ
    ========================= */

    if (
        game.room === "bedroom" &&
        player.x > 265 &&
        player.y > 50 &&
        player.y < 130
    ) {

        game.room = "street";

        player.x = 30;

        player.y = 135;

        saveGame(game.saveSlot);

    }


    /* =========================
       ВХОД В БИБЛИОТЕКУ
    ========================= */

    if (
        game.room === "street" &&
        player.x > 135 &&
        player.x < 185 &&
        player.y < 110
    ) {

        game.room = "library";

        player.x = 160;

        player.y = 145;

        saveGame(game.saveSlot);

    }

}


/* =====================================================
   C MENU
===================================================== */

function updateMenuShortcut() {

    if (
        keys.c &&
        !pressed.c
    ) {

        if (game.screen === "world") {

            game.screen = "menu";

        }

        else if (game.screen === "menu") {

            game.screen = "world";

        }

    }

}


/* =====================================================
   MENU
===================================================== */

function drawMenu() {

    ctx.fillStyle = "#050505";

    ctx.fillRect(0,0,W,H);


    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        25,
        15,
        270,
        150
    );


    ctx.fillStyle = "#fff";

    ctx.font = "12px monospace";

    ctx.fillText(
        "МЕНЮ",
        45,
        38
    );


    ctx.font = "8px monospace";

    const items = [

        "ITEM",
        "STATUS",
        "EQUIPMENT",
        "SAVE",
        "RETURN"

    ];


    items.forEach(function(item,i) {

        const y = 60 + i*19;

        if (i === game.menuIndex) {

            ctx.fillText(
                "▶",
                55,
                y
            );

        }

        ctx.fillText(
            item,
            70,
            y
        );

    });


    ctx.font = "6px monospace";

    ctx.fillStyle = "#888";

    ctx.fillText(
        "Z — выбрать",
        45,
        150
    );

    ctx.fillText(
        "C — закрыть",
        210,
        150
    );

}


/* =====================================================
   MENU UPDATE
===================================================== */

function updateMenu() {

    if (keys.up && !pressed.up) {

        game.menuIndex--;

        if (game.menuIndex < 0)
            game.menuIndex = 4;

    }


    if (keys.down && !pressed.down) {

        game.menuIndex++;

        if (game.menuIndex > 4)
            game.menuIndex = 0;

    }


    if (keys.z && !pressed.z) {

        if (game.menuIndex === 3) {

            saveGame(game.saveSlot);

        }

        if (game.menuIndex === 4) {

            game.screen = "world";

        }

    }


    if (keys.x && !pressed.x) {

        game.screen = "world";

    }

}


/* =====================================================
   DRAW WORLD
===================================================== */

function drawWorld() {

    if (game.room === "bedroom") {

        drawBedroom();

    }

    else if (game.room === "street") {

        drawStreet();

    }

    else if (game.room === "library") {

        drawLibrary();

    }

}


/* =====================================================
   UPDATE
===================================================== */

function update() {

    if (game.screen === "title") {

        updateTitle();

    }

    else if (game.screen === "save") {

        updateSaveScreen();

    }

    else if (game.screen === "intro") {

        updateIntro();

    }

    else if (game.screen === "world") {

        updateWorld();

    }

    else if (game.screen === "menu") {

        updateMenu();

    }


    updateMenuShortcut();


    /* edge detection */

    pressed.z = keys.z;
    pressed.x = keys.x;
    pressed.c = keys.c;

    pressed.up = keys.up;
    pressed.down = keys.down;

}


/* =====================================================
   DRAW
===================================================== */

function draw() {

    /* ВАЖНО:
       всегда сначала очищаем canvas.
       Поэтому чёрного экрана из-за
       отсутствующего draw не будет.
    */

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    if (game.screen === "title") {

        drawTitle();

    }

    else if (game.screen === "save") {

        drawSaveScreen();

    }

    else if (game.screen === "intro") {

        drawBedroom();

        ctx.fillStyle = "rgba(0,0,0,.75)";

        ctx.fillRect(
            0,
            0,
            W,
            H
        );


        ctx.fillStyle = "#fff";

        ctx.font = "8px monospace";

        ctx.textAlign = "center";

        ctx.fillText(
            "ДЕЛЬТА",
            W/2,
            75
        );

        ctx.font = "7px monospace";

        ctx.fillText(
            "просыпается...",
            W/2,
            90
        );

        ctx.font = "6px monospace";

        ctx.fillStyle = "#aaa";

        ctx.fillText(
            "Z — продолжить",
            W/2,
            125
        );

        ctx.textAlign = "left";

    }

    else if (game.screen === "world") {

        drawWorld();

    }

    else if (game.screen === "menu") {

        drawWorld();

        ctx.fillStyle = "rgba(0,0,0,.75)";

        ctx.fillRect(
            0,
            0,
            W,
            H
        );

        drawMenu();

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

draw();

loop();
