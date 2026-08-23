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
   FULLSCREEN
===================================================== */

document
    .getElementById("fullscreen-button")
    .addEventListener("click", async () => {

        try {

            if (!document.fullscreenElement) {

                await document.documentElement.requestFullscreen();

            } else {

                await document.exitFullscreen();

            }

        } catch (e) {

            console.log(e);

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
    c:false

};

const oldKeys = {

    z:false,
    x:false,
    c:false

};


/* =====================================================
   KEYBOARD
===================================================== */

window.addEventListener("keydown", e => {

    const k = e.key.toLowerCase();

    if (k === "arrowup" || k === "w")
        keys.up = true;

    if (k === "arrowdown" || k === "s")
        keys.down = true;

    if (k === "arrowleft" || k === "a")
        keys.left = true;

    if (k === "arrowright" || k === "d")
        keys.right = true;

    if (k === "z" || k === "enter")
        keys.z = true;

    if (k === "x" || k === "escape")
        keys.x = true;

    if (k === "c")
        keys.c = true;

    e.preventDefault();

}, {passive:false});


window.addEventListener("keyup", e => {

    const k = e.key.toLowerCase();

    if (k === "arrowup" || k === "w")
        keys.up = false;

    if (k === "arrowdown" || k === "s")
        keys.down = false;

    if (k === "arrowleft" || k === "a")
        keys.left = false;

    if (k === "arrowright" || k === "d")
        keys.right = false;

    if (k === "z" || k === "enter")
        keys.z = false;

    if (k === "x" || k === "escape")
        keys.x = false;

    if (k === "c")
        keys.c = false;

    e.preventDefault();

}, {passive:false});


/* =====================================================
   MOBILE BUTTONS
===================================================== */

document.querySelectorAll(".joy, .action-button")
.forEach(button => {

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
   PARTY
===================================================== */

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
        name:"НЕМКА",
        hp:100,
        maxHP:100,
        atk:11,
        def:9,
        color:"#ff5555"
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
    }

];


/* =====================================================
   GAME
===================================================== */

const game = {

    mode:"title",

    room:"room1",

    menu:0,

    saveMenu:0,

    dialogue:null,

    dialogueIndex:0,

    battle:null,

    saved:false

};


/* =====================================================
   PLAYER
===================================================== */

const player = {

    x:150,
    y:115,

    w:9,
    h:13

};


/* =====================================================
   FOLLOWERS
===================================================== */

const followers = [

    {x:135,y:115,color:"#ff5555"},
    {x:120,y:115,color:"#55aaff"},
    {x:105,y:115,color:"#55dd66"},
    {x:90,y:115,color:"#cc8844"}

];


/* =====================================================
   ROOMS
===================================================== */

const rooms = {

    room1: {

        name:"DARK ROOM",

        walls:[

            {x:0,y:0,w:320,h:8},
            {x:0,y:172,w:320,h:8},
            {x:0,y:0,w:8,h:180},
            {x:312,y:0,w:8,h:180}

        ],

        pizza:{
            x:50,
            y:45,
            w:38,
            h:25
        },

        exit:{
            x:295,
            y:70,
            w:17,
            h:40
        }

    },

    room2: {

        name:"OLD HALL",

        walls:[

            {x:0,y:0,w:320,h:8},
            {x:0,y:172,w:320,h:8},
            {x:0,y:0,w:8,h:180},
            {x:312,y:0,w:8,h:180},

            {x:70,y:45,w:100,h:8},
            {x:200,y:100,w:60,h:8}

        ],

        pizza:null,

        exit:{
            x:8,
            y:70,
            w:17,
            h:40
        }

    }

};


/* =====================================================
   COLLISION
===================================================== */

function hit(a,b) {

    return (

        a.x < b.x+b.w &&
        a.x+a.w > b.x &&
        a.y < b.y+b.h &&
        a.y+a.h > b.y

    );

}


function canMove(x,y) {

    const test = {

        x:x,
        y:y,
        w:player.w,
        h:player.h

    };

    for (const wall of rooms[game.room].walls) {

        if (hit(test,wall))
            return false;

    }

    return true;

}


/* =====================================================
   PLAYER UPDATE
===================================================== */

function updatePlayer() {

    if (game.mode !== "explore")
        return;

    let dx = 0;
    let dy = 0;

    const speed = 1.5;

    if (keys.up) dy -= speed;
    if (keys.down) dy += speed;
    if (keys.left) dx -= speed;
    if (keys.right) dx += speed;

    if (dx && dy) {

        dx *= .7;
        dy *= .7;

    }

    if (canMove(player.x+dx,player.y))
        player.x += dx;

    if (canMove(player.x,player.y+dy))
        player.y += dy;


    const room = rooms[game.room];

    if (hit(player,room.exit)) {

        if (game.room === "room1") {

            game.room = "room2";

            player.x = 25;

        } else {

            game.room = "room1";

            player.x = 280;

        }

    }

}


/* =====================================================
   FOLLOWERS
===================================================== */

function updateFollowers() {

    if (game.mode !== "explore")
        return;

    followers.forEach((f,i) => {

        const targetX =
            player.x - 14*(i+1);

        const targetY =
            player.y;

        f.x += (targetX-f.x)*.08;
        f.y += (targetY-f.y)*.08;

    });

}


/* =====================================================
   PIZZA SAVE POINT
===================================================== */

function nearPizza() {

    const p =
        rooms.room1.pizza;

    if (!p || game.room !== "room1")
        return false;

    return hit(player,{

        x:p.x-10,
        y:p.y-10,
        w:p.w+20,
        h:p.h+20

    });

}


function updatePizza() {

    if (!nearPizza())
        return;

    if (pressed("z")) {

        saveGame();

        game.dialogue = [
            "Вы нашли старый стол.",
            "На нём лежит пицца.",
            "Вы чувствуете себя немного лучше.",
            "Игра сохранена."
        ];

        game.dialogueIndex = 0;
        game.mode = "dialogue";

    }

}


/* =====================================================
   SAVE
===================================================== */

function saveGame() {

    const data = {

        room:game.room,

        x:player.x,

        y:player.y,

        party:party.map(p => ({

            hp:p.hp

        }))

    };

    localStorage.setItem(
        "blood_glow_save",
        JSON.stringify(data)
    );

    game.saved = true;

}


function loadGame() {

    const raw =
        localStorage.getItem("blood_glow_save");

    if (!raw)
        return false;

    try {

        const data =
            JSON.parse(raw);

        game.room =
            data.room || "room1";

        player.x =
            data.x || 150;

        player.y =
            data.y || 115;

        if (data.party) {

            data.party.forEach((saved,i) => {

                if (party[i]) {

                    party[i].hp =
                        saved.hp;

                }

            });

        }

        return true;

    } catch(e) {

        return false;

    }

}


/* =====================================================
   TITLE
===================================================== */

function updateTitle() {

    if (!pressed("z"))
        return;

    if (game.menu === 0) {

        game.mode = "explore";

    }

    else if (game.menu === 1) {

        if (loadGame()) {

            game.mode = "explore";

        }

    }

}


function drawTitle() {

    ctx.fillStyle="#000";
    ctx.fillRect(0,0,W,H);

    ctx.fillStyle="#fff";

    ctx.font="18px monospace";

    ctx.fillText(
        "BLOOD GLOW",
        85,
        45
    );

    ctx.font="11px monospace";

    ctx.fillText(
        "RPG",
        145,
        62
    );

    const items=[
        "НОВАЯ ИГРА",
        "ЗАГРУЗИТЬ"
    ];

    items.forEach((text,i)=>{

        const y=100+i*25;

        if(game.menu===i){

            ctx.fillText(
                "▶",
                90,
                y
            );

        }

        ctx.fillText(
            text,
            110,
            y
        );

    });

    ctx.font="6px monospace";

    ctx.fillText(
        "↑ ↓ — выбор     Z — выбрать",
        75,
        160
    );

}


/* =====================================================
   MENU
===================================================== */

function updateMainMenu() {

    if (pressed("c")) {

        game.mode="menu";

        game.menu=0;

    }

}


function drawMainMenu() {

    ctx.fillStyle="rgba(0,0,0,.95)";
    ctx.fillRect(0,0,W,H);

    ctx.strokeStyle="#fff";
    ctx.strokeRect(20,10,280,160);

    ctx.fillStyle="#fff";
    ctx.font="10px monospace";

    ctx.fillText(
        "МЕНЮ",
        40,
        30
    );

    const items=[
        "ITEM",
        "STATUS",
        "SAVE",
        "SETTINGS"
    ];

    items.forEach((text,i)=>{

        const y=55+i*22;

        if(game.menu===i){

            ctx.fillText(
                "▶",
                45,
                y
            );

        }

        ctx.fillText(
            text,
            65,
            y
        );

    });

    ctx.font="6px monospace";

    ctx.fillText(
        "C — закрыть",
        40,
        158
    );

}


function updateMenu() {

    if (pressed("x") || pressed("c")) {

        game.mode="explore";

        return;

    }

    if (keys.up) {

        game.menu--;

        if(game.menu<0)
            game.menu=3;

        keys.up=false;

    }

    if (keys.down) {

        game.menu++;

        if(game.menu>3)
            game.menu=0;

        keys.down=false;

    }

    if (pressed("z")) {

        if(game.menu===0) {

            game.dialogue=[
                "У вас есть:",
                "Potion x3",
                "Candy x2"
            ];

            game.dialogueIndex=0;
            game.mode="dialogue";

        }

        if(game.menu===1) {

            game.dialogue=[
                "ДЕЛЬТА  90/90 HP",
                "НЕМКА   100/100 HP",
                "ЛИЧИ    80/80 HP",
                "ПАНКЕЙК 70/70 HP",
                "КАШТАН  110/110 HP"
            ];

            game.dialogueIndex=0;
            game.mode="dialogue";

        }

        if(game.menu===2) {

            saveGame();

            game.dialogue=[
                "Сохранение завершено."
            ];

            game.dialogueIndex=0;
            game.mode="dialogue";

        }

        if(game.menu===3) {

            game.dialogue=[
                "SETTINGS",
                "FULLSCREEN — кнопка ⛶",
                "PIXEL MODE — ON"
            ];

            game.dialogueIndex=0;
            game.mode="dialogue";

        }

    }

}


/* =====================================================
   DIALOGUE
===================================================== */

function updateDialogue() {

    if (pressed("z")) {

        game.dialogueIndex++;

        if(
            game.dialogueIndex >=
            game.dialogue.length
        ) {

            game.dialogue=null;
            game.mode="explore";

        }

    }

    if (pressed("x")) {

        game.dialogue=null;
        game.mode="explore";

    }

}


function drawDialogue() {

    ctx.fillStyle="rgba(0,0,0,.7)";
    ctx.fillRect(0,0,W,H);

    ctx.fillStyle="#000";
    ctx.fillRect(15,110,290,55);

    ctx.strokeStyle="#fff";
    ctx.strokeRect(15,110,290,55);

    ctx.fillStyle="#fff";

    ctx.font="7px monospace";

    const text=
        game.dialogue[game.dialogueIndex];

    ctx.fillText(
        text,
        27,
        130
    );

    ctx.font="6px monospace";

    ctx.fillText(
        "Z — далее",
        220,
        155
    );

}


/* =====================================================
   BATTLE
===================================================== */

function startBattle() {

    game.mode="battle";

    game.battle={

        enemyHP:250,

        enemyMax:250,

        menu:0,

        actor:0,

        phase:"menu",

        rd:0,

        defending:false,

        soulX:160,

        soulY:140,

        bullets:[],

        timer:0

    };

}


/* =====================================================
   BATTLE MENU
===================================================== */

const battleItems=[
    "FIGHT",
    "ACT",
    "ITEM",
    "DEFEND"
];


function updateBattle() {

    const b=game.battle;


    if(b.phase==="menu") {

        if(keys.left) {

            b.menu--;

            if(b.menu<0)
                b.menu=3;

            keys.left=false;

        }

        if(keys.right) {

            b.menu++;

            if(b.menu>3)
                b.menu=0;

            keys.right=false;

        }

        if(pressed("z")) {

            if(b.menu===0) {

                const p=party[b.actor];

                const damage=
                    p.atk+
                    Math.floor(Math.random()*6);

                b.enemyHP-=damage;

                b.rd=Math.min(
                    100,
                    b.rd+20
                );

                nextActor(
                    p.name+
                    " атакует! -" +
                    damage +
                    " HP"
                );

            }

            if(b.menu===1) {

                b.phase="act";

            }

            if(b.menu===2) {

                party[b.actor].hp=
                    Math.min(
                        party[b.actor].maxHP,
                        party[b.actor].hp+30
                    );

                nextActor(
                    party[b.actor].name+
                    " восстановил HP."
                );

            }

            if(b.menu===3) {

                b.defending=true;

                /*
                   Защита НЕ повышает RD.
                */

                nextActor(
                    party[b.actor].name+
                    " защищается."
                );

            }

        }

    }


    else if(b.phase==="act") {

        if(pressed("x")) {

            b.phase="menu";

        }

        if(pressed("z")) {

            /*
               ACT даёт маленький урон
               и заполняет RD.
            */

            b.enemyHP-=5;

            b.rd=Math.min(
                100,
                b.rd+35
            );

            nextActor(
                party[b.actor].name+
                " использует ACT."
            );

        }

    }


    else if(b.phase==="enemy") {

        updateEnemyAttack();

    }


    if(b.enemyHP<=0) {

        b.phase="victory";

    }

    if(b.phase==="victory" && pressed("z")) {

        game.mode="explore";
        game.battle=null;

    }

}


function nextActor(message) {

    const b=game.battle;

    b.message=message;

    b.actor++;

    if(b.actor>=party.length) {

        b.actor=0;

        b.phase="enemy";

        b.timer=360;

        b.defending=false;

        createBullets();

    }

}


/* =====================================================
   ACT MENU
===================================================== */

function drawActMenu() {

    ctx.fillStyle="#fff";

    ctx.font="7px monospace";

    ctx.fillText(
        "ACT",
        200,
        105
    );

    ctx.fillText(
        "ПОГОВОРИТЬ",
        190,
        120
    );

    ctx.fillText(
        "ОСМОТРЕТЬ",
        190,
        135
    );

    ctx.fillText(
        "Z — выбрать",
        190,
        153
    );

}


/* =====================================================
   BULLETS
===================================================== */

function createBullets() {

    const b=game.battle;

    b.bullets=[];

    for(let i=0;i<8;i++) {

        b.bullets.push({

            x:60+Math.random()*200,

            y:-Math.random()*100,

            speed:1+Math.random()*1.5

        });

    }

}


function updateEnemyAttack() {

    const b=game.battle;

    if(keys.up)
        b.soulY-=2;

    if(keys.down)
        b.soulY+=2;

    if(keys.left)
        b.soulX-=2;

    if(keys.right)
        b.soulX+=2;

    b.soulX=
        Math.max(
            55,
            Math.min(
                265,
                b.soulX
            )
        );

    b.soulY=
        Math.max(
            90,
            Math.min(
                160,
                b.soulY
            )
        );


    b.bullets.forEach(bullet=>{

        bullet.y+=bullet.speed;

        if(bullet.y>165) {

            bullet.y=-5;

            bullet.x=
                55+Math.random()*210;

        }

        const dx=
            bullet.x-b.soulX;

        const dy=
            bullet.y-b.soulY;

        if(
            Math.sqrt(dx*dx+dy*dy)<7
        ) {

            const p=party[b.actor];

            const damage=
                b.defending ? 3 : 8;

            p.hp=Math.max(
                0,
                p.hp-damage
            );

        }

    });


    b.timer--;

    if(b.timer<=0) {

        b.phase="menu";

        b.menu=0;

    }

}


/* =====================================================
   DRAW BATTLE
===================================================== */

function drawBattle() {

    const b=game.battle;

    ctx.fillStyle="#000";
    ctx.fillRect(0,0,W,H);


    /* ENEMY */

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        20,
        10,
        280,
        62
    );


    ctx.fillStyle="#6611aa";

    ctx.fillRect(
        140,
        25,
        40,
        35
    );

    ctx.fillStyle="#fff";

    ctx.fillRect(
        148,
        34,
        6,
        6
    );

    ctx.fillRect(
        166,
        34,
        6,
        6
    );


    ctx.font="6px monospace";

    ctx.fillText(
        "ТЕНЕВОЙ ЗВЕРЬ",
        28,
        20
    );


    ctx.fillText(
        "HP "+b.enemyHP+"/250",
        215,
        20
    );


    drawHP(
        215,
        25,
        70,
        6,
        b.enemyHP,
        250
    );


    /* MESSAGE */

    ctx.fillStyle="#fff";

    ctx.font="6px monospace";

    if(b.message) {

        ctx.fillText(
            b.message,
            30,
            82
        );

    }


    /* PARTY */

    party.forEach((p,i)=>{

        const y=
            98+i*13;

        ctx.fillStyle=p.color;

        ctx.fillText(
            p.name,
            3,
            y
        );

        /*
           Стрелка теперь прямо
           возле имени.
        */

        if(
            i===b.actor &&
            b.phase==="menu"
        ) {

            ctx.fillText(
                "▶",
                45,
                y
            );

        }

        ctx.fillStyle="#fff";

        ctx.fillText(
            p.hp+"/"+p.maxHP,
            58,
            y
        );

    });


    /* RD */

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        143,
        96,
        12,
        70
    );

    ctx.fillStyle="#fff";

    const rdHeight=
        66*(b.rd/100);

    ctx.fillRect(
        145,
        164-rdHeight,
        8,
        rdHeight
    );

    ctx.font="5px monospace";

    ctx.fillText(
        "RD",
        145,
        174
    );


    /* MENU */

    if(b.phase==="menu") {

        battleItems.forEach((item,i)=>{

            const x=
                170+(i%2)*65;

            const y=
                110+Math.floor(i/2)*28;

            if(i===b.menu) {

                ctx.strokeStyle="#fff";

                ctx.strokeRect(
                    x-6,
                    y-9,
                    55,
                    16
                );

            }

            ctx.fillStyle="#fff";

            ctx.font="6px monospace";

            ctx.fillText(
                item,
                x,
                y
            );

        });

    }


    if(b.phase==="act") {

        drawActMenu();

    }


    /* ENEMY PHASE */

    if(b.phase==="enemy") {

        ctx.strokeStyle="#fff";

        ctx.strokeRect(
            55,
            92,
            210,
            70
        );

        b.bullets.forEach(bullet=>{

            ctx.fillStyle="#fff";

            ctx.fillRect(
                bullet.x-2,
                bullet.y-2,
                4,
                4
            );

        });

        ctx.fillStyle="#fff";

        ctx.fillRect(
            b.soulX-3,
            b.soulY-3,
            6,
            6
        );

    }


    /* VICTORY */

    if(b.phase==="victory") {

        ctx.fillStyle="#fff";

        ctx.font="12px monospace";

        ctx.fillText(
            "ПОБЕДА!",
            125,
            105
        );

        ctx.font="6px monospace";

        ctx.fillText(
            "Z — продолжить",
            110,
            125
        );

    }

}


/* =====================================================
   HP
===================================================== */

function drawHP(
    x,y,w,h,hp,max
) {

    ctx.fillStyle="#333";

    ctx.fillRect(
        x,y,w,h
    );

    ctx.fillStyle="#fff";

    ctx.fillRect(
        x,
        y,
        w*Math.max(0,hp/max),
        h
    );

}


/* =====================================================
   ROOM DRAW
===================================================== */

function drawRoom() {

    const room=rooms[game.room];

    ctx.fillStyle=
        game.room==="room1"
        ? "#171717"
        : "#101520";

    ctx.fillRect(
        0,0,W,H
    );


    ctx.fillStyle="#555";

    room.walls.forEach(w=>{

        ctx.fillRect(
            w.x,
            w.y,
            w.w,
            w.h
        );

    });


    /* EXIT */

    ctx.fillStyle="#662222";

    ctx.fillRect(
        room.exit.x,
        room.exit.y,
        room.exit.w,
        room.exit.h
    );


    /* PIZZA TABLE */

    if(room.pizza) {

        const p=room.pizza;

        ctx.fillStyle="#5a351d";

        ctx.fillRect(
            p.x,
            p.y,
            p.w,
            p.h
        );

        ctx.fillStyle="#ddd";

        ctx.fillRect(
            p.x+5,
            p.y+4,
            28,
            17
        );

        /*
           Пицца
        */

        ctx.fillStyle="#c77b30";

        ctx.fillRect(
            p.x+8,
            p.y+6,
            20,
            12
        );

        ctx.fillStyle="#b22";

        ctx.fillRect(
            p.x+13,
            p.y+8,
            4,
            4
        );

        ctx.fillRect(
            p.x+21,
            p.y+13,
            4,
            3
        );

    }

}


/* =====================================================
   CHARACTER
===================================================== */

function character(x,y,color) {

    ctx.fillStyle="#000";

    ctx.fillRect(
        Math.round(x)-1,
        Math.round(y)-1,
        11,
        16
    );

    ctx.fillStyle=color;

    ctx.fillRect(
        Math.round(x)+1,
        Math.round(y),
        7,
        7
    );

    ctx.fillRect(
        Math.round(x),
        Math.round(y)+7,
        9,
        7
    );

}


/* =====================================================
   EXPLORE DRAW
===================================================== */

function drawExplore() {

    drawRoom();


    followers.forEach(f=>{

        character(
            f.x,
            f.y,
            f.color
        );

    });


    character(
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


    if(nearPizza()) {

        ctx.fillStyle="#000";

        ctx.fillRect(
            70,
            145,
            180,
            18
        );

        ctx.strokeStyle="#fff";

        ctx.strokeRect(
            70,
            145,
            180,
            18
        );

        ctx.fillStyle="#fff";

        ctx.fillText(
            "Z — СОХРАНИТЬСЯ У ПИЦЦЫ",
            88,
            157
        );

    }

}


/* =====================================================
   PRESSED
===================================================== */

function pressed(key) {

    return (
        keys[key] &&
        !oldKeys[key]
    );

}


/* =====================================================
   UPDATE
===================================================== */

function update() {

    if(game.mode==="title") {

        updateTitle();

    }

    else if(game.mode==="explore") {

        updatePlayer();

        updateFollowers();

        updatePizza();

        updateMainMenu();

        /*
           Для проверки боя:
           C — меню,
           Z возле пиццы — сохранение.
           
           Автоматический первый бой:
           если игрок переходит во вторую комнату,
           запускаем его через некоторое время.
        */

        if(
            game.room==="room2" &&
            player.x>100 &&
            !game.battleStarted
        ) {

            game.battleStarted=true;

            setTimeout(
                startBattle,
                500
            );

        }

    }

    else if(game.mode==="dialogue") {

        updateDialogue();

    }

    else if(game.mode==="menu") {

        updateMenu();

    }

    else if(game.mode==="battle") {

        updateBattle();

    }


    oldKeys.z=keys.z;
    oldKeys.x=keys.x;
    oldKeys.c=keys.c;

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


    if(game.mode==="title") {

        drawTitle();

    }

    else if(game.mode==="battle") {

        drawBattle();

    }

    else {

        drawExplore();

        if(game.mode==="dialogue")
            drawDialogue();

        if(game.mode==="menu")
            drawMainMenu();

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
