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
   IMAGES
===================================================== */

const images = {

    delta: new Image(),
    deltaLeft: new Image(),
    deltaRight: new Image(),
    deltaBack: new Image(),
    error: new Image()

};

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
   MOBILE CONTROLS
===================================================== */

document.querySelectorAll(".joy, .action").forEach(button => {

    const key = button.dataset.key;

    button.addEventListener("pointerdown", e => {

        e.preventDefault();

        keys[key] = true;

        try {
            button.setPointerCapture(e.pointerId);
        } catch {}

    });

    button.addEventListener("pointerup", e => {

        e.preventDefault();

        keys[key] = false;

    });

    button.addEventListener("pointercancel", () => {

        keys[key] = false;

    });

    button.addEventListener("pointerleave", () => {

        keys[key] = false;

    });

});


/* =====================================================
   FULLSCREEN
===================================================== */

document.getElementById("fullscreen")
    .addEventListener("pointerdown", async e => {

        e.preventDefault();

        try {

            if (!document.fullscreenElement) {

                await document.documentElement.requestFullscreen();

            } else {

                await document.exitFullscreen();

            }

        } catch {}

    });


/* =====================================================
   GAME STATE
===================================================== */

const game = {

    state: "title",

    dialogue: null,
    dialogueIndex: 0,

    battle: null,

    started: false,

    battleCooldown: 0,

    encounterSteps: 0

};


/* =====================================================
   PLAYER
===================================================== */

const player = {

    x: 70,
    y: 125,

    width: 12,
    height: 16,

    direction: "down"

};


/* =====================================================
   DIGITAL WASTELAND
===================================================== */

const wasteland = {

    width: 1000,

    walls: [

        {
            x: 0,
            y: 0,
            w: 1000,
            h: 7
        },

        {
            x: 0,
            y: 173,
            w: 1000,
            h: 7
        }

    ]

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
        def: 8,
        color: "#ffffff"
    },

    {
        name: "ЛИЧИ",
        hp: 80,
        maxHP: 80,
        atk: 13,
        def: 6,
        color: "#66aaff"
    },

    {
        name: "ПАНКЕЙК",
        hp: 70,
        maxHP: 70,
        atk: 10,
        def: 11,
        color: "#66dd77"
    },

    {
        name: "КАШТАН",
        hp: 110,
        maxHP: 110,
        atk: 12,
        def: 12,
        color: "#cc8844"
    },

    {
        name: "ШАРЛОТА",
        hp: 100,
        maxHP: 100,
        atk: 13,
        def: 9,
        color: "#ff77cc"
    }

];


/* =====================================================
   DIALOGUE
===================================================== */

const firstDialogue = [

    {
        name: "ЛИЧИ",
        text: "Надо проверить Немку..."
    },

    {
        name: "ЛИЧИ",
        text: "Она изменилась."
    },

    {
        name: "ЛИЧИ",
        text: "Последний раз, когда мы пытались поговорить с ней, она была странной."
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
        name: "ШАРЛОТА",
        text: "Тогда не будем терять время."
    }

];


/* =====================================================
   START
===================================================== */

function startGame() {

    game.state = "intro";

    player.x = 70;
    player.y = 125;

    game.dialogue = firstDialogue;
    game.dialogueIndex = 0;

}


/* =====================================================
   TITLE
===================================================== */

function updateTitle() {

    if (pressed("z")) {

        startGame();

    }

}


/* =====================================================
   INTRO
===================================================== */

function updateIntro() {

    if (pressed("z")) {

        game.dialogueIndex++;

        if (
            game.dialogueIndex >=
            game.dialogue.length
        ) {

            game.dialogue = null;

            game.state = "wasteland";

        }

    }

    if (pressed("x")) {

        game.dialogue = null;

        game.state = "wasteland";

    }

}


/* =====================================================
   MOVEMENT
===================================================== */

function updateWasteland() {

    let dx = 0;
    let dy = 0;

    const speed = 1.45;

    if (keys.up) {

        dy -= speed;
        player.direction = "up";

    }

    if (keys.down) {

        dy += speed;
        player.direction = "down";

    }

    if (keys.left) {

        dx -= speed;
        player.direction = "left";

    }

    if (keys.right) {

        dx += speed;
        player.direction = "right";

    }

    if (dx !== 0 && dy !== 0) {

        dx *= .707;
        dy *= .707;

    }

    player.x += dx;
    player.y += dy;

    player.x = Math.max(
        10,
        Math.min(
            wasteland.width - 20,
            player.x
        )
    );

    player.y = Math.max(
        15,
        Math.min(
            160,
            player.y
        )
    );


    if (dx !== 0 || dy !== 0) {

        game.encounterSteps++;

    }


    /*
       Случайные враги не появляются
       каждые два шага.
       Нужно пройти некоторое расстояние.
    */

    if (
        game.encounterSteps > 450 &&
        game.battleCooldown <= 0
    ) {

        if (Math.random() < 0.012) {

            startBattle();

            game.encounterSteps = 0;

        }

    }


    if (game.battleCooldown > 0) {

        game.battleCooldown--;

    }

}


/* =====================================================
   BATTLE
===================================================== */

function startBattle() {

    game.state = "battle";

    game.battle = {

        enemy: {

            name: "ОШИБКА СИСТЕМЫ",

            hp: 250,

            maxHP: 250

        },

        menu: 0,

        actor: 0,

        mercy: 0,

        phase: "menu",

        message: "ОШИБКА ОБНАРУЖЕНА.",

        soul: {

            x: 160,
            y: 130

        },

        bullets: [],

        attackTime: 0,

        defend: false

    };

}


/* =====================================================
   BATTLE UPDATE
===================================================== */

function updateBattle() {

    const b = game.battle;

    if (!b)
        return;


    /* MENU */

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

            if (b.menu === 0) {

                attackEnemy();

            }

            else if (b.menu === 1) {

                b.phase = "act";

            }

            else if (b.menu === 2) {

                defend();

            }

            else {

                if (b.mercy >= 100) {

                    b.message =
                        "ОШИБКА БЫЛА УДАЛЕНА.";

                    b.phase = "victory";

                }
                else {

                    b.message =
                        "ОШИБКА ЕЩЁ НЕ ГОТОВА.";

                    startEnemyAttack();

                }

            }

        }

    }


    /* ACT */

    else if (b.phase === "act") {

        if (pressed("x")) {

            b.phase = "menu";

        }

        if (pressed("z")) {

            b.mercy = Math.min(
                100,
                b.mercy + 25
            );

            b.message =
                "Вы изучили структуру ошибки.";

            startEnemyAttack();

        }

    }


    /* ENEMY */

    else if (b.phase === "enemy") {

        updateEnemyAttack();

    }


    /* VICTORY */

    else if (b.phase === "victory") {

        if (pressed("z")) {

            game.state = "wasteland";
            game.battle = null;

            game.battleCooldown = 250;

        }

    }

}


/* =====================================================
   ATTACK
===================================================== */

function attackEnemy() {

    const b = game.battle;

    const p = party[b.actor];

    const damage =
        p.atk +
        Math.floor(Math.random() * 6);

    b.enemy.hp -= damage;

    b.message =
        p.name +
        " атакует!  -" +
        damage;

    if (b.enemy.hp <= 0) {

        b.enemy.hp = 0;

        b.phase = "victory";

        return;

    }

    b.actor++;

    if (b.actor >= party.length)
        b.actor = 0;

    startEnemyAttack();

}


/* =====================================================
   DEFEND
===================================================== */

function defend() {

    const b = game.battle;

    /*
       Защита увеличивает RD.
    */

    b.mercy = Math.min(
        100,
        b.mercy + 18
    );

    b.defend = true;

    b.message =
        party[b.actor].name +
        " защищается.";

    startEnemyAttack();

}


/* =====================================================
   ENEMY ATTACK
===================================================== */

function startEnemyAttack() {

    const b = game.battle;

    b.phase = "enemy";

    b.attackTime = 360;

    b.bullets = [];

    /*
       Один ERROR — лазер.
       Здесь создаётся одна атака.
    */

    for (let i = 0; i < 3; i++) {

        b.bullets.push({

            x: 60 + Math.random() * 200,

            y: 92,

            targetX:
                60 + Math.random() * 200,

            warning: 45,

            speed: 3,

            active: false

        });

    }

}


/* =====================================================
   ENEMY ATTACK UPDATE
===================================================== */

function updateEnemyAttack() {

    const b = game.battle;

    if (pressed("up"))
        b.soul.y -= 2.3;

    if (pressed("down"))
        b.soul.y += 2.3;

    if (pressed("left"))
        b.soul.x -= 2.3;

    if (pressed("right"))
        b.soul.x += 2.3;


    b.soul.x = Math.max(
        55,
        Math.min(265, b.soul.x)
    );

    b.soul.y = Math.max(
        100,
        Math.min(158, b.soul.y)
    );


    b.bullets.forEach(laser => {

        if (laser.warning > 0) {

            laser.warning--;

        }
        else {

            laser.active = true;

            laser.y += laser.speed;

            if (
                Math.abs(
                    b.soul.x -
                    laser.targetX
                ) < 6 &&
                Math.abs(
                    b.soul.y -
                    laser.y
                ) < 8
            ) {

                damageParty();

                laser.y = 999;

            }

        }

    });


    b.attackTime--;

    if (b.attackTime <= 0) {

        b.phase = "menu";

        b.defend = false;

        b.message =
            "Ход: " +
            party[b.actor].name;

    }

}


/* =====================================================
   DAMAGE
===================================================== */

function damageParty() {

    const b = game.battle;

    const p = party[b.actor];

    let damage = 10;

    if (b.defend)
        damage = 5;

    p.hp = Math.max(
        0,
        p.hp - damage
    );

    b.message =
        p.name +
        " получил " +
        damage +
        " урона!";

    if (p.hp <= 0) {

        let alive = party.some(
            member => member.hp > 0
        );

        if (!alive) {

            b.phase = "victory";

            b.message =
                "Система остановила бой.";

        }

    }

}


/* =====================================================
   INPUT EDGE
===================================================== */

function pressed(key) {

    return (
        keys[key] &&
        !oldKeys[key]
    );

}


/* =====================================================
   DRAW TITLE
===================================================== */

function drawTitle() {

    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#fff";

    ctx.font = "20px monospace";

    ctx.fillText(
        "BLOOD GLOW",
        92,
        65
    );

    ctx.font = "8px monospace";

    ctx.fillText(
        "DIGITAL WASTELAND",
        103,
        82
    );

    ctx.font = "9px monospace";

    ctx.fillText(
        "Z — НАЧАТЬ",
        118,
        120
    );

}


/* =====================================================
   DRAW WASTELAND
===================================================== */

function drawWasteland() {

    ctx.fillStyle = "#11151c";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /*
       Длинная цифровая пустошь.
    */

    const cameraX =
        Math.max(
            0,
            Math.min(
                wasteland.width - W,
                player.x - 160
            )
        );


    /* фон */

    for (
        let x = -cameraX % 20;
        x < W;
        x += 20
    ) {

        ctx.fillStyle = "#18202a";

        ctx.fillRect(
            x,
            20,
            1,
            150
        );

    }


    for (
        let x = -cameraX % 32;
        x < W;
        x += 32
    ) {

        ctx.fillStyle = "#27313c";

        ctx.fillRect(
            x,
            150,
            2,
            2
        );

    }


    /* дальние ошибки */

    for (
        let x = 30;
        x < wasteland.width;
        x += 120
    ) {

        const sx = x - cameraX;

        if (
            sx > -30 &&
            sx < W + 30
        ) {

            drawSmallError(
                sx,
                75
            );

        }

    }


    /* путь */

    ctx.fillStyle = "#20262e";

    ctx.fillRect(
        -cameraX,
        108,
        wasteland.width,
        45
    );


    /* player */

    drawDelta(
        player.x - cameraX,
        player.y
    );


    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";

    ctx.fillText(
        "ЦИФРОВАЯ ПУСТОШЬ",
        10,
        18
    );

}


/* =====================================================
   DELTA SPRITE
===================================================== */

function drawDelta(x, y) {

    let img = images.delta;

    if (player.direction === "left")
        img = images.deltaLeft;

    if (player.direction === "right")
        img = images.deltaRight;

    if (player.direction === "up")
        img = images.deltaBack;


    if (
        img.complete &&
        img.naturalWidth > 0
    ) {

        ctx.drawImage(
            img,
            Math.round(x - 10),
            Math.round(y - 17),
            20,
            24
        );

    }
    else {

        /*
           Запасной вариант, чтобы
           игра никогда не превращалась
           в пустой экран, если картинки
           ещё не загрузились.
        */

        ctx.fillStyle = "#fff";

        ctx.fillRect(
            x - 5,
            y - 10,
            10,
            14
        );

    }

}


/* =====================================================
   SMALL ERROR
===================================================== */

function drawSmallError(x, y) {

    if (
        images.error.complete &&
        images.error.naturalWidth > 0
    ) {

        ctx.drawImage(
            images.error,
            x - 8,
            y - 8,
            16,
            16
        );

    }
    else {

        ctx.fillStyle = "#aa44ff";

        ctx.fillRect(
            x - 6,
            y - 6,
            12,
            12
        );

    }

}


/* =====================================================
   DRAW DIALOGUE
===================================================== */

function drawDialogue() {

    ctx.fillStyle = "rgba(0,0,0,.45)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle = "#000";

    ctx.fillRect(
        12,
        108,
        296,
        58
    );


    ctx.strokeStyle = "#fff";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        12,
        108,
        296,
        58
    );


    const d =
        game.dialogue[
            game.dialogueIndex
        ];


    ctx.fillStyle = "#fff";

    ctx.font = "8px monospace";

    ctx.fillText(
        d.name,
        23,
        124
    );


    ctx.font = "7px monospace";

    drawText(
        d.text,
        23,
        140,
        270,
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

    const words = text.split(" ");

    let line = "";

    for (const word of words) {

        const test =
            line +
            word +
            " ";

        if (
            ctx.measureText(test).width >
            maxWidth &&
            line !== ""
        ) {

            ctx.fillText(
                line,
                x,
                y
            );

            line = word + " ";

            y += lineHeight;

        }
        else {

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
   DRAW BATTLE
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


    /* ВРАГ */

    if (
        images.error.complete &&
        images.error.naturalWidth > 0
    ) {

        ctx.drawImage(
            images.error,
            136,
            15,
            48,
            48
        );

    }
    else {

        ctx.fillStyle = "#aa44ff";

        ctx.fillRect(
            143,
            22,
            34,
            34
        );

    }


    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";

    ctx.fillText(
        b.enemy.name,
        20,
        20
    );


    /* ENEMY HP */

    ctx.fillText(
        "HP",
        230,
        20
    );

    drawBar(
        248,
        15,
        50,
        6,
        b.enemy.hp,
        b.enemy.maxHP
    );


    ctx.fillText(
        b.enemy.hp +
        "/" +
        b.enemy.maxHP,
        248,
        31
    );


    /* MESSAGE */

    ctx.font = "6px monospace";

    drawText(
        b.message,
        25,
        78,
        270,
        8
    );


    /* RD */

    ctx.fillStyle = "#fff";

    ctx.font = "6px monospace";

    ctx.fillText(
        "RD",
        175,
        88
    );

    drawBar(
        195,
        83,
        105,
        8,
        b.mercy,
        100
    );


    ctx.fillText(
        Math.floor(b.mercy) + "%",
        270,
        98
    );


    /* BATTLE BOX */

    ctx.strokeStyle = "#fff";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        45,
        101,
        225,
        59
    );


    if (b.phase === "enemy") {

        drawEnemyAttack();

    }
    else {

        drawSoulBox();

    }


    /* MENU */

    if (
        b.phase === "menu" ||
        b.phase === "act"
    ) {

        drawBattleMenu();

    }


    /* PARTY */

    drawBattleParty();


    if (b.phase === "victory") {

        ctx.fillStyle = "#fff";

        ctx.font = "11px monospace";

        ctx.fillText(
            "ПОБЕДА",
            125,
            125
        );

        ctx.font = "6px monospace";

        ctx.fillText(
            "Z — продолжить",
            110,
            142
        );

    }

}


/* =====================================================
   SOUL BOX
===================================================== */

function drawSoulBox() {

    const b = game.battle;

    ctx.fillStyle = "#fff";

    ctx.fillRect(
        b.soul.x - 3,
        b.soul.y - 3,
        6,
        6
    );

}


/* =====================================================
   ENEMY ATTACK
===================================================== */

function drawEnemyAttack() {

    const b = game.battle;


    b.bullets.forEach(laser => {

        if (laser.warning > 0) {

            ctx.strokeStyle = "#ff5555";

            ctx.lineWidth = 1;

            ctx.beginPath();

            ctx.moveTo(
                laser.targetX,
                103
            );

            ctx.lineTo(
                laser.targetX,
                158
            );

            ctx.stroke();

        }
        else {

            ctx.fillStyle = "#ff4444";

            ctx.fillRect(
                laser.targetX - 2,
                103,
                4,
                55
            );

        }

    });


    drawSoulBox();

}


/* =====================================================
   BATTLE MENU
===================================================== */

function drawBattleMenu() {

    const b = game.battle;

    if (b.phase === "menu") {

        const options = [
            "FIGHT",
            "ACT",
            "DEFEND",
            "MERCY"
        ];


        options.forEach((text, i) => {

            const x =
                180 +
                (i % 2) * 65;

            const y =
                113 +
                Math.floor(i / 2) * 23;


            if (b.menu === i) {

                ctx.strokeStyle = "#fff";

                ctx.strokeRect(
                    x - 6,
                    y - 8,
                    57,
                    15
                );

            }


            ctx.fillStyle =
                i === 0 ? "#ff5555" :
                i === 1 ? "#ffdd55" :
                i === 2 ? "#55aaff" :
                "#fff";


            ctx.font = "6px monospace";

            ctx.fillText(
                text,
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
            180,
            112
        );

        ctx.font = "6px monospace";

        ctx.fillText(
            "Z — изучить ошибку",
            180,
            128
        );

        ctx.fillText(
            "X — назад",
            180,
            145
        );

    }

}


/* =====================================================
   PARTY
===================================================== */

function drawBattleParty() {

    party.forEach((p, i) => {

        const y =
            107 + i * 13;

        ctx.fillStyle = p.color;

        ctx.font = "5px monospace";

        ctx.fillText(
            p.name,
            3,
            y
        );


        ctx.fillStyle = "#333";

        ctx.fillRect(
            45,
            y - 5,
            35,
            5
        );


        ctx.fillStyle = "#fff";

        ctx.fillRect(
            45,
            y - 5,
            35 *
            (p.hp / p.maxHP),
            5
        );


        ctx.fillStyle = "#fff";

        ctx.fillText(
            p.hp + "/" + p.maxHP,
            83,
            y
        );

    });

}


/* =====================================================
   BAR
===================================================== */

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


    ctx.fillStyle = "#fff";

    ctx.fillRect(
        x,
        y,
        w *
        Math.max(
            0,
            Math.min(
                1,
                value / max
            )
        ),
        h
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


    if (game.state === "title") {

        drawTitle();

    }

    else if (game.state === "intro") {

        drawWasteland();

        drawDialogue();

    }

    else if (game.state === "wasteland") {

        drawWasteland();

    }

    else if (game.state === "battle") {

        drawBattle();

    }

}


/* =====================================================
   UPDATE OLD KEYS
===================================================== */

function updateOldKeys() {

    for (const key in keys) {

        oldKeys[key] = keys[key];

    }

}


/* =====================================================
   MAIN LOOP
===================================================== */

function loop() {

    try {

        if (game.state === "title") {

            updateTitle();

        }

        else if (game.state === "intro") {

            updateIntro();

        }

        else if (game.state === "wasteland") {

            updateWasteland();

        }

        else if (game.state === "battle") {

            updateBattle();

        }

        draw();

        updateOldKeys();

    }
    catch (error) {

        /*
           Ошибка игры больше не оставляет
           пользователя с полностью чёрным экраном.
        */

        console.error(error);

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = "#fff";
        ctx.font = "7px monospace";

        ctx.fillText(
            "BLOOD GLOW",
            15,
            25
        );

        ctx.fillText(
            "ОШИБКА ИГРЫ",
            15,
            40
        );

    }

    requestAnimationFrame(loop);

}


/* =====================================================
   START LOOP
===================================================== */

loop();
