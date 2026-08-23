"use strict";

/* =========================================================
   PIXEL RPG
   DELTA + NEMKA + LYCHEE + PANCAKE + KASHATAN
========================================================= */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = 320;
const H = 180;

const WALK_SPEED = 1.4;
const RUN_SPEED = 2.7;


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
    c:false,

    run:false
};

let previous = {
    z:false,
    x:false,
    c:false
};


/* =========================================================
   KEYBOARD
========================================================= */

window.addEventListener("keydown", e => {

    const k = e.key.toLowerCase();

    if(e.key === "ArrowUp" || k === "w")
        keys.up = true;

    if(e.key === "ArrowDown" || k === "s")
        keys.down = true;

    if(e.key === "ArrowLeft" || k === "a")
        keys.left = true;

    if(e.key === "ArrowRight" || k === "d")
        keys.right = true;

    if(k === "z")
        keys.z = true;

    if(k === "x")
        keys.x = true;

    if(k === "c")
        keys.c = true;

    e.preventDefault();

},{passive:false});


window.addEventListener("keyup", e => {

    const k = e.key.toLowerCase();

    if(e.key === "ArrowUp" || k === "w")
        keys.up = false;

    if(e.key === "ArrowDown" || k === "s")
        keys.down = false;

    if(e.key === "ArrowLeft" || k === "a")
        keys.left = false;

    if(e.key === "ArrowRight" || k === "d")
        keys.right = false;

    if(k === "z")
        keys.z = false;

    if(k === "x")
        keys.x = false;

    if(k === "c")
        keys.c = false;

    e.preventDefault();

},{passive:false});


/* =========================================================
   MOBILE BUTTONS
========================================================= */

document.querySelectorAll(".joy").forEach(button => {

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


document.querySelectorAll(".action-button").forEach(button => {

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


/* =========================================================
   FULLSCREEN
========================================================= */

async function enterFullscreen(){

    try {

        if(!document.fullscreenElement){

            await document.documentElement.requestFullscreen();

        }

    } catch(e){

        console.log(e);

    }

}

document.addEventListener("pointerdown",enterFullscreen,{once:true});


/* =========================================================
   RUN
========================================================= */

const runIndicator =
    document.getElementById("run-indicator");

let runPointer = null;

canvas.addEventListener("pointerdown",e => {

    runPointer = e.pointerId;

    keys.run = true;

    runIndicator.classList.add("active");

});

canvas.addEventListener("pointerup",e => {

    if(e.pointerId !== runPointer)
        return;

    runPointer = null;

    keys.run = false;

    runIndicator.classList.remove("active");

});

canvas.addEventListener("pointercancel",() => {

    runPointer = null;

    keys.run = false;

    runIndicator.classList.remove("active");

});


/* =========================================================
   GAME STATE
========================================================= */

const game = {

    mode:"explore",

    room:"room1",

    dialogue:null,

    dialogueIndex:0,

    menuPage:"main",

    menuIndex:0,

    transition:0,

    battle:null,

    message:"",

    messageTimer:0

};


/* =========================================================
   PARTY
========================================================= */

const party = [

    {
        name:"Дельта",
        color:"#ffffff",
        hp:100,
        maxHP:100,
        atk:12,
        def:8
    },

    {
        name:"Немка",
        color:"#ff5555",
        hp:90,
        maxHP:90,
        atk:10,
        def:9
    },

    {
        name:"Личи",
        color:"#55aaff",
        hp:110,
        maxHP:110,
        atk:13,
        def:6
    },

    {
        name:"Панкейк",
        color:"#55dd66",
        hp:85,
        maxHP:85,
        atk:9,
        def:11
    },

    {
        name:"Каштан",
        color:"#cc8844",
        hp:120,
        maxHP:120,
        atk:11,
        def:12
    }

];


/* =========================================================
   FOLLOWERS
========================================================= */

const followers = [

    {x:130,y:120,color:"#ff5555"},
    {x:115,y:120,color:"#55aaff"},
    {x:100,y:120,color:"#55dd66"},
    {x:85,y:120,color:"#cc8844"}

];


/* =========================================================
   PLAYER
========================================================= */

const player = {

    x:145,
    y:120,

    width:10,
    height:14,

    direction:"down"

};


/* =========================================================
   ROOMS
========================================================= */

const rooms = {

    room1:{

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
            {x:255,y:45,w:10,h:60}

        ],

        npc:{
            x:225,
            y:110,
            width:10,
            height:14,
            color:"#ffff55",
            name:"Странный человек"
        },

        exit:{
            x:295,
            y:75,
            w:17,
            h:30,
            target:"room2"
        }

    },

    room2:{

        name:"ТЁМНАЯ КОМНАТА",

        floor:"#0d1018",

        walls:[

            {x:0,y:0,w:320,h:8},
            {x:0,y:172,w:320,h:8},
            {x:0,y:0,w:8,h:180},
            {x:312,y:0,w:8,h:180}

        ],

        npc:{
            x:160,
            y:65,
            width:10,
            height:14,
            color:"#ff66cc",
            name:"Таинственная девушка"
        },

        exit:{
            x:8,
            y:75,
            w:17,
            h:30,
            target:"room1"
        }

    }

};


/* =========================================================
   DIALOGUES
========================================================= */

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


/* =========================================================
   COLLISION
========================================================= */

function overlap(a,b){

    return (

        a.x < b.x + b.w &&
        a.x + a.width > b.x &&
        a.y < b.y + b.h &&
        a.y + a.height > b.y

    );

}


function canMove(x,y){

    const test = {

        x,
        y,
        width:player.width,
        height:player.height

    };

    for(const wall of rooms[game.room].walls){

        if(overlap(test,wall))
            return false;

    }

    return true;

}


/* =========================================================
   EXPLORE MOVEMENT
========================================================= */

function updatePlayer(){

    if(game.mode !== "explore")
        return;

    let dx = 0;
    let dy = 0;

    const speed =
        keys.run ? RUN_SPEED : WALK_SPEED;

    if(keys.up){

        dy -= speed;
        player.direction = "up";

    }

    if(keys.down){

        dy += speed;
        player.direction = "down";

    }

    if(keys.left){

        dx -= speed;
        player.direction = "left";

    }

    if(keys.right){

        dx += speed;
        player.direction = "right";

    }

    if(dx !== 0 && dy !== 0){

        dx *= .707;
        dy *= .707;

    }

    if(canMove(player.x + dx,player.y))
        player.x += dx;

    if(canMove(player.x,player.y + dy))
        player.y += dy;

}


/* =========================================================
   FOLLOWERS
========================================================= */

function updateFollowers(){

    if(game.mode !== "explore")
        return;

    const targets = [

        {x:player.x-15,y:player.y},
        {x:player.x-30,y:player.y},
        {x:player.x-45,y:player.y},
        {x:player.x-60,y:player.y}

    ];

    followers.forEach((f,i)=>{

        const t = targets[i];

        const dx = t.x-f.x;
        const dy = t.y-f.y;

        const distance =
            Math.sqrt(dx*dx+dy*dy);

        if(distance > 2){

            f.x += dx*.08;
            f.y += dy*.08;

        }

    });

}


/* =========================================================
   DIALOGUE
========================================================= */

function startDialogue(name){

    if(!dialogues[name])
        return;

    game.mode = "dialogue";

    game.dialogue = dialogues[name];

    game.dialogueIndex = 0;

}


function updateDialogue(){

    if(game.mode !== "dialogue")
        return;

    if(keys.x && !previous.x){

        closeDialogue();

        return;

    }

    if(keys.z && !previous.z){

        game.dialogueIndex++;

        if(game.dialogueIndex >= game.dialogue.length){

            closeDialogue();

        }

    }

}


function closeDialogue(){

    game.dialogue = null;

    game.dialogueIndex = 0;

    game.mode = "explore";

}


/* =========================================================
   NPC
========================================================= */

function npcDistance(){

    const npc =
        rooms[game.room].npc;

    const dx =
        player.x-npc.x;

    const dy =
        player.y-npc.y;

    return Math.sqrt(dx*dx+dy*dy);

}


function updateNPC(){

    if(game.mode !== "explore")
        return;

    if(
        npcDistance() < 25 &&
        keys.z &&
        !previous.z
    ){

        startDialogue(
            rooms[game.room].npc.name
        );

    }

}


/* =========================================================
   EXIT
========================================================= */

function updateExit(){

    if(game.mode !== "explore")
        return;

    const room =
        rooms[game.room];

    if(overlap(player,room.exit)){

        game.room =
            room.exit.target;

        game.transition = 20;

        if(game.room === "room1"){

            player.x = 275;
            player.y = 90;

        }else{

            player.x = 30;
            player.y = 90;

        }

        followers.forEach((f,i)=>{

            f.x =
                player.x -
                15*(i+1);

            f.y =
                player.y;

        });

    }

}


/* =========================================================
   RANDOM BATTLE
========================================================= */

let stepCounter = 0;

function randomBattleCheck(){

    if(game.mode !== "explore")
        return;

    if(
        keys.up ||
        keys.down ||
        keys.left ||
        keys.right
    ){

        stepCounter++;

        if(stepCounter > 600){

            stepCounter = 0;

            if(Math.random() < .18){

                startBattle();

            }

        }

    }

}


/* =========================================================
   BATTLE
========================================================= */

function startBattle(){

    game.mode = "battle";

    game.battle = {

        enemy:{

            name:"Теневой зверь",

            hp:180,
            maxHP:180,

            attack:12,

            color:"#aa55ff"

        },

        phase:"menu",

        actor:0,

        menu:0,

        message:"",

        enemyTimer:0,

        soul:{

            x:160,
            y:130,

            size:5,

            speed:2.2,

            damageCooldown:0

        },

        bullets:[]

    };

}


const battleMenus = [

    "FIGHT",
    "ACT",
    "ITEM",
    "MERCY"

];


/* =========================================================
   BATTLE UPDATE
========================================================= */

function updateBattle(){

    const b = game.battle;

    if(!b)
        return;


    /* -------------------------
       PLAYER MENU
    ------------------------- */

    if(b.phase === "menu"){

        if(keys.left && !previous.x){

            b.menu--;

            if(b.menu < 0)
                b.menu = 3;

        }

        if(keys.right && !previous.x){

            b.menu++;

            if(b.menu > 3)
                b.menu = 0;

        }

        if(keys.z && !previous.z){

            chooseBattleAction();

        }

    }


    /* -------------------------
       ACT MENU
    ------------------------- */

    else if(b.phase === "act"){

        if(keys.x && !previous.x){

            b.phase = "menu";

        }

        if(keys.z && !previous.z){

            b.enemy.hp -= 8;

            b.message =
                "Дельта использовал ACT!";

            afterPlayerAction();

        }

    }


    /* -------------------------
       ITEM MENU
    ------------------------- */

    else if(b.phase === "item"){

        if(keys.x && !previous.x){

            b.phase = "menu";

        }

        if(keys.z && !previous.z){

            const target = party[b.actor];

            if(target.hp < target.maxHP){

                target.hp =
                    Math.min(
                        target.maxHP,
                        target.hp + 35
                    );

                b.message =
                    target.name +
                    " восстановил HP!";

                afterPlayerAction();

            }else{

                b.message =
                    "HP уже заполнено.";

            }

        }

    }


    /* -------------------------
       MERCY
    ------------------------- */

    else if(b.phase === "mercy"){

        if(keys.x && !previous.x){

            b.phase = "menu";

        }

        if(keys.z && !previous.z){

            if(b.enemy.hp <= 35){

                b.enemy.hp = 0;

                b.message =
                    "Враг пощадил вас.";

                b.phase =
                    "victory";

            }else{

                b.message =
                    "Враг пока не готов.";

                afterPlayerAction();

            }

        }

    }


    /* -------------------------
       ENEMY PHASE
    ------------------------- */

    else if(b.phase === "enemy"){

        updateSoul();

        updateBullets();

        if(b.enemyTimer > 0){

            b.enemyTimer--;

        }else{

            endEnemyPhase();

        }

    }


    /* -------------------------
       VICTORY
    ------------------------- */

    else if(b.phase === "victory"){

        if(keys.z && !previous.z){

            game.mode = "explore";

            game.battle = null;

            game.message = "";

        }

    }


    /* -------------------------
       DEFEAT
    ------------------------- */

    else if(b.phase === "defeat"){

        if(keys.z && !previous.z){

            resetParty();

            game.mode = "explore";

            game.battle = null;

        }

    }

}


/* =========================================================
   CHOOSE BATTLE ACTION
========================================================= */

function chooseBattleAction(){

    const b = game.battle;

    if(b.menu === 0){

        /* FIGHT */

        const actor =
            party[b.actor];

        const damage =
            actor.atk +
            Math.floor(
                Math.random()*6
            );

        b.enemy.hp -= damage;

        b.message =
            actor.name +
            " атакует! -" +
            damage +
            " HP";

        afterPlayerAction();

    }

    else if(b.menu === 1){

        b.phase = "act";

    }

    else if(b.menu === 2){

        b.phase = "item";

    }

    else if(b.menu === 3){

        b.phase = "mercy";

    }

}


/* =========================================================
   NEXT CHARACTER
========================================================= */

function afterPlayerAction(){

    const b = game.battle;

    if(b.enemy.hp <= 0){

        b.enemy.hp = 0;

        b.phase = "victory";

        return;

    }

    b.actor++;

    if(b.actor >= party.length){

        b.actor = 0;

        startEnemyPhase();

    }else{

        b.phase = "menu";

    }

}


/* =========================================================
   ENEMY PHASE
========================================================= */

function startEnemyPhase(){

    const b = game.battle;

    b.phase = "enemy";

    b.enemyTimer = 480;

    b.bullets = [];

    b.soul.x = 160;
    b.soul.y = 130;

    for(let i=0;i<5;i++){

        b.bullets.push({

            x:40+i*55,

            y:-10-Math.random()*50,

            speed:1+Math.random()*1.5,

            size:4

        });

    }

}


function updateSoul(){

    const b = game.battle;

    const s = b.soul;

    if(keys.up)
        s.y -= s.speed;

    if(keys.down)
        s.y += s.speed;

    if(keys.left)
        s.x -= s.speed;

    if(keys.right)
        s.x += s.speed;

    s.x =
        Math.max(
            55,
            Math.min(
                265,
                s.x
            )
        );

    s.y =
        Math.max(
            75,
            Math.min(
                155,
                s.y
            )
        );

    if(s.damageCooldown > 0)
        s.damageCooldown--;

}


function updateBullets(){

    const b = game.battle;

    const s = b.soul;

    b.bullets.forEach(bullet=>{

        bullet.y += bullet.speed;

        if(bullet.y > 165){

            bullet.y = -10;

            bullet.x =
                45+
                Math.random()*220;

        }

        const dx =
            bullet.x-s.x;

        const dy =
            bullet.y-s.y;

        const distance =
            Math.sqrt(dx*dx+dy*dy);

        if(
            distance <
            bullet.size+s.size
        ){

            if(
                s.damageCooldown <= 0
            ){

                party[b.actor].hp -= 10;

                s.damageCooldown = 45;

                if(
                    party[b.actor].hp <= 0
                ){

                    party[b.actor].hp = 0;

                    checkDefeat();

                }

            }

        }

    });

}


function endEnemyPhase(){

    const b = game.battle;

    b.actor = 0;

    b.phase = "menu";

    b.message = "";

}


function checkDefeat(){

    let alive = false;

    party.forEach(p=>{

        if(p.hp > 0)
            alive = true;

    });

    if(!alive){

        game.battle.phase =
            "defeat";

    }

}


function resetParty(){

    party.forEach(p=>{

        p.hp = p.maxHP;

    });

}


/* =========================================================
   DRAW ROOM
========================================================= */

function drawRoom(){

    const room =
        rooms[game.room];

    ctx.fillStyle =
        room.floor;

    ctx.fillRect(
        0,0,W,H
    );

    ctx.fillStyle =
        "#252525";

    for(let y=10;y<172;y+=16){

        for(let x=10;x<312;x+=16){

            ctx.fillRect(
                x,y,1,1
            );

        }

    }

    ctx.fillStyle =
        "#555";

    room.walls.forEach(w=>{

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


/* =========================================================
   DRAW CHARACTER
========================================================= */

function drawCharacter(x,y,color){

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


/* =========================================================
   DRAW EXPLORE
========================================================= */

function drawExplore(){

    drawRoom();

    const npc =
        rooms[game.room].npc;

    drawCharacter(
        npc.x,
        npc.y,
        npc.color
    );

    followers.forEach(f=>{

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


    if(npcDistance()<25){

        ctx.fillStyle="#000";

        ctx.fillRect(
            95,145,130,18
        );

        ctx.strokeStyle="#fff";

        ctx.strokeRect(
            95,145,130,18
        );

        ctx.fillStyle="#fff";

        ctx.fillText(
            "Z — ГОВОРИТЬ",
            115,
            156
        );

    }

}


/* =========================================================
   DRAW DIALOGUE
========================================================= */

function drawDialogue(){

    ctx.fillStyle =
        "rgba(0,0,0,.45)";

    ctx.fillRect(
        0,0,W,H
    );

    ctx.fillStyle="#000";

    ctx.fillRect(
        12,112,296,55
    );

    ctx.strokeStyle="#fff";

    ctx.lineWidth=2;

    ctx.strokeRect(
        12,112,296,55
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


/* =========================================================
   WRAP TEXT
========================================================= */

function drawWrappedText(
    text,
    x,
    y,
    maxWidth,
    lineHeight
){

    const words =
        text.split(" ");

    let line="";

    for(let i=0;i<words.length;i++){

        const test =
            line+
            words[i]+
            " ";

        if(
            ctx.measureText(test).width >
            maxWidth &&
            i>0
        ){

            ctx.fillText(
                line,
                x,
                y
            );

            line =
                words[i]+" ";

            y += lineHeight;

        }else{

            line=test;

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

function drawMenu(){

    ctx.fillStyle =
        "rgba(0,0,0,.92)";

    ctx.fillRect(
        0,0,W,H
    );

    ctx.strokeStyle="#fff";

    ctx.lineWidth=2;

    ctx.strokeRect(
        20,10,280,160
    );

    ctx.fillStyle="#fff";

    ctx.font="10px monospace";


    if(game.menuPage==="main"){

        ctx.fillText(
            "MENU",
            40,30
        );

        const items=[
            "ITEM",
            "STATUS",
            "EQUIPMENT",
            "SETTINGS"
        ];

        items.forEach((item,i)=>{

            const y =
                55+i*24;

            if(i===game.menuIndex)
                ctx.fillText(
                    "▶",
                    50,
                    y
                );

            ctx.fillText(
                item,
                70,
                y
            );

        });

    }


    if(game.menuPage==="ITEM"){

        ctx.fillText(
            "ITEM",
            40,30
        );

        ctx.font="7px monospace";

        [
            "Potion       x3",
            "Candy        x2",
            "Dark Food    x1",
            "Key          x1"
        ].forEach((t,i)=>{

            ctx.fillText(
                t,
                45,
                52+i*18
            );

        });

    }


    if(game.menuPage==="STATUS"){

        ctx.fillText(
            "STATUS",
            40,30
        );

        party.forEach((p,i)=>{

            const y =
                48+i*22;

            ctx.fillStyle =
                p.color;

            ctx.fillText(
                p.name,
                40,
                y
            );

            ctx.fillStyle="#fff";

            ctx.fillText(
                "HP "+p.hp+"/"+p.maxHP,
                150,
                y
            );

        });

    }


    if(game.menuPage==="EQUIPMENT"){

        ctx.fillText(
            "EQUIPMENT",
            40,30
        );

        ctx.font="7px monospace";

        ctx.fillText(
            "ДЕЛЬТА",
            45,55
        );

        ctx.fillText(
            "WEAPON  Wooden Sword",
            45,75
        );

        ctx.fillText(
            "ARMOR   Old Clothes",
            45,95
        );

    }


    if(game.menuPage==="SETTINGS"){

        ctx.fillText(
            "SETTINGS",
            40,30
        );

        ctx.font="7px monospace";

        ctx.fillText(
            "FULLSCREEN: ON",
            45,55
        );

        ctx.fillText(
            "PIXEL MODE: ON",
            45,75
        );

        ctx.fillText(
            "SOUND: ON",
            45,95
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


/* =========================================================
   DRAW BATTLE
========================================================= */

function drawBattle(){

    const b =
        game.battle;

    ctx.fillStyle="#050505";

    ctx.fillRect(
        0,0,W,H
    );


    /* ENEMY AREA */

    ctx.fillStyle="#111";

    ctx.fillRect(
        0,0,320,90
    );

    ctx.strokeStyle="#777";

    ctx.strokeRect(
        20,10,280,70
    );


    /* ENEMY */

    drawEnemy(
        160,
        45,
        b.enemy.color
    );


    ctx.fillStyle="#fff";

    ctx.font="8px monospace";

    ctx.fillText(
        b.enemy.name,
        25,
        22
    );

    ctx.font="6px monospace";

    ctx.fillText(
        "HP",
        230,
        22
    );

    drawHPBar(
        245,
        17,
        45,
        5,
        b.enemy.hp,
        b.enemy.maxHP
    );


    /* MESSAGE */

    if(b.message){

        ctx.fillStyle="#fff";

        ctx.font="7px monospace";

        drawWrappedText(
            b.message,
            35,
            102,
            250,
            9
        );

    }


    /* ENEMY ATTACK */

    if(b.phase==="enemy"){

        drawEnemyBox();

    }


    /* VICTORY */

    if(b.phase==="victory"){

        ctx.fillStyle="#fff";

        ctx.font="10px monospace";

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


    /* DEFEAT */

    if(b.phase==="defeat"){

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


    /* PARTY */

    drawBattleParty();


    /* MENU */

    if(
        b.phase==="menu" ||
        b.phase==="act" ||
        b.phase==="item" ||
        b.phase==="mercy"
    ){

        drawBattleMenu();

    }

}


/* =========================================================
   ENEMY
========================================================= */

function drawEnemy(x,y,color){

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


/* =========================================================
   HP BAR
========================================================= */

function drawHPBar(
    x,
    y,
    w,
    h,
    hp,
    max
){

    ctx.fillStyle="#333";

    ctx.fillRect(
        x,y,w,h
    );

    const amount =
        Math.max(
            0,
            hp/max
        );

    ctx.fillStyle="#fff";

    ctx.fillRect(
        x,
        y,
        w*amount,
        h
    );

}


/* =========================================================
   PARTY IN BATTLE
========================================================= */

function drawBattleParty(){

    ctx.font="6px monospace";

    party.forEach((p,i)=>{

        const y =
            105+i*13;

        ctx.fillStyle =
            p.color;

        ctx.fillText(
            p.name,
            15,
            y
        );

        ctx.fillStyle="#fff";

        ctx.fillText(
            "HP",
            75,
            y
        );

        drawHPBar(
            90,
            y-5,
            45,
            5,
            p.hp,
            p.maxHP
        );

        ctx.fillText(
            p.hp+"/"+p.maxHP,
            142,
            y
        );

        if(
            i===game.battle.actor &&
            game.battle.phase==="menu"
        ){

            ctx.fillText(
                "▶",
                5,
                y
            );

        }

    });

}


/* =========================================================
   BATTLE MENU
========================================================= */

function drawBattleMenu(){

    const b =
        game.battle;

    const labels = [
        "FIGHT",
        "ACT",
        "ITEM",
        "MERCY"
    ];


    if(b.phase==="menu"){

        labels.forEach((label,i)=>{

            const x =
                185+(i%2)*60;

            const y =
                110+
                Math.floor(i/2)*25;

            if(i===b.menu){

                ctx.strokeStyle="#fff";

                ctx.strokeRect(
                    x-8,
                    y-9,
                    55,
                    16
                );

            }

            ctx.fillStyle="#fff";

            ctx.font="7px monospace";

            ctx.fillText(
                label,
                x,
                y+2
            );

        });

    }


    if(b.phase==="act"){

        ctx.fillStyle="#fff";

        ctx.font="7px monospace";

        ctx.fillText(
            "ACT",
            200,
            110
        );

        ctx.fillText(
            "Поговорить",
            200,
            128
        );

        ctx.fillText(
            "Осмотреть",
            200,
            143
        );

        ctx.fillText(
            "Z — выбрать",
            200,
            160
        );

    }


    if(b.phase==="item"){

        ctx.fillStyle="#fff";

        ctx.font="7px monospace";

        ctx.fillText(
            "ITEM",
            200,
            110
        );

        ctx.fillText(
            "Potion +35 HP",
            200,
            128
        );

        ctx.fillText(
            "Z — использовать",
            200,
            143
        );

        ctx.fillText(
            "X — назад",
            200,
            158
        );

    }


    if(b.phase==="mercy"){

        ctx.fillStyle="#fff";

        ctx.font="7px monospace";

        ctx.fillText(
            "MERCY",
            200,
            110
        );

        ctx.fillText(
            "Пощадить",
            200,
            128
        );

        ctx.fillText(
            "Z — выбрать",
            200,
            143
        );

        ctx.fillText(
            "X — назад",
            200,
            158
        );

    }

}


/* =========================================================
   ENEMY BOX + SOUL
========================================================= */

function drawEnemyBox(){

    const b =
        game.battle;

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        50,
        88,
        220,
        72
    );


    /* bullets */

    b.bullets.forEach(bullet=>{

        ctx.fillStyle="#fff";

        ctx.fillRect(
            bullet.x-bullet.size,
            bullet.y-bullet.size,
            bullet.size*2,
            bullet.size*2
        );

    });


    /* soul */

    ctx.fillStyle="#fff";

    ctx.fillRect(
        b.soul.x-3,
        b.soul.y-3,
        6,
        6
    );


    if(
        b.soul.damageCooldown > 0
    ){

        ctx.fillStyle="#aaa";

        ctx.fillRect(
            b.soul.x-5,
            b.soul.y-5,
            10,
            10
        );

    }

}


/* =========================================================
   TRANSITION
========================================================= */

function drawTransition(){

    if(game.transition<=0)
        return;

    ctx.fillStyle="#000";

    ctx.globalAlpha =
        game.transition/20;

    ctx.fillRect(
        0,0,W,H
    );

    ctx.globalAlpha=1;

    game.transition--;

}


/* =========================================================
   UPDATE
========================================================= */

function update(){

    if(game.mode==="explore"){

        updatePlayer();
        updateFollowers();
        updateNPC();
        updateExit();

        randomBattleCheck();

    }

    else if(game.mode==="dialogue"){

        updateDialogue();

    }

    else if(game.mode==="menu"){

        updateMenu();

    }

    else if(game.mode==="battle"){

        updateBattle();

    }


    /* C opens menu only during exploration */

    if(
        keys.c &&
        !previous.c &&
        game.mode==="explore"
    ){

        game.mode="menu";

        game.menuPage="main";

        game.menuIndex=0;

    }


    previous.z = keys.z;
    previous.x = keys.x;
    previous.c = keys.c;

}


/* =========================================================
   MENU UPDATE
========================================================= */

function updateMenu(){

    if(keys.x && !previous.x){

        if(game.menuPage!=="main"){

            game.menuPage="main";

        }else{

            game.mode="explore";

        }

        return;

    }


    if(game.menuPage==="main"){

        if(keys.up){

            game.menuIndex--;

            if(game.menuIndex<0)
                game.menuIndex=3;

            keys.up=false;

        }

        if(keys.down){

            game.menuIndex++;

            if(game.menuIndex>3)
                game.menuIndex=0;

            keys.down=false;

        }

        if(keys.z && !previous.z){

            const pages=[
                "ITEM",
                "STATUS",
                "EQUIPMENT",
                "SETTINGS"
            ];

            game.menuPage =
                pages[game.menuIndex];

        }

    }

}


/* =========================================================
   DRAW
========================================================= */

function draw(){

    ctx.clearRect(
        0,0,W,H
    );


    if(game.mode==="battle"){

        drawBattle();

    }

    else {

        drawExplore();

        if(game.mode==="dialogue")
            drawDialogue();

        if(game.mode==="menu")
            drawMenu();

    }


    drawTransition();

}


/* =========================================================
   LOOP
========================================================= */

function loop(){

    update();

    draw();

    requestAnimationFrame(loop);

}

loop();
