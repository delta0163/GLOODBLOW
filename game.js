"use strict";

/* =====================================================
   CANVAS
===================================================== */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = 320;
const H = 180;

ctx.textBaseline = "top";


/* =====================================================
   FULLSCREEN
===================================================== */

const fullscreenButton =
    document.getElementById("fullscreen-button");

if (fullscreenButton) {

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

}


/* =====================================================
   INPUT
===================================================== */

const keys = {

    up:false,
    down:false,
    left:false,
    right:false,

    z:false,
    x:false,
    c:false,

    run:false

};


/*
   Отдельные предыдущие состояния.
   Благодаря этому стрелка работает
   ОДИН раз за одно нажатие.
*/

const previous = {

    up:false,
    down:false,
    left:false,
    right:false,

    z:false,
    x:false,
    c:false

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

    if (runIndicator)
        runIndicator.classList.add("active");

});


canvas.addEventListener("pointerup", function(e) {

    if (e.pointerId !== runPointer)
        return;

    runPointer = null;

    keys.run = false;

    if (runIndicator)
        runIndicator.classList.remove("active");

});


canvas.addEventListener("pointercancel", function() {

    runPointer = null;

    keys.run = false;

    if (runIndicator)
        runIndicator.classList.remove("active");

});


/* =====================================================
   GAME
===================================================== */

const game = {

    mode:"explore",

    room:"room1",

    dialogue:null,

    dialogueIndex:0,

    dialogueText:"",

    menuPage:"main",

    menuIndex:0,

    transition:0,

    battle:null,

    firstBattleDone:false

};


/* =====================================================
   PARTY
===================================================== */

const party = [

    {
        name:"ДЕЛЬТА",
        color:"#ffffff",

        hp:90,
        maxHP:90,

        atk:14,
        def:8
    },

    {
        name:"НЕМКА",
        color:"#ff5555",

        hp:100,
        maxHP:100,

        atk:11,
        def:9
    },

    {
        name:"ЛИЧИ",
        color:"#55aaff",

        hp:80,
        maxHP:80,

        atk:13,
        def:6
    },

    {
        name:"ПАНКЕЙК",
        color:"#55dd66",

        hp:70,
        maxHP:70,

        atk:10,
        def:11
    },

    {
        name:"КАШТАН",
        color:"#cc8844",

        hp:110,
        maxHP:110,

        atk:12,
        def:12
    }

];


/* =====================================================
   PLAYER
===================================================== */

const player = {

    x:145,
    y:120,

    width:10,
    height:14,

    direction:"down"

};


/* =====================================================
   FOLLOWERS
===================================================== */

const followers = [

    {
        x:130,
        y:120,
        color:"#ff5555"
    },

    {
        x:115,
        y:120,
        color:"#55aaff"
    },

    {
        x:100,
        y:120,
        color:"#55dd66"
    },

    {
        x:85,
        y:120,
        color:"#cc8844"
    }

];


/* =====================================================
   ROOMS
===================================================== */

const rooms = {

    room1: {

        name:"НАЧАЛО",

        floor:"#181818",

        walls:[

            {
                x:0,
                y:0,
                w:320,
                h:8
            },

            {
                x:0,
                y:172,
                w:320,
                h:8
            },

            {
                x:0,
                y:0,
                w:8,
                h:180
            },

            {
                x:312,
                y:0,
                w:8,
                h:180
            },

            {
                x:55,
                y:45,
                w:80,
                h:10
            },

            {
                x:200,
                y:45,
                w:60,
                h:10
            },

            {
                x:55,
                y:45,
                w:10,
                h:60
            },

            {
                x:255,
                y:45,
                w:10,
                h:60
            }

        ],

        npc: {

            x:225,
            y:110,

            width:10,
            height:14,

            color:"#ffff55",

            name:"Странный человек"

        },

        exit: {

            x:295,
            y:75,
            w:17,
            h:30,

            target:"room2"

        }

    },


    room2: {

        name:"ТЁМНАЯ КОМНАТА",

        floor:"#0d1018",

        walls:[

            {
                x:0,
                y:0,
                w:320,
                h:8
            },

            {
                x:0,
                y:172,
                w:320,
                h:8
            },

            {
                x:0,
                y:0,
                w:8,
                h:180
            },

            {
                x:312,
                y:0,
                w:8,
                h:180
            }

        ],

        npc: {

            x:160,
            y:65,

            width:10,
            height:14,

            color:"#ff66cc",

            name:"Таинственная девушка"

        },

        exit: {

            x:8,
            y:75,
            w:17,
            h:30,

            target:"room1"

        }

    }

};


/* =====================================================
   DIALOGUES
===================================================== */

const dialogues = {

    "Странный человек":[

        "Эй...",

        "Дельта.",

        "Так это ты ведёшь этот отряд?",

        "Немка, Личи, Панкейк и Каштан.",

        "Интересная команда.",

        "Вам лучше идти дальше."

    ],

    "Таинственная девушка":[

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

    game.dialogueText = "";

}


function updateDialogue() {

    if (game.mode !== "dialogue")
        return;


    /*
       Z сначала мгновенно показывает
       весь текущий текст.
    */

    if (
        keys.z &&
        !previous.z
    ) {

        const full =
            game.dialogue[
                game.dialogueIndex
            ];

        if (
            game.dialogueText !== full
        ) {

            game.dialogueText = full;

            return;

        }

        game.dialogueIndex++;

        game.dialogueText = "";

        if (
            game.dialogueIndex >=
            game.dialogue.length
        ) {

            closeDialogue();

        }

    }


    if (
        keys.x &&
        !previous.x
    ) {

        closeDialogue();

    }

}


function closeDialogue() {

    game.dialogue = null;

    game.dialogueIndex = 0;

    game.dialogueText = "";

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
   CREATE BATTLE
===================================================== */

function createBattle(firstBattle) {

    return {

        enemy: {

            name:"ТЕНЕВОЙ ЗВЕРЬ",

            /*
               БАЗОВОЕ HP ВРАГА
            */

            hp:250,

            maxHP:250,

            attack:10,

            color:"#6b35a8"

        },

        phase:"menu",

        actor:0,

        menu:0,

        actIndex:0,

        message:"",

        messageTimer:0,

        soul: {

            x:160,

            y:125,

            size:4,

            speed:2.4,

            damageCooldown:0

        },

        bullets:[],

        enemyTimer:0,

        firstBattle:firstBattle,

        victory:false

    };

}


/* =====================================================
   FIRST BATTLE
===================================================== */

function startFirstBattle() {

    if (game.firstBattleDone)
        return;

    game.mode = "battle";

    game.battle =
        createBattle(true);

    game.battle.message =
        "ТЕНЕВОЙ ЗВЕРЬ появился!";

}


/* =====================================================
   NORMAL BATTLE
===================================================== */

function startBattle() {

    game.mode = "battle";

    game.battle =
        createBattle(false);

    game.battle.message =
        "ТЕНЕВОЙ ЗВЕРЬ напал!";

}


/* =====================================================
   BATTLE UPDATE
===================================================== */

function updateBattle() {

    const b =
        game.battle;

    if (!b)
        return;


    /* -----------------------------------------------
       MAIN MENU
    ----------------------------------------------- */

    if (b.phase === "menu") {

        /*
           ← → работают только один раз
           за физическое нажатие.
        */

        if (
            keys.left &&
            !previous.left
        ) {

            b.menu--;

            if (b.menu < 0)
                b.menu = 3;

        }


        if (
            keys.right &&
            !previous.right
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


    /* -----------------------------------------------
       ACT
    ----------------------------------------------- */

    else if (b.phase === "act") {

        if (
            keys.up &&
            !previous.up
        ) {

            b.actIndex--;

            if (b.actIndex < 0)
                b.actIndex = 3;

        }


        if (
            keys.down &&
            !previous.down
        ) {

            b.actIndex++;

            if (b.actIndex > 3)
                b.actIndex = 0;

        }


        if (
            keys.x &&
            !previous.x
        ) {

            b.phase = "menu";

            b.actIndex = 0;

        }


        if (
            keys.z &&
            !previous.z
        ) {

            executeACT();

        }

    }


    /* -----------------------------------------------
       ITEM
    ----------------------------------------------- */

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
                    "Но HP уже полностью заполнено.";

            }

        }

    }


    /* -----------------------------------------------
       MERCY
    ----------------------------------------------- */

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

            if (b.enemy.hp <= 50) {

                b.enemy.hp = 0;

                b.message =
                    "ТЕНЕВОЙ ЗВЕРЬ был пощажён.";

                b.phase = "victory";

            }

            else {

                b.message =
                    "Он ещё не готов к пощаде.";

                afterAction();

            }

        }

    }


    /* -----------------------------------------------
       ENEMY
    ----------------------------------------------- */

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


    /* -----------------------------------------------
       VICTORY
    ----------------------------------------------- */

    else if (b.phase === "victory") {

        if (
            keys.z &&
            !previous.z
        ) {

            game.mode = "explore";

            game.battle = null;

        }

    }


    /* -----------------------------------------------
       DEFEAT
    ----------------------------------------------- */

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
   CHOOSE BATTLE ACTION
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

        b.enemy.hp =
            Math.max(
                0,
                b.enemy.hp - damage
            );

        b.message =
            actor.name +
            " атакует!  -" +
            damage +
            " HP";

        afterAction();

    }


    /* ACT */

    else if (b.menu === 1) {

        b.phase = "act";

        b.actIndex = 0;

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
   ACT ACTIONS
===================================================== */

const actActions = [

    {
        name:"ОСМОТРЕТЬ",

        result:
            "Теневой зверь. HP 250. Похоже, он чего-то боится.",

        damage:0
    },

    {
        name:"ПОГОВОРИТЬ",

        result:
            "Дельта попытался поговорить с Теневым зверем.",

        damage:0
    },

    {
        name:"ДРАЗНИТЬ",

        result:
            "Теневой зверь пришёл в ярость!",

        damage:0
    },

    {
        name:"УСПОКОИТЬ",

        result:
            "Теневой зверь немного успокоился.",

        damage:0
    }

];


function executeACT() {

    const b =
        game.battle;

    const action =
        actActions[b.actIndex];


    /*
       Некоторые действия немного
       приближают врага к MERCY.
    */

    if (
        b.actIndex === 1 ||
        b.actIndex === 3
    ) {

        b.enemy.mercy =
            Math.min(
                100,
                (b.enemy.mercy || 0) + 25
            );

    }


    b.message =
        action.result;


    afterAction();

}


/* =====================================================
   AFTER ACTION
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


    b.actor++;


    if (
        b.actor >= party.length
    ) {

        b.actor = 0;

        startEnemyPhase();

    }

    else {

        /*
           Если следующий персонаж
           уже повержен — пропускаем его.
        */

        let attempts = 0;

        while (
            party[b.actor].hp <= 0 &&
            attempts < party.length
        ) {

            b.actor++;

            if (
                b.actor >= party.length
            )
                b.actor = 0;

            attempts++;

        }


        if (
            party[b.actor].hp <= 0
        ) {

            startEnemyPhase();

            return;

        }


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

    /*
       Разные типы атак.
    */

    for (
        let i = 0;
        i < 9;
        i++
    ) {

        b.bullets.push({

            x:
                55 +
                Math.random() * 210,

            y:
                -10 -
                Math.random() * 80,

            speed:
                1 +
                Math.random() * 1.5,

            size:
                3 + Math.random() * 2

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
    ) {

        soul.damageCooldown--;

    }

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
                Math.random() * 220;

        }


        const dx =
            bullet.x - soul.x;

        const dy =
            bullet.y - soul.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance <
            bullet.size +
            soul.size
        ) {

            if (
                soul.damageCooldown <= 0
            ) {

                /*
                   Урон получает текущий
                   живой персонаж.
                */

                let target =
                    party[b.actor];


                if (
                    !target ||
                    target.hp <= 0
                ) {

                    target =
                        party.find(
                            p => p.hp > 0
                        );

                }


                if (target) {

                    target.hp =
                        Math.max(
                            0,
                            target.hp - 10
                        );


                    soul.damageCooldown =
                        45;


                    b.message =
                        target.name +
                        " получил 10 урона!";


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

    if (b.phase === "defeat")
        return;


    b.actor = 0;


    while (
        party[b.actor].hp <= 0 &&
        b.actor < party.length
    ) {

        b.actor++;

    }


    if (
        b.actor >= party.length
    ) {

        checkDefeat();

        return;

    }


    b.phase = "menu";

    b.menu = 0;

    b.message =
        "Ход: " +
        party[b.actor].name;

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
        let y = 10;
        y < 172;
        y += 16
    ) {

        for (
            let x = 10;
            x < 312;
            x += 16
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
   CHARACTER
===================================================== */

function drawCharacter(x,y,color) {

    x = Math.round(x);
    y = Math.round(y);


    ctx.fillStyle =
        "#000";

    ctx.fillRect(
        x - 1,
        y - 1,
        12,
        16
    );


    ctx.fillStyle =
        color;

    ctx.fillRect(
        x + 2,
        y,
        6,
        6
    );

    ctx.fillRect(
        x + 1,
        y + 6,
        8,
        7
    );


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


    ctx.fillStyle =
        "#fff";

    ctx.font =
        "bold 8px monospace";

    ctx.fillText(
        rooms[game.room].name,
        12,
        16
    );


    if (
        npcDistance() < 25
    ) {

        drawBox(
            90,
            142,
            140,
            22
        );


        ctx.fillStyle =
            "#fff";

        ctx.font =
            "bold 7px monospace";

        ctx.fillText(
            "Z — ГОВОРИТЬ",
            112,
            150
        );

    }

}


/* =====================================================
   BOX
===================================================== */

function drawBox(x,y,w,h) {

    ctx.fillStyle =
        "#000";

    ctx.fillRect(
        x,
        y,
        w,
        h
    );


    ctx.strokeStyle =
        "#fff";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        x + 1,
        y + 1,
        w - 2,
        h - 2
    );

}


/* =====================================================
   TEXT
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
   DIALOGUE
===================================================== */

function drawDialogue() {

    ctx.fillStyle =
        "rgba(0,0,0,.58)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    drawBox(
        10,
        112,
        300,
        57
    );


    ctx.fillStyle =
        "#fff";

    ctx.font =
        "bold 9px monospace";


    drawWrappedText(
        game.dialogueText ||
        game.dialogue[
            game.dialogueIndex
        ],
        22,
        124,
        276,
        11
    );


    ctx.font =
        "bold 6px monospace";

    ctx.fillText(
        "Z — ДАЛЕЕ",
        22,
        157
    );

    ctx.fillText(
        "X — ЗАКРЫТЬ",
        230,
        157
    );

}


/* =====================================================
   BATTLE
===================================================== */

function drawBattle() {

    const b =
        game.battle;


    /*
       Тёмный боевой фон
    */

    ctx.fillStyle =
        "#050505";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /*
       Верхняя часть.
       ОТРЯД СЛЕВА.
       ВРАГ СПРАВА.
    */

    drawBattleSideCharacters();

    drawBattleEnemy();


    /*
       Если идёт атака врага,
       поле появляется по центру.
    */

    if (
        b.phase === "enemy"
    ) {

        drawEnemyBox();

        drawBattleHUD();

        return;

    }


    /*
       Основной интерфейс
    */

    drawBattleHUD();


    if (
        b.phase === "victory"
    ) {

        drawVictory();

        return;

    }


    if (
        b.phase === "defeat"
    ) {

        drawDefeat();

        return;

    }


    drawBattleMenu();

}


/* =====================================================
   BATTLE SIDE CHARACTERS
===================================================== */

function drawBattleSideCharacters() {

    /*
       Пять персонажей слева.
    */

    const positions = [

        {x:42,y:35},
        {x:42,y:60},
        {x:42,y:85},
        {x:42,y:110},
        {x:42,y:135}

    ];


    party.forEach(function(p,i) {

        const pos =
            positions[i];


        /*
           Выделение текущего персонажа.
        */

        if (
            game.battle &&
            game.battle.actor === i &&
            game.battle.phase !== "victory" &&
            game.battle.phase !== "defeat"
        ) {

            ctx.fillStyle =
                "#fff";

            ctx.font =
                "bold 8px monospace";

            ctx.fillText(
                "▶",
                12,
                pos.y - 4
            );

        }


        /*
           Маленький боевой спрайт.
        */

        drawBattleCharacter(
            pos.x,
            pos.y,
            p.color,
            p.hp <= 0
        );


        /*
           Имя
        */

        ctx.fillStyle =
            p.hp <= 0
            ? "#777"
            : "#fff";

        ctx.font =
            "bold 6px monospace";

        ctx.fillText(
            p.name,
            58,
            pos.y - 4
        );


        /*
           HP
        */

        ctx.font =
            "6px monospace";

        ctx.fillText(
            "HP " +
            p.hp +
            "/" +
            p.maxHP,
            58,
            pos.y + 6
        );


        /*
           Полоска HP
        */

        drawHPBar(
            58,
            pos.y + 15,
            50,
            4,
            p.hp,
            p.maxHP
        );

    });

}


/* =====================================================
   BATTLE CHARACTER
===================================================== */

function drawBattleCharacter(
    x,
    y,
    color,
    dead
) {

    if (dead)
        color = "#333";


    /*
       Тёмная тень
    */

    ctx.fillStyle =
        "#000";

    ctx.fillRect(
        x - 9,
        y - 11,
        18,
        22
    );


    /*
       Голова
    */

    ctx.fillStyle =
        color;

    ctx.fillRect(
        x - 6,
        y - 9,
        12,
        9
    );


    /*
       Тело
    */

    ctx.fillRect(
        x - 7,
        y,
        14,
        10
    );


    /*
       Ноги
    */

    ctx.fillRect(
        x - 6,
        y + 10,
        4,
        3
    );

    ctx.fillRect(
        x + 2,
        y + 10,
        4,
        3
    );

}


/* =====================================================
   BATTLE ENEMY
===================================================== */

function drawBattleEnemy() {

    const b =
        game.battle;


    /*
       Враг находится справа.
    */

    const x = 257;
    const y = 55;


    ctx.fillStyle =
        "#000";

    ctx.fillRect(
        x - 29,
        y - 30,
        58,
        60
    );


    /*
       Тело
    */

    ctx.fillStyle =
        b.enemy.color;

    ctx.fillRect(
        x - 23,
        y - 24,
        46,
        45
    );


    /*
       Голова/маска
    */

    ctx.fillStyle =
        "#222";

    ctx.fillRect(
        x - 18,
        y - 18,
        36,
        25
    );


    /*
       Глаза
    */

    ctx.fillStyle =
        "#fff";

    ctx.fillRect(
        x - 12,
        y - 11,
        6,
        6
    );

    ctx.fillRect(
        x + 6,
        y - 11,
        6,
        6
    );


    /*
       Рот
    */

    ctx.fillStyle =
        "#000";

    ctx.fillRect(
        x - 12,
        y + 5,
        24,
        5
    );


    /*
       Имя врага
    */

    ctx.fillStyle =
        "#fff";

    ctx.font =
        "bold 7px monospace";

    ctx.fillText(
        b.enemy.name,
        208,
        100
    );


    /*
       HP
    */

    ctx.font =
        "bold 6px monospace";

    ctx.fillText(
        "HP " +
        b.enemy.hp +
        "/" +
        b.enemy.maxHP,
        208,
        111
    );


    drawHPBar(
        208,
        121,
        75,
        6,
        b.enemy.hp,
        b.enemy.maxHP
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
        "#222";

    ctx.fillRect(
        x,
        y,
        w,
        h
    );


    const amount =
        Math.max(
            0,
            Math.min(
                1,
                hp / max
            )
        );


    ctx.fillStyle =
        "#fff";

    ctx.fillRect(
        x,
        y,
        w * amount,
        h
    );


    ctx.strokeStyle =
        "#777";

    ctx.lineWidth = 1;

    ctx.strokeRect(
        x,
        y,
        w,
        h
    );

}


/* =====================================================
   BATTLE HUD
===================================================== */

function drawBattleHUD() {

    const b =
        game.battle;


    /*
       Нижняя область
    */

    drawBox(
        8,
        143,
        304,
        33
    );


    /*
       Имя текущего персонажа
    */

    const actor =
        party[b.actor];


    ctx.fillStyle =
        actor.hp > 0
        ? actor.color
        : "#777";

    ctx.font =
        "bold 7px monospace";

    ctx.fillText(
        actor.name,
        16,
        149
    );


    ctx.fillStyle =
        "#fff";

    ctx.font =
        "bold 6px monospace";

    ctx.fillText(
        "HP " +
        actor.hp +
        "/" +
        actor.maxHP,
        16,
        160
    );


    /*
       Сообщение
    */

    if (b.message) {

        ctx.fillStyle =
            "#fff";

        ctx.font =
            "6px monospace";

        ctx.fillText(
            b.message.substring(
                0,
                44
            ),
            130,
            149
        );

    }

}


/* =====================================================
   MAIN BATTLE MENU
===================================================== */

function drawBattleMenu() {

    const b =
        game.battle;


    if (
        b.phase === "menu"
    ) {

        const labels = [

            "FIGHT",
            "ACT",
            "ITEM",
            "MERCY"

        ];


        /*
           Меню внизу справа.
        */

        labels.forEach(function(label,i) {

            const x =
                130 +
                (i % 2) * 82;

            const y =
                149 +
                Math.floor(i / 2) * 13;


            if (
                i === b.menu
            ) {

                ctx.fillStyle =
                    "#fff";

                ctx.font =
                    "bold 6px monospace";

                ctx.fillText(
                    "▶",
                    x - 8,
                    y
                );

            }


            ctx.fillStyle =
                "#fff";

            ctx.font =
                "bold 7px monospace";

            ctx.fillText(
                label,
                x,
                y
            );

        });


        return;

    }


    /*
       ACT MENU
    */

    if (
        b.phase === "act"
    ) {

        drawBox(
            125,
            78,
            175,
            61
        );


        ctx.fillStyle =
            "#fff";

        ctx.font =
            "bold 7px monospace";

        ctx.fillText(
            "ACT — ТЕНЕВОЙ ЗВЕРЬ",
            137,
            85
        );


        actActions.forEach(function(action,i) {

            const y =
                98 + i * 10;


            if (
                i === b.actIndex
            ) {

                ctx.fillText(
                    "▶",
                    136,
                    y
                );

            }


            ctx.fillText(
                action.name,
                147,
                y
            );

        });


        return;

    }


    /*
       ITEM
    */

    if (
        b.phase === "item"
    ) {

        drawBox(
            125,
            90,
            175,
            42
        );


        ctx.fillStyle =
            "#fff";

        ctx.font =
            "bold 7px monospace";

        ctx.fillText(
            "ITEM",
            140,
            97
        );

        ctx.font =
            "6px monospace";

        ctx.fillText(
            "POTION  +35 HP",
            140,
            109
        );

        ctx.fillText(
            "Z — ИСПОЛЬЗОВАТЬ",
            140,
            120
        );

        return;

    }


    /*
       MERCY
    */

    if (
        b.phase === "mercy"
    ) {

        drawBox(
            125,
            90,
            175,
            42
        );


        ctx.fillStyle =
            "#fff";

        ctx.font =
            "bold 7px monospace";

        ctx.fillText(
            "MERCY",
            140,
            97
        );

        ctx.font =
            "6px monospace";

        ctx.fillText(
            "ПОЩАДИТЬ",
            140,
            109
        );

        ctx.fillText(
            "Z — ВЫБРАТЬ",
            140,
            120
        );

    }

}


/* =====================================================
   ENEMY ATTACK BOX
===================================================== */

function drawEnemyBox() {

    const b =
        game.battle;


    /*
       Поле находится между
       отрядом и противником.
    */

    ctx.fillStyle =
        "#000";

    ctx.fillRect(
        115,
        25,
        90,
        105
    );


    ctx.strokeStyle =
        "#fff";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        115,
        25,
        90,
        105
    );


    /*
       Снаряды
    */

    b.bullets.forEach(function(bullet) {

        ctx.fillStyle =
            "#fff";

        ctx.fillRect(
            Math.round(bullet.x - bullet.size),
            Math.round(bullet.y - bullet.size),
            Math.ceil(bullet.size * 2),
            Math.ceil(bullet.size * 2)
        );

    });


    /*
       SOUL
    */

    drawSoul(
        b.soul.x,
        b.soul.y
    );

}


/* =====================================================
   SOUL
===================================================== */

function drawSoul(x,y) {

    /*
       Пиксельное сердце.
    */

    ctx.fillStyle =
        "#fff";


    ctx.fillRect(
        x - 4,
        y - 3,
        3,
        3
    );

    ctx.fillRect(
        x + 1,
        y - 3,
        3,
        3
    );

    ctx.fillRect(
        x - 5,
        y,
        10,
        4
    );

    ctx.fillRect(
        x - 3,
        y + 4,
        6,
        3
    );

}


/* =====================================================
   VICTORY
===================================================== */

function drawVictory() {

    drawBox(
        90,
        55,
        140,
        55
    );


    ctx.fillStyle =
        "#fff";

    ctx.font =
        "bold 10px monospace";

    ctx.fillText(
        "ПОБЕДА!",
        125,
        66
    );


    ctx.font =
        "6px monospace";

    ctx.fillText(
        "Враг больше не мешает.",
        105,
        82
    );

    ctx.fillText(
        "Z — ПРОДОЛЖИТЬ",
        113,
        97
    );

}


/* =====================================================
   DEFEAT
===================================================== */

function drawDefeat() {

    ctx.fillStyle =
        "#000";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle =
        "#fff";

    ctx.font =
        "bold 10px monospace";

    ctx.fillText(
        "ОТРЯД ПОВЕРЖЕН",
        91,
        67
    );


    ctx.font =
        "6px monospace";

    ctx.fillText(
        "Z — ВОССТАНОВИТЬСЯ",
        101,
        90
    );

}


/* =====================================================
   WORLD MENU
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

        if (
            keys.up &&
            !previous.up
        ) {

            game.menuIndex--;

            if (
                game.menuIndex < 0
            )
                game.menuIndex = 3;

        }


        if (
            keys.down &&
            !previous.down
        ) {

            game.menuIndex++;

            if (
                game.menuIndex > 3
            )
                game.menuIndex = 0;

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
   WORLD MENU DRAW
===================================================== */

function drawMenu() {

    ctx.fillStyle =
        "rgba(0,0,0,.96)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    drawBox(
        15,
        8,
        290,
        164
    );


    ctx.fillStyle =
        "#fff";

    ctx.font =
        "bold 10px monospace";


    if (
        game.menuPage === "main"
    ) {

        ctx.fillText(
            "МЕНЮ",
            32,
            22
        );


        const items = [

            "ITEM",
            "STATUS",
            "EQUIPMENT",
            "SETTINGS"

        ];


        items.forEach(function(item,i) {

            const y =
                48 + i * 25;


            if (
                i === game.menuIndex
            ) {

                ctx.fillText(
                    "▶",
                    42,
                    y
                );

            }


            ctx.fillText(
                item,
                60,
                y
            );

        });

    }


    if (
        game.menuPage === "ITEM"
    ) {

        ctx.fillText(
            "ITEM",
            32,
            22
        );

        ctx.font =
            "7px monospace";

        ctx.fillText(
            "Potion          x3",
            40,
            48
        );

        ctx.fillText(
            "Candy           x2",
            40,
            65
        );

        ctx.fillText(
            "Dark Food       x1",
            40,
            82
        );

        ctx.fillText(
            "Key             x1",
            40,
            99
        );

    }


    if (
        game.menuPage === "STATUS"
    ) {

        ctx.fillText(
            "STATUS",
            32,
            22
        );


        party.forEach(function(p,i) {

            const y =
                45 + i * 22;


            ctx.fillStyle =
                p.color;

            ctx.font =
                "bold 7px monospace";

            ctx.fillText(
                p.name,
                35,
                y
            );


            ctx.fillStyle =
                "#fff";

            ctx.fillText(
                "HP " +
                p.hp +
                "/" +
                p.maxHP,
                145,
                y
            );


            ctx.font =
                "6px monospace";

            ctx.fillText(
                "ATK " +
                p.atk +
                "   DEF " +
                p.def,
                145,
                y + 9
            );

        });

    }


    if (
        game.menuPage === "EQUIPMENT"
    ) {

        ctx.fillText(
            "EQUIPMENT",
            32,
            22
        );

        ctx.font =
            "7px monospace";

        ctx.fillText(
            "ДЕЛЬТА",
            40,
            50
        );

        ctx.fillText(
            "WEAPON  Wooden Sword",
            40,
            68
        );

        ctx.fillText(
            "ARMOR   Old Clothes",
            40,
            86
        );

    }


    if (
        game.menuPage === "SETTINGS"
    ) {

        ctx.fillText(
            "SETTINGS",
            32,
            22
        );

        ctx.font =
            "7px monospace";

        ctx.fillText(
            "FULLSCREEN: ON/OFF",
            40,
            50
        );

        ctx.fillText(
            "PIXEL MODE: ON",
            40,
            68
        );

        ctx.fillText(
            "SOUND: ON",
            40,
            86
        );

    }


    ctx.font =
        "bold 6px monospace";

    ctx.fillText(
        "Z — ВЫБРАТЬ",
        35,
        156
    );

    ctx.fillText(
        "X — НАЗАД",
        225,
        156
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
       C = меню
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


    /*
       Сохраняем предыдущие состояния.
    */

    previous.up =
        keys.up;

    previous.down =
        keys.down;

    previous.left =
        keys.left;

    previous.right =
        keys.right;

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
