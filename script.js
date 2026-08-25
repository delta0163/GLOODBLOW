"use strict";

/* =====================================================
   CANVAS
===================================================== */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = 640;
const H = 360;


/* =====================================================
   IMAGES
===================================================== */

const images = {};

function loadImage(name, src) {

    const img = new Image();

    img.src = src;

    images[name] = img;
}

loadImage("wasteland", "images/wasteland.png");

loadImage("delta", "images/delta.png");
loadImage("deltaLeft", "images/deltalef.png");
loadImage("deltaRight", "images/deltaright.png");
loadImage("deltaBack", "images/deltabach.png");

loadImage("error", "images/error.png");


/* =====================================================
   MUSIC
===================================================== */

const music = new Audio("sounds/wonderland.mp3");

music.loop = true;
music.volume = 0.35;

let musicStarted = false;

function startMusic() {

    if (musicStarted)
        return;

    musicStarted = true;

    music.play().catch(() => {
        musicStarted = false;
    });
}

window.addEventListener("pointerdown", startMusic);


/* =====================================================
   FULLSCREEN
===================================================== */

document
    .getElementById("fullscreen")
    .addEventListener("pointerdown", function(e) {

        e.preventDefault();

        if (!document.fullscreenElement) {

            document.documentElement
                .requestFullscreen()
                .catch(() => {});

        } else {

            document.exitFullscreen()
                .catch(() => {});

        }

    });


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


function pressed(key) {

    return keys[key] && !oldKeys[key];

}


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

    startMusic();

    e.preventDefault();

}, { passive:false });


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

}, { passive:false });


/* =====================================================
   MOBILE INPUT
===================================================== */

document.querySelectorAll(".joy").forEach(button => {

    const key = button.dataset.key;

    button.addEventListener("pointerdown", function(e) {

        e.preventDefault();

        keys[key] = true;

        startMusic();

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


document.querySelectorAll(".action").forEach(button => {

    const key = button.dataset.key;

    button.addEventListener("pointerdown", function(e) {

        e.preventDefault();

        keys[key] = true;

        startMusic();

        button.setPointerCapture(e.pointerId);

    });

    button.addEventListener("pointerup", function() {

        keys[key] = false;

    });

    button.addEventListener("pointercancel", function() {

        keys[key] = false;

    });

});


/* =====================================================
   GAME STATE
===================================================== */

const game = {

    screen: "world",

    room: 1,

    dialogue: null,

    dialogueIndex: 0,

    transition: 0,

    transitionTarget: 0,

    encounterSteps: 0,

    encounterCooldown: 0,

    shopIndex: 0,

    shopMessage: "",

    menuIndex: 0,

    chase: null,

    puzzle: null,

    battle: null

};


/* =====================================================
   PARTY
===================================================== */

const party = [

    {
        name: "ДЕЛЬТА",
        hp: 90,
        maxHP: 90,
        mp: 40,
        maxMP: 40,
        atk: 14,
        def: 8,
        color: "#fff"
    },

    {
        name: "ЛИЧИ",
        hp: 80,
        maxHP: 80,
        mp: 55,
        maxMP: 55,
        atk: 13,
        def: 6,
        color: "#66aaff"
    },

    {
        name: "ПАНКЕЙК",
        hp: 70,
        maxHP: 70,
        mp: 45,
        maxMP: 45,
        atk: 10,
        def: 11,
        color: "#66dd77"
    },

    {
        name: "КАШТАН",
        hp: 110,
        maxHP: 110,
        mp: 35,
        maxMP: 35,
        atk: 12,
        def: 12,
        color: "#cc8844"
    },

    {
        name: "ШАРЛОТА",
        hp: 100,
        maxHP: 100,
        mp: 60,
        maxMP: 60,
        atk: 13,
        def: 9,
        color: "#ff77cc"
    }

];


/* =====================================================
   PLAYER
===================================================== */

const player = {

    x: 110,
    y: 265,

    speed: 2.2,

    direction: "down"

};


/* =====================================================
   FOLLOWERS
===================================================== */

const followers = [

    {
        x: 85,
        y: 265,
        color: "#66aaff"
    },

    {
        x: 65,
        y: 265,
        color: "#66dd77"
    },

    {
        x: 45,
        y: 265,
        color: "#cc8844"
    },

    {
        x: 25,
        y: 265,
        color: "#ff77cc"
    }

];


/* =====================================================
   WORLD
===================================================== */

const world = {

    room1: {

        name: "ЦИФРОВАЯ ПУСТОШЬ",

        background: "wasteland",

        startX: 110,

        startY: 265,

        transitionX: 570,

        transitionY: 130,

        transitionW: 60,

        transitionH: 110,

        teamX: 260,

        teamY: 175

    },

    room2: {

        name: "ПУСТОШЬ — ТОРГОВЫЙ ПОСТ",

        background: "wasteland",

        startX: 80,

        startY: 250,

        transitionX: 0,

        transitionY: 130,

        transitionW: 40,

        transitionH: 110,

        shopX: 430,

        shopY: 120

    }

};


/* =====================================================
   DIALOGUE
===================================================== */

const introDialogue = [

    {
        name: "ЛИЧИ",
        text: "Надо проверить Немку... Она изменилась."
    },

    {
        name: "ЛИЧИ",
        text: "Последний раз, когда мы пытались поговорить с ней, она была очень странной."
    },

    {
        name: "ДЕЛЬТА",
        text: "Так мы идём?"
    },

    {
        name: "ЛИЧИ",
        text: "Да."
    },

    {
        name: "ПАНКЕЙК",
        text: "Тогда не будем терять время."
    },

    {
        name: "КАШТАН",
        text: "Надеюсь, с Немкой всё ещё можно поговорить."
    },

    {
        name: "ШАРЛОТА",
        text: "Если она действительно изменилась... нам нужно быть осторожнее."
    },

    {
        name: "ЛИЧИ",
        text: "Идём через пустошь."
    }

];


let introStarted = false;

function startIntro() {

    if (introStarted)
        return;

    introStarted = true;

    game.dialogue = introDialogue;

    game.dialogueIndex = 0;

    game.screen = "dialogue";

}


/* =====================================================
   WORLD UPDATE
===================================================== */

function updateWorld() {

    if (game.transition > 0)
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


    if (dx !== 0 && dy !== 0) {

        dx *= .707;
        dy *= .707;

    }


    player.x += dx;
    player.y += dy;


    player.x =
        Math.max(
            25,
            Math.min(
                W - 25,
                player.x
            )
        );


    player.y =
        Math.max(
            75,
            Math.min(
                H - 35,
                player.y
            )
        );


    if (dx !== 0 || dy !== 0)
        game.encounterSteps++;


    if (game.encounterCooldown > 0)
        game.encounterCooldown--;


    if (
        game.encounterSteps > 180 &&
        game.encounterCooldown <= 0
    ) {

        if (Math.random() < .0025) {

            startBattle();

            game.encounterSteps = 0;

            game.encounterCooldown = 420;

            return;

        }

    }


    const room =
        game.room === 1
            ? world.room1
            : world.room2;


    if (
        player.x > room.transitionX &&
        player.x <
        room.transitionX + room.transitionW &&
        player.y > room.transitionY &&
        player.y <
        room.transitionY + room.transitionH
    ) {

        if (game.room === 1)
            beginTransition(2);

        else
            beginTransition(1);

    }


    /* =================================================
       SHOP
    ================================================= */

    if (
        game.room === 2 &&
        distance(
            player.x,
            player.y,
            world.room2.shopX,
            world.room2.shopY
        ) < 45
    ) {

        if (pressed("z")) {

            game.screen = "shop";

            game.shopIndex = 0;

            game.shopMessage = "";

        }

    }


    if (pressed("c")) {

        game.screen = "menu";

        game.menuIndex = 0;

    }

}


/* =====================================================
   FOLLOWERS
===================================================== */

function updateFollowers() {

    if (game.screen !== "world")
        return;


    const targets = [

        {
            x: player.x - 18,
            y: player.y
        },

        {
            x: player.x - 36,
            y: player.y
        },

        {
            x: player.x - 54,
            y: player.y
        },

        {
            x: player.x - 72,
            y: player.y
        }

    ];


    followers.forEach((f, i) => {

        const target = targets[i];

        f.x +=
            (target.x - f.x) * .08;

        f.y +=
            (target.y - f.y) * .08;

    });

}


/* =====================================================
   TRANSITION
===================================================== */

function beginTransition(target) {

    game.transitionTarget = target;

    game.transition = 60;

}


function updateTransition() {

    if (game.transition <= 0)
        return;


    game.transition--;


    if (game.transition === 30) {

        game.room =
            game.transitionTarget;


        const room =
            game.room === 1
                ? world.room1
                : world.room2;


        player.x = room.startX;
        player.y = room.startY;


        followers.forEach((f, i) => {

            f.x =
                player.x -
                20 -
                i * 20;

            f.y = player.y;

        });

    }

}


/* =====================================================
   DISTANCE
===================================================== */

function distance(x1,y1,x2,y2) {

    const dx = x1-x2;
    const dy = y1-y2;

    return Math.sqrt(
        dx*dx + dy*dy
    );

}


/* =====================================================
   DIALOGUE UPDATE
===================================================== */

function updateDialogue() {

    if (pressed("z")) {

        game.dialogueIndex++;


        if (
            game.dialogueIndex >=
            game.dialogue.length
        ) {

            game.dialogue = null;

            game.screen = "world";

            player.x = 120;

            player.y = 260;

        }

    }


    if (pressed("x")) {

        game.dialogue = null;

        game.screen = "world";

    }

}


/* =====================================================
   CHASE
===================================================== */

function startChase() {

    game.chase = {

        time: 30,

        timerFrames: 1800,

        distance: 100,

        speed: 1,

        qteTimer: 0,

        qteActive: false,

        qteWindow: 0,

        qteHits: 0,

        qteMisses: 0,

        message: "БЕГИ!",

        flash: 0

    };


    game.screen = "chase";

}


function updateChase() {

    const c = game.chase;

    if (!c)
        return;


    c.timerFrames--;

    c.time =
        Math.ceil(
            c.timerFrames / 60
        );


    /*
       С каждым промахом зверь
       приближается.
    */

    c.distance +=
        c.speed * .03;


    /*
       QTE каждые несколько секунд.
    */

    if (!c.qteActive) {

        c.qteTimer--;

        if (c.qteTimer <= 0) {

            c.qteActive = true;

            c.qteWindow = 75;

        }

    }


    if (c.qteActive) {

        c.qteWindow--;


        if (pressed("z")) {

            c.qteActive = false;

            c.qteHits++;

            c.distance =
                Math.max(
                    40,
                    c.distance - 9
                );

            c.qteTimer =
                150 +
                Math.floor(
                    Math.random()*100
                );

            c.message =
                "УСПЕЛ! БЕГИ ДАЛЬШЕ!";

            c.flash = 8;

        }


        else if (c.qteWindow <= 0) {

            c.qteActive = false;

            c.qteMisses++;

            c.distance += 16;

            c.qteTimer = 100;

            c.message =
                "ПРОМАХ! ТЫ ЗАМЕДЛИЛСЯ!";

            c.flash = 18;

        }

    }


    /*
       Если зверь слишком близко —
       плохой конец погони.
    */

    if (c.distance >= 190) {

        startBattleWithBeast();

        return;

    }


    /*
       30 секунд прошло.
    */

    if (c.timerFrames <= 0) {

        startChasePuzzle();

        return;

    }


    if (c.flash > 0)
        c.flash--;

}


/* =====================================================
   CHASE DRAW
===================================================== */

function drawChase() {

    drawBackground();


    /*
       Затемнение
    */

    ctx.fillStyle =
        "rgba(10,0,0,.35)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /*
       Земля
    */

    ctx.fillStyle="#30231d";

    ctx.fillRect(
        0,
        270,
        W,
        90
    );


    /*
       Скорость / полосы
    */

    ctx.strokeStyle =
        "rgba(255,255,255,.25)";

    for (let i=0;i<12;i++) {

        const y =
            275 +
            i*7;

        ctx.beginPath();

        ctx.moveTo(
            Math.random()*300,
            y
        );

        ctx.lineTo(
            250 +
            Math.random()*350,
            y
        );

        ctx.stroke();

    }


    /*
       Дельта
    */

    drawDelta(
        200,
        265
    );


    /*
       Команда
    */

    followers.forEach((f,i) => {

        drawFollower(
            170-i*25,
            270,
            f.color
        );

    });


    /*
       ГЛЮКНУВШИЙ ЗВЕРЬ
    */

    drawGlitchedBeast(
        560,
        220,
        game.chase.distance
    );


    /*
       Верхний интерфейс
    */

    ctx.fillStyle="#fff";

    ctx.font="18px monospace";

    ctx.fillText(
        "П О Г О Н Я",
        245,
        35
    );


    ctx.font="10px monospace";

    ctx.fillText(
        "ВРЕМЯ: " +
        game.chase.time,
        25,
        30
    );


    /*
       Индикатор расстояния
    */

    ctx.fillStyle="#222";

    ctx.fillRect(
        25,
        45,
        180,
        12
    );


    ctx.fillStyle="#fff";

    const distancePercent =
        Math.max(
            0,
            Math.min(
                1,
                1 -
                game.chase.distance/190
            )
        );


    ctx.fillRect(
        25,
        45,
        180 * distancePercent,
        12
    );


    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        25,
        45,
        180,
        12
    );


    ctx.font="8px monospace";

    ctx.fillText(
        "ДИСТАНЦИЯ ДО ЗВЕРЯ",
        25,
        70
    );


    /*
       QTE
    */

    if (game.chase.qteActive) {

        ctx.fillStyle=
            "rgba(0,0,0,.82)";

        ctx.fillRect(
            210,
            105,
            220,
            100
        );


        ctx.strokeStyle="#fff";

        ctx.lineWidth=3;

        ctx.strokeRect(
            210,
            105,
            220,
            100
        );


        ctx.fillStyle="#fff";

        ctx.font="13px monospace";

        ctx.fillText(
            "НАЖМИ!",
            275,
            130
        );


        ctx.strokeStyle="#ff5555";

        ctx.strokeRect(
            285,
            145,
            70,
            45
        );


        ctx.fillStyle="#fff";

        ctx.font="24px monospace";

        ctx.fillText(
            "Z",
            313,
            177
        );


        ctx.font="8px monospace";

        ctx.fillText(
            "НЕ УСПЕЕШЬ — ЗВЕРЬ ПРИБЛИЗИТСЯ",
            232,
            220
        );

    }


    /*
       Сообщение
    */

    ctx.fillStyle="#fff";

    ctx.font="11px monospace";

    ctx.fillText(
        game.chase.message,
        230,
        300
    );


    ctx.font="8px monospace";

    ctx.fillText(
        "Z — вовремя нажать",
        255,
        320
    );


    if (game.chase.flash > 0) {

        ctx.fillStyle =
            "rgba(255,255,255,.15)";

        ctx.fillRect(
            0,
            0,
            W,
            H
        );

    }

}


/* =====================================================
   GLITCH BEAST
===================================================== */

function drawGlitchedBeast(x,y,distanceValue) {

    const size =
        45 +
        Math.min(
            40,
            distanceValue / 4
        );


    ctx.save();

    ctx.translate(x,y);


    /*
       Глитч-сдвиги
    */

    for (let i=0;i<6;i++) {

        ctx.fillStyle =
            i % 2 === 0
                ? "#ff2222"
                : "#7722ff";

        ctx.globalAlpha=.45;

        ctx.fillRect(
            -size/2 +
            Math.random()*12,
            -size/2 +
            Math.random()*12,
            size,
            size
        );

    }


    ctx.globalAlpha=1;

    ctx.fillStyle="#090909";

    ctx.fillRect(
        -size/2,
        -size/2,
        size,
        size
    );


    /*
       глаза
    */

    ctx.fillStyle="#ff3333";

    ctx.fillRect(
        -size*.28,
        -size*.18,
        size*.18,
        size*.12
    );

    ctx.fillRect(
        size*.10,
        -size*.18,
        size*.18,
        size*.12
    );


    /*
       пасть
    */

    ctx.strokeStyle="#fff";

    ctx.lineWidth=3;

    ctx.beginPath();

    ctx.moveTo(
        -size*.25,
        size*.15
    );

    ctx.lineTo(
        0,
        size*.30
    );

    ctx.lineTo(
        size*.25,
        size*.15
    );

    ctx.stroke();


    ctx.restore();

}


/* =====================================================
   CHASE PUZZLE
===================================================== */

function startChasePuzzle() {

    const sequence = [];

    const buttons = [
        "z",
        "x",
        "c"
    ];


    for (let i=0;i<5;i++) {

        sequence.push(
            buttons[
                Math.floor(
                    Math.random()*buttons.length
                )
            ]
        );

    }


    game.puzzle = {

        sequence: sequence,

        index: 0,

        timer: 600,

        message:
            "ВЗЛОМАННАЯ ДВЕРЬ! НУЖНО ОТКРЫТЬ ЕЁ.",

        failed: 0,

        flash: 0

    };


    game.screen = "puzzle";

}


function updatePuzzle() {

    const p = game.puzzle;

    if (!p)
        return;


    p.timer--;


    if (p.timer <= 0) {

        p.timer = 600;

        p.index = 0;

        p.failed++;

        p.message =
            "СЛИШКОМ МЕДЛЕННО! ПОСЛЕДОВАТЕЛЬНОСТЬ СБРОШЕНА.";

    }


    const keysToCheck = [
        "z",
        "x",
        "c"
    ];


    for (const key of keysToCheck) {

        if (pressed(key)) {

            if (
                key ===
                p.sequence[p.index]
            ) {

                p.index++;

                p.message =
                    "ПРАВИЛЬНО!";


                if (
                    p.index >=
                    p.sequence.length
                ) {

                    p.message =
                        "ДВЕРЬ ОТКРЫТА!";

                    p.flash = 30;

                    finishChase();

                }

            }

            else {

                p.index = 0;

                p.failed++;

                p.message =
                    "НЕПРАВИЛЬНО! НАЧНИ СНАЧАЛА.";

                p.flash = 15;

            }

        }

    }


    if (p.flash > 0)
        p.flash--;

}


function finishChase() {

    game.puzzle = null;

    game.chase = null;

    game.screen = "world";

    player.x = 260;

    player.y = 260;

    followers.forEach((f,i) => {

        f.x =
            player.x -
            20 -
            i*20;

        f.y =
            player.y;

    });

}


/* =====================================================
   PUZZLE DRAW
===================================================== */

function drawPuzzle() {

    ctx.fillStyle="#020202";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /*
       глитч-фон
    */

    for (let i=0;i<35;i++) {

        ctx.fillStyle =
            i%2
                ? "#321044"
                : "#18203a";

        ctx.globalAlpha=.35;

        ctx.fillRect(
            Math.random()*W,
            Math.random()*H,
            Math.random()*80,
            2
        );

    }

    ctx.globalAlpha=1;


    ctx.strokeStyle="#fff";

    ctx.lineWidth=3;

    ctx.strokeRect(
        80,
        35,
        480,
        290
    );


    ctx.fillStyle="#fff";

    ctx.font="18px monospace";

    ctx.fillText(
        "СИСТЕМА ВЗЛОМА",
        200,
        70
    );


    ctx.font="10px monospace";

    ctx.fillText(
        game.puzzle.message,
        115,
        100
    );


    /*
       Таймер
    */

    ctx.fillStyle="#222";

    ctx.fillRect(
        150,
        115,
        340,
        10
    );


    ctx.fillStyle="#fff";

    ctx.fillRect(
        150,
        115,
        340 *
        (game.puzzle.timer/600),
        10
    );


    /*
       Последовательность
    */

    game.puzzle.sequence.forEach((key,i) => {

        const x =
            160 + i*65;

        const y = 155;


        ctx.strokeStyle=
            i < game.puzzle.index
                ? "#66ff88"
                : "#777";


        ctx.strokeRect(
            x,
            y,
            45,
            45
        );


        ctx.fillStyle=
            i < game.puzzle.index
                ? "#66ff88"
                : "#fff";


        ctx.font="20px monospace";

        ctx.fillText(
            key.toUpperCase(),
            x+15,
            y+30
        );

    });


    /*
       Кнопки
    */

    const buttons = [
        "Z",
        "X",
        "C"
    ];


    buttons.forEach((key,i) => {

        const x =
            190 + i*100;


        ctx.strokeStyle="#fff";

        ctx.lineWidth=2;

        ctx.strokeRect(
            x,
            225,
            70,
            50
        );


        ctx.fillStyle="#fff";

        ctx.font="22px monospace";

        ctx.fillText(
            key,
            x+25,
            258
        );

    });


    ctx.font="8px monospace";

    ctx.fillText(
        "НАЖИМАЙ КНОПКИ В УКАЗАННОМ ПОРЯДКЕ",
        195,
        300
    );


    ctx.fillText(
        "ОШИБКИ: " +
        game.puzzle.failed,
        480,
        300
    );

}


/* =====================================================
   BATTLE START
===================================================== */

function createEnemies(count) {

    const enemies = [];


    for (let i=0;i<count;i++) {

        const max =
            55 +
            Math.floor(
                Math.random()*20
            );


        enemies.push({

            hp: max,

            maxHP: max,

            x: 220 + i*100,

            y: 85,

            alive: true

        });

    }


    return enemies;

}


function startBattle() {

    game.battle = {

        enemies:
            createEnemies(
                Math.random()<.65
                    ? 1
                    : 2 + Math.floor(Math.random()*2)
            ),

        actor: 0,

        phase: "menu",

        menu: 0,

        act: 0,

        magic: 0,

        message:
            "ОШИБКА ПРЕРВАЛА ПУТЬ.",

        soul: {

            x: 320,

            y: 255,

            speed: 3.2,

            invincible: 0

        },

        bullets: [],

        attackTimer: 0,

        laserWarning: [],

        explosions: [],

        defense: false

    };


    game.screen = "battle";

}


/* =====================================================
   SPECIAL BEAST BATTLE
===================================================== */

function startBattleWithBeast() {

    game.battle = {

        enemies: [

            {

                hp: 170,

                maxHP: 170,

                x: 320,

                y: 85,

                alive: true,

                beast: true

            }

        ],

        actor: 0,

        phase: "menu",

        menu: 0,

        act: 0,

        magic: 0,

        message:
            "ГЛЮКНУВШИЙ ЗВЕРЬ НАСТИГ ВАС!",

        soul: {

            x: 320,

            y: 255,

            speed: 3.2,

            invincible: 0

        },

        attackTimer: 0,

        laserWarning: [],

        explosions: [],

        defense: false

    };


    game.chase = null;

    game.screen = "battle";

}


/* =====================================================
   BATTLE UPDATE
===================================================== */

function updateBattle() {

    const b = game.battle;

    if (!b)
        return;


    if (b.phase === "menu") {

        if (pressed("left")) {

            b.menu--;

            if (b.menu < 0)
                b.menu = 4;

        }


        if (pressed("right")) {

            b.menu++;

            if (b.menu > 4)
                b.menu = 0;

        }


        if (pressed("z"))
            battleChoose();

    }


    else if (b.phase === "act") {

        if (pressed("up")) {

            b.act--;

            if (b.act < 0)
                b.act = 2;

        }


        if (pressed("down")) {

            b.act++;

            if (b.act > 2)
                b.act = 0;

        }


        if (pressed("x"))
            b.phase = "menu";


        if (pressed("z")) {

            const texts = [

                "Вы нашли слабое место.",

                "Существо реагирует на голос.",

                "Ошибка становится нестабильной."

            ];


            b.message =
                texts[b.act];


            if (b.act === 2) {

                const enemy =
                    b.enemies.find(
                        e => e.alive
                    );


                if (enemy) {

                    enemy.hp =
                        Math.max(
                            0,
                            enemy.hp - 15
                        );

                    if (enemy.hp === 0)
                        enemy.alive = false;

                }

            }


            if (
                b.enemies.every(
                    e => !e.alive
                )
            ) {

                b.phase="victory";

                return;

            }


            nextBattleActor();

        }

    }


    else if (b.phase === "magic") {

        if (pressed("up")) {

            b.magic--;

            if (b.magic < 0)
                b.magic = 3;

        }


        if (pressed("down")) {

            b.magic++;

            if (b.magic > 3)
                b.magic = 0;

        }


        if (pressed("x")) {

            b.phase="menu";

        }


        if (pressed("z")) {

            useMagic();

        }

    }


    else if (b.phase === "enemy") {

        updateEnemyAttack();

    }


    else if (b.phase === "victory") {

        if (pressed("z")) {

            game.screen="world";

            game.battle=null;

        }

    }


    else if (b.phase === "defeat") {

        if (pressed("z")) {

            party.forEach(p => {

                p.hp=p.maxHP;
                p.mp=p.maxMP;

            });

            game.screen="world";

            game.battle=null;

        }

    }

}


/* =====================================================
   BATTLE CHOICE
===================================================== */

function battleChoose() {

    const b = game.battle;

    const actor = party[b.actor];


    /*
       FIGHT
    */

    if (b.menu === 0) {

        const enemy =
            b.enemies.find(
                e => e.alive
            );


        if (!enemy)
            return;


        const damage =
            actor.atk +
            Math.floor(
                Math.random()*7
            );


        enemy.hp -= damage;


        if (enemy.hp <= 0) {

            enemy.hp=0;

            enemy.alive=false;

            b.message =
                actor.name +
                " наносит смертельный удар!";

        }

        else {

            b.message =
                actor.name +
                " атакует! -" +
                damage +
                " HP";

        }


        if (
            b.enemies.every(
                e => !e.alive
            )
        ) {

            b.phase="victory";

            return;

        }


        nextBattleActor();

    }


    /*
       ACT
    */

    else if (b.menu === 1) {

        b.phase="act";

        b.act=0;

    }


    /*
       MAGIC
    */

    else if (b.menu === 2) {

        b.phase="magic";

        b.magic=0;

    }


    /*
       DEFEND
    */

    else if (b.menu === 3) {

        b.defense=true;

        b.message =
            actor.name +
            " принимает защитную стойку.";

        nextBattleActor();

    }


    /*
       MERCY
    */

    else if (b.menu === 4) {

        const enemy =
            b.enemies.find(
                e => e.alive
            );


        if (
            enemy &&
            enemy.hp <= enemy.maxHP*.2
        ) {

            b.message =
                "Зверь отступил.";

            b.phase="victory";

        }

        else {

            b.message =
                "Существо ещё не готово уйти.";

            nextBattleActor();

        }

    }

}


/* =====================================================
   MAGIC
===================================================== */

const magicList = [

    {
        name:"ЛЕЧЕНИЕ",
        cost:10,
        description:"Восстанавливает HP союзнику."
    },

    {
        name:"ОГОНЬ",
        cost:12,
        description:"Наносит большой магический урон."
    },

    {
        name:"ЭЛЕКТРОИМПУЛЬС",
        cost:15,
        description:"Повреждает всех врагов."
    },

    {
        name:"БАРЬЕР",
        cost:8,
        description:"Усиливает защиту на ход."
    }

];


function useMagic() {

    const b = game.battle;

    const actor = party[b.actor];

    const spell =
        magicList[b.magic];


    if (actor.mp < spell.cost) {

        b.message =
            "Недостаточно MP!";

        return;

    }


    actor.mp -= spell.cost;


    /*
       ЛЕЧЕНИЕ
    */

    if (b.magic === 0) {

        const target =
            party.find(
                p => p.hp < p.maxHP
            );


        if (target) {

            target.hp =
                Math.min(
                    target.maxHP,
                    target.hp + 30
                );

            b.message =
                actor.name +
                " использует ЛЕЧЕНИЕ!";

        }

        else {

            b.message =
                "Все HP уже заполнено.";

        }

    }


    /*
       ОГОНЬ
    */

    else if (b.magic === 1) {

        const enemy =
            b.enemies.find(
                e => e.alive
            );


        if (enemy) {

            const damage =
                25 +
                Math.floor(
                    Math.random()*10
                );


            enemy.hp -= damage;


            if (enemy.hp <= 0) {

                enemy.hp=0;

                enemy.alive=false;

            }


            b.message =
                actor.name +
                " использует ОГОНЬ! -" +
                damage;

        }

    }


    /*
       ЭЛЕКТРОИМПУЛЬС
    */

    else if (b.magic === 2) {

        let total=0;


        b.enemies.forEach(enemy => {

            if (!enemy.alive)
                return;


            const damage=16;

            enemy.hp -= damage;

            total += damage;


            if (enemy.hp <= 0) {

                enemy.hp=0;

                enemy.alive=false;

            }

        });


        b.message =
            "ЭЛЕКТРОИМПУЛЬС! -" +
            total +
            " суммарного урона.";

    }


    /*
       БАРЬЕР
    */

    else if (b.magic === 3) {

        b.defense=true;

        b.message =
            actor.name +
            " создаёт защитный барьер.";

    }


    if (
        b.enemies.every(
            e => !e.alive
        )
    ) {

        b.phase="victory";

        return;

    }


    nextBattleActor();

}


/* =====================================================
   NEXT ACTOR
===================================================== */

function nextBattleActor() {

    const b = game.battle;


    b.actor++;


    if (
        b.actor >= party.length
    ) {

        b.actor=0;

        b.phase="enemy";

        beginEnemyAttack();

    }

    else {

        b.phase="menu";

        b.menu=0;

        b.message =
            "ХОД: " +
            party[b.actor].name;

    }

}


/* =====================================================
   ENEMY ATTACK
===================================================== */

function beginEnemyAttack() {

    const b = game.battle;


    b.attackTimer=420;

    b.bullets=[];

    b.laserWarning=[];

    b.explosions=[];


    const alive =
        b.enemies.filter(
            e => e.alive
        ).length;


    if (alive === 1) {

        for (let i=0;i<5;i++) {

            b.laserWarning.push({

                x:
                    190 +
                    Math.random()*260,

                timer:
                    40 +
                    Math.random()*100,

                fired:false

            });

        }

    }

    else {

        for (let i=0;i<10;i++) {

            b.explosions.push({

                x:
                    190 +
                    Math.random()*260,

                y:
                    195 +
                    Math.random()*105,

                timer:
                    50 +
                    Math.random()*180,

                active:false,

                radius:0

            });

        }

    }

}


/* =====================================================
   SOUL
===================================================== */

function updateSoul() {

    const b = game.battle;

    const soul=b.soul;


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
            190,
            Math.min(
                450,
                soul.x
            )
        );


    soul.y =
        Math.max(
            190,
            Math.min(
                315,
                soul.y
            )
        );


    if (soul.invincible > 0)
        soul.invincible--;

}


/* =====================================================
   ENEMY ATTACK UPDATE
===================================================== */

function updateEnemyAttack() {

    const b=game.battle;


    updateSoul();


    if (b.attackTimer > 0)
        b.attackTimer--;


    b.laserWarning.forEach(laser => {

        laser.timer--;


        if (laser.timer <= 0)
            laser.fired=true;


        if (
            laser.fired &&
            laser.timer > -28
        ) {

            if (
                Math.abs(
                    b.soul.x-laser.x
                ) < 8
            ) {

                damageSoul();

            }

        }

    });


    b.explosions.forEach(explosion => {

        explosion.timer--;


        if (explosion.timer <= 0) {

            explosion.active=true;

            explosion.radius+=2;


            if (explosion.radius > 30) {

                explosion.timer=65;

                explosion.radius=0;

                explosion.active=false;

            }

        }


        if (explosion.active) {

            const d =
                distance(
                    b.soul.x,
                    b.soul.y,
                    explosion.x,
                    explosion.y
                );


            if (
                d <
                explosion.radius+6
            ) {

                damageSoul();

            }

        }

    });


    if (b.attackTimer <= 0) {

        b.phase="menu";

        b.defense=false;

        b.message =
            "ВРАГ ЗАКОНЧИЛ АТАКУ.";

    }

}


/* =====================================================
   DAMAGE
===================================================== */

function damageSoul() {

    const b=game.battle;


    if (b.soul.invincible > 0)
        return;


    const actor =
        party[b.actor];


    /*
       DEFEND:
       обычный урон 8
       защита 4
       магический барьер 2
    */

    let damage=8;


    if (b.defense)
        damage=4;


    if (
        b.magicBarrier
    )
        damage=2;


    actor.hp =
        Math.max(
            0,
            actor.hp-damage
        );


    b.message =
        actor.name +
        " получает -" +
        damage +
        " HP";


    b.soul.invincible=45;


    if (
        party.every(
            p => p.hp<=0
        )
    ) {

        b.phase="defeat";

    }

}


/* =====================================================
   BACKGROUND
===================================================== */

function drawBackground() {

    const img=images.wasteland;


    if (
        img &&
        img.complete &&
        img.naturalWidth>0
    ) {

        const scale=.72;

        const iw=
            img.naturalWidth*scale;

        const ih=
            img.naturalHeight*scale;

        ctx.drawImage(
            img,
            (W-iw)/2,
            (H-ih)/2,
            iw,
            ih
        );

    }

    else {

        ctx.fillStyle="#15151c";

        ctx.fillRect(
            0,
            0,
            W,
            H
        );

    }

}


/* =====================================================
   DELTA
===================================================== */

function drawDelta(x,y) {

    let img=images.delta;


    if (
        player.direction==="left" &&
        images.deltaLeft.complete
    )
        img=images.deltaLeft;


    if (
        player.direction==="right" &&
        images.deltaRight.complete
    )
        img=images.deltaRight;


    if (
        player.direction==="up" &&
        images.deltaBack.complete
    )
        img=images.deltaBack;


    if (
        img &&
        img.complete &&
        img.naturalWidth>0
    ) {

        ctx.drawImage(
            img,
            x-20,
            y-32,
            40,
            40
        );

    }

    else {

        ctx.fillStyle="#fff";

        ctx.fillRect(
            x-7,
            y-18,
            14,
            22
        );

    }

}


/* =====================================================
   FOLLOWER DRAW
===================================================== */

function drawFollower(x,y,color) {

    ctx.fillStyle="#000";

    ctx.fillRect(
        x-7,
        y-20,
        15,
        24
    );


    ctx.fillStyle=color;

    ctx.fillRect(
        x-5,
        y-18,
        10,
        17
    );

}


/* =====================================================
   WORLD DRAW
===================================================== */

function drawWorld() {

    drawBackground();


    ctx.fillStyle="rgba(40,35,30,.75)";

    ctx.beginPath();

    ctx.moveTo(0,285);
    ctx.lineTo(640,250);
    ctx.lineTo(640,340);
    ctx.lineTo(0,340);

    ctx.closePath();

    ctx.fill();


    const room =
        game.room===1
            ? world.room1
            : world.room2;


    ctx.fillStyle="#111";

    ctx.fillRect(
        room.transitionX,
        room.transitionY,
        room.transitionW,
        room.transitionH
    );


    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        room.transitionX,
        room.transitionY,
        room.transitionW,
        room.transitionH
    );


    ctx.fillStyle="#fff";

    ctx.font="10px monospace";


    if (game.room===1) {

        ctx.fillText(
            "ДАЛЬШЕ",
            535,
            125
        );

    }


    /*
       SHOP
    */

    if (game.room===2) {

        ctx.fillStyle="#241b16";

        ctx.fillRect(
            390,
            75,
            100,
            100
        );


        ctx.strokeStyle="#fff";

        ctx.strokeRect(
            390,
            75,
            100,
            100
        );


        ctx.fillStyle="#fff";

        ctx.font="12px monospace";

        ctx.fillText(
            "МАГАЗИН",
            402,
            100
        );


        ctx.font="7px monospace";

        ctx.fillText(
            "ЕДА • ОРУЖИЕ • БРОНЯ",
            397,
            120
        );


        ctx.fillText(
            "Z — войти",
            412,
            155
        );

    }


    if (
        game.room===1 &&
        !introStarted
    ) {

        ctx.fillStyle="#fff";

        ctx.font="8px monospace";

        ctx.fillText(
            "▶ Z — поговорить с командой",
            210,
            150
        );

    }


    followers.forEach(f => {

        drawFollower(
            f.x,
            f.y,
            f.color
        );

    });


    drawDelta(
        player.x,
        player.y
    );


    ctx.fillStyle="#fff";

    ctx.font="9px monospace";

    ctx.fillText(
        room.name,
        15,
        25
    );


    ctx.font="7px monospace";

    ctx.fillText(
        "C — меню",
        15,
        42
    );


    if (
        game.room===1 &&
        !introStarted &&
        distance(
            player.x,
            player.y,
            world.room1.teamX,
            world.room1.teamY
        )<55
    ) {

        ctx.fillStyle="#fff";

        ctx.font="8px monospace";

        ctx.fillText(
            "Z — поговорить",
            225,
            170
        );


        if (pressed("z"))
            startIntro();

    }

}


/* =====================================================
   DIALOGUE DRAW
===================================================== */

function drawDialogue() {

    drawWorld();


    ctx.fillStyle="rgba(0,0,0,.62)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    const d =
        game.dialogue[
            game.dialogueIndex
        ];


    ctx.fillStyle="#000";

    ctx.fillRect(
        30,
        230,
        580,
        105
    );


    ctx.strokeStyle="#fff";

    ctx.lineWidth=3;

    ctx.strokeRect(
        30,
        230,
        580,
        105
    );


    ctx.fillStyle="#fff";

    ctx.font="13px monospace";

    ctx.fillText(
        d.name,
        50,
        255
    );


    ctx.font="11px monospace";

    wrapText(
        d.text,
        50,
        280,
        530,
        15
    );


    ctx.font="8px monospace";

    ctx.fillText(
        "Z — далее",
        490,
        320
    );


    ctx.fillText(
        "X — пропустить",
        390,
        320
    );

}


/* =====================================================
   TEXT WRAP
===================================================== */

function wrapText(
    text,
    x,
    y,
    width,
    lineHeight
) {

    const words=text.split(" ");

    let line="";


    for (
        let i=0;
        i<words.length;
        i++
    ) {

        const test=
            line+
            words[i]+
            " ";


        if (
            ctx.measureText(test).width>
            width &&
            line
        ) {

            ctx.fillText(
                line,
                x,
                y
            );

            line=
                words[i]+" ";

            y+=lineHeight;

        }

        else {

            line=test;

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

    ctx.fillStyle="#030303";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    const b=game.battle;


    /*
       декоративные линии
    */

    ctx.strokeStyle="#262626";

    for (let i=0;i<12;i++) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            80+i*20
        );

        ctx.lineTo(
            W,
            80+i*20
        );

        ctx.stroke();

    }


    /*
       ВРАГИ
    */

    b.enemies.forEach((enemy,i) => {

        if (!enemy.alive)
            return;


        if (enemy.beast) {

            drawGlitchedBeast(
                enemy.x,
                enemy.y,
                80
            );

        }

        else {

            drawError(
                enemy.x,
                enemy.y
            );

        }


        ctx.fillStyle="#fff";

        ctx.font="8px monospace";

        ctx.fillText(
            enemy.beast
                ? "GLITCHED BEAST"
                : "ERROR",
            enemy.x-40,
            enemy.y-48
        );


        drawBar(
            enemy.x-30,
            enemy.y-40,
            60,
            6,
            enemy.hp,
            enemy.maxHP
        );

    });


    /*
       MESSAGE PANEL
    */

    ctx.fillStyle="#000";

    ctx.fillRect(
        20,
        130,
        600,
        40
    );


    ctx.strokeStyle="#555";

    ctx.strokeRect(
        20,
        130,
        600,
        40
    );


    ctx.fillStyle="#fff";

    ctx.font="9px monospace";

    wrapText(
        b.message,
        35,
        153,
        570,
        11
    );


    /*
       BATTLE BOX
    */

    ctx.strokeStyle="#fff";

    ctx.lineWidth=3;

    ctx.strokeRect(
        170,
        180,
        300,
        145
    );


    if (b.phase==="enemy") {

        drawEnemyAttack();


        ctx.fillStyle="#ff3333";

        ctx.fillRect(
            b.soul.x-6,
            b.soul.y-6,
            12,
            12
        );

    }


    /*
       PARTY
    */

    drawPartyHP();


    /*
       MENUS
    */

    if (b.phase==="menu")
        drawBattleMenu();


    if (b.phase==="act")
        drawActMenu();


    if (b.phase==="magic")
        drawMagicMenu();


    if (b.phase==="victory") {

        ctx.fillStyle="#fff";

        ctx.font="25px monospace";

        ctx.fillText(
            "ПОБЕДА",
            250,
            165
        );


        ctx.font="9px monospace";

        ctx.fillText(
            "Z — продолжить",
            260,
            190
        );

    }


    if (b.phase==="defeat") {

        ctx.fillStyle="#fff";

        ctx.font="18px monospace";

        ctx.fillText(
            "ОТРЯД ПОБЕЖДЁН",
            215,
            165
        );


        ctx.font="9px monospace";

        ctx.fillText(
            "Z — восстановиться",
            250,
            190
        );

    }

}


/* =====================================================
   ERROR
===================================================== */

function drawError(x,y) {

    const img=images.error;


    if (
        img &&
        img.complete &&
        img.naturalWidth>0
    ) {

        ctx.drawImage(
            img,
            x-35,
            y-35,
            70,
            70
        );

    }

    else {

        ctx.fillStyle="#8a2be2";

        ctx.fillRect(
            x-25,
            y-25,
            50,
            50
        );


        ctx.fillStyle="#fff";

        ctx.fillRect(
            x-12,
            y-7,
            7,
            7
        );

        ctx.fillRect(
            x+5,
            y-7,
            7,
            7
        );

    }

}


/* =====================================================
   BAR
===================================================== */

function drawBar(
    x,
    y,
    w,
    h,
    hp,
    max
) {

    ctx.fillStyle="#222";

    ctx.fillRect(
        x,
        y,
        w,
        h
    );


    const percent =
        Math.max(
            0,
            Math.min(
                1,
                hp/max
            )
        );


    ctx.fillStyle="#fff";

    ctx.fillRect(
        x,
        y,
        w*percent,
        h
    );


    ctx.strokeStyle="#aaa";

    ctx.strokeRect(
        x,
        y,
        w,
        h
    );

}


/* =====================================================
   PARTY HP + MP
===================================================== */

function drawPartyHP() {

    const b=game.battle;


    party.forEach((p,i) => {

        const y=35+i*25;


        ctx.fillStyle=p.color;

        ctx.font="8px monospace";

        ctx.fillText(
            p.name,
            15,
            y
        );


        drawBar(
            80,
            y-7,
            55,
            7,
            p.hp,
            p.maxHP
        );


        ctx.fillStyle="#fff";

        ctx.fillText(
            p.hp+"/"+p.maxHP,
            140,
            y
        );


        /*
           MP
        */

        ctx.fillStyle="#666";

        ctx.fillRect(
            175,
            y-7,
            45,
            5
        );


        ctx.fillStyle="#88aaff";

        ctx.fillRect(
            175,
            y-7,
            45 *
            (p.mp/p.maxMP),
            5
        );


        if (
            i===b.actor &&
            b.phase!=="enemy"
        ) {

            ctx.fillStyle="#fff";

            ctx.fillText(
                "▶",
                5,
                y
            );

        }

    });

}


/* =====================================================
   BATTLE MENU
===================================================== */

function drawBattleMenu() {

    const b=game.battle;


    const options=[

        "FIGHT",

        "ACT",

        "MAGIC",

        "DEFEND",

        "MERCY"

    ];


    options.forEach((text,i) => {

        const x=
            185+
            (i%3)*145;


        const y=
            345-
            Math.floor(i/3)*30;


        if (i===b.menu) {

            ctx.strokeStyle="#fff";

            ctx.strokeRect(
                x-10,
                y-16,
                120,
                23
            );

        }


        ctx.fillStyle="#fff";

        ctx.font="9px monospace";

        ctx.fillText(
            text,
            x,
            y
        );

    });


    ctx.font="7px monospace";

    ctx.fillText(
        "← → — выбор",
        20,
        345
    );

}


/* =====================================================
   ACT MENU
===================================================== */

function drawActMenu() {

    const b=game.battle;


    ctx.fillStyle="#000";

    ctx.fillRect(
        180,
        250,
        280,
        75
    );


    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        180,
        250,
        280,
        75
    );


    const acts=[

        "ОСМОТРЕТЬ",

        "ПОГОВОРИТЬ",

        "ПОМЕШАТЬ"

    ];


    acts.forEach((text,i) => {

        ctx.fillStyle="#fff";

        ctx.font="8px monospace";


        if (i===b.act) {

            ctx.fillText(
                "▶",
                195,
                270+i*15
            );

        }


        ctx.fillText(
            text,
            210,
            270+i*15
        );

    });


    ctx.fillText(
        "X — назад",
        365,
        310
    );

}


/* =====================================================
   MAGIC MENU
===================================================== */

function drawMagicMenu() {

    const b=game.battle;

    const actor=party[b.actor];


    ctx.fillStyle="#000";

    ctx.fillRect(
        155,
        215,
        330,
        110
    );


    ctx.strokeStyle="#88aaff";

    ctx.lineWidth=2;

    ctx.strokeRect(
        155,
        215,
        330,
        110
    );


    ctx.fillStyle="#88aaff";

    ctx.font="10px monospace";

    ctx.fillText(
        "MAGIC    MP " +
        actor.mp +
        "/" +
        actor.maxMP,
        175,
        235
    );


    magicList.forEach((spell,i) => {

        const y =
            253+i*16;


        if (i===b.magic) {

            ctx.fillStyle="#fff";

            ctx.fillText(
                "▶",
                170,
                y
            );

        }


        ctx.fillStyle=
            i===b.magic
                ? "#fff"
                : "#999";


        ctx.font="8px monospace";

        ctx.fillText(
            spell.name,
            185,
            y
        );


        ctx.fillText(
            spell.cost+" MP",
            330,
            y
        );

    });


    ctx.fillStyle="#aaa";

    ctx.fillText(
        "X — назад",
        390,
        310
    );

}


/* =====================================================
   ENEMY ATTACK DRAW
===================================================== */

function drawEnemyAttack() {

    const b=game.battle;


    b.laserWarning.forEach(laser => {

        if (!laser.fired) {

            ctx.fillStyle="#ff4444";

            ctx.globalAlpha=.35;

            ctx.fillRect(
                laser.x-2,
                180,
                4,
                145
            );

            ctx.globalAlpha=1;

        }

        else {

            ctx.fillStyle="#fff";

            ctx.fillRect(
                laser.x-4,
                180,
                8,
                145
            );

        }

    });


    b.explosions.forEach(explosion => {

        if (!explosion.active)
            return;


        ctx.strokeStyle="#fff";

        ctx.lineWidth=2;

        ctx.beginPath();

        ctx.arc(
            explosion.x,
            explosion.y,
            explosion.radius,
            0,
            Math.PI*2
        );

        ctx.stroke();


        ctx.fillStyle="#fff";


        for (
            let i=0;
            i<8;
            i++
        ) {

            const a=
                i*Math.PI/4;


            const px=
                explosion.x+
                Math.cos(a)*
                explosion.radius;


            const py=
                explosion.y+
                Math.sin(a)*
                explosion.radius;


            ctx.fillRect(
                px-2,
                py-2,
                4,
                4
            );

        }

    });

}


/* =====================================================
   SHOP
===================================================== */

const shopItems=[

    {
        name:"ЕДА",
        description:"Восстанавливает 25 HP.",
        price:10
    },

    {
        name:"ОРУЖИЕ",
        description:"+3 к атаке Дельты.",
        price:30
    },

    {
        name:"БРОНЯ",
        description:"+3 к защите Дельты.",
        price:25
    }

];


let money=100;


function updateShop() {

    if (pressed("up")) {

        game.shopIndex--;

        if (game.shopIndex<0)
            game.shopIndex=
                shopItems.length-1;

    }


    if (pressed("down")) {

        game.shopIndex++;

        if (
            game.shopIndex>=
