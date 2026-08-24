"use strict";

/* =========================================================
   CANVAS
========================================================= */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = 320;
const H = 180;


/* =========================================================
   FULLSCREEN
========================================================= */

document
    .getElementById("fullscreen")
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


/* =========================================================
   INPUT
========================================================= */

const keys = {

    up:false,
    down:false,
    left:false,
    right:false,

    z:false,
    x:false,
    c:false
};

const oldKeys = {

    up:false,
    down:false,
    left:false,
    right:false,

    z:false,
    x:false,
    c:false
};


/* =========================================================
   KEYBOARD
========================================================= */

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

}, {passive:false});


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

}, {passive:false});


/* =========================================================
   MOBILE INPUT
========================================================= */

document.querySelectorAll(".joy").forEach(function(button) {

    const key = button.dataset.key;

    button.addEventListener("pointerdown", function(e) {

        e.preventDefault();

        keys[key] = true;

        button.setPointerCapture(e.pointerId);

    });

    button.addEventListener("pointerup", function() {

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

    button.addEventListener("pointerup", function() {

        keys[key] = false;

    });

    button.addEventListener("pointercancel", function() {

        keys[key] = false;

    });

});


/* =========================================================
   GAME STATE
========================================================= */

const game = {

    state:"title",

    room:"wasteland",

    dialogue:null,

    dialogueIndex:0,

    menuIndex:0,

    saveIndex:0,

    battle:null,

    messageTimer:0,

    introStarted:false

};


/* =========================================================
   PARTY
========================================================= */

const party = [

    {
        name:"ДЕЛЬТА",
        hp:90,
        maxHP:90,
        atk:14,
        def:8,
        color:"#ffffff"
    },

    {
        name:"ЛИЧИ",
        hp:80,
        maxHP:80,
        atk:13,
        def:6,
        color:"#55aaff"
    },

    {
        name:"ПАНКЕЙК",
        hp:70,
        maxHP:70,
        atk:10,
        def:11,
        color:"#55dd66"
    },

    {
        name:"КАШТАН",
        hp:110,
        maxHP:110,
        atk:12,
        def:12,
        color:"#cc8844"
    },

    {
        name:"ШАРЛОТТА",
        hp:100,
        maxHP:100,
        atk:11,
        def:9,
        color:"#ff77cc"
    }

];


/* =========================================================
   PLAYER
========================================================= */

const player = {

    x:48,
    y:125,

    w:9,
    h:13,

    speed:1.4
};


/* =========================================================
   FOLLOWERS
========================================================= */

const followers = [

    {
        x:30,
        y:125,
        color:"#55aaff"
    },

    {
        x:18,
        y:125,
        color:"#55dd66"
    },

    {
        x:6,
        y:125,
        color:"#cc8844"
    },

    {
        x:0,
        y:125,
        color:"#ff77cc"
    }

];


/* =========================================================
   WORLD
========================================================= */

const wasteland = {

    walls:[

        {
            x:0,
            y:0,
            w:320,
            h:7
        },

        {
            x:0,
            y:173,
            w:320,
            h:7
        },

        {
            x:0,
            y:0,
            w:7,
            h:180
        },

        {
            x:313,
            y:0,
            w:7,
            h:180
        }

    ],

    saveX:250,
    saveY:115
};


/* =========================================================
   DIALOGUE
========================================================= */

const openingDialogue = [

    {
        name:"ЛИЧИ",

        text:
        "Надо проверить Немку... Она изменилась."
    },

    {
        name:"ЛИЧИ",

        text:
        "Последний раз, когда мы пытались поговорить с ней, то она была странной."
    },

    {
        name:"ДЕЛЬТА",

        text:
        "Так мы идём?"
    },

    {
        name:"ЛИЧИ",

        text:
        "Да."
    }

];


/* =========================================================
   EDGE
========================================================= */

function justPressed(key) {

    return keys[key] && !oldKeys[key];

}


/* =========================================================
   COLLISION
========================================================= */

function collides(x,y) {

    const p = {

        x:x,
        y:y,
        w:player.w,
        h:player.h

    };

    for (const wall of wasteland.walls) {

        if (

            p.x < wall.x + wall.w &&
            p.x + p.w > wall.x &&
            p.y < wall.y + wall.h &&
            p.y + p.h > wall.y

        ) {

            return true;

        }

    }

    return false;

}


/* =========================================================
   START
========================================================= */

function startGame() {

    game.state = "save";

}


/* =========================================================
   SAVE MENU
========================================================= */

function updateSave() {

    if (justPressed("x")) {

        game.state = "title";

        return;

    }

    if (justPressed("up")) {

        game.saveIndex--;

        if (game.saveIndex < 0)
            game.saveIndex = 2;

    }

    if (justPressed("down")) {

        game.saveIndex++;

        if (game.saveIndex > 2)
            game.saveIndex = 0;

    }

    if (justPressed("z")) {

        const key =
            "bloodGlow_slot_" +
            game.saveIndex;

        const data = {

            room:"wasteland",

            playerX:48,
            playerY:125,

            hp:party.map(p => p.hp),

            created:new Date().toLocaleString()

        };

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

        game.state = "intro";

    }

}


/* =========================================================
   INTRO
========================================================= */

function updateIntro() {

    if (justPressed("z")) {

        game.state = "dialogue";

        game.dialogue =
            openingDialogue;

        game.dialogueIndex = 0;

    }

}


/* =========================================================
   DIALOGUE
========================================================= */

function updateDialogue() {

    if (justPressed("z")) {

        game.dialogueIndex++;

        if (
            game.dialogueIndex >=
            game.dialogue.length
        ) {

            game.dialogue = null;

            game.state = "world";

        }

    }

    if (justPressed("x")) {

        game.dialogue = null;

        game.state = "world";

    }

}


/* =========================================================
   WORLD UPDATE
========================================================= */

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


    if (dx && dy) {

        dx *= .707;
        dy *= .707;

    }


    if (!collides(player.x + dx, player.y))
        player.x += dx;

    if (!collides(player.x, player.y + dy))
        player.y += dy;


    /* движение спутников */

    followers.forEach(function(f,i) {

        const target = i === 0

            ? player

            : followers[i-1];

        const dx =
            target.x - f.x - 11;

        const dy =
            target.y - f.y;

        f.x += dx * .08;
        f.y += dy * .08;

    });


    /* меню */

    if (justPressed("c")) {

        game.state = "menu";

    }


    /*
       Небольшой случайный шанс боя.
       После движения.
    */

    if (
        Math.random() < 0.0015
    ) {

        startBattle(
            Math.random() < .55
                ? 1
                : 2
        );

    }

}


/* =========================================================
   MENU
========================================================= */

const menuItems = [

    "ITEM",
    "STATUS",
    "SAVE",
    "BACK"

];


function updateMenu() {

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

    if (justPressed("x")) {

        game.state = "world";

    }

    if (justPressed("z")) {

        if (game.menuIndex === 0) {

            game.messageTimer = 120;

        }

        if (game.menuIndex === 1) {

            game.state = "status";

        }

        if (game.menuIndex === 2) {

            game.state = "save";

        }

        if (game.menuIndex === 3) {

            game.state = "world";

        }

    }

}


/* =========================================================
   STATUS
========================================================= */

function updateStatus() {

    if (justPressed("x")) {

        game.state = "menu";

    }

}


/* =========================================================
   BATTLE START
========================================================= */

function startBattle(count) {

    game.state = "battle";

    game.battle = {

        enemies:[],

        actor:0,

        menu:0,

        phase:"menu",

        rd:0,

        message:"Что будет делать ДЕЛЬТА?",

        soul:{

            x:160,
            y:135,

            speed:2.5,

            invuln:0

        },

        bullets:[],

        laser:null,

        attackTimer:0,

        turnTimer:0

    };


    for (let i=0; i<count; i++) {

        game.battle.enemies.push({

            x:
                count === 1
                    ? 160
                    : 125 + i * 70,

            y:45,

            hp:45,

            maxHP:45,

            alive:true,

            glitch:
                Math.random()

        });

    }

}


/* =========================================================
   BATTLE INPUT
========================================================= */

function updateBattle() {

    const b = game.battle;


    /* =====================
       MENU
    ===================== */

    if (b.phase === "menu") {

        if (justPressed("left")) {

            b.menu--;

            if (b.menu < 0)
                b.menu = 4;

        }

        if (justPressed("right")) {

            b.menu++;

            if (b.menu > 4)
                b.menu = 0;

        }

        if (justPressed("z")) {

            battleChoice();

        }

    }


    /* =====================
       ACT
    ===================== */

    else if (b.phase === "act") {

        if (justPressed("x")) {

            b.phase = "menu";

        }

        if (justPressed("z")) {

            b.message =
                "Вы попытались поговорить с ошибкой.";

            b.rd =
                Math.min(
                    100,
                    b.rd + 10
                );

            nextTurn();

        }

    }


    /* =====================
       ITEM
    ===================== */

    else if (b.phase === "item") {

        if (justPressed("x")) {

            b.phase = "menu";

        }

        if (justPressed("z")) {

            const p = party[b.actor];

            p.hp =
                Math.min(
                    p.maxHP,
                    p.hp + 25
                );

            b.message =
                p.name +
                " восстановил 25 HP.";

            nextTurn();

        }

    }


    /* =====================
       MERCY
    ===================== */

    else if (b.phase === "mercy") {

        if (justPressed("x")) {

            b.phase = "menu";

        }

        if (justPressed("z")) {

            if (b.rd >= 100) {

                b.message =
                    "Ошибка системы исчезла.";

                b.phase = "victory";

            } else {

                b.message =
                    "RD недостаточно.";

                nextTurn();

            }

        }

    }


    /* =====================
       DEFEND
    ===================== */

    else if (b.phase === "defend") {

        /*
           Защита сразу запускает
           фазу уклонения.

           RD растёт именно здесь.
        */

        b.rd =
            Math.min(
                100,
                b.rd + 25
            );

        b.message =
            "ДЕЛЬТА защищается! RD +25%";

        startEnemyAttack(true);

    }


    /* =====================
       ENEMY ATTACK
    ===================== */

    else if (b.phase === "enemy") {

        updateEnemyAttack();

    }


    /* =====================
       VICTORY
    ===================== */

    else if (b.phase === "victory") {

        if (justPressed("z")) {

            game.state = "world";

            game.battle = null;

        }

    }

}


/* =========================================================
   BATTLE CHOICE
========================================================= */

function battleChoice() {

    const b = game.battle;

    if (b.menu === 0) {

        attackEnemy();

    }

    else if (b.menu === 1) {

        b.phase = "act";

    }

    else if (b.menu === 2) {

        b.phase = "item";

    }

    else if (b.menu === 3) {

        b.phase = "defend";

    }

    else if (b.menu === 4) {

        b.phase = "mercy";

    }

}


/* =========================================================
   ATTACK
========================================================= */

function attackEnemy() {

    const b = game.battle;

    const enemy =
        b.enemies.find(e => e.alive);

    if (!enemy) {

        b.phase = "victory";

        return;

    }

    const damage =
        party[b.actor].atk +
        Math.floor(Math.random()*6);

    enemy.hp -= damage;

    b.message =
        party[b.actor].name +
        " атакует! -" +
        damage;

    if (enemy.hp <= 0) {

        enemy.hp = 0;

        enemy.alive = false;

    }

    if (
        b.enemies.every(e => !e.alive)
    ) {

        b.phase = "victory";

        return;

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

        startEnemyAttack(false);

    } else {

        b.phase = "menu";

        b.menu = 0;

        b.message =
            "Ход: " +
            party[b.actor].name;

    }

}


/* =========================================================
   ENEMY ATTACK
========================================================= */

function startEnemyAttack(defended) {

    const b = game.battle;

    b.phase = "enemy";

    b.attackTimer = 300;

    b.bullets = [];

    b.laser = null;

    b.soul.x = 160;
    b.soul.y = 135;

    const alive =
        b.enemies.filter(e => e.alive);

    /*
       ОДНА ОШИБКА
       = ЛАЗЕР
    */

    if (alive.length === 1) {

        const enemy = alive[0];

        const vertical =
            Math.random() < .5;

        b.laser = {

            vertical:vertical,

            warning:100,

            position:
                vertical
                    ? enemy.x
                    : 115 + Math.random()*40,

            damage:10

        };

    }

    /*
       2+ ОШИБКИ
       = ВЗРЫВ И ЧАСТИЦЫ
    */

    else {

        alive.forEach(function(enemy) {

            const cx = enemy.x;
            const cy = enemy.y + 10;

            for (let i=0; i<18; i++) {

                const angle =
                    Math.random() *
                    Math.PI * 2;

                const speed =
                    0.7 +
                    Math.random()*1.5;

                b.bullets.push({

                    x:cx,

                    y:cy,

                    vx:
                        Math.cos(angle) *
                        speed,

                    vy:
                        Math.sin(angle) *
                        speed,

                    size:2.5

                });

            }

        });

    }

}


/* =========================================================
   ENEMY ATTACK UPDATE
========================================================= */

function updateEnemyAttack() {

    const b = game.battle;

    const soul = b.soul;


    if (soul.invuln > 0)
        soul.invuln--;


    /* движение сердца */

    if (keys.up)
        soul.y -= soul.speed;

    if (keys.down)
        soul.y += soul.speed;

    if (keys.left)
        soul.x -= soul.speed;

    if (keys.right)
        soul.x += soul.speed;


    /*
       ГРАНИЦЫ КАК В DELTARUNE
    */

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
            105,
            Math.min(
                160,
                soul.y
            )
        );


    /* лазер */

    if (b.laser) {

        if (b.laser.warning > 0) {

            b.laser.warning--;

        } else {

            let hit = false;

            if (b.laser.vertical) {

                if (
                    Math.abs(
                        soul.x -
                        b.laser.position
                    ) < 5
                )
                    hit = true;

            } else {

                if (
                    Math.abs(
                        soul.y -
                        b.laser.position
                    ) < 5
                )
                    hit = true;

            }

            if (hit)
                damagePlayer();

        }

    }


    /* частицы */

    b.bullets.forEach(function(p) {

        p.x += p.vx;
        p.y += p.vy;

        if (
            Math.abs(p.x-soul.x)<5 &&
            Math.abs(p.y-soul.y)<5
        ) {

            damagePlayer();

        }

    });


    b.attackTimer--;

    if (b.attackTimer <= 0) {

        b.phase = "menu";

        b.message =
            "Ход: " +
            party[b.actor].name;

        b.laser = null;

        b.bullets = [];

    }

}


/* =========================================================
   DAMAGE
========================================================= */

function damagePlayer() {

    const b = game.battle;

    if (b.soul.invuln > 0)
        return;

    const target =
        party[b.actor];

    target.hp =
        Math.max(
            0,
            target.hp - 10
        );

    b.soul.invuln = 50;

    b.message =
        target.name +
        " получил 10 урона!";

    if (
        party.every(p => p.hp <= 0)
    ) {

        b.phase = "victory";

        b.message =
            "Команда потеряла сознание...";

    }

}


/* =========================================================
   DRAW TITLE
========================================================= */

function drawTitle() {

    ctx.fillStyle="#050505";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle="#fff";

    ctx.font="18px monospace";

    ctx.fillText(
        "BLOOD GLOW",
        78,
        55
    );


    ctx.font="7px monospace";

    ctx.fillText(
        "DIGITAL WASTELAND",
        96,
        69
    );


    ctx.font="9px monospace";

    ctx.fillText(
        "▶ НАЧАТЬ",
        110,
        105
    );


    ctx.font="6px monospace";

    ctx.fillText(
        "Z — выбрать",
        120,
        130
    );

}


/* =========================================================
   DRAW SAVE
========================================================= */

function drawSave() {

    ctx.fillStyle="#030303";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        35,
        20,
        250,
        140
    );


    ctx.fillStyle="#fff";

    ctx.font="10px monospace";

    ctx.fillText(
        "СОХРАНЕНИЕ",
        105,
        38
    );


    for (let i=0; i<3; i++) {

        const y =
            65+i*25;

        if (i===game.saveIndex) {

            ctx.fillText(
                "▶",
                55,
                y
            );

        }

        const saved =
            localStorage.getItem(
                "bloodGlow_slot_"+i
            );

        ctx.fillText(
            "ФАЙЛ "+(i+1),
            70,
            y
        );

        ctx.font="5px monospace";

        ctx.fillText(
            saved
                ? "СОХРАНЕНО"
                : "ПУСТО",
            180,
            y
        );

        ctx.font="10px monospace";

    }


    ctx.font="6px monospace";

    ctx.fillText(
        "Z — выбрать файл",
        85,
        145
    );

}


/* =========================================================
   DRAW INTRO
========================================================= */

function drawIntro() {

    ctx.fillStyle="#000";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle="#aaa";

    ctx.font="7px monospace";

    ctx.fillText(
        "ЗАГРУЗКА ЦИФРОВОГО МИРА...",
        75,
        85
    );


    ctx.fillStyle="#fff";

    ctx.fillText(
        "ЦИФРОВАЯ ПУСТОШЬЯ",
        91,
        100
    );


    ctx.font="6px monospace";

    ctx.fillText(
        "Z — продолжить",
        116,
        130
    );

}


/* =========================================================
   DRAW WORLD
========================================================= */

function drawWorld() {

    ctx.fillStyle="#11131a";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /*
       ЦИФРОВАЯ ЗЕМЛЯ
    */

    for (
        let y=10;
        y<170;
        y+=10
    ) {

        ctx.fillStyle =
            y % 20 === 0
                ? "#171b24"
                : "#131720";

        ctx.fillRect(
            8,
            y,
            304,
            9
        );

    }


    /* глитч-линии */

    ctx.fillStyle="#252d3b";

    for (let i=0; i<25; i++) {

        const x =
            Math.random()*310;

        const y =
            10+Math.random()*155;

        ctx.fillRect(
            x,
            y,
            1+Math.random()*7,
            1
        );

    }


    /* стены */

    ctx.fillStyle="#303744";

    wasteland.walls.forEach(function(w) {

        ctx.fillRect(
            w.x,
            w.y,
            w.w,
            w.h
        );

    });


    /* точка сохранения */

    drawSavePoint(
        wasteland.saveX,
        wasteland.saveY
    );


    /* команда */

    followers.forEach(function(f) {

        drawCharacter(
            f.x,
            f.y,
            f.color
        );

    });


    drawCharacter(
        player.x,
        player.y,
        "#fff"
    );


    ctx.fillStyle="#fff";

    ctx.font="7px monospace";

    ctx.fillText(
        "ЦИФРОВАЯ ПУСТОШЬЯ",
        12,
        18
    );


    /*
       первая реплика автоматически
       после запуска мира
    */

    if (!game.introStarted) {

        game.introStarted = true;

        setTimeout(function() {

            if (game.state === "world") {

                game.dialogue =
                    openingDialogue;

                game.dialogueIndex = 0;

                game.state = "dialogue";

            }

        }, 500);

    }

}


/* =========================================================
   CHARACTER
========================================================= */

function drawCharacter(x,y,color) {

    x=Math.floor(x);
    y=Math.floor(y);

    ctx.fillStyle="#000";

    ctx.fillRect(
        x-1,
        y-1,
        11,
        16
    );

    ctx.fillStyle=color;

    ctx.fillRect(
        x+2,
        y,
        6,
        6
    );

    ctx.fillRect(
        x+1,
        y+6,
        8,
        7
    );

    ctx.fillRect(
        x+1,
        y+13,
        3,
        2
    );

    ctx.fillRect(
        x+6,
        y+13,
        3,
        2
    );

}


/* =========================================================
   SAVE POINT
========================================================= */

function drawSavePoint(x,y) {

    ctx.fillStyle="#553c8f";

    ctx.fillRect(
        x,
        y,
        30,
        13
    );


    ctx.fillStyle="#8f72d4";

    ctx.fillRect(
        x+2,
        y-2,
        26,
        7
    );


    /* пицца */

    ctx.fillStyle="#d48b37";

    ctx.fillRect(
        x+7,
        y-4,
        14,
        5
    );

    ctx.fillStyle="#ffd75a";

    ctx.fillRect(
        x+9,
        y-4,
        10,
        3
    );


    ctx.fillStyle="#ff4444";

    ctx.fillRect(
        x+11,
        y-4,
        2,
        2
    );

    ctx.fillRect(
        x+17,
        y-3,
        2,
        2
    );


    ctx.fillStyle="#fff";

    ctx.font="5px monospace";

    ctx.fillText(
        "*",
        x-5,
        y
    );

    ctx.fillText(
        "*",
        x+31,
        y+4
    );

}


/* =========================================================
   DRAW DIALOGUE
========================================================= */

function drawDialogue() {

    ctx.fillStyle="rgba(0,0,0,.7)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle="#050505";

    ctx.fillRect(
        12,
        105,
        296,
        62
    );


    ctx.strokeStyle="#fff";

    ctx.lineWidth=2;

    ctx.strokeRect(
        12,
        105,
        296,
        62
    );


    const d =
        game.dialogue[
            game.dialogueIndex
        ];


    ctx.fillStyle="#fff";

    ctx.font="8px monospace";

    ctx.fillText(
        d.name,
        23,
        120
    );


    ctx.font="7px monospace";

    wrapText(
        d.text,
        23,
        134,
        270,
        9
    );


    ctx.font="5px monospace";

    ctx.fillText(
        "Z — далее",
        245,
        160
    );

}


/* =========================================================
   WRAP TEXT
========================================================= */

function wrapText(
    text,
    x,
    y,
    width,
    lineHeight
) {

    const words =
        text.split(" ");

    let line="";

    for (const word of words) {

        const test =
            line +
            word +
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

            y += lineHeight;

            line =
                word + " ";

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
   DRAW MENU
========================================================= */

function drawMenu() {

    ctx.fillStyle="#050505";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        25,
        15,
        270,
        150
    );


    ctx.fillStyle="#fff";

    ctx.font="11px monospace";

    ctx.fillText(
        "MENU",
        45,
        35
    );


    menuItems.forEach(function(item,i) {

        const y =
            65+i*23;

        if (i===game.menuIndex) {

            ctx.fillText(
                "▶",
                55,
                y
            );

        }

        ctx.fillText(
            item,
            75,
            y
        );

    });


    ctx.font="6px monospace";

    ctx.fillText(
        "Z — выбрать",
        45,
        153
    );

    ctx.fillText(
        "X — назад",
        220,
        153
    );

}


/* =========================================================
   DRAW STATUS
========================================================= */

function drawStatus() {

    ctx.fillStyle="#050505";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle="#fff";

    ctx.font="11px monospace";

    ctx.fillText(
        "STATUS",
        35,
        30
    );


    party.forEach(function(p,i) {

        const y =
            52+i*22;

        ctx.fillStyle=p.color;

        ctx.fillText(
            p.name,
            40,
            y
        );

        ctx.fillStyle="#fff";

        ctx.fillText(
            "HP "+p.hp+"/"+p.maxHP,
            135,
            y
        );

    });


    ctx.font="6px monospace";

    ctx.fillText(
        "X — назад",
        220,
        155
    );

}


/* =========================================================
   DRAW BATTLE
========================================================= */

function drawBattle() {

    const b =
        game.battle;


    ctx.fillStyle="#050505";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /*
       ВРАГИ
    */

    b.enemies.forEach(function(enemy) {

        if (!enemy.alive)
            return;

        drawGlitchEnemy(
            enemy.x,
            enemy.y
        );

    });


    /*
       ИМЯ
    */

    ctx.fillStyle="#fff";

    ctx.font="6px monospace";

    ctx.fillText(
        b.enemies.length === 1
            ? "ОШИБКА СИСТЕМЫ"
            : "ОШИБКИ СИСТЕМЫ",
        12,
        14
    );


    /*
       СООБЩЕНИЕ
    */

    ctx.fillText(
        b.message,
        12,
        26
    );


    /*
       БОЕВАЯ ОБЛАСТЬ
    */

    ctx.strokeStyle="#fff";

    ctx.lineWidth=2;

    ctx.strokeRect(
        45,
        92,
        230,
        72
    );


    /*
       ВРАЖЕСКИЕ АТАКИ
    */

    if (b.phase === "enemy") {

        drawEnemyAttack(b);

    }


    /*
       СЕРДЦЕ
    */

    if (
        b.phase === "enemy"
    ) {

        ctx.fillStyle="#ff3333";

        ctx.fillRect(
            b.soul.x-3,
            b.soul.y-3,
            6,
            6
        );

    }


    /*
       RD
    */

    drawRD();


    /*
       КОМАНДА
    */

    drawBattleParty();


    /*
       МЕНЮ
    */

    if (b.phase === "menu") {

        drawBattleButtons();

    }


    if (b.phase === "act") {

        drawAct();

    }


    if (b.phase === "item") {

        drawItem();

    }


    if (b.phase === "mercy") {

        drawMercy();

    }


    if (b.phase === "victory") {

        ctx.fillStyle="#fff";

        ctx.font="12px monospace";

        ctx.fillText(
            "ПОБЕДА!",
            130,
            70
        );

        ctx.font="6px monospace";

        ctx.fillText(
            "Z — продолжить",
            115,
            83
        );

    }

}


/* =========================================================
   GLITCH ENEMY
========================================================= */

function drawGlitchEnemy(x,y) {

    ctx.fillStyle="#161616";

    ctx.fillRect(
        x-17,
        y-16,
        34,
        32
    );


    ctx.fillStyle="#5c62ff";

    ctx.fillRect(
        x-13,
        y-12,
        26,
        24
    );


    ctx.fillStyle="#fff";

    ctx.fillRect(
        x-8,
        y-5,
        5,
        5
    );

    ctx.fillRect(
        x+3,
        y-5,
        5,
        5
    );


    /*
       глитч-полосы
    */

    ctx.fillStyle="#ff44dd";

    ctx.fillRect(
        x-19,
        y+5,
        12,
        2
    );

    ctx.fillRect(
        x+7,
        y-9,
        16,
        2
    );

    ctx.fillStyle="#44ffff";

    ctx.fillRect(
        x-10,
        y+11,
        20,
        2
    );

}


/* =========================================================
   ENEMY ATTACK
========================================================= */

function drawEnemyAttack(b) {

    /*
       ОДИН ВРАГ — ЛАЗЕР
    */

    if (b.laser) {

        if (b.laser.warning > 0) {

            ctx.save();

            ctx.globalAlpha =
                .25 +
                Math.sin(
                    Date.now()/70
                )*.2;

            ctx.strokeStyle="#ff3333";

            ctx.lineWidth=1;

            ctx.setLineDash([4,3]);

            if (b.laser.vertical) {

                ctx.beginPath();

                ctx.moveTo(
                    b.laser.position,
                    92
                );

                ctx.lineTo(
                    b.laser.position,
                    164
                );

                ctx.stroke();

            } else {

                ctx.beginPath();

                ctx.moveTo(
                    45,
                    b.laser.position
                );

                ctx.lineTo(
                    275,
                    b.laser.position
                );

                ctx.stroke();

            }

            ctx.restore();


            ctx.fillStyle="#ff5555";

            ctx.font="6px monospace";

            ctx.fillText(
                "ОПАСНОСТЬ",
                135,
                105
            );

        } else {

            ctx.strokeStyle="#ff1111";

            ctx.lineWidth=5;

            if (b.laser.vertical) {

                ctx.beginPath();

                ctx.moveTo(
                    b.laser.position,
                    92
                );

                ctx.lineTo(
                    b.laser.position,
                    164
                );

                ctx.stroke();

            } else {

                ctx.beginPath();

                ctx.moveTo(
                    45,
                    b.laser.position
                );

                ctx.lineTo(
                    275,
                    b.laser.position
                );

                ctx.stroke();

            }

        }

    }


    /*
       2+ ВРАГА — ЧАСТИЦЫ
    */

    b.bullets.forEach(function(p) {

        ctx.fillStyle="#55ffff";

        ctx.fillRect(
            p.x-p.size,
            p.y-p.size,
            p.size*2,
            p.size*2
        );

    });

}


/* =========================================================
   RD
========================================================= */

function drawRD() {

    const b =
        game.battle;

    const x=286;
    const y=90;
    const w=15;
    const h=74;


    /*
       рамка
    */

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        x,
        y,
        w,
        h
    );


    /*
       фон
    */

    ctx.fillStyle="#171717";

    ctx.fillRect(
        x+2,
        y+2,
        w-4,
        h-4
    );


    /*
       заполнение снизу
    */

    const amount =
        (h-4) *
        (b.rd/100);

    ctx.fillStyle="#ffd83d";

    ctx.fillRect(
        x+2,
        y+h-2-amount,
        w-4,
        amount
    );


    ctx.fillStyle="#fff";

    ctx.font="5px monospace";

    ctx.save();

    ctx.translate(
        x+12,
        y+58
    );

    ctx.rotate(
        -Math.PI/2
    );

    ctx.fillText(
        "RD "+Math.floor(b.rd)+"%",
        0,
        0
    );

    ctx.restore();

}


/* =========================================================
   PARTY IN BATTLE
========================================================= */

function drawBattleParty() {

    const b =
        game.battle;


    party.forEach(function(p,i) {

        const y =
            104+i*11;


        if (
            i === b.actor &&
            b.phase === "menu"
        ) {

            ctx.fillStyle="#fff";

            ctx.fillText(
                "▶",
                2,
                y
            );

        }


        ctx.fillStyle=p.color;

        ctx.font="5.5px monospace";

        ctx.fillText(
            p.name,
            9,
            y
        );


        ctx.fillStyle="#fff";

        ctx.fillText(
            p.hp+"/"+p.maxHP,
            62,
            y
        );


        ctx.fillStyle="#333";

        ctx.fillRect(
            93,
            y-5,
            38,
            4
        );


        ctx.fillStyle="#fff";

        ctx.fillRect(
            93,
            y-5,
            38 *
            Math.max(
                0,
                p.hp/p.maxHP
            ),
            4
        );

    });

}


/* =========================================================
   BATTLE BUTTONS
========================================================= */

function drawBattleButtons() {

    const labels = [

        "FIGHT",
        "ACT",
        "ITEM",
        "DEFEND",
        "MERCY"

    ];


    labels.forEach(function(label,i) {

        const x =
            145 +
            (i%2)*62;

        const y =
            108 +
            Math.floor(i/2)*20;


        if (i===4) {

            /* mercy ниже */

        }


        if (i===game.battle.menu) {

            ctx.strokeStyle="#fff";

            ctx.strokeRect(
                x-5,
                y-8,
                55,
                15
            );

        }


        ctx.fillStyle="#fff";

        ctx.font="6px monospace";

        ctx.fillText(
            label,
            x,
            y+2
        );

    });

}


/* =========================================================
   ACT
========================================================= */

function drawAct() {

    ctx.fillStyle="#fff";

    ctx.font="7px monospace";

    ctx.fillText(
        "ACT",
        155,
        108
    );

    ctx.font="6px monospace";

    ctx.fillText(
        "▶ ПОГОВОРИТЬ",
        155,
        122
    );

    ctx.fillText(
        "ОСМОТРЕТЬ",
        155,
        134
    );

    ctx.fillText(
        "УСПОКОИТЬ",
        155,
        146
    );

    ctx.fillText(
        "X — назад",
        210,
        158
    );

}


/* =========================================================
   ITEM
========================================================= */

function drawItem() {

    ctx.fillStyle="#fff";

    ctx.font="7px monospace";

    ctx.fillText(
        "ITEM",
        155,
        108
    );

    ctx.fillText(
        "POTION  +25 HP",
        155,
        125
    );

    ctx.fillText(
        "Z — использовать",
        155,
        142
    );

    ctx.fillText(
        "X — назад",
        210,
        158
    );

}


/* =========================================================
   MERCY
========================================================= */

function drawMercy() {

    ctx.fillStyle="#fff";

    ctx.font="7px monospace";

    ctx.fillText(
        "MERCY",
        155,
        108
    );

    ctx.fillText(
        "ПОЩАДИТЬ",
        155,
        125
    );

    ctx.fillStyle =
        game.battle.rd >= 100
            ? "#ffd83d"
            : "#888";

    ctx.fillText(
        game.battle.rd >= 100
            ? "ГОТОВО!"
            : "RD НЕ ХВАТАЕТ",
        155,
        140
    );

    ctx.fillStyle="#fff";

    ctx.fillText(
        "Z — выбрать",
        155,
        155
    );

}


/* =========================================================
   MAIN UPDATE
========================================================= */

function update() {

    if (game.state === "title") {

        if (justPressed("z")) {

            startGame();

        }

    }

    else if (game.state === "save") {

        updateSave();

    }

    else if (game.state === "intro") {

        updateIntro();

    }

    else if (game.state === "dialogue") {

        updateDialogue();

    }

    else if (game.state === "world") {

        updateWorld();

    }

    else if (game.state === "menu") {

        updateMenu();

    }

    else if (game.state === "status") {

        updateStatus();

    }

    else if (game.state === "battle") {

        updateBattle();

    }


    if (game.messageTimer > 0)
        game.messageTimer--;


    /*
       сохраняем старое состояние клавиш
    */

    for (const key in keys) {

        oldKeys[key] = keys[key];

    }

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


    if (game.state === "title") {

        drawTitle();

    }

    else if (game.state === "save") {

        drawSave();

    }

    else if (game.state === "intro") {

        drawIntro();

    }

    else if (game.state === "dialogue") {

        drawWorld();

        drawDialogue();

    }

    else if (game.state === "world") {

        drawWorld();

    }

    else if (game.state === "menu") {

        drawMenu();

    }

    else if (game.state === "status") {

        drawStatus();

    }

    else if (game.state === "battle") {

        drawBattle();

    }


    /*
       сообщение от ITEM
    */

    if (
        game.messageTimer > 0
    ) {

        ctx.fillStyle="#fff";

        ctx.font="6px monospace";

        ctx.fillText(
            "В инвентаре пока ничего не изменилось.",
            45,
            170
        );

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
