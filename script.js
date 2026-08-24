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
   ИЗОБРАЖЕНИЯ
===================================================== */

const images = {
    delta: new Image(),
    deltaLeft: new Image(),
    deltaRight: new Image(),
    deltaBack: new Image(),
    error: new Image()
};

images.delta.src = "images/delta.png";
images.deltaLeft.src = "images/deltaleft.png";
images.deltaRight.src = "images/deltaright.png";
images.deltaBack.src = "images/deltaback.png";
images.error.src = "images/error.png";


/* =====================================================
   ПОЛНОЭКРАННЫЙ РЕЖИМ
===================================================== */

const fullscreenButton =
    document.getElementById("fullscreenButton");

fullscreenButton.addEventListener(
    "pointerdown",
    async function(e) {

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

    }
);


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

    up: false,
    down: false,
    left: false,
    right: false,

    z: false,
    x: false,
    c: false

};


/* =====================================================
   КЛАВИАТУРА
===================================================== */

window.addEventListener(
    "keydown",
    function(e) {

        let key = e.key.toLowerCase();

        let mapped = null;

        if (e.key === "ArrowUp" || key === "w")
            mapped = "up";

        if (e.key === "ArrowDown" || key === "s")
            mapped = "down";

        if (e.key === "ArrowLeft" || key === "a")
            mapped = "left";

        if (e.key === "ArrowRight" || key === "d")
            mapped = "right";

        if (key === "z")
            mapped = "z";

        if (key === "x")
            mapped = "x";

        if (key === "c")
            mapped = "c";

        if (mapped) {

            keys[mapped] = true;

            e.preventDefault();

        }

    },
    { passive:false }
);


window.addEventListener(
    "keyup",
    function(e) {

        let key = e.key.toLowerCase();

        let mapped = null;

        if (e.key === "ArrowUp" || key === "w")
            mapped = "up";

        if (e.key === "ArrowDown" || key === "s")
            mapped = "down";

        if (e.key === "ArrowLeft" || key === "a")
            mapped = "left";

        if (e.key === "ArrowRight" || key === "d")
            mapped = "right";

        if (key === "z")
            mapped = "z";

        if (key === "x")
            mapped = "x";

        if (key === "c")
            mapped = "c";

        if (mapped) {

            keys[mapped] = false;

            e.preventDefault();

        }

    },
    { passive:false }
);


/* =====================================================
   МОБИЛЬНЫЕ КНОПКИ
===================================================== */

document.querySelectorAll(".joy").forEach(
    function(button) {

        const key = button.dataset.key;

        button.addEventListener(
            "pointerdown",
            function(e) {

                e.preventDefault();

                keys[key] = true;

                button.setPointerCapture(
                    e.pointerId
                );

            }
        );

        button.addEventListener(
            "pointerup",
            function(e) {

                e.preventDefault();

                keys[key] = false;

            }
        );

        button.addEventListener(
            "pointercancel",
            function() {

                keys[key] = false;

            }
        );

    }
);


document.querySelectorAll(".action").forEach(
    function(button) {

        const key = button.dataset.key;

        button.addEventListener(
            "pointerdown",
            function(e) {

                e.preventDefault();

                keys[key] = true;

                button.setPointerCapture(
                    e.pointerId
                );

            }
        );

        button.addEventListener(
            "pointerup",
            function() {

                keys[key] = false;

            }
        );

        button.addEventListener(
            "pointercancel",
            function() {

                keys[key] = false;

            }
        );

    }
);


/* =====================================================
   НАЖАТИЕ ОДИН РАЗ
===================================================== */

function justPressed(key) {

    if (keys[key] && !pressed[key]) {

        pressed[key] = true;

        return true;

    }

    return false;
}


function updatePressed() {

    const list = [
        "up",
        "down",
        "left",
        "right",
        "z",
        "x",
        "c"
    ];

    list.forEach(function(key) {

        if (!keys[key])
            pressed[key] = false;

    });

}


/* =====================================================
   СОСТОЯНИЕ ИГРЫ
===================================================== */

const game = {

    state: "title",

    scene: "room",

    dialogue: null,

    dialogueLine: 0,

    room: "room",

    menuIndex: 0,

    battle: null,

    started: false,

    encounterTimer: 0,

    transition: 0

};


/* =====================================================
   ПАРТИЯ
===================================================== */

const party = [

    {
        name: "ДЕЛЬТА",
        hp: 90,
        maxHP: 90,
        atk: 14,
        def: 8
    },

    {
        name: "ЛИЧИ",
        hp: 80,
        maxHP: 80,
        atk: 13,
        def: 6
    },

    {
        name: "ПАНКЕЙК",
        hp: 70,
        maxHP: 70,
        atk: 10,
        def: 11
    },

    {
        name: "КАШТАН",
        hp: 110,
        maxHP: 110,
        atk: 12,
        def: 12
    },

    {
        name: "ШАРЛОТА",
        hp: 100,
        maxHP: 100,
        atk: 13,
        def: 10
    }

];


/* =====================================================
   ДЕЛЬТА
===================================================== */

const player = {

    x: 70,
    y: 230,

    speed: 2.2,

    direction: "down",

    width: 22,
    height: 30

};


/* =====================================================
   ОТРЯД
===================================================== */

const followers = [

    {
        x: 42,
        y: 230,
        color: "#66aaff"
    },

    {
        x: 15,
        y: 230,
        color: "#ffcc55"
    },

    {
        x: -12,
        y: 230,
        color: "#cc8844"
    },

    {
        x: -39,
        y: 230,
        color: "#ff77cc"
    }

];


/* =====================================================
   ТЕКСТЫ
===================================================== */

const introText = [

    "Дельта медленно открывает глаза.",

    "Комната выглядит непривычно тихой.",

    "За окном мерцают строки неизвестного кода.",

    "Это не обычный мир.",

    "Это цифровая пустошь."

];


const partyDialogue = [

    {
        name: "ЛИЧИ",
        text: "Надо проверить Немку... она изменилась."
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
        name: "ПАНКЕЙК",
        text: "Надеюсь, с ней всё в порядке."
    },

    {
        name: "ШАРЛОТА",
        text: "Сначала найдём её. Потом разберёмся."
    }

];


/* =====================================================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
===================================================== */

function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );

}


function rectsOverlap(a, b) {

    return (

        a.x < b.x + b.w &&
        a.x + a.width > b.x &&
        a.y < b.y + b.h &&
        a.y + a.height > b.y

    );

}


/* =====================================================
   ПЕРЕХОД
===================================================== */

function changeState(state) {

    game.state = state;

}


/* =====================================================
   ГЛАВНОЕ МЕНЮ
===================================================== */

function updateTitle() {

    if (justPressed("z")) {

        game.state = "save";

    }

}


function drawTitle() {

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = "center";

    ctx.fillStyle = "#fff";

    ctx.font = "38px monospace";

    ctx.fillText(
        "BLOOD GLOW",
        W / 2,
        105
    );

    ctx.font = "14px monospace";

    ctx.fillStyle = "#aaa";

    ctx.fillText(
        "DIGITAL WASTELAND",
        W / 2,
        130
    );

    ctx.fillStyle = "#fff";

    ctx.font = "16px monospace";

    ctx.fillText(
        "▶ НАЧАТЬ",
        W / 2,
        205
    );

    ctx.font = "11px monospace";

    ctx.fillStyle = "#777";

    ctx.fillText(
        "Z — выбрать",
        W / 2,
        240
    );

    ctx.textAlign = "left";

}


/* =====================================================
   МЕНЮ СОХРАНЕНИЙ
===================================================== */

function updateSave() {

    if (justPressed("x")) {

        game.state = "title";

        return;

    }


    if (justPressed("up")) {

        game.menuIndex--;

        if (game.menuIndex < 0)
            game.menuIndex = 2;

    }


    if (justPressed("down")) {

        game.menuIndex++;

        if (game.menuIndex > 2)
            game.menuIndex = 0;

    }


    if (justPressed("z")) {

        if (game.menuIndex === 0) {

            localStorage.setItem(
                "bloodGlowSave1",
                "new"
            );

            game.state = "intro";

            game.dialogueLine = 0;

        }

        if (game.menuIndex === 1) {

            const save =
                localStorage.getItem(
                    "bloodGlowSave1"
                );

            if (save) {

                game.state = "world";

            } else {

                game.state = "intro";

                game.dialogueLine = 0;

            }

        }

        if (game.menuIndex === 2) {

            game.state = "title";

        }

    }

}


function drawSave() {

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;

    ctx.strokeRect(
        100,
        45,
        440,
        270
    );

    ctx.fillStyle = "#fff";

    ctx.font = "22px monospace";

    ctx.fillText(
        "СОХРАНЕНИЕ",
        245,
        80
    );

    const options = [
        "НОВАЯ ИГРА",
        "ЗАГРУЗИТЬ",
        "НАЗАД"
    ];

    options.forEach(
        function(text, i) {

            const y =
                135 + i * 50;

            if (i === game.menuIndex) {

                ctx.fillText(
                    "▶",
                    170,
                    y
                );

            }

            ctx.fillText(
                text,
                205,
                y
            );

        }
    );

    ctx.font = "12px monospace";

    ctx.fillStyle = "#888";

    ctx.fillText(
        "Z — выбрать    X — назад",
        220,
        285
    );

}


/* =====================================================
   ВСТУПЛЕНИЕ
===================================================== */

function updateIntro() {

    if (justPressed("z")) {

        game.dialogueLine++;

        if (
            game.dialogueLine >=
            introText.length
        ) {

            game.state = "world";

            player.x = 90;
            player.y = 220;

            followers[0].x = 60;
            followers[1].x = 30;
            followers[2].x = 0;
            followers[3].x = -30;

        }

    }

}


function drawIntro() {

    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#111";

    ctx.fillRect(
        160,
        65,
        320,
        210
    );

    ctx.fillStyle = "#222";

    ctx.fillRect(
        190,
        100,
        260,
        100
    );

    ctx.fillStyle = "#fff";

    ctx.font = "16px monospace";

    drawWrapped(
        introText[game.dialogueLine],
        120,
        290,
        400,
        22
    );

    ctx.font = "11px monospace";

    ctx.fillStyle = "#888";

    ctx.fillText(
        "Z — далее",
        520,
        330
    );

}


/* =====================================================
   МИР
===================================================== */

function updateWorld() {

    if (justPressed("c")) {

        game.state = "menu";

        game.menuIndex = 0;

        return;

    }


    if (justPressed("z")) {

        if (
            player.x > 430 &&
            player.x < 550 &&
            player.y > 170 &&
            player.y < 270
        ) {

            game.dialogue = partyDialogue;

            game.dialogueLine = 0;

            game.state = "dialogue";

            return;

        }

    }


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


    player.x += dx;
    player.y += dy;


    player.x =
        clamp(
            player.x,
            20,
            W - 45
        );

    player.y =
        clamp(
            player.y,
            65,
            285
        );


    updateFollowers();


    /*
       Встречи происходят не через
       каждые несколько шагов.
    */

    game.encounterTimer++;

    if (
        game.encounterTimer > 900
    ) {

        if (
            Math.random() < 0.0015
        ) {

            startBattle();

            game.encounterTimer = 0;

        }

    }

}


function updateFollowers() {

    const targets = [

        {
            x: player.x - 30,
            y: player.y
        },

        {
            x: player.x - 60,
            y: player.y
        },

        {
            x: player.x - 90,
            y: player.y
        },

        {
            x: player.x - 120,
            y: player.y
        }

    ];


    followers.forEach(
        function(f, i) {

            const target = targets[i];

            f.x +=
                (target.x - f.x) * .08;

            f.y +=
                (target.y - f.y) * .08;

        }
    );

}


/* =====================================================
   ДИАЛОГ
===================================================== */

function updateDialogue() {

    if (justPressed("z")) {

        game.dialogueLine++;

        if (
            game.dialogueLine >=
            game.dialogue.length
        ) {

            game.state = "world";

            game.dialogue = null;

        }

    }


    if (justPressed("x")) {

        game.state = "world";

        game.dialogue = null;

    }

}


function drawDialogue() {

    drawWorld();

    ctx.fillStyle = "rgba(0,0,0,.65)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle = "#000";

    ctx.fillRect(
        50,
        220,
        540,
        105
    );


    ctx.strokeStyle = "#fff";

    ctx.lineWidth = 3;

    ctx.strokeRect(
        50,
        220,
        540,
        105
    );


    const d =
        game.dialogue[
            game.dialogueLine
        ];


    ctx.fillStyle = "#fff";

    ctx.font = "16px monospace";

    ctx.fillText(
        d.name,
        75,
        250
    );


    ctx.font = "13px monospace";

    drawWrapped(
        d.text,
        75,
        275,
        490,
        18
    );


    ctx.font = "10px monospace";

    ctx.fillStyle = "#888";

    ctx.fillText(
        "Z — далее",
        485,
        310
    );

}


/* =====================================================
   МИР — РИСОВКА
===================================================== */

function drawWorld() {

    /*
       Цифровая пустошь
    */

    ctx.fillStyle = "#090b12";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /*
       Небо
    */

    ctx.fillStyle = "#101522";

    ctx.fillRect(
        0,
        0,
        W,
        190
    );


    /*
       горизонт
    */

    ctx.fillStyle = "#171b26";

    ctx.fillRect(
        0,
        190,
        W,
        170
    );


    /*
       цифровая земля
    */

    ctx.fillStyle = "#252a35";

    for (
        let y = 195;
        y < H;
        y += 20
    ) {

        ctx.fillRect(
            0,
            y,
            W,
            1
        );

    }


    /*
       случайные пиксели
    */

    ctx.fillStyle = "#353b48";

    for (
        let i = 0;
        i < 80;
        i++
    ) {

        const x =
            (i * 83) % W;

        const y =
            205 +
            ((i * 47) % 145);

        ctx.fillRect(
            x,
            y,
            2,
            2
        );

    }


    /*
       цифровые столбы
    */

    ctx.fillStyle = "#191e2a";

    ctx.fillRect(
        20,
        110,
        18,
        90
    );

    ctx.fillRect(
        575,
        90,
        22,
        110
    );


    /*
       команда
    */

    followers.forEach(
        function(f) {

            drawCharacter(
                f.x,
                f.y,
                f.color
            );

        }
    );


    /*
       Дельта
    */

    drawDelta();


    /*
       зона разговора
    */

    ctx.strokeStyle = "#666";

    ctx.strokeRect(
        430,
        170,
        120,
        100
    );


    ctx.fillStyle = "#aaa";

    ctx.font = "10px monospace";

    ctx.fillText(
        "Z",
        485,
        190
    );


    ctx.fillStyle = "#fff";

    ctx.font = "12px monospace";

    ctx.fillText(
        "ЦИФРОВАЯ ПУСТОШЬ",
        20,
        30
    );


    ctx.fillStyle = "#777";

    ctx.font = "10px monospace";

    ctx.fillText(
        "Идите вперёд.",
        20,
        48
    );

}


/* =====================================================
   ДЕЛЬТА
===================================================== */

function getDeltaImage() {

    if (
        player.direction === "left" &&
        images.deltaLeft.complete &&
        images.deltaLeft.naturalWidth
    )
        return images.deltaLeft;

    if (
        player.direction === "right" &&
        images.deltaRight.complete &&
        images.deltaRight.naturalWidth
    )
        return images.deltaRight;

    if (
        player.direction === "back" &&
        images.deltaBack.complete &&
        images.deltaBack.naturalWidth
    )
        return images.deltaBack;

    if (
        images.delta.complete &&
        images.delta.naturalWidth
    )
        return images.delta;

    return null;

}


function drawDelta() {

    const img = getDeltaImage();


    if (img) {

        ctx.drawImage(
            img,
            player.x - 12,
            player.y - 18,
            32,
            42
        );

        return;

    }


    drawCharacter(
        player.x,
        player.y,
        "#ffffff"
    );

}


/* =====================================================
   ПИКСЕЛЬНЫЙ ПЕРСОНАЖ
===================================================== */

function drawCharacter(
    x,
    y,
    color
) {

    x = Math.round(x);
    y = Math.round(y);


    ctx.fillStyle = "#000";

    ctx.fillRect(
        x - 2,
        y - 3,
        24,
        34
    );


    ctx.fillStyle = color;

    ctx.fillRect(
        x + 3,
        y,
        15,
        13
    );


    ctx.fillRect(
        x + 2,
        y + 12,
        17,
        16
    );


    ctx.fillRect(
        x + 3,
        y + 28,
        5,
        5
    );


    ctx.fillRect(
        x + 13,
        y + 28,
        5,
        5
    );

}


/* =====================================================
   MENU
===================================================== */

function updateMenu() {

    if (justPressed("x")) {

        game.state = "world";

        return;

    }


    if (justPressed("up")) {

        game.menuIndex--;

        if (game.menuIndex < 0)
            game.menuIndex = 3;

    }


    if (justPressed("down")) {

        game.menuIndex++;

        if (game.menuIndex > 3)
            game.menuIndex = 0;

    }

}


function drawMenu() {

    drawWorld();


    ctx.fillStyle = "rgba(0,0,0,.9)";

    ctx.fillRect(
        80,
        35,
        480,
        290
    );


    ctx.strokeStyle = "#fff";

    ctx.lineWidth = 3;

    ctx.strokeRect(
        80,
        35,
        480,
        290
    );


    ctx.fillStyle = "#fff";

    ctx.font = "24px monospace";

    ctx.fillText(
        "MENU",
        115,
        75
    );


    const items = [
        "ПРЕДМЕТЫ",
        "КОМАНДА",
        "СОХРАНЕНИЕ",
        "НАСТРОЙКИ"
    ];


    items.forEach(
        function(item, i) {

            const y =
                120 + i * 42;

            if (
                i === game.menuIndex
            ) {

                ctx.fillText(
                    "▶",
                    125,
                    y
                );

            }

            ctx.fillText(
                item,
                165,
                y
            );

        }
    );


    ctx.font = "11px monospace";

    ctx.fillStyle = "#888";

    ctx.fillText(
        "C — меню",
        110,
        300
    );

    ctx.fillText(
        "X — закрыть",
        430,
        300
    );

}


/* =====================================================
   БОЙ
===================================================== */

function startBattle() {

    game.state = "battle";


    game.battle = {

        enemyHP: 250,

        enemyMaxHP: 250,

        mercy: 0,

        actor: 0,

        menu: 0,

        phase: "menu",

        message:
            "ОШИБКА СИСТЕМЫ появилась перед вами.",

        soul: {

            x: 320,

            y: 250,

            size: 7,

            speed: 3.2

        },

        bullets: [],

        attackTime: 0,

        laser: null,

        explosions: [],

        errorCount:
            1 + Math.floor(
                Math.random() * 2
            )

    };

}


function updateBattle() {

    const b = game.battle;


    if (!b)
        return;


    /*
       МЕНЮ
    */

    if (b.phase === "menu") {

        if (justPressed("left")) {

            b.menu--;

            if (b.menu < 0)
                b.menu = 3;

        }


        if (justPressed("right")) {

            b.menu++;

            if (b.menu > 3)
                b.menu = 0;

        }


        if (justPressed("z")) {

            if (b.menu === 0) {

                attackEnemy();

            }


            if (b.menu === 1) {

                b.phase = "act";

            }


            if (b.menu === 2) {

                healParty();

            }


            if (b.menu === 3) {

                b.mercy += 10;

                b.message =
                    "Вы пытаетесь пощадить ошибку.";

                nextTurn();

            }

        }

        return;

    }


    /*
       ACT
    */

    if (b.phase === "act") {

        if (justPressed("x")) {

            b.phase = "menu";

            return;

        }


        if (justPressed("z")) {

            b.mercy += 25;

            b.mercy =
                clamp(
                    b.mercy,
                    0,
                    100
                );

            b.message =
                "Вы нашли нестабильный фрагмент системы.";

            nextTurn();

        }

        return;

    }


    /*
       ВРАЖЕСКАЯ АТАКА
    */

    if (b.phase === "enemy") {

        updateEnemyAttack();

        return;

    }


    /*
       ПОБЕДА
    */

    if (b.phase === "victory") {

        if (justPressed("z")) {

            game.state = "world";

            game.battle = null;

        }

    }

}


/* =====================================================
   АТАКА
===================================================== */

function attackEnemy() {

    const b = game.battle;

    const actor =
        party[b.actor];


    const damage =
        actor.atk +
        Math.floor(
            Math.random() * 8
        );


    b.enemyHP -= damage;


    b.enemyHP =
        Math.max(
            0,
            b.enemyHP
        );


    b.message =
        actor.name +
        " атакует!  -" +
        damage +
        " HP";


    if (b.enemyHP <= 0) {

        b.phase = "victory";

        b.message =
            "Ошибка системы исчезла.";

        return;

    }


    nextTurn();

}


/* =====================================================
   ЛЕЧЕНИЕ
===================================================== */

function healParty() {

    const p =
        party[
            game.battle.actor
        ];


    p.hp =
        Math.min(
            p.maxHP,
            p.hp + 25
        );


    game.battle.message =
        p.name +
        " восстановил 25 HP.";


    nextTurn();

}


/* =====================================================
   СЛЕДУЮЩИЙ ХОД
===================================================== */

function nextTurn() {

    const b = game.battle;


    b.actor++;


    if (
        b.actor >=
        party.length
    ) {

        b.actor = 0;

        startEnemyAttack();

    }

    else {

        b.phase = "menu";

        b.menu = 0;

        b.message =
            "Ход " +
            party[b.actor].name +
            ".";

    }

}


/* =====================================================
   ВРАЖЕСКАЯ АТАКА
===================================================== */

function startEnemyAttack() {

    const b = game.battle;

    b.phase = "enemy";

    b.attackTime = 0;

    b.bullets = [];

    b.laser = null;

    b.explosions = [];


    /*
       Один враг — лазер.
       Два врага — взрывы.
    */

    if (b.errorCount === 1) {

        b.laser = {

            x:
                100 +
                Math.random() * 440,

            warning: 70,

            active: 35

        };

    }

    else {

        for (
            let i = 0;
            i < 6;
            i++
        ) {

            b.explosions.push({

                x:
                    120 +
                    Math.random() * 400,

                y:
                    155 +
                    Math.random() * 100,

                radius: 0,

                maxRadius: 25,

                timer: 80 +
                    Math.random() * 80

            });

        }

    }

}


/* =====================================================
   ОБНОВЛЕНИЕ ВРАЖЕСКОЙ АТАКИ
===================================================== */

function updateEnemyAttack() {

    const b = game.battle;


    /*
       ДВИЖЕНИЕ ДУШИ
    */

    if (keys.up)
        b.soul.y -= b.soul.speed;

    if (keys.down)
        b.soul.y += b.soul.speed;

    if (keys.left)
        b.soul.x -= b.soul.speed;

    if (keys.right)
        b.soul.x += b.soul.speed;


    /*
       ГРАНИЦЫ КАК В DELTARUNE
    */

    b.soul.x =
        clamp(
            b.soul.x,
            145,
            495
        );


    b.soul.y =
        clamp(
            b.soul.y,
            145,
            285
        );


    b.attackTime++;


    /*
       ЛАЗЕР
    */

    if (b.laser) {

        if (b.laser.warning > 0) {

            b.laser.warning--;

        }

        else if (b.laser.active > 0) {

            b.laser.active--;

            const distance =
                Math.abs(
                    b.soul.x -
                    b.laser.x
                );


            if (distance < 9) {

                damageParty();

            }

        }

    }


    /*
       ВЗРЫВЫ
    */

    b.explosions.forEach(
        function(explosion) {

            explosion.timer--;

            if (
                explosion.timer < 35
            ) {

                explosion.radius =
                    Math.min(
                        explosion.maxRadius,
                        explosion.radius + 1.5
                    );

            }


            const dx =
                b.soul.x -
                explosion.x;

            const dy =
                b.soul.y -
                explosion.y;

            const dist =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                dist <
                explosion.radius + 8
            ) {

                damageParty();

            }

        }
    );


    if (
        b.attackTime > 480
    ) {

        b.phase = "menu";

        b.actor = 0;

        b.menu = 0;

        b.message =
            "Ход Дельты.";

    }

}


/* =====================================================
   УРОН
===================================================== */

let damageCooldown = 0;


function damageParty() {

    if (damageCooldown > 0)
        return;


    damageCooldown = 45;


    const b = game.battle;

    const p =
        party[b.actor];


    p.hp -= 8;


    p.hp =
        Math.max(
            0,
            p.hp
        );


    b.message =
        p.name +
        " получил 8 урона!";


    if (p.hp <= 0) {

        let alive = false;

        party.forEach(
            function(member) {

                if (member.hp > 0)
                    alive = true;

            }
        );


        if (!alive) {

            party.forEach(
                function(member) {

                    member.hp =
                        member.maxHP;

                }
            );

            b.phase = "menu";

            b.message =
                "Отряд восстановился.";

        }

    }

}


/* =====================================================
   РИСОВКА БОЯ
===================================================== */

function drawBattle() {

    const b = game.battle;


    ctx.fillStyle = "#000";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /*
       ВРАГ
    */

    drawErrorEnemy();


    ctx.fillStyle = "#fff";

    ctx.font = "15px monospace";

    ctx.fillText(
        "ERROR",
        45,
        35
    );


    /*
       HP ВРАГА
    */

    ctx.font = "11px monospace";

    ctx.fillText(
        "HP",
        440,
        30
    );


    drawBar(
        470,
        21,
        110,
        12,
        b.enemyHP,
        b.enemyMaxHP
    );


    /*
       ОБЛАСТЬ БОЯ
    */

    ctx.strokeStyle = "#fff";

    ctx.lineWidth = 4;

    ctx.strokeRect(
        130,
        130,
        390,
        165
    );


    /*
       ВРАЖЕСКАЯ АТАКА
    */

    if (
        b.phase === "enemy"
    ) {

        drawEnemyAttack();

    }
    else {

        drawSoul(
            b.soul.x,
            b.soul.y
        );

    }


    /*
       ТЕКСТ
    */

    ctx.fillStyle = "#fff";

    ctx.font = "12px monospace";

    drawWrapped(
        b.message,
        30,
        80,
        580,
        16
    );


    /*
       НИЖНЯЯ ЧАСТЬ
    */

    drawPartyBattle();


    if (
        b.phase !== "enemy" &&
        b.phase !== "victory"
    ) {

        drawBattleCommands();

    }


    if (
        b.phase === "victory"
    ) {

        ctx.fillStyle = "#fff";

        ctx.font = "24px monospace";

        ctx.fillText(
            "ПОБЕДА!",
            260,
            330
        );

        ctx.font = "11px monospace";

        ctx.fillStyle = "#aaa";

        ctx.fillText(
            "Z — продолжить",
            450,
            330
        );

    }


    if (damageCooldown > 0)
        damageCooldown--;

}


/* =====================================================
   ОШИБКА
===================================================== */

function drawErrorEnemy() {

    const img = images.error;


    if (
        img.complete &&
        img.naturalWidth
    ) {

        ctx.drawImage(
            img,
            255,
            20,
            130,
            100
        );

        return;

    }


    /*
       Запасной вариант,
       если error.png отсутствует
    */

    ctx.fillStyle = "#331144";

    ctx.fillRect(
        270,
        35,
        100,
        75
    );


    ctx.fillStyle = "#ff00ff";

    ctx.fillRect(
        285,
        50,
        20,
        15
    );

    ctx.fillRect(
        335,
        50,
        20,
        15
    );


    ctx.fillStyle = "#fff";

    ctx.fillRect(
        295,
        88,
        50,
        5
    );

}


/* =====================================================
   ДУША
===================================================== */

function drawSoul(x, y) {

    ctx.save();

    ctx.translate(
        Math.round(x),
        Math.round(y)
    );


    ctx.fillStyle = "#ff2222";


    /*
       Классическая пиксельная душа
    */

    ctx.fillRect(
        -6,
        -7,
        12,
        14
    );

    ctx.fillRect(
        -9,
        -4,
        18,
        8
    );


    ctx.fillStyle = "#000";

    ctx.fillRect(
        -3,
        -5,
        6,
        10
    );


    ctx.restore();

}


/* =====================================================
   АТАКИ
===================================================== */

function drawEnemyAttack() {

    const b = game.battle;


    /*
       ЛАЗЕР
    */

    if (b.laser) {

        ctx.fillStyle =
            "rgba(255,0,0,.25)";

        ctx.fillRect(
            b.laser.x - 12,
            134,
            24,
            158
        );


        if (
            b.laser.warning > 0
        ) {

            ctx.strokeStyle = "#ff4444";

            ctx.lineWidth = 3;

            ctx.strokeRect(
                b.laser.x - 5,
                135,
                10,
                157
            );

            ctx.fillStyle = "#ff4444";

            ctx.font = "10px monospace";

            ctx.fillText(
                "!",
                b.laser.x - 3,
                150
            );

        }
        else {

            ctx.fillStyle =
                "rgba(255,0,0,.8)";

            ctx.fillRect(
                b.laser.x - 4,
                135,
                8,
                157
            );

        }

    }


    /*
       ВЗРЫВЫ
    */

    b.explosions.forEach(
        function(explosion) {

            ctx.strokeStyle = "#ff5555";

            ctx.lineWidth = 3;

            ctx.beginPath();

            ctx.arc(
                explosion.x,
                explosion.y,
                explosion.radius,
                0,
                Math.PI * 2
            );

            ctx.stroke();


            if (
                explosion.radius >
                15
            ) {

                ctx.fillStyle = "#ffaaaa";

                for (
                    let i = 0;
                    i < 8;
                    i++
                ) {

                    const angle =
                        i *
                        Math.PI /
                        4;

                    const px =
                        explosion.x +
                        Math.cos(angle) *
                        explosion.radius;

                    const py =
                        explosion.y +
                        Math.sin(angle) *
                        explosion.radius;

                    ctx.fillRect(
                        px - 2,
                        py - 2,
                        4,
                        4
                    );

                }

            }

        }
    );


    drawSoul(
        game.battle.soul.x,
        game.battle.soul.y
    );

}


/* =====================================================
   ПАРТИЯ В БОЮ
===================================================== */

function drawPartyBattle() {

    const b = game.battle;


    party.forEach(
        function(p, i) {

            const x =
                20 + i * 120;


            const y = 315;


            if (
                i === b.actor
            ) {

                ctx.fillStyle = "#fff";

                ctx.font = "12px monospace";

                ctx.fillText(
                    "▶",
                    x,
                    y
                );

            }


            ctx.fillStyle = "#fff";

            ctx.font = "11px monospace";

            ctx.fillText(
                p.name,
                x + 15,
                y
            );


            drawBar(
                x + 15,
                y + 7,
                70,
                7,
                p.hp,
                p.maxHP
            );


            ctx.font = "8px monospace";

            ctx.fillStyle = "#aaa";

            ctx.fillText(
                p.hp + "/" + p.maxHP,
                x + 15,
                y + 25
            );

        }
    );

}


/* =====================================================
   КОМАНДЫ
===================================================== */

function drawBattleCommands() {

    const b = game.battle;


    const commands = [
        "FIGHT",
        "ACT",
        "ITEM",
        "MERCY"
    ];


    commands.forEach(
        function(command, i) {

            const x =
                150 +
                (i * 120);


            const y = 105;


            if (
                i === b.menu &&
                b.phase === "menu"
            ) {

                ctx.strokeStyle = "#fff";

                ctx.lineWidth = 2;

                ctx.strokeRect(
                    x - 8,
                    y - 20,
                    100,
                    30
                );

            }


            ctx.fillStyle = "#fff";

            ctx.font = "13px monospace";

            ctx.fillText(
                command,
                x,
                y
            );

        }
    );


    if (
        b.phase === "act"
    ) {

        ctx.fillStyle = "#000";

        ctx.fillRect(
            145,
            95,
            350,
            45
        );

        ctx.strokeStyle = "#fff";

        ctx.strokeRect(
            145,
            95,
            350,
            45
        );


        ctx.fillStyle = "#fff";

        ctx.font = "11px monospace";

        ctx.fillText(
            "Z — исследовать ошибку",
            170,
            122
        );

    }

}


/* =====================================================
   ПОЛОСА
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


    const amount =
        clamp(
            value / max,
            0,
            1
        );


    ctx.fillStyle = "#fff";

    ctx.fillRect(
        x,
        y,
        w * amount,
        h
    );


    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        x,
        y,
        w,
        h
    );

}


/* =====================================================
   ТЕКСТ
===================================================== */

function drawWrapped(
    text,
    x,
    y,
    width,
    lineHeight
) {

    const words =
        String(text).split(" ");

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
            ctx.measureText(test).width >
            width &&
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

        }
        else {

            line = test;

        }

    }


    if (line) {

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

    switch (game.state) {

        case "title":
            updateTitle();
            break;


        case "save":
            updateSave();
            break;


        case "intro":
            updateIntro();
            break;


        case "world":
            updateWorld();
            break;


        case "dialogue":
            updateDialogue();
            break;


        case "menu":
            updateMenu();
            break;


        case "battle":
            updateBattle();
            break;

    }


    updatePressed();

}


/* =====================================================
   DRAW
===================================================== */

function draw() {

    /*
       ВАЖНО:
       сначала всегда очищаем canvas.
       Поэтому чёрный экран не останется
       из-за отсутствующей картинки.
    */

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    switch (game.state) {

        case "title":
            drawTitle();
            break;


        case "save":
            drawSave();
            break;


        case "intro":
            drawIntro();
            break;


        case "world":
            drawWorld();
            break;


        case "dialogue":
            drawDialogue();
            break;


        case "menu":
            drawMenu();
            break;


        case "battle":
            drawBattle();
            break;


        default:

            ctx.fillStyle = "#000";

            ctx.fillRect(
                0,
                0,
                W,
                H
            );

            ctx.fillStyle = "#fff";

            ctx.font = "16px monospace";

            ctx.fillText(
                "BLOOD GLOW",
                250,
                180
            );

            break;

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
   ЗАПУСК
===================================================== */

game.state = "title";

loop();
