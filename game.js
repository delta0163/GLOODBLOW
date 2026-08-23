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

        console.log(error);

    }

});


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
   MOBILE CONTROLS
===================================================== */

document.querySelectorAll(".joy").forEach(function(button) {

    const key = button.dataset.key;

    button.addEventListener("pointerdown", function(e) {

        e.preventDefault();

        keys[key] = true;

        try {
            button.setPointerCapture(e.pointerId);
        } catch(error) {}

    });

    button.addEventListener("pointerup", function(e) {

        e.preventDefault();

        keys[key] = false;

    });

    button.addEventListener("pointercancel", function() {

        keys[key] = false;

    });

    button.addEventListener("pointerleave", function() {

        if (button.hasPointerCapture &&
            button.hasPointerCapture(event.pointerId)) {

            keys[key] = false;

        }

    });

});


document.querySelectorAll(".action-button").forEach(function(button) {

    const key = button.dataset.key;

    button.addEventListener("pointerdown", function(e) {

        e.preventDefault();

        keys[key] = true;

        try {
            button.setPointerCapture(e.pointerId);
        } catch(error) {}

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
   GAME STATE
===================================================== */

const game = {

    mode:"explore",

    room:"room1",

    dialogue:null,

    dialogueIndex:0,

    menuPage:"main",

    menuIndex:0,

    transition:0,

    battle:null,

    firstBattleDone:false,

    saveIndex:0,

    saveMessage:""

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

            {x:0,y:0,w:320,h:8},
            {x:0,y:172,w:320,h:8},
            {x:0,y:0,w:8,h:180},
            {x:312,y:0,w:8,h:180},

            {x:55,y:45,w:80,h:10},
            {x:200,y:45,w:60,h:10},

            {x:55,y:45,w:10,h:60},
            {x:255,y:45,w:10,h:60},

            {x:80,y:75,w:65,h:10}

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

        },

        savePoint: {

            x:100,
            y:58,

            w:35,
            h:20

        }

    },


    room2: {

        name:"ТЁМНАЯ КОМНАТА",

        floor:"#0d1018",

        walls:[

            {x:0,y:0,w:320,h:8},
            {x:0,y:172,w:320,h:8},
            {x:0,y:0,w:8,h:180},
            {x:312,y:0,w:8,h:180}

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

    let dx=0;
    let dy=0;

    const speed =
        keys.run ? 2.7 : 1.4;

    if (keys.up) {

        dy -= speed;
        player.direction="up";

    }

    if (keys.down) {

        dy += speed;
        player.direction="down";

    }

    if (keys.left) {

        dx -= speed;
        player.direction="left";

    }

    if (keys.right) {

        dx += speed;
        player.direction="right";

    }

    if (dx !== 0 && dy !== 0) {

        dx*=.707;
        dy*=.707;

    }

    if (canMove(player.x+dx,player.y))
        player.x+=dx;

    if (canMove(player.x,player.y+dy))
        player.y+=dy;

}


/* =====================================================
   FOLLOWERS
===================================================== */

function updateFollowers() {

    if (game.mode !== "explore")
        return;

    const targets=[

        {x:player.x-15,y:player.y},
        {x:player.x-30,y:player.y},
        {x:player.x-45,y:player.y},
        {x:player.x-60,y:player.y}

    ];

    followers.forEach(function(f,i) {

        const target=targets[i];

        const dx=target.x-f.x;
        const dy=target.y-f.y;

        const distance=Math.sqrt(dx*dx+dy*dy);

        if (distance>2) {

            f.x+=dx*.08;
            f.y+=dy*.08;

        }

    });

}


/* =====================================================
   NPC
===================================================== */

function npcDistance() {

    const npc=rooms[game.room].npc;

    const dx=player.x-npc.x;
    const dy=player.y-npc.y;

    return Math.sqrt(dx*dx+dy*dy);

}


function updateNPC() {

    if (game.mode !== "explore")
        return;

    if (
        npcDistance()<25 &&
        keys.z &&
        !previous.z
    ) {

        startDialogue(
            rooms[game.room].npc.name
        );

    }

}


/* =====================================================
   SAVE POINT
===================================================== */

function savePointDistance() {

    const point=rooms[game.room].savePoint;

    if (!point)
        return 999;

    const cx=point.x+point.w/2;
    const cy=point.y+point.h/2;

    const dx=player.x-cx;
    const dy=player.y-cy;

    return Math.sqrt(dx*dx+dy*dy);

}


function updateSavePoint() {

    if (game.mode !== "explore")
        return;

    if (!rooms[game.room].savePoint)
        return;

    if (
        savePointDistance()<30 &&
        keys.z &&
        !previous.z
    ) {

        game.mode="save";
        game.saveIndex=0;
        game.saveMessage="";

    }

}


/* =====================================================
   SAVE SYSTEM
===================================================== */

function getSaveData() {

    return {

        room:game.room,

        playerX:player.x,
        playerY:player.y,

        firstBattleDone:game.firstBattleDone,

        party:party.map(function(p) {

            return {

                name:p.name,
                hp:p.hp,
                maxHP:p.maxHP

            };

        }),

        date:new Date().toLocaleString()

    };

}


function saveGame(slot) {

    try {

        const data=getSaveData();

        localStorage.setItem(
            "bloodGlowSave_"+slot,
            JSON.stringify(data)
        );

        game.saveMessage =
            "ИГРА СОХРАНЕНА В ФАЙЛ "+
            (slot+1);

    }

    catch(error) {

        game.saveMessage="ОШИБКА СОХРАНЕНИЯ";

    }

}


function loadGame(slot) {

    const raw=localStorage.getItem(
        "bloodGlowSave_"+slot
    );

    if (!raw) {

        game.saveMessage="ФАЙЛ ПУСТ";

        return;

    }

    try {

        const data=JSON.parse(raw);

        game.room=data.room||"room1";

        player.x=data.playerX ?? 145;
        player.y=data.playerY ?? 120;

        game.firstBattleDone=
            !!data.firstBattleDone;

        if (data.party) {

            data.party.forEach(function(saved,i) {

                if (party[i]) {

                    party[i].hp=
                        Math.max(
                            0,
                            Math.min(
                                party[i].maxHP,
                                saved.hp
                            )
                        );

                }

            });

        }

        game.mode="explore";

        game.saveMessage="ИГРА ЗАГРУЖЕНА";

    }

    catch(error) {

        game.saveMessage="ОШИБКА ФАЙЛА";

    }

}


function updateSaveMenu() {

    if (keys.x && !previous.x) {

        game.mode="explore";

        return;

    }

    if (keys.up && !previous.up) {

        game.saveIndex--;

        if (game.saveIndex<0)
            game.saveIndex=2;

    }

    if (keys.down && !previous.down) {

        game.saveIndex++;

        if (game.saveIndex>2)
            game.saveIndex=0;

    }

    if (keys.z && !previous.z) {

        const slot=game.saveIndex;

        const raw=localStorage.getItem(
            "bloodGlowSave_"+slot
        );

        if (raw)
            loadGame(slot);
        else
            saveGame(slot);

    }

}


/* =====================================================
   DIALOGUE
===================================================== */

function startDialogue(name) {

    if (!dialogues[name])
        return;

    game.mode="dialogue";

    game.dialogue=dialogues[name];

    game.dialogueIndex=0;

}


function updateDialogue() {

    if (keys.x && !previous.x) {

        closeDialogue();

        return;

    }

    if (keys.z && !previous.z) {

        game.dialogueIndex++;

        if (
            game.dialogueIndex>=
            game.dialogue.length
        ) {

            closeDialogue();

        }

    }

}


function closeDialogue() {

    game.dialogue=null;
    game.dialogueIndex=0;
    game.mode="explore";

}


/* =====================================================
   EXIT
===================================================== */

function updateExit() {

    if (game.mode !== "explore")
        return;

    const room=rooms[game.room];

    if (overlap(player,room.exit)) {

        game.room=room.exit.target;

        game.transition=20;

        if (game.room==="room1") {

            player.x=275;
            player.y=90;

        }

        else {

            player.x=30;
            player.y=90;

            if (!game.firstBattleDone) {

                setTimeout(function() {

                    if (
                        game.mode==="explore" &&
                        game.room==="room2"
                    ) {

                        startFirstBattle();

                    }

                },500);

            }

        }

    }

}


/* =====================================================
   CREATE BATTLE
===================================================== */

function createBattle(first) {

    return {

        enemy:{

            name:"ТЕНЕВОЙ ЗВЕРЬ",

            hp:250,

            maxHP:250,

            attack:first ? 8 : 12,

            color:first ? "#6633aa" : "#aa55ff"

        },

        phase:"menu",

        actor:0,

        menu:0,

        actIndex:0,

        mercy:0,

        message:
            first
                ? "Перед вами появился Теневой зверь."
                : "Теневой зверь вернулся.",

        soul:{

            x:160,
            y:125,

            size:5,

            speed:2.5,

            damageCooldown:0

        },

        bullets:[],

        enemyTimer:0,

        firstBattle:first,

        rd:party.map(function() {
            return 0;
        }),

        defending:party.map(function() {
            return false;
        })

    };

}


function startFirstBattle() {

    if (game.firstBattleDone)
        return;

    game.mode="battle";

    game.battle=createBattle(true);

}


function startBattle() {

    game.mode="battle";

    game.battle=createBattle(false);

}


/* =====================================================
   RD SYSTEM
===================================================== */

function updateRD() {

    const b=game.battle;

    if (!b)
        return;

    if (
        b.phase!=="menu" &&
        b.phase!=="act" &&
        b.phase!=="item" &&
        b.phase!=="mercy"
    )
        return;

    const actor=b.actor;

    if (!party[actor])
        return;

    /* Защита останавливает РД */

    if (b.defending[actor])
        return;

    /* РД постепенно заполняется */

    b.rd[actor]+=0.55;

    if (b.rd[actor]>=100)
        b.rd[actor]=100;

}


function finishRDAction() {

    const b=game.battle;

    if (!b)
        return;

    b.rd[b.actor]=0;

    b.defending[b.actor]=false;

    afterAction();

}


/* =====================================================
   BATTLE UPDATE
===================================================== */

function updateBattle() {

    const b=game.battle;

    if (!b)
        return;

    updateRD();


    /* ================================================
       MAIN BATTLE MENU
    ================================================ */

    if (b.phase==="menu") {

        if (keys.left && !previous.left) {

            b.menu--;

            if (b.menu<0)
                b.menu=3;

        }

        if (keys.right && !previous.right) {

            b.menu++;

            if (b.menu>3)
                b.menu=0;

        }

        if (keys.z && !previous.z) {

            chooseBattleAction();

        }


        /*
           C = ЗАЩИТА
        */

        if (keys.c && !previous.c) {

            defend();

        }

    }


    /* ================================================
       ACT
    ================================================ */

    else if (b.phase==="act") {

        if (keys.up && !previous.up) {

            b.actIndex--;

            if (b.actIndex<0)
                b.actIndex=2;

        }

        if (keys.down && !previous.down) {

            b.actIndex++;

            if (b.actIndex>2)
                b.actIndex=0;

        }

        if (keys.x && !previous.x) {

            b.phase="menu";

        }

        if (keys.z && !previous.z) {

            useAct();

        }

    }


    /* ================================================
       ITEM
    ================================================ */

    else if (b.phase==="item") {

        if (keys.x && !previous.x) {

            b.phase="menu";

        }

        if (keys.z && !previous.z) {

            const target=party[b.actor];

            if (target.hp<target.maxHP) {

                target.hp=Math.min(
                    target.maxHP,
                    target.hp+35
                );

                b.message=
                    target.name+
                    " восстановил 35 HP!";

                finishRDAction();

            }

            else {

                b.message="HP уже заполнено.";

            }

        }

    }


    /* ================================================
       MERCY
    ================================================ */

    else if (b.phase==="mercy") {

        if (keys.x && !previous.x) {

            b.phase="menu";

        }

        if (keys.z && !previous.z) {

            if (b.mercy>=100) {

                b.enemy.hp=0;

                b.message=
                    "Враг был пощажён.";

                b.phase="victory";

                if (b.firstBattle)
                    game.firstBattleDone=true;

            }

            else {

                b.message=
                    "Пощада ещё недостаточно заполнена.";

                finishRDAction();

            }

        }

    }


    /* ================================================
       ENEMY
    ================================================ */

    else if (b.phase==="enemy") {

        updateSoul();

        updateBullets();

        if (b.enemyTimer>0) {

            b.enemyTimer--;

        }

        else {

            endEnemyPhase();

        }

    }


    /* ================================================
       VICTORY
    ================================================ */

    else if (b.phase==="victory") {

        if (keys.z && !previous.z) {

            game.mode="explore";

            game.battle=null;

        }

    }


    /* ================================================
       DEFEAT
    ================================================ */

    else if (b.phase==="defeat") {

        if (keys.z && !previous.z) {

            resetParty();

            game.mode="explore";

            game.battle=null;

        }

    }

}


/* =====================================================
   DEFENSE
===================================================== */

function defend() {

    const b=game.battle;

    const actor=b.actor;

    const p=party[actor];

    if (b.rd[actor]<100) {

        b.message=
            p.name+
            ": РД ещё не заполнена!";

        return;

    }

    b.defending[actor]=true;

    /*
       РД остаётся 100%,
       но больше не растёт.
    */

    b.rd[actor]=100;

    b.message=
        p.name+
        " защищается!";

    b.actor++;

    if (b.actor>=party.length) {

        b.actor=0;

        startEnemyPhase();

    }

    else {

        b.phase="menu";

        b.menu=0;

        b.message=
            "Ход: "+
            party[b.actor].name;

    }

}


/* =====================================================
   BATTLE ACTION
===================================================== */

function chooseBattleAction() {

    const b=game.battle;

    const actor=party[b.actor];


    if (b.rd[b.actor]<100) {

        b.message=
            actor.name+
            ": РД ещё не заполнена!";

        return;

    }


    /* FIGHT */

    if (b.menu===0) {

        const damage=
            actor.atk+
            Math.floor(
                Math.random()*7
            );

        b.enemy.hp-=damage;

        b.message=
            actor.name+
            " атакует! -"+
            damage+
            " HP";

        b.mercy=
            Math.min(
                100,
                b.mercy+8
            );

        finishRDAction();

    }


    /* ACT */

    else if (b.menu===1) {

        b.phase="act";

        b.actIndex=0;

    }


    /* ITEM */

    else if (b.menu===2) {

        b.phase="item";

    }


    /* MERCY */

    else if (b.menu===3) {

        b.phase="mercy";

    }

}


/* =====================================================
   ACT
===================================================== */

function useAct() {

    const b=game.battle;

    if (b.actIndex===0) {

        b.mercy=
            Math.min(
                100,
                b.mercy+22
            );

        b.message=
            "ДЕЛЬТА поговорил с врагом.";

    }

    else if (b.actIndex===1) {

        b.mercy=
            Math.min(
                100,
                b.mercy+32
            );

        b.message=
            "Вы внимательно осмотрели врага.";

    }

    else {

        b.mercy=
            Math.min(
                100,
                b.mercy+18
            );

        b.message=
            "НЕМКА попыталась успокоить зверя.";

    }

    finishRDAction();

}


/* =====================================================
   AFTER ACTION
===================================================== */

function afterAction() {

    const b=game.battle;

    if (b.enemy.hp<=0) {

        b.enemy.hp=0;

        b.phase="victory";

        if (b.firstBattle) {

            b.message=
                "Теневой зверь исчез...";

            game.firstBattleDone=true;

        }
        else {

            b.message=
                "Враг побеждён!";

        }

        return;

    }


    b.actor++;

    if (b.actor>=party.length) {

        b.actor=0;

        startEnemyPhase();

    }

    else {

        b.phase="menu";

        b.menu=0;

        b.message=
            "Ход: "+
            party[b.actor].name;

    }

}


/* =====================================================
   ENEMY PHASE
===================================================== */

function startEnemyPhase() {

    const b=game.battle;

    b.phase="enemy";

    b.enemyTimer=480;

    b.bullets=[];

    b.soul.x=160;
    b.soul.y=125;

    for (let i=0;i<7;i++) {

        b.bullets.push({

            x:55+Math.random()*210,

            y:-10-Math.random()*80,

            speed:1+Math.random()*1.6,

            size:4

        });

    }

}


/* =====================================================
   SOUL
===================================================== */

function updateSoul() {

    const b=game.battle;

    const soul=b.soul;

    if (keys.up)
        soul.y-=soul.speed;

    if (keys.down)
        soul.y+=soul.speed;

    if (keys.left)
        soul.x-=soul.speed;

    if (keys.right)
        soul.x+=soul.speed;

    soul.x=Math.max(
        55,
        Math.min(265,soul.x)
    );

    soul.y=Math.max(
        90,
        Math.min(155,soul.y)
    );

    if (soul.damageCooldown>0)
        soul.damageCooldown--;

}


/* =====================================================
   BULLETS
===================================================== */

function updateBullets() {

    const b=game.battle;

    const soul=b.soul;

    b.bullets.forEach(function(bullet) {

        bullet.y+=bullet.speed;

        if (bullet.y>165) {

            bullet.y=-10;

            bullet.x=
                50+
                Math.random()*220;

        }

        const dx=bullet.x-soul.x;
        const dy=bullet.y-soul.y;

        const distance=
            Math.sqrt(dx*dx+dy*dy);

        if (
            distance<
            bullet.size+soul.size
        ) {

            if (soul.damageCooldown<=0) {

                const target=
                    party[b.actor];

                /*
                   Защита уменьшает урон.
                */

                const damage=
                    b.defending[b.actor]
                        ? 3
                        : 10;

                target.hp-=damage;

                soul.damageCooldown=45;

                b.message=
                    target.name+
                    " получил "+
                    damage+
                    " урона!";

                if (target.hp<=0) {

                    target.hp=0;

                    checkDefeat();

                }

            }

        }

    });

}


/* =====================================================
   END ENEMY
===================================================== */

function endEnemyPhase() {

    const b=game.battle;

    b.actor=0;

    b.phase="menu";

    b.menu=0;

    b.message="Ход: ДЕЛЬТА";

}


/* =====================================================
   DEFEAT
===================================================== */

function checkDefeat() {

    let alive=false;

    party.forEach(function(p) {

        if (p.hp>0)
            alive=true;

    });

    if (!alive)
        game.battle.phase="defeat";

}


function resetParty() {

    party.forEach(function(p) {

        p.hp=p.maxHP;

    });

}


/* =====================================================
   DRAW ROOM
===================================================== */

function drawRoom() {

    const room=rooms[game.room];

    ctx.fillStyle=room.floor;

    ctx.fillRect(0,0,W,H);


    ctx.fillStyle="#252525";

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

            ctx.fillRect(x,y,1,1);

        }

    }


    ctx.fillStyle="#555";

    room.walls.forEach(function(w) {

        ctx.fillRect(
            w.x,
            w.y,
            w.w,
            w.h
        );

    });


    ctx.fillStyle="#663333";

    ctx.fillRect(
        room.exit.x,
        room.exit.y,
        room.exit.w,
        room.exit.h
    );


    if (room.savePoint) {

        drawPizzaTable(
            room.savePoint.x,
            room.savePoint.y
        );

    }

}


/* =====================================================
   PIZZA TABLE
===================================================== */

function drawPizzaTable(x,y) {

    /* стол */

    ctx.fillStyle="#5a321d";

    ctx.fillRect(
        x,
        y+5,
        35,
        12
    );

    ctx.fillStyle="#8b542f";

    ctx.fillRect(
        x+2,
        y+3,
        31,
        7
    );


    /* ножки */

    ctx.fillStyle="#3a2114";

    ctx.fillRect(
        x+4,
        y+15,
        4,
        7
    );

    ctx.fillRect(
        x+27,
        y+15,
        4,
        7
    );


    /* тарелка */

    ctx.fillStyle="#ddd";

    ctx.fillRect(
        x+7,
        y,
        20,
        6
    );


    /* пицца */

    ctx.fillStyle="#d88932";

    ctx.fillRect(
        x+9,
        y-1,
        16,
        5
    );


    /* сыр */

    ctx.fillStyle="#ffd85a";

    ctx.fillRect(
        x+11,
        y,
        12,
        3
    );


    /* пепперони */

    ctx.fillStyle="#a33";

    ctx.fillRect(
        x+13,
        y,
        2,
        2
    );

    ctx.fillRect(
        x+19,
        y+1,
        2,
        2
    );


    /* звёздочки */

    ctx.fillStyle="#fff";

    ctx.font="7px monospace";

    ctx.fillText("*",x-5,y+3);
    ctx.fillText("*",x+34,y+5);

}


/* =====================================================
   CHARACTER
===================================================== */

function drawCharacter(x,y,color) {

    x=Math.round(x);
    y=Math.round(y);

    ctx.fillStyle="#000";

    ctx.fillRect(
        x-1,
        y-1,
        12,
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


/* =====================================================
   EXPLORE DRAW
===================================================== */

function drawExplore() {

    drawRoom();

    const npc=rooms[game.room].npc;

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


    ctx.fillStyle="#fff";

    ctx.font="6px monospace";

    ctx.fillText(
        rooms[game.room].name,
        12,
        18
    );


    if (npcDistance()<25) {

        ctx.fillStyle="#000";

        ctx.fillRect(
            90,
            142,
            140,
            20
        );

        ctx.strokeStyle="#fff";

        ctx.strokeRect(
            90,
            142,
            140,
            20
        );

        ctx.fillStyle="#fff";

        ctx.fillText(
            "Z — ГОВОРИТЬ",
            112,
            154
        );

    }


    if (
        rooms[game.room].savePoint &&
        savePointDistance()<30
    ) {

        ctx.fillStyle="#000";

        ctx.fillRect(
            75,
            25,
            170,
            18
        );

        ctx.strokeStyle="#fff";

        ctx.strokeRect(
            75,
            25,
            170,
            18
        );

        ctx.fillStyle="#fff";

        ctx.fillText(
            "Z — СОХРАНИТЬ ИГРУ",
            94,
            37
        );

    }

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
            maxWidth &&
            i>0
        ) {

            ctx.fillText(
                line,
                x,
                y
            );

            line=words[i]+" ";

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
   DIALOGUE DRAW
===================================================== */

function drawDialogue() {

    ctx.fillStyle="rgba(0,0,0,.55)";

    ctx.fillRect(0,0,W,H);

    ctx.fillStyle="#000";

    ctx.fillRect(
        12,
        112,
        296,
        55
    );

    ctx.strokeStyle="#fff";

    ctx.lineWidth=2;

    ctx.strokeRect(
        12,
        112,
        296,
        55
    );

    ctx.fillStyle="#fff";

    ctx.font="7px monospace";

    drawWrappedText(
        game.dialogue[
            game.dialogueIndex
        ],
        23,
        132,
        270,
        10
    );

    ctx.font="6px monospace";

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

    const b=game.battle;

    ctx.fillStyle="#050505";

    ctx.fillRect(0,0,W,H);


    /* ВРАГ */

    ctx.fillStyle="#101010";

    ctx.fillRect(
        0,
        0,
        320,
        72
    );

    ctx.strokeStyle="#777";

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


    ctx.fillStyle="#fff";

    ctx.font="7px monospace";

    ctx.fillText(
        b.enemy.name,
        27,
        20
    );

    ctx.fillText(
        "HP",
        220,
        20
    );


    drawHPBar(
        238,
        15,
        50,
        6,
        b.enemy.hp,
        b.enemy.maxHP
    );


    ctx.fillText(
        b.enemy.hp+
        "/"+
        b.enemy.maxHP,
        238,
        31
    );


    /* MESSAGE */

    if (b.message) {

        ctx.fillStyle="#fff";

        ctx.font="6px monospace";

        drawWrappedText(
            b.message,
            35,
            82,
            130,
            8
        );

    }


    /* MERCY */

    drawMercyBar();


    if (b.phase==="enemy")
        drawEnemyBox();


    if (b.phase==="victory") {

        ctx.fillStyle="#fff";

        ctx.font="11px monospace";

        ctx.fillText(
            "ПОБЕДА!",
            125,
            105
        );

        ctx.font="7px monospace";

        ctx.fillText(
            "Z — продолжить",
            105,
            125
        );

        return;

    }


    if (b.phase==="defeat") {

        ctx.fillStyle="#fff";

        ctx.font="10px monospace";

        ctx.fillText(
            "ОТРЯД ПОБЕЖДЁН",
            90,
            105
        );

        ctx.font="7px monospace";

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
   MERCY BAR
===================================================== */

function drawMercyBar() {

    const b=game.battle;

    const x=175;
    const y=91;
    const w=125;
    const h=8;

    ctx.fillStyle="#222";

    ctx.fillRect(
        x,
        y,
        w,
        h
    );

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        x,
        y,
        w,
        h
    );

    ctx.fillStyle="#ffd83d";

    ctx.fillRect(
        x+1,
        y+1,
        (w-2)*(b.mercy/100),
        h-2
    );

    ctx.fillStyle="#fff";

    ctx.font="6px monospace";

    ctx.fillText(
        "ПОЩАДА "+
        Math.floor(b.mercy)+
        "%",
        175,
        87
    );

}


/* =====================================================
   ENEMY
===================================================== */

function drawEnemy(x,y,color) {

    ctx.fillStyle="#000";

    ctx.fillRect(
        x-18,
        y-22,
        36,
        44
    );

    ctx.fillStyle=color;

    ctx.fillRect(
        x-14,
        y-18,
        28,
        32
    );

    ctx.fillStyle="#fff";

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

    ctx.fillStyle="#333";

    ctx.fillRect(
        x,
        y,
        w,
        h
    );

    const amount=
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
        w*amount,
        h
    );

}


/* =====================================================
   BATTLE PARTY + RD
===================================================== */

function drawBattleParty() {

    const b=game.battle;

    ctx.font="5.5px monospace";

    /*
       Заголовок РД
    */

    ctx.fillStyle="#aaa";

    ctx.fillText(
        "РД",
        143,
        101
    );


    party.forEach(function(p,i) {

        const y=105+i*12;


        /* СТРЕЛКА ПЕРЕД ИМЕНЕМ */

        if (
            i===b.actor &&
            b.phase==="menu"
        ) {

            ctx.fillStyle="#fff";

            ctx.fillText(
                "▶",
                2,
                y
            );

        }


        /* ИМЯ */

        ctx.fillStyle=p.color;

        ctx.fillText(
            p.name,
            9,
            y
        );


        /* HP */

        ctx.fillStyle="#fff";

        ctx.fillText(
            "HP",
            72,
            y
        );


        drawHPBar(
            88,
            y-5,
            35,
            5,
            p.hp,
            p.maxHP
        );


        ctx.fillText(
            p.hp+
            "/"+
            p.maxHP,
            128,
            y
        );


        /* =================================================
           RD
        ================================================= */

        const rdX=143;
        const rdY=y-5;
        const rdW=25;
        const rdH=5;

        ctx.fillStyle="#222";

        ctx.fillRect(
            rdX,
            rdY,
            rdW,
            rdH
        );

        ctx.strokeStyle="#777";

        ctx.strokeRect(
            rdX,
            rdY,
            rdW,
            rdH
        );


        /*
           Защищающийся персонаж
        */

        if (b.defending[i]) {

            ctx.fillStyle="#666";

        }

        else if (b.rd[i]>=100) {

            ctx.fillStyle="#ffd83d";

        }

        else {

            ctx.fillStyle="#fff";

        }


        ctx.fillRect(
            rdX+1,
            rdY+1,
            (rdW-2)*(b.rd[i]/100),
            rdH-2
        );


        ctx.fillStyle="#fff";

        ctx.font="5px monospace";

        ctx.fillText(
            Math.floor(b.rd[i])+"%",
            171,
            y
        );


        /*
           Щит
        */

        if (b.defending[i]) {

            ctx.fillStyle="#aaa";

            ctx.fillText(
                "ЗАЩ",
                190,
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


    if (b.phase==="menu") {

        const labels=[

            "FIGHT",
            "ACT",
            "ITEM",
            "MERCY"

        ];


        labels.forEach(function(label,i) {

            const x=
                210+
                (i%2)*55;

            const y=
                112+
                Math.floor(i/2)*24;


            if (i===b.menu) {

                ctx.strokeStyle="#fff";

                ctx.strokeRect(
                    x-7,
                    y-9,
                    50,
                    16
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


        /*
           Кнопка защиты
        */

        ctx.strokeStyle="#5599ff";

        ctx.strokeRect(
            205,
            151,
            100,
            16
        );

        ctx.fillStyle="#fff";

        ctx.font="6px monospace";

        ctx.fillText(
            "C — ЗАЩИТА",
            218,
            162
        );


        /*
           Состояние РД
        */

        if (b.rd[b.actor]>=100) {

            ctx.fillStyle="#ffd83d";

            ctx.fillText(
                "ГОТОВ",
                270,
                102
            );

        }

        else {

            ctx.fillStyle="#777";

            ctx.fillText(
                "ЗАРЯД...",
                262,
                102
            );

        }

    }


    if (b.phase==="act") {

        ctx.fillStyle="#fff";

        ctx.font="7px monospace";

        ctx.fillText(
            "ACT",
            190,
            108
        );


        const acts=[

            "ПОГОВОРИТЬ",
            "ОСМОТРЕТЬ",
            "УСПОКОИТЬ"

        ];


        acts.forEach(function(text,i) {

            const y=121+i*12;

            if (i===b.actIndex) {

                ctx.fillText(
                    "▶",
                    181,
                    y
                );

            }

            ctx.fillText(
                text,
                190,
                y
            );

        });


        ctx.fillText(
            "X — назад",
            190,
            158
        );

    }


    if (b.phase==="item") {

        ctx.fillStyle="#fff";

        ctx.font="7px monospace";

        ctx.fillText(
            "ITEM",
            190,
            108
        );

        ctx.fillText(
            "POTION +35 HP",
            190,
            124
        );

        ctx.fillText(
            "Z — использовать",
            190,
            140
        );

        ctx.fillText(
            "X — назад",
            190,
            155
        );

    }


    if (b.phase==="mercy") {

        ctx.fillStyle="#fff";

        ctx.font="7px monospace";

        ctx.fillText(
            "MERCY",
            190,
            108
        );

        ctx.fillText(
            "ПОЩАДИТЬ",
            190,
            124
        );


        if (b.mercy>=100) {

            ctx.fillStyle="#ffd83d";

            ctx.fillText(
                "ГОТОВО!",
                190,
                139
            );

        }

        else {

            ctx.fillStyle="#aaa";

            ctx.fillText(
                "Нужно 100%",
                190,
                139
            );

        }


        ctx.fillStyle="#fff";

        ctx.fillText(
            "Z — выбрать",
            190,
            154
        );

    }

}


/* =====================================================
   ENEMY ATTACK BOX
===================================================== */

function drawEnemyBox() {

    const b=game.battle;

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        50,
        88,
        220,
        72
    );


    b.bullets.forEach(function(bullet) {

        ctx.fillStyle="#fff";

        ctx.fillRect(
            bullet.x-bullet.size,
            bullet.y-bullet.size,
            bullet.size*2,
            bullet.size*2
        );

    });


    ctx.fillStyle="#fff";

    ctx.fillRect(
        b.soul.x-3,
        b.soul.y-3,
        6,
        6
    );

}


/* =====================================================
   MAIN MENU
===================================================== */

function updateMenu() {

    if (keys.x && !previous.x) {

        game.mode="explore";

        return;

    }

    if (keys.up && !previous.up) {

        game.menuIndex--;

        if (game.menuIndex<0)
            game.menuIndex=3;

    }

    if (keys.down && !previous.down) {

        game.menuIndex++;

        if (game.menuIndex>3)
            game.menuIndex=0;

    }

    if (keys.z && !previous.z) {

        const pages=[

            "ITEM",
            "STATUS",
            "EQUIPMENT",
            "SETTINGS"

        ];

        game.menuPage=
            pages[game.menuIndex];

    }

}


/* =====================================================
   MENU DRAW
===================================================== */

function drawMenu() {

    ctx.fillStyle="rgba(0,0,0,.94)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    ctx.strokeStyle="#fff";

    ctx.lineWidth=2;

    ctx.strokeRect(
        20,
        10,
        280,
        160
    );

    ctx.fillStyle="#fff";

    ctx.font="10px monospace";


    if (game.menuPage==="main") {

        ctx.fillText(
            "MENU",
            40,
            30
        );


        const items=[

            "ITEM",
            "STATUS",
            "EQUIPMENT",
            "SETTINGS"

        ];


        items.forEach(function(item,i) {

            const y=55+i*24;

            if (i===game.menuIndex) {

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


    if (game.menuPage==="ITEM") {

        ctx.fillText(
            "ITEM",
            40,
            30
        );

        ctx.font="7px monospace";

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


    if (game.menuPage==="STATUS") {

        ctx.fillText(
            "STATUS",
            40,
            30
        );

        party.forEach(function(p,i) {

            const y=48+i*22;

            ctx.fillStyle=p.color;

            ctx.fillText(
                p.name,
                40,
                y
            );

            ctx.fillStyle="#fff";

            ctx.fillText(
                "HP "+
                p.hp+
                "/"+
                p.maxHP,
                150,
                y
            );

        });

    }


    if (game.menuPage==="EQUIPMENT") {

        ctx.fillText(
            "EQUIPMENT",
            40,
            30
        );

        ctx.font="7px monospace";

        ctx.fillText(
            "ДЕЛЬТА",
            45,
            55
        );

        ctx.fillText(
            "WEAPON Wooden Sword",
            45,
            75
        );

        ctx.fillText(
            "ARMOR Old Clothes",
            45,
            95
        );

    }


    if (game.menuPage==="SETTINGS") {

        ctx.fillText(
            "SETTINGS",
            40,
            30
        );

        ctx.font="7px monospace";

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
            "SAVE SYSTEM: ON",
            45,
            95
        );

    }


    ctx.font="6px monospace";

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
   SAVE MENU DRAW
===================================================== */

function drawSaveMenu() {

    ctx.fillStyle="rgba(0,0,0,.96)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    ctx.strokeStyle="#fff";

    ctx.lineWidth=2;

    ctx.strokeRect(
        28,
        14,
        264,
        150
    );

    ctx.fillStyle="#fff";

    ctx.font="10px monospace";

    ctx.fillText(
        "ТОЧКА СОХРАНЕНИЯ",
        70,
        32
    );

    ctx.font="6px monospace";

    ctx.fillText(
        "Пицца всё ещё тёплая.",
        83,
        43
    );


    for (let i=0;i<3;i++) {

        const y=65+i*27;


        if (i===game.saveIndex) {

            ctx.strokeStyle="#fff";

            ctx.strokeRect(
                48,
                y-11,
                224,
                22
            );

            ctx.fillStyle="#fff";

            ctx.fillText(
                "▶",
                54,
                y+3
            );

        }


        const raw=
            localStorage.getItem(
                "bloodGlowSave_"+i
            );


        ctx.fillStyle="#fff";

        ctx.font="7px monospace";

        ctx.fillText(
            "ФАЙЛ "+(i+1),
            70,
            y
        );


        ctx.font="5px monospace";

        if (raw) {

            try {

                const data=JSON.parse(raw);

                ctx.fillText(
                    data.date || "СОХРАНЕНО",
                    145,
                    y
                );

            }

            catch(error) {

                ctx.fillText(
                    "ПОВРЕЖДЁН",
                    145,
                    y
                );

            }

        }

        else {

            ctx.fillText(
                "ПУСТО",
                145,
                y
            );

        }

    }


    ctx.font="6px monospace";

    ctx.fillText(
        "Z — сохранить / загрузить",
        40,
        153
    );

    ctx.fillText(
        "X — назад",
        215,
        153
    );


    if (game.saveMessage) {

        ctx.fillStyle="#ffd83d";

        ctx.font="6px monospace";

        ctx.fillText(
            game.saveMessage,
            85,
            178
        );

    }

}


/* =====================================================
   TRANSITION
===================================================== */

function drawTransition() {

    if (game.transition<=0)
        return;

    ctx.fillStyle="#000";

    ctx.globalAlpha=
        game.transition/20;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    ctx.globalAlpha=1;

    game.transition--;

}


/* =====================================================
   UPDATE
===================================================== */

function update() {

    if (game.mode==="explore") {

        updatePlayer();

        updateFollowers();

        updateNPC();

        updateSavePoint();

        updateExit();


        /*
           C открывает главное меню
        */

        if (keys.c && !previous.c) {

            game.mode="menu";

            game.menuPage="main";

            game.menuIndex=0;

        }

    }


    else if (game.mode==="dialogue") {

        updateDialogue();

    }


    else if (game.mode==="menu") {

        updateMenu();

    }


    else if (game.mode==="save") {

        updateSaveMenu();

    }


    else if (game.mode==="battle") {

        updateBattle();

    }


    /*
       Сохраняем прошлое состояние
    */

    previous.up=keys.up;
    previous.down=keys.down;

    previous.left=keys.left;
    previous.right=keys.right;

    previous.z=keys.z;
    previous.x=keys.x;
    previous.c=keys.c;

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


    if (game.mode==="battle") {

        drawBattle();

    }

    else {

        drawExplore();


        if (game.mode==="dialogue") {

            drawDialogue();

        }


        if (game.mode==="menu") {

            drawMenu();

        }


        if (game.mode==="save") {

            drawSaveMenu();

        }

    }


    drawTransition();

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

loop();
