"use strict";

/* =====================================================
   CANVAS
===================================================== */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = 320;
const H = 180;


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

    } catch(error) {

        console.log("Fullscreen error:", error);

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
    c: false,

    run: false

};

const previous = {

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
   MOBILE BUTTONS
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


document.querySelectorAll(".action-button").forEach(function(button) {

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
   RUN
===================================================== */

const runIndicator =
    document.getElementById("run-indicator");

let runPointer = null;

canvas.addEventListener("pointerdown", function(e) {

    runPointer = e.pointerId;

    keys.run = true;

    runIndicator.classList.add("active");

});

canvas.addEventListener("pointerup", function(e) {

    if (e.pointerId !== runPointer)
        return;

    runPointer = null;

    keys.run = false;

    runIndicator.classList.remove("active");

});

canvas.addEventListener("pointercancel", function() {

    runPointer = null;

    keys.run = false;

    runIndicator.classList.remove("active");

});


/* =====================================================
   GAME
===================================================== */

const game = {

    mode: "explore",

    room: "room1",

    dialogue: null,

    dialogueIndex: 0,

    menuPage: "main",

    menuIndex: 0,

    transition: 0,

    battle: null,

    firstBattleDone: false

};


/* =====================================================
   PARTY
===================================================== */

const party = [

    {
        name: "ДЕЛЬТА",
        color: "#ffffff",

        hp: 90,
        maxHP: 90,

        atk: 14,
        def: 8
    },

    {
        name: "НЕМКА",
        color: "#ff5555",

        hp: 100,
        maxHP: 100,

        atk: 11,
        def: 9
    },

    {
        name: "ЛИЧИ",
        color: "#55aaff",

        hp: 80,
        maxHP: 80,

        atk: 13,
        def: 6
    },

    {
        name: "ПАНКЕЙК",
        color: "#55dd66",

        hp: 70,
        maxHP: 70,

        atk: 10,
        def: 11
    },

    {
        name: "КАШТАН",
        color: "#cc8844",

        hp: 110,
        maxHP: 110,

        atk: 12,
        def: 12
    }

];


/* =====================================================
   PLAYER
===================================================== */

const player = {

    x: 145,
    y: 120,

    width: 10,
    height: 14,

    direction: "down"

};


/* =====================================================
   FOLLOWERS
===================================================== */

const followers = [

    {
        x: 130,
        y: 120,
        color: "#ff5555"
    },

    {
        x: 115,
        y: 120,
        color: "#55aaff"
    },

    {
        x: 100,
        y: 120,
        color: "#55dd66"
    },

    {
        x: 85,
        y: 120,
        color: "#cc8844"
    }

];


/* =====================================================
   ROOMS
===================================================== */

const rooms = {

    room1: {

        name: "НАЧАЛО",

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

            color: "#ffff55",

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

        name: "ТЁМНАЯ КОМНАТА",

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


/* =====================================================
   DIALOGUES
===================================================== */

const dialogues = {

    "Странный человек": [

        "Эй...",

        "Дельта.",

        "Так это ты ведёшь этот отряд?",

        "Немка, Личи, Панкейк и Каштан.",

        "Интересная команда.",

        "Вам лучше идти дальше."

    ],

    "Таинственная девушка": [

        "Вы наконец пришли.",

        "Я ждала именно вас.",

        "Дельта...",

        "Ты ещё не знаешь, что происходит.",

        "Но скоро узнаешь."

    ]

};


/* =====================================================
   COLLISION
===================================================== */

function overlap(a,b) {

    return (

        a.x < b.x + b.w &&
        a.x + a.width > b.x &&
        a.y < b.y + b.h &&
        a.y + a.height > b.y

    );

}


function canMove(x,y) {

    const test = {

        x:x,
        y:y,

        width:player.width,
        height:player.height

    };

    for (const wall of rooms[game.room].walls) {

        if (overlap(test,wall))
            return false;

    }

    return true;

}


/* =====================================================
   PLAYER
===================================================== */

function updatePlayer() {

    if (game.mode !== "explore")
        return;

    let dx = 0;
    let dy = 0;

    const speed =
        keys.run ? 2.7 : 1.4;

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

    if (
        canMove(
            player.x + dx,
            player.y
        )
    )
        player.x += dx;

    if (
        canMove(
            player.x,
            player.y + dy
        )
    )
        player.y += dy;

}


/* =====================================================
   FOLLOWERS
===================================================== */

function updateFollowers() {

    if (game.mode !== "explore")
        return;

    const targets = [

        {
            x:player.x - 15,
            y:player.y
        },

        {
            x:player.x - 30,
            y:player.y
        },

        {
            x:player.x - 45,
            y:player.y
        },

        {
            x:player.x - 60,
            y:player.y
        }

    ];

    followers.forEach(function(f,i) {

        const target = targets[i];

        const dx = target.x - f.x;
        const dy = target.y - f.y;

        const distance =
            Math.sqrt(
                dx*dx + dy*dy
            );

        if (distance > 2) {

            f.x += dx * .08;
            f.y += dy * .08;

        }

    });

}


/* =====================================================
   NPC
===================================================== */

function npcDistance() {

    const npc =
        rooms[game.room].npc;

    const dx =
        player.x - npc.x;

    const dy =
        player.y - npc.y;

    return Math.sqrt(dx*dx + dy*dy);

}


function updateNPC() {

    if (game.mode !== "explore")
        return;

    if (
        npcDistance() < 25 &&
        keys.z &&
        !previous.z
    ) {

        startDialogue(
            rooms[game.room].npc.name
        );

    }

}


/* =====================================================
   DIALOGUE
===================================================== */

function startDialogue(name) {

    if (!dialogues[name])
        return;

    game.mode = "dialogue";

    game.dialogue =
        dialogues[name];

    game.dialogueIndex = 0;

}


function updateDialogue() {

    if (game.mode !== "dialogue")
        return;

    if (
        keys.x &&
        !previous.x
    ) {

        closeDialogue();

        return;

    }

    if (
        keys.z &&
        !previous.z
    ) {

        game.dialogueIndex++;

        if (
            game.dialogueIndex >=
            game.dialogue.length
        ) {

            closeDialogue();

        }

    }

}


function closeDialogue() {

    game.dialogue = null;

    game.dialogueIndex = 0;

    game.mode = "explore";

}


/* =====================================================
   EXIT
===================================================== */

function updateExit() {

    if (game.mode !== "explore")
        return;

    const room =
        rooms[game.room];

    if (
        overlap(
            player,
            room.exit
        )
    ) {

        game.room =
            room.exit.target;

        game.transition = 20;

        if (game.room === "room1") {

            player.x = 275;
            player.y = 90;

        }

        else {

            player.x = 30;
            player.y = 90;

            /* FIRST STORY BATTLE */

            if (!game.firstBattleDone) {

                setTimeout(function() {

                    startFirstBattle();

                },500);

            }

        }

    }

}


/* =====================================================
   RANDOM BATTLES
===================================================== */

let stepCounter = 0;

function randomBattleCheck() {

    if (game.mode !== "explore")
        return;

    /*
       Первый сюжетный бой должен
       произойти раньше случайных.
    */

    if (!game.firstBattleDone)
        return;

    if (
        keys.up ||
        keys.down ||
        keys.left ||
        keys.right
    ) {

        stepCounter++;

        if (stepCounter >= 500) {

            stepCounter = 0;

            if (Math.random() < .25) {

                startBattle();

            }

        }

    }

}


/* =====================================================
   FIRST BATTLE
===================================================== */

function startFirstBattle() {

    if (game.firstBattleDone)
        return;

    game.mode = "battle";

    game.battle = {

        enemy: {

            name: "ТЕНЕВОЙ ЗВЕРЬ",

            hp: 80,

            maxHP: 80,

            attack: 8,

            color: "#6633aa"

        },

        phase: "menu",

        actor: 0,

        menu: 0,

        message:
            "Перед вами появился Теневой зверь.",

        soul: {

            x:160,
            y:125,

            size:5,

            speed:2.5,

            damageCooldown:0

        },

        bullets: [],

        enemyTimer:0,

        firstBattle:true

    };

}


/* =====================================================
   NORMAL BATTLE
===================================================== */

function startBattle() {

    game.mode = "battle";

    game.battle = {

        enemy: {

            name:"ТЕНЕВОЙ ЗВЕРЬ",

            hp:180,

            maxHP:180,

            attack:12,

            color:"#aa55ff"

        },

        phase:"menu",

        actor:0,

        menu:0,

        message:
            "Что будет делать ДЕЛЬТА?",

        soul: {

            x:160,
            y:125,

            size:5,

            speed:2.5,

            damageCooldown:0

        },

        bullets:[],

        enemyTimer:0,

        firstBattle:false

    };

}


/* =====================================================
   BATTLE UPDATE
===================================================== */

function updateBattle() {

    const b =
        game.battle;

    if (!b)
        return;


    /* MENU */

    if (b.phase === "menu") {

        if (
            keys.left &&
            !previous.x
        ) {

            b.menu--;

            if (b.menu < 0)
                b.menu = 3;

        }

        if (
            keys.right &&
            !previous.x
        ) {

            b.menu++;

            if (b.menu > 3)
                b.menu = 0;

        }

        if (
            keys.z &&
            !previous.z
        ) {

            chooseBattleAction();

        }

    }


    /* ACT */

    else if (b.phase === "act") {

        if (
            keys.x &&
            !previous.x
        ) {

            b.phase = "menu";

        }

        if (
            keys.z &&
            !previous.z
        ) {

            b.enemy.hp -= 10;

            b.message =
                "Вы поговорили с врагом.";

            afterAction();

        }

    }


    /* ITEM */

    else if (b.phase === "item") {

        if (
            keys.x &&
            !previous.x
        ) {

            b.phase = "menu";

        }

        if (
            keys.z &&
            !previous.z
        ) {

            const target =
                party[b.actor];

            if (
                target.hp <
                target.maxHP
            ) {

                target.hp =
                    Math.min(
                        target.maxHP,
                        target.hp + 35
                    );

                b.message =
                    target.name +
                    " восстановил 35 HP!";

                afterAction();

            }

            else {

                b.message =
                    "HP уже заполнено.";

            }

        }

    }


    /* MERCY */

    else if (b.phase === "mercy") {

        if (
            keys.x &&
            !previous.x
        ) {

            b.phase = "menu";

        }

        if (
            keys.z &&
            !previous.z
        ) {

            if (b.enemy.hp <= 35) {

                b.enemy.hp = 0;

                b.message =
                    "Враг был пощажён.";

                b.phase = "victory";

            }

            else {

                b.message =
                    "Враг ещё не готов.";

                afterAction();

            }

        }

    }


    /* ENEMY */

    else if (b.phase === "enemy") {

        updateSoul();

        updateBullets();

        if (b.enemyTimer > 0) {

            b.enemyTimer--;

        }

        else {

            endEnemyPhase();

        }

    }


    /* VICTORY */

    else if (b.phase === "victory") {

        if (
            keys.z &&
            !previous.z
        ) {

            game.mode = "explore";

            game.battle = null;

        }

    }


    /* DEFEAT */

    else if (b.phase === "defeat") {

        if (
            keys.z &&
            !previous.z
        ) {

            resetParty();

            game.mode = "explore";

            game.battle = null;

        }

    }

}


/* =====================================================
   BATTLE ACTION
===================================================== */

function chooseBattleAction() {

    const b =
        game.battle;

    const actor =
        party[b.actor];


    /* FIGHT */

    if (b.menu === 0) {

        const damage =
            actor.atk +
            Math.floor(
                Math.random() * 7
            );

        b.enemy.hp -= damage;

        b.message =
            actor.name +
            " атакует! -" +
            damage +
            " HP";

        afterAction();

    }


    /* ACT */

    else if (b.menu === 1) {

        b.phase = "act";

    }


    /* ITEM */

    else if (b.menu === 2) {

        b.phase = "item";

    }


    /* MERCY */

    else if (b.menu === 3) {

        b.phase = "mercy";

    }

}


/* =====================================================
   AFTER CHARACTER ACTION
===================================================== */

function afterAction() {

    const b =
        game.battle;


    if (b.enemy.hp <= 0) {

        b.enemy.hp = 0;

        b.phase = "victory";

        if (b.firstBattle) {

            b.message =
                "Теневой зверь исчез...";

            game.firstBattleDone = true;

        }

        else {

            b.message =
                "Враг побеждён!";

        }

        return;

    }


    /*
       Следующий персонаж
    */

    b.actor++;

    if (
        b.actor >= party.length
    ) {

        b.actor = 0;

        startEnemyPhase();

    }

    else {

        b.phase = "menu";

        b.menu = 0;

        b.message =
            "Ход: " +
            party[b.actor].name;

    }

}


/* =====================================================
   ENEMY PHASE
===================================================== */

function startEnemyPhase() {

    const b =
        game.battle;

    b.phase = "enemy";

    b.enemyTimer = 480;

    b.bullets = [];

    b.soul.x = 160;
    b.soul.y = 125;

    for (
        let i=0;
        i<7;
        i++
    ) {

        b.bullets.push({

            x:
                55 +
                Math.random()*210,

            y:
                -10 -
                Math.random()*80,

            speed:
                1 +
                Math.random()*1.6,

            size:4

        });

    }

}


/* =====================================================
   SOUL
===================================================== */

function updateSoul() {

    const b =
        game.battle;

    const soul =
        b.soul;

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
            90,
            Math.min(
                155,
                soul.y
            )
        );


    if (
        soul.damageCooldown > 0
    )
        soul.damageCooldown--;

}


/* =====================================================
   BULLETS
===================================================== */

function updateBullets() {

    const b =
        game.battle;

    const soul =
        b.soul;

    b.bullets.forEach(function(bullet) {

        bullet.y += bullet.speed;

        if (bullet.y > 165) {

            bullet.y = -10;

            bullet.x =
                50 +
                Math.random()*220;

        }


        const dx =
            bullet.x - soul.x;

        const dy =
            bullet.y - soul.y;

        const distance =
            Math.sqrt(
                dx*dx +
                dy*dy
            );


        if (
            distance <
            bullet.size +
            soul.size
        ) {

            if (
                soul.damageCooldown <= 0
            ) {

                const target =
                    party[b.actor];

                target.hp -= 10;

                soul.damageCooldown =
                    45;

                b.message =
                    target.name +
                    " получил 10 урона!";

                if (target.hp <= 0) {

                    target.hp = 0;

                    checkDefeat();

                }

            }

        }

    });

}


/* =====================================================
   END ENEMY PHASE
===================================================== */

function endEnemyPhase() {

    const b =
        game.battle;

    b.actor = 0;

    b.phase = "menu";

    b.menu = 0;

    b.message =
        "Ход: ДЕЛЬТА";

}


/* =====================================================
   DEFEAT
===================================================== */

function checkDefeat() {

    let alive = false;

    party.forEach(function(p) {

        if (p.hp > 0)
            alive = true;

    });

    if (!alive) {

        game.battle.phase =
            "defeat";

    }

}


/* =====================================================
   RESET PARTY
===================================================== */

function resetParty() {

    party.forEach(function(p) {

        p.hp = p.maxHP;

    });

}


/* =====================================================
   DRAW ROOM
===================================================== */

function drawRoom() {

    const room =
        rooms[game.room];

    ctx.fillStyle =
        room.floor;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle =
        "#252525";


    for (
        let y=10;
        y<172;
        y+=16
    ) {

        for (
            let x=10;
            x<312;
            x+=16
        ) {

            ctx.fillRect(
                x,
                y,
                1,
                1
            );

        }

    }


    ctx.fillStyle =
        "#555";


    room.walls.forEach(function(w) {

        ctx.fillRect(
            w.x,
            w.y,
            w.w,
            w.h
        );

    });


    ctx.fillStyle =
        "#663333";

    ctx.fillRect(
        room.exit.x,
        room.exit.y,
        room.exit.w,
        room.exit.h
    );

}


/* =====================================================
   CHARACTER DRAW
===================================================== */

function drawCharacter(x,y,color) {

    x = Math.round(x);
    y = Math.round(y);

    ctx.fillStyle = "#000";

    ctx.fillRect(
        x-1,
        y-1,
        12,
        16
    );

    ctx.fillStyle = color;

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


/* =====================================================
   EXPLORE DRAW
===================================================== */

function drawExplore() {

    drawRoom();

    const npc =
        rooms[game.room].npc;


    drawCharacter(
        npc.x,
        npc.y,
        npc.color
    );


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


    ctx.fillStyle = "#fff";

    ctx.font =
        "6px monospace";

    ctx.fillText(
        rooms[game.room].name,
        12,
        18
    );


    if (
        npcDistance() < 25
    ) {

        ctx.fillStyle =
            "#000";

        ctx.fillRect(
            95,
            145,
            130,
            18
        );

        ctx.strokeStyle =
            "#fff";

        ctx.strokeRect(
            95,
            145,
            130,
            18
        );

        ctx.fillStyle =
            "#fff";

        ctx.fillText(
            "Z — ГОВОРИТЬ",
            115,
            156
        );

    }

}


/* =====================================================
   WRAPPED TEXT
===================================================== */

function drawWrappedText(
    text,
    x,
    y,
    maxWidth,
    lineHeight
) {

    const words =
        text.split(" ");

    let line = "";

    for (
        let i=0;
        i<words.length;
        i++
    ) {

        const test =
            line +
            words[i] +
            " ";

        if (
            ctx.measureText(test).width >
            maxWidth &&
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
   DIALOGUE DRAW
===================================================== */

function drawDialogue() {

    ctx.fillStyle =
        "rgba(0,0,0,.5)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle =
        "#000";

    ctx.fillRect(
        12,
        112,
        296,
        55
    );


    ctx.strokeStyle =
        "#fff";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        12,
        112,
        296,
        55
    );


    ctx.fillStyle =
        "#fff";

    ctx.font =
        "7px monospace";


    drawWrappedText(
        game.dialogue[
            game.dialogueIndex
        ],
        23,
        132,
        270,
        10
    );


    ctx.font =
        "6px monospace";

    ctx.fillText(
        "Z — далее",
        230,
        157
    );

    ctx.fillText(
        "X — закрыть",
        230,
        164
    );

}


/* =====================================================
   BATTLE DRAW
===================================================== */

function drawBattle() {

    const b =
        game.battle;


    ctx.fillStyle =
        "#050505";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* ENEMY */

    ctx.fillStyle =
        "#101010";

    ctx.fillRect(
        0,
        0,
        320,
        75
    );


    ctx.strokeStyle =
        "#777";

    ctx.strokeRect(
        20,
        8,
        280,
        60
    );


    drawEnemy(
        160,
        38,
        b.enemy.color
    );


    ctx.fillStyle =
        "#fff";

    ctx.font =
        "7px monospace";

    ctx.fillText(
        b.enemy.name,
        27,
        20
    );


    ctx.fillText(
        "HP",
        225,
        20
    );


    drawHPBar(
        240,
        15,
        48,
        6,
        b.enemy.hp,
        b.enemy.maxHP
    );


    ctx.fillText(
        b.enemy.hp +
        "/" +
        b.enemy.maxHP,
        240,
        31
    );


    /* MESSAGE */

    if (b.message) {

        ctx.fillStyle =
            "#fff";

        ctx.font =
            "6px monospace";

        drawWrappedText(
            b.message,
            35,
            84,
            250,
            8
        );

    }


    /* ENEMY ATTACK */

    if (b.phase === "enemy") {

        drawEnemyBox();

    }


    /* VICTORY */

    if (b.phase === "victory") {

        ctx.fillStyle =
            "#fff";

        ctx.font =
            "11px monospace";

        ctx.fillText(
            "ПОБЕДА!",
            125,
            105
        );

        ctx.font =
            "7px monospace";

        ctx.fillText(
            "Z — продолжить",
            105,
            125
        );

        return;

    }


    /* DEFEAT */

    if (b.phase === "defeat") {

        ctx.fillStyle =
            "#fff";

        ctx.font =
            "10px monospace";

        ctx.fillText(
            "ОТРЯД ПОБЕЖДЁН",
            90,
            105
        );

        ctx.font =
            "7px monospace";

        ctx.fillText(
            "Z — восстановиться",
            95,
            125
        );

        return;

    }


    drawBattleParty();

    drawBattleMenu();

}


/* =====================================================
   ENEMY
===================================================== */

function drawEnemy(x,y,color) {

    ctx.fillStyle =
        "#000";

    ctx.fillRect(
        x-18,
        y-22,
        36,
        44
    );


    ctx.fillStyle =
        color;

    ctx.fillRect(
        x-14,
        y-18,
        28,
        32
    );


    ctx.fillStyle =
        "#fff";

    ctx.fillRect(
        x-8,
        y-8,
        5,
        5
    );

    ctx.fillRect(
        x+3,
        y-8,
        5,
        5
    );

}


/* =====================================================
   HP BAR
===================================================== */

function drawHPBar(
    x,
    y,
    w,
    h,
    hp,
    max
) {

    ctx.fillStyle =
        "#333";

    ctx.fillRect(
        x,
        y,
        w,
        h
    );


    const amount =
        Math.max(
            0,
            hp / max
        );


    ctx.fillStyle =
        "#fff";

    ctx.fillRect(
        x,
        y,
        w * amount,
        h
    );

}


/* =====================================================
   BATTLE PARTY
===================================================== */

function drawBattleParty() {

    /*
       Все 5 персонажей подписаны.
       У каждого отображается текущее HP
       и максимальное HP.
    */

    ctx.font =
        "5.5px monospace";


    party.forEach(function(p,i) {

        const y =
            105 + i * 12;


        /* NAME */

        ctx.fillStyle =
            p.color;

        ctx.fillText(
            p.name,
            8,
            y
        );


        /* HP TEXT */

        ctx.fillStyle =
            "#fff";

        ctx.fillText(
            "HP",
            72,
            y
        );


        /* HP BAR */

        drawHPBar(
            88,
            y-5,
            35,
            5,
            p.hp,
            p.maxHP
        );


        /* NUMBERS */

        ctx.fillText(
            p.hp +
            "/" +
            p.maxHP,
            128,
            y
        );


        /*
           ARROW — чей сейчас ход
        */

        if (
            i === game.battle.actor &&
            game.battle.phase === "menu"
        ) {

            ctx.fillText(
                "▶",
                2,
                y
            );

        }

    });

}


/* =====================================================
   BATTLE MENU
===================================================== */

function drawBattleMenu() {

    const b =
        game.battle;


    if (b.phase === "menu") {

        const labels = [

            "FIGHT",
            "ACT",
            "ITEM",
            "MERCY"

        ];


        labels.forEach(function(label,i) {

            const x =
                175 +
                (i % 2) * 65;

            const y =
                108 +
                Math.floor(i / 2) * 24;


            if (i === b.menu) {

                ctx.strokeStyle =
                    "#fff";

                ctx.strokeRect(
                    x-7,
                    y-9,
                    55,
                    16
                );

            }


            ctx.fillStyle =
                "#fff";

            ctx.font =
                "6px monospace";

            ctx.fillText(
                label,
                x,
                y+2
            );

        });

    }


    if (b.phase === "act") {

        ctx.fillStyle =
            "#fff";

        ctx.font =
            "7px monospace";

        ctx.fillText(
            "ACT",
            190,
            106
        );

        ctx.fillText(
            "ПОГОВОРИТЬ",
            190,
            122
        );

        ctx.fillText(
            "ОСМОТРЕТЬ",
            190,
            138
        );

        ctx.fillText(
            "Z — выбрать",
            190,
            155
        );

    }


    if (b.phase === "item") {

        ctx.fillStyle =
            "#fff";

        ctx.font =
            "7px monospace";

        ctx.fillText(
            "ITEM",
            190,
            106
        );

        ctx.fillText(
            "POTION +35 HP",
            190,
            122
        );

        ctx.fillText(
            "Z — использовать",
            190,
            138
        );

        ctx.fillText(
            "X — назад",
            190,
            153
        );

    }


    if (b.phase === "mercy") {

        ctx.fillStyle =
            "#fff";

        ctx.font =
            "7px monospace";

        ctx.fillText(
            "MERCY",
            190,
            106
        );

        ctx.fillText(
            "ПОЩАДИТЬ",
            190,
            122
        );

        ctx.fillText(
            "Z — выбрать",
            190,
            138
        );

        ctx.fillText(
            "X — назад",
            190,
            153
        );

    }

}


/* =====================================================
   ENEMY ATTACK BOX
===================================================== */

function drawEnemyBox() {

    const b =
        game.battle;


    ctx.strokeStyle =
        "#fff";

    ctx.strokeRect(
        50,
        88,
        220,
        72
    );


    /* BULLETS */

    b.bullets.forEach(function(bullet) {

        ctx.fillStyle =
            "#fff";

        ctx.fillRect(
            bullet.x - bullet.size,
            bullet.y - bullet.size,
            bullet.size * 2,
            bullet.size * 2
        );

    });


    /* SOUL */

    ctx.fillStyle =
        "#fff";

    ctx.fillRect(
        b.soul.x-3,
        b.soul.y-3,
        6,
        6
    );


    if (
        b.soul.damageCooldown > 0
    ) {

        ctx.fillStyle =
            "#aaa";

        ctx.fillRect(
            b.soul.x-5,
            b.soul.y-5,
            10,
            10
        );

    }

}


/* =====================================================
   MENU
===================================================== */

function updateMenu() {

    if (
        keys.x &&
        !previous.x
    ) {

        if (
            game.menuPage !== "main"
        ) {

            game.menuPage =
                "main";

        }

        else {

            game.mode =
                "explore";

        }

        return;

    }


    if (
        game.menuPage === "main"
    ) {

        if (keys.up) {

            game.menuIndex--;

            if (
                game.menuIndex < 0
            )
                game.menuIndex = 3;

            keys.up = false;

        }


        if (keys.down) {

            game.menuIndex++;

            if (
                game.menuIndex > 3
            )
                game.menuIndex = 0;

            keys.down = false;

        }


        if (
            keys.z &&
            !previous.z
        ) {

            const pages = [

                "ITEM",
                "STATUS",
                "EQUIPMENT",
                "SETTINGS"

            ];

            game.menuPage =
                pages[
                    game.menuIndex
                ];

        }

    }

}


/* =====================================================
   MENU DRAW
===================================================== */

function drawMenu() {

    ctx.fillStyle =
        "rgba(0,0,0,.94)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.strokeStyle =
        "#fff";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        20,
        10,
        280,
        160
    );


    ctx.fillStyle =
        "#fff";

    ctx.font =
        "10px monospace";


    if (
        game.menuPage === "main"
    ) {

        ctx.fillText(
            "MENU",
            40,
            30
        );


        const items = [

            "ITEM",
            "STATUS",
            "EQUIPMENT",
            "SETTINGS"

        ];


        items.forEach(function(item,i) {

            const y =
                55 + i*24;


            if (
                i === game.menuIndex
            ) {

                ctx.fillText(
                    "▶",
                    50,
                    y
                );

            }


            ctx.fillText(
                item,
                70,
                y
            );

        });

    }


    if (
        game.menuPage === "ITEM"
    ) {

        ctx.fillText(
            "ITEM",
            40,
            30
        );

        ctx.font =
            "7px monospace";

        ctx.fillText(
            "Potion       x3",
            45,
            52
        );

        ctx.fillText(
            "Candy        x2",
            45,
            70
        );

        ctx.fillText(
            "Dark Food    x1",
            45,
            88
        );

        ctx.fillText(
            "Key          x1",
            45,
            106
        );

    }


    if (
        game.menuPage === "STATUS"
    ) {

        ctx.fillText(
            "STATUS",
            40,
            30
        );

        party.forEach(function(p,i) {

            const y =
                48 + i*22;


            ctx.fillStyle =
                p.color;

            ctx.fillText(
                p.name,
                40,
                y
            );


            ctx.fillStyle =
                "#fff";

            ctx.fillText(
                "HP " +
                p.hp +
                "/" +
                p.maxHP,
                150,
                y
            );

        });

    }


    if (
        game.menuPage === "EQUIPMENT"
    ) {

        ctx.fillText(
            "EQUIPMENT",
            40,
            30
        );

        ctx.font =
            "7px monospace";

        ctx.fillText(
            "ДЕЛЬТА",
            45,
            55
        );

        ctx.fillText(
            "WEAPON  Wooden Sword",
            45,
            75
        );

        ctx.fillText(
            "ARMOR   Old Clothes",
            45,
            95
        );

    }


    if (
        game.menuPage === "SETTINGS"
    ) {

        ctx.fillText(
            "SETTINGS",
            40,
            30
        );

        ctx.font =
            "7px monospace";

        ctx.fillText(
            "FULLSCREEN: BUTTON",
            45,
            55
        );

        ctx.fillText(
            "PIXEL MODE: ON",
            45,
            75
        );

        ctx.fillText(
            "SOUND: ON",
            45,
            95
        );

    }


    ctx.font =
        "6px monospace";

    ctx.fillText(
        "Z — выбрать",
        40,
        158
    );

    ctx.fillText(
        "X — назад",
        215,
        158
    );

}


/* =====================================================
   TRANSITION
===================================================== */

function drawTransition() {

    if (
        game.transition <= 0
    )
        return;


    ctx.fillStyle =
        "#000";

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


/* =====================================================
   UPDATE
===================================================== */

function update() {

    if (
        game.mode === "explore"
    ) {

        updatePlayer();

        updateFollowers();

        updateNPC();

        updateExit();

        randomBattleCheck();

    }


    else if (
        game.mode === "dialogue"
    ) {

        updateDialogue();

    }


    else if (
        game.mode === "menu"
    ) {

        updateMenu();

    }


    else if (
        game.mode === "battle"
    ) {

        updateBattle();

    }


    /*
       C открывает меню
    */

    if (
        keys.c &&
        !previous.c &&
        game.mode === "explore"
    ) {

        game.mode = "menu";

        game.menuPage = "main";

        game.menuIndex = 0;

    }


    previous.z =
        keys.z;

    previous.x =
        keys.x;

    previous.c =
        keys.c;

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


    if (
        game.mode === "battle"
    ) {

        drawBattle();

    }

    else {

        drawExplore();


        if (
            game.mode === "dialogue"
        ) {

            drawDialogue();

        }


        if (
            game.mode === "menu"
        ) {

            drawMenu();

        }

    }


    drawTransition();

}


/* =====================================================
   GAME LOOP
===================================================== */

function loop() {

    update();

    draw();

    requestAnimationFrame(loop);

}

loop();
