"use strict";

/* =========================================================
   CANVAS
========================================================= */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = 480;
const H = 270;


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

const old = {
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

window.addEventListener("keydown", e => {

    const k = e.key.toLowerCase();

    if(e.key === "ArrowUp" || k === "w") keys.up = true;
    if(e.key === "ArrowDown" || k === "s") keys.down = true;
    if(e.key === "ArrowLeft" || k === "a") keys.left = true;
    if(e.key === "ArrowRight" || k === "d") keys.right = true;

    if(k === "z" || e.key === "Enter") keys.z = true;
    if(k === "x" || e.key === "Escape") keys.x = true;
    if(k === "c") keys.c = true;

    e.preventDefault();

},{passive:false});


window.addEventListener("keyup", e => {

    const k = e.key.toLowerCase();

    if(e.key === "ArrowUp" || k === "w") keys.up = false;
    if(e.key === "ArrowDown" || k === "s") keys.down = false;
    if(e.key === "ArrowLeft" || k === "a") keys.left = false;
    if(e.key === "ArrowRight" || k === "d") keys.right = false;

    if(k === "z" || e.key === "Enter") keys.z = false;
    if(k === "x" || e.key === "Escape") keys.x = false;
    if(k === "c") keys.c = false;

    e.preventDefault();

},{passive:false});


/* =========================================================
   MOBILE BUTTONS
========================================================= */

document.querySelectorAll(".joy,.action-button").forEach(button => {

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

document
.getElementById("fullscreen-button")
.addEventListener("pointerdown", async e => {

    e.preventDefault();

    try {

        if(!document.fullscreenElement) {

            await document.documentElement.requestFullscreen();

        } else {

            await document.exitFullscreen();

        }

    } catch(err) {

        console.log(err);

    }

});


/* =========================================================
   GAME STATE
========================================================= */

const game = {

    mode:"title",

    room:"room1",

    menu:0,

    dialogue:null,

    dialogueIndex:0,

    battle:null,

    firstBattleDone:false,

    saveSlot:0,

    saveMessage:""

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


/* =========================================================
   PLAYER
========================================================= */

const player = {
    x:80,
    y:180,
    w:12,
    h:16
};


/* =========================================================
   ROOMS
========================================================= */

const rooms = {

    room1:{
        floor:"#151515",

        walls:[
            {x:0,y:0,w:480,h:10},
            {x:0,y:260,w:480,h:10},
            {x:0,y:0,w:10,h:270},
            {x:470,y:0,w:10,h:270},

            {x:80,y:70,w:100,h:10},
            {x:300,y:70,w:100,h:10}
        ],

        npc:{
            x:350,
            y:170,
            name:"СТРАННЫЙ ЧЕЛОВЕК",
            color:"#ffff55"
        },

        save:{
            x:110,
            y:65
        },

        exit:{
            x:450,
            y:120,
            w:20,
            h:40
        }
    },

    room2:{
        floor:"#080b12",

        walls:[
            {x:0,y:0,w:480,h:10},
            {x:0,y:260,w:480,h:10},
            {x:0,y:0,w:10,h:270},
            {x:470,y:0,w:10,h:270}
        ],

        npc:{
            x:240,
            y:80,
            name:"ТАИНСТВЕННАЯ ДЕВУШКА",
            color:"#ff66cc"
        },

        exit:{
            x:10,
            y:120,
            w:20,
            h:40
        }
    }

};


/* =========================================================
   COLLISION
========================================================= */

function collide(a,b){

    return (
        a.x < b.x+b.w &&
        a.x+a.w > b.x &&
        a.y < b.y+b.h &&
        a.y+a.h > b.y
    );

}


function canMove(x,y){

    const test = {
        x:x,
        y:y,
        w:player.w,
        h:player.h
    };

    for(const wall of rooms[game.room].walls){

        if(collide(test,wall))
            return false;

    }

    return true;
}


/* =========================================================
   EXPLORE
========================================================= */

function updateExplore(){

    let dx=0;
    let dy=0;

    if(keys.up) dy-=1;
    if(keys.down) dy+=1;
    if(keys.left) dx-=1;
    if(keys.right) dx+=1;

    const speed=1.6;

    if(dx && dy){
        dx*=.707;
        dy*=.707;
    }

    if(canMove(player.x+dx*speed,player.y))
        player.x+=dx*speed;

    if(canMove(player.x,player.y+dy*speed))
        player.y+=dy*speed;


    const room=rooms[game.room];

    if(
        keys.z &&
        !old.z &&
        Math.hypot(
            player.x-room.npc.x,
            player.y-room.npc.y
        ) < 35
    ){

        startDialogue(room.npc.name);

    }


    if(
        keys.z &&
        !old.z &&
        room.save &&
        Math.hypot(
            player.x-room.save.x,
            player.y-room.save.y
        ) < 35
    ){

        game.mode="save";

    }


    if(
        collide(player,room.exit)
    ){

        if(game.room==="room1"){

            game.room="room2";
            player.x=35;
            player.y=130;

            if(!game.firstBattleDone){

                setTimeout(startBattle,300);

            }

        }else{

            game.room="room1";
            player.x=430;
            player.y=130;

        }

    }

}


/* =========================================================
   DIALOGUE
========================================================= */

const dialogueText = {

    "СТРАННЫЙ ЧЕЛОВЕК":[
        "Эй...",
        "Дельта.",
        "Так это ты ведёшь этот отряд?",
        "Здесь становится всё опаснее.",
        "Лучше не задерживайтесь."
    ],

    "ТАИНСТВЕННАЯ ДЕВУШКА":[
        "Вы наконец пришли.",
        "Я ждала именно вас.",
        "Что-то пробудилось в темноте.",
        "Будьте осторожны."
    ]

};


function startDialogue(name){

    game.dialogue=dialogueText[name];

    game.dialogueIndex=0;

    game.mode="dialogue";

}


function updateDialogue(){

    if(keys.x && !old.x){

        game.mode="explore";
        game.dialogue=null;

        return;

    }

    if(keys.z && !old.z){

        game.dialogueIndex++;

        if(game.dialogueIndex>=game.dialogue.length){

            game.mode="explore";
            game.dialogue=null;

        }

    }

}


/* =========================================================
   SAVE
========================================================= */

function saveGame(slot){

    const data={

        room:game.room,

        x:player.x,

        y:player.y,

        firstBattleDone:game.firstBattleDone,

        party:party.map(p=>p.hp),

        date:new Date().toLocaleString()

    };

    localStorage.setItem(
        "bloodGlow_"+slot,
        JSON.stringify(data)
    );

    game.saveMessage="ИГРА СОХРАНЕНА!";

}


function loadGame(slot){

    const raw=localStorage.getItem("bloodGlow_"+slot);

    if(!raw){

        game.saveMessage="ФАЙЛ ПУСТ.";

        return;

    }

    try{

        const d=JSON.parse(raw);

        game.room=d.room || "room1";

        player.x=d.x || 80;
        player.y=d.y || 180;

        game.firstBattleDone=!!d.firstBattleDone;

        if(d.party){

            d.party.forEach((hp,i)=>{

                if(party[i])
                    party[i].hp=Math.max(
                        0,
                        Math.min(
                            party[i].maxHP,
                            hp
                        )
                    );

            });

        }

        game.mode="explore";

        game.saveMessage="ИГРА ЗАГРУЖЕНА!";

    }catch{

        game.saveMessage="ОШИБКА ФАЙЛА.";

    }

}


function updateSave(){

    if(keys.x && !old.x){

        game.mode="explore";
        game.saveMessage="";

    }

    if(keys.up && !old.up){

        game.saveSlot--;

        if(game.saveSlot<0)
            game.saveSlot=2;

    }

    if(keys.down && !old.down){

        game.saveSlot++;

        if(game.saveSlot>2)
            game.saveSlot=0;

    }

    if(keys.z && !old.z){

        const raw=localStorage.getItem(
            "bloodGlow_"+game.saveSlot
        );

        if(raw)
            loadGame(game.saveSlot);
        else
            saveGame(game.saveSlot);

    }

}


/* =========================================================
   MAIN MENU
========================================================= */

function updateMenu(){

    if(keys.x && !old.x){

        game.mode="explore";

        return;

    }

}


function drawMenu(){

    ctx.fillStyle="#000";
    ctx.fillRect(0,0,W,H);

    ctx.strokeStyle="#fff";
    ctx.lineWidth=3;

    ctx.strokeRect(30,20,420,230);

    ctx.fillStyle="#fff";

    ctx.font="22px monospace";

    ctx.fillText("BLOOD GLOW",55,55);

    ctx.font="13px monospace";

    ctx.fillText("ITEM",70,95);
    ctx.fillText("STATUS",70,125);
    ctx.fillText("PARTY",70,155);
    ctx.fillText("SETTINGS",70,185);

    ctx.fillText("C / X — назад",280,225);

}


/* =========================================================
   BATTLE
========================================================= */

function startBattle(){

    game.mode="battle";

    game.battle={

        enemy:{
            name:"ТЕНЕВОЙ ЗВЕРЬ",
            hp:250,
            maxHP:250,
            color:"#7439a8"
        },

        actor:0,

        cursor:0,

        phase:"menu",

        mercy:0,

        rd:0,

        message:"ТЕНЕВОЙ ЗВЕРЬ смотрит прямо на вас.",

        attackTime:0,

        soul:{
            x:240,
            y:185,
            speed:2.7
        },

        bullets:[]

    };

}


/* =========================================================
   BATTLE MENU
========================================================= */

const battleCommands=[
    "FIGHT",
    "ACT",
    "ITEM",
    "DEFEND",
    "MAGIC",
    "MERCY"
];


function updateBattle(){

    const b=game.battle;

    if(!b) return;


    /* ================= MENU ================= */

    if(b.phase==="menu"){

        if(keys.left && !old.left){

            b.cursor--;

            if(b.cursor<0)
                b.cursor=5;

        }

        if(keys.right && !old.right){

            b.cursor++;

            if(b.cursor>5)
                b.cursor=0;

        }

        if(keys.z && !old.z){

            selectBattleCommand();

        }

    }


    /* ================= MAGIC ================= */

    else if(b.phase==="magic"){

        if(keys.x && !old.x){

            b.phase="menu";

        }

        if(keys.z && !old.z){

            if(b.actor===4){

                b.message=
                    "КАШТАН использует «Пепельный импульс»!";

                b.enemy.hp-=25;

                if(b.enemy.hp<0)
                    b.enemy.hp=0;

                afterPlayerAction();

            }

        }

    }


    /* ================= ACT ================= */

    else if(b.phase==="act"){

        if(keys.x && !old.x)
            b.phase="menu";

        if(keys.z && !old.z){

            b.mercy=Math.min(
                100,
                b.mercy+25
            );

            b.message=
                party[b.actor].name+
                " пытается понять врага.";

            afterPlayerAction();

        }

    }


    /* ================= ITEM ================= */

    else if(b.phase==="item"){

        if(keys.x && !old.x)
            b.phase="menu";

        if(keys.z && !old.z){

            const p=party[b.actor];

            p.hp=Math.min(
                p.maxHP,
                p.hp+30
            );

            b.message=
                p.name+
                " восстановил HP.";

            afterPlayerAction();

        }

    }


    /* ================= MERCY ================= */

    else if(b.phase==="mercy"){

        if(keys.x && !old.x)
            b.phase="menu";

        if(keys.z && !old.z){

            if(b.mercy>=100){

                b.enemy.hp=0;

                b.phase="victory";

                b.message=
                    "Вы пощадили Теневого зверя.";

            }else{

                b.message=
                    "Пощада пока недостаточно сильна.";

                afterPlayerAction();

            }

        }

    }


    /* ================= DEFEND ================= */

    else if(b.phase==="defend"){

        b.attackTime--;

        updateEnemyAttack();

        if(b.attackTime<=0){

            b.rd=Math.min(
                100,
                b.rd+18
            );

            b.message=
                party[b.actor].name+
                " защищается. RD +18";

            nextActor();

        }

    }


    /* ================= ENEMY ================= */

    else if(b.phase==="enemy"){

        updateEnemyAttack();

        b.attackTime--;

        if(b.attackTime<=0){

            b.phase="menu";

            b.actor=0;

            b.cursor=0;

            b.message=
                "Ход ДЕЛЬТЫ.";

        }

    }


    /* ================= VICTORY ================= */

    else if(b.phase==="victory"){

        if(keys.z && !old.z){

            game.firstBattleDone=true;

            game.mode="explore";

            game.battle=null;

        }

    }


    /* ================= DEFEAT ================= */

    else if(b.phase==="defeat"){

        if(keys.z && !old.z){

            party.forEach(p=>p.hp=p.maxHP);

            game.mode="explore";

            game.battle=null;

        }

    }

}


/* =========================================================
   COMMAND SELECT
========================================================= */

function selectBattleCommand(){

    const b=game.battle;

    const command=battleCommands[b.cursor];

    /* FIGHT */

    if(command==="FIGHT"){

        const p=party[b.actor];

        const damage=
            p.atk+
            Math.floor(Math.random()*6);

        b.enemy.hp-=damage;

        b.message=
            p.name+
            " атакует!  −"+
            damage+
            " HP";

        /*
           ВАЖНО:
           FIGHT НЕ увеличивает RD.
        */

        afterPlayerAction();

    }


    /* ACT */

    else if(command==="ACT"){

        b.phase="act";

    }


    /* ITEM */

    else if(command==="ITEM"){

        b.phase="item";

    }


    /* DEFEND */

    else if(command==="DEFEND"){

        b.phase="defend";

        b.attackTime=240;

        b.bullets=[];

        createBullets();

        b.message=
            party[b.actor].name+
            " приготовился защищаться.";

    }


    /* MAGIC */

    else if(command==="MAGIC"){

        if(b.actor===4){

            b.phase="magic";

        }else{

            b.message=
                party[b.actor].name+
                " не знает магии.";

        }

    }


    /* MERCY */

    else if(command==="MERCY"){

        b.phase="mercy";

    }

}


/* =========================================================
   PLAYER ACTION
========================================================= */

function afterPlayerAction(){

    const b=game.battle;

    if(b.enemy.hp<=0){

        b.enemy.hp=0;

        b.phase="victory";

        b.message="ПОБЕДА!";

        return;

    }

    nextActor();

}


function nextActor(){

    const b=game.battle;

    b.actor++;

    if(b.actor>=party.length){

        b.actor=0;

        startEnemyTurn();

    }else{

        b.phase="menu";

        b.cursor=0;

        b.message=
            "Ход "+
            party[b.actor].name+".";

    }

}


/* =========================================================
   ENEMY TURN
========================================================= */

function startEnemyTurn(){

    const b=game.battle;

    b.phase="enemy";

    b.attackTime=300;

    b.soul.x=240;
    b.soul.y=180;

    b.bullets=[];

    createBullets();

    b.message=
        "УКЛОНЯЙТЕСЬ!";

}


function createBullets(){

    const b=game.battle;

    b.bullets=[];

    for(let i=0;i<9;i++){

        b.bullets.push({

            x:105+Math.random()*270,

            y:-Math.random()*100,

            speed:1.2+Math.random()*1.7,

            size:5

        });

    }

}


/* =========================================================
   ENEMY ATTACK
========================================================= */

function updateEnemyAttack(){

    const b=game.battle;

    const soul=b.soul;

    if(keys.up) soul.y-=soul.speed;
    if(keys.down) soul.y+=soul.speed;
    if(keys.left) soul.x-=soul.speed;
    if(keys.right) soul.x+=soul.speed;


    /*
       ГРАНИЦЫ КАК В DELTARUNE
    */

    soul.x=Math.max(
        80,
        Math.min(
            400,
            soul.x
        )
    );

    soul.y=Math.max(
        115,
        Math.min(
            225,
            soul.y
        )
    );


    for(const bullet of b.bullets){

        bullet.y+=bullet.speed;

        if(bullet.y>235){

            bullet.y=-10;

            bullet.x=
                80+
                Math.random()*320;

        }


        const d=Math.hypot(
            bullet.x-soul.x,
            bullet.y-soul.y
        );


        if(d<bullet.size+4){

            if(!b.hitCooldown)
                b.hitCooldown=30;

        }

    }


    if(b.hitCooldown){

        b.hitCooldown--;

        if(b.hitCooldown===29){

            const p=party[b.actor];

            p.hp=Math.max(
                0,
                p.hp-5
            );

            b.message=
                p.name+
                " получил 5 урона.";

            if(p.hp<=0)
                checkDefeat();

        }

    }

}


/* =========================================================
   DEFEAT
========================================================= */

function checkDefeat(){

    if(
        party.every(
            p=>p.hp<=0
        )
    ){

        game.battle.phase="defeat";

    }

}


/* =========================================================
   DRAW EXPLORE
========================================================= */

function drawExplore(){

    const room=rooms[game.room];

    ctx.fillStyle=room.floor;
    ctx.fillRect(0,0,W,H);


    ctx.fillStyle="#202020";

    for(let y=15;y<260;y+=18){

        for(let x=15;x<470;x+=18){

            ctx.fillRect(x,y,1,1);

        }

    }


    ctx.fillStyle="#555";

    room.walls.forEach(w=>{
        ctx.fillRect(
            w.x,
            w.y,
            w.w,
            w.h
        );
    });


    ctx.fillStyle="#633333";

    ctx.fillRect(
        room.exit.x,
        room.exit.y,
        room.exit.w,
        room.exit.h
    );


    if(room.save)
        drawPizza(room.save.x,room.save.y);


    drawCharacter(
        room.npc.x,
        room.npc.y,
        room.npc.color
    );


    drawCharacter(
        player.x,
        player.y,
        "#fff"
    );


    ctx.fillStyle="#fff";
    ctx.font="10px monospace";

    ctx.fillText(
        game.room==="room1"
        ? "НАЧАЛО"
        : "ТЁМНАЯ КОМНАТА",
        20,
        28
    );


    ctx.font="8px monospace";

    ctx.fillText(
        "C — МЕНЮ",
        20,
        45
    );

}


/* =========================================================
   CHARACTER
========================================================= */

function drawCharacter(x,y,color){

    x=Math.round(x);
    y=Math.round(y);

    ctx.fillStyle="#000";

    ctx.fillRect(
        x-2,
        y-2,
        16,
        20
    );

    ctx.fillStyle=color;

    ctx.fillRect(
        x+2,
        y,
        8,
        7
    );

    ctx.fillRect(
        x+1,
        y+7,
        10,
        9
    );

}


/* =========================================================
   PIZZA SAVE POINT
========================================================= */

function drawPizza(x,y){

    ctx.fillStyle="#5a321d";

    ctx.fillRect(
        x-18,
        y,
        36,
        14
    );

    ctx.fillStyle="#8b542f";

    ctx.fillRect(
        x-16,
        y-3,
        32,
        7
    );

    ctx.fillStyle="#eee";

    ctx.fillRect(
        x-10,
        y-7,
        20,
        5
    );

    ctx.fillStyle="#d88932";

    ctx.fillRect(
        x-8,
        y-7,
        16,
        4
    );

    ctx.fillStyle="#ffd84a";

    ctx.fillRect(
        x-5,
        y-6,
        10,
        2
    );

    ctx.fillStyle="#a33";

    ctx.fillRect(
        x-5,
        y-6,
        2,
        2
    );

    ctx.fillRect(
        x+3,
        y-5,
        2,
        2
    );

    ctx.fillStyle="#fff";

    ctx.font="10px monospace";

    ctx.fillText("*",x-30,y-2);
    ctx.fillText("*",x+22,y+3);

}


/* =========================================================
   DIALOGUE DRAW
========================================================= */

function drawDialogue(){

    ctx.fillStyle="rgba(0,0,0,.75)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle="#000";

    ctx.fillRect(
        30,
        180,
        420,
        65
    );


    ctx.strokeStyle="#fff";
    ctx.lineWidth=3;

    ctx.strokeRect(
        30,
        180,
        420,
        65
    );


    ctx.fillStyle="#fff";

    ctx.font="12px monospace";

    ctx.fillText(
        game.dialogue[game.dialogueIndex],
        50,
        215
    );


    ctx.font="8px monospace";

    ctx.fillText(
        "Z — далее",
        350,
        235
    );

}


/* =========================================================
   BATTLE DRAW
========================================================= */

function drawBattle(){

    const b=game.battle;

    ctx.fillStyle="#000";
    ctx.fillRect(0,0,W,H);


    /*
       ENEMY AREA
    */

    ctx.strokeStyle="#fff";
    ctx.lineWidth=2;

    ctx.strokeRect(
        25,
        15,
        430,
        75
    );


    drawEnemy(
        240,
        52,
        b.enemy.color
    );


    ctx.fillStyle="#fff";

    ctx.font="10px monospace";

    ctx.fillText(
        b.enemy.name,
        38,
        32
    );


    ctx.fillText(
        "HP",
        330,
        32
    );


    drawBar(
        350,
        25,
        85,
        8,
        b.enemy.hp,
        b.enemy.maxHP
    );


    /*
       MESSAGE
    */

    ctx.font="9px monospace";

    ctx.fillText(
        b.message,
        35,
        105
    );


    /*
       RD СБОКУ
    */

    drawRD();


    /*
       PARTY
    */

    drawPartyBattle();


    /*
       COMMANDS
    */

    drawCommands();


    /*
       ENEMY ATTACK
    */

    if(
        b.phase==="enemy" ||
        b.phase==="defend"
    ){

        drawAttackField();

    }


    if(b.phase==="magic"){

        drawMagic();

    }


    if(b.phase==="act"){

        drawAct();

    }


    if(b.phase==="item"){

        drawItem();

    }


    if(b.phase==="mercy"){

        drawMercy();

    }


    if(b.phase==="victory"){

        ctx.fillStyle="#fff";

        ctx.font="20px monospace";

        ctx.fillText(
            "ПОБЕДА!",
            180,
            140
        );

        ctx.font="10px monospace";

        ctx.fillText(
            "Z — продолжить",
            185,
            165
        );

    }


    if(b.phase==="defeat"){

        ctx.fillStyle="#fff";

        ctx.font="17px monospace";

        ctx.fillText(
            "ОТРЯД ПОВЕРЖЕН",
            145,
            140
        );

        ctx.font="10px monospace";

        ctx.fillText(
            "Z — восстановиться",
            175,
            165
        );

    }

}


/* =========================================================
   RD
========================================================= */

function drawRD(){

    const b=game.battle;

    const x=8;
    const y=112;
    const w=45;
    const h=115;


    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        x,
        y,
        w,
        h
    );


    ctx.fillStyle="#151515";

    ctx.fillRect(
        x+5,
        y+5,
        w-10,
        h-10
    );


    const amount=
        (h-10)*(b.rd/100);


    ctx.fillStyle="#ffe33d";

    ctx.fillRect(
        x+5,
        y+h-5-amount,
        w-10,
        amount
    );


    ctx.fillStyle="#fff";

    ctx.font="8px monospace";

    ctx.fillText(
        "RD",
        18,
        103
    );


    ctx.save();

    ctx.translate(29,215);

    ctx.rotate(-Math.PI/2);

    ctx.fillText(
        Math.floor(b.rd)+"%",
        0,
        0
    );

    ctx.restore();

}


/* =========================================================
   PARTY
========================================================= */

function drawPartyBattle(){

    party.forEach((p,i)=>{

        const y=125+i*25;

        if(i===game.battle.actor){

            ctx.fillStyle="#fff";

            ctx.font="11px monospace";

            ctx.fillText(
                "▶",
                62,
                y
            );

        }


        ctx.fillStyle=p.color;

        ctx.font="9px monospace";

        ctx.fillText(
            p.name,
            80,
            y
        );


        drawBar(
            150,
            y-8,
            60,
            7,
            p.hp,
            p.maxHP
        );


        ctx.fillStyle="#fff";

        ctx.fillText(
            p.hp+"/"+p.maxHP,
            218,
            y
        );

    });

}


/* =========================================================
   COMMANDS
========================================================= */

function drawCommands(){

    const b=game.battle;

    const startX=285;

    const startY=135;

    battleCommands.forEach((command,i)=>{

        const col=i%2;
        const row=Math.floor(i/2);

        const x=startX+col*80;
        const y=startY+row*28;


        if(
            i===b.cursor &&
            b.phase==="menu"
        ){

            ctx.strokeStyle="#fff";

            ctx.strokeRect(
                x-8,
                y-13,
                72,
                20
            );

        }


        ctx.fillStyle=
            command==="DEFEND"
            ? "#5aaaff"
            : command==="MAGIC"
            ? "#bb66ff"
            : "#fff";


        ctx.font="9px monospace";

        ctx.fillText(
            command,
            x,
            y
        );

    });

}


/* =========================================================
   ATTACK FIELD
========================================================= */

function drawAttackField(){

    const b=game.battle;


    /*
       Большое поле,
       как отдельная арена.
    */

    ctx.fillStyle="#000";

    ctx.fillRect(
        75,
        112,
        330,
        118
    );


    ctx.strokeStyle="#fff";

    ctx.lineWidth=3;

    ctx.strokeRect(
        75,
        112,
        330,
        118
    );


    /*
       Внутренняя граница
    */

    ctx.strokeStyle="#555";

    ctx.lineWidth=1;

    ctx.strokeRect(
        83,
        120,
        314,
        102
    );


    /*
       Снаряды
    */

    for(const bullet of b.bullets){

        ctx.fillStyle="#fff";

        ctx.fillRect(
            bullet.x-bullet.size,
            bullet.y-bullet.size,
            bullet.size*2,
            bullet.size*2
        );

    }


    /*
       ДУША
    */

    ctx.fillStyle="#ff3344";

    ctx.fillRect(
        b.soul.x-5,
        b.soul.y-5,
        10,
        10
    );

    ctx.fillStyle="#fff";

    ctx.fillRect(
        b.soul.x-2,
        b.soul.y-2,
        4,
        4
    );


    ctx.fillStyle="#fff";

    ctx.font="8px monospace";

    ctx.fillText(
        b.phase==="defend"
        ? "ЗАЩИТА — УКЛОНЯЙСЯ"
        : "УКЛОНЯЙСЯ!",
        150,
        245
    );

}


/* =========================================================
   MAGIC
========================================================= */

function drawMagic(){

    ctx.fillStyle="#000";

    ctx.fillRect(
        270,
        130,
        190,
        90
    );


    ctx.strokeStyle="#bb66ff";

    ctx.strokeRect(
        270,
        130,
        190,
        90
    );


    ctx.fillStyle="#bb66ff";

    ctx.font="11px monospace";

    ctx.fillText(
        "MAGIC",
        290,
        153
    );


    ctx.fillStyle="#fff";

    ctx.font="9px monospace";

    ctx.fillText(
        "ПЕПЕЛЬНЫЙ ИМПУЛЬС",
        290,
        178
    );


    ctx.font="8px monospace";

    ctx.fillText(
        "Урон: 25",
        290,
        195
    );

    ctx.fillText(
        "Z — использовать",
        290,
        211
    );

}


/* =========================================================
   ACT
========================================================= */

function drawAct(){

    ctx.fillStyle="#000";

    ctx.fillRect(
        270,
        130,
        190,
        90
    );

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        270,
        130,
        190,
        90
    );

    ctx.fillStyle="#fff";

    ctx.font="11px monospace";

    ctx.fillText(
        "ACT",
        290,
        153
    );

    ctx.font="9px monospace";

    ctx.fillText(
        "ПОГОВОРИТЬ",
        290,
        178
    );

    ctx.fillText(
        "+25 RD",
        290,
        194
    );

    ctx.fillText(
        "Z — выбрать",
        290,
        211
    );

}


/* =========================================================
   ITEM
========================================================= */

function drawItem(){

    ctx.fillStyle="#000";

    ctx.fillRect(
        270,
        130,
        190,
        90
    );

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        270,
        130,
        190,
        90
    );

    ctx.fillStyle="#fff";

    ctx.font="11px monospace";

    ctx.fillText(
        "ITEM",
        290,
        153
    );

    ctx.font="9px monospace";

    ctx.fillText(
        "ПИТОН +30 HP",
        290,
        180
    );

    ctx.fillText(
        "Z — использовать",
        290,
        210
    );

}


/* =========================================================
   MERCY
========================================================= */

function drawMercy(){

    ctx.fillStyle="#000";

    ctx.fillRect(
        270,
        130,
        190,
        90
    );

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        270,
        130,
        190,
        90
    );

    ctx.fillStyle="#fff";

    ctx.font="11px monospace";

    ctx.fillText(
        "MERCY",
        290,
        153
    );

    ctx.font="9px monospace";

    ctx.fillText(
        "ПОЩАДИТЬ",
        290,
        180
    );

    ctx.fillText(
        Math.floor(game.battle.mercy)+"%",
        390,
        180
    );

    ctx.fillText(
        "Z — выбрать",
        290,
        210
    );

}


/* =========================================================
   BAR
========================================================= */

function drawBar(x,y,w,h,value,max){

    ctx.fillStyle="#333";

    ctx.fillRect(
        x,
        y,
        w,
        h
    );


    ctx.fillStyle="#fff";

    ctx.fillRect(
        x,
        y,
        w*Math.max(
            0,
            value/max
        ),
        h
    );

}


/* =========================================================
   ENEMY
========================================================= */

function drawEnemy(x,y,color){

    ctx.fillStyle="#000";

    ctx.fillRect(
        x-35,
        y-30,
        70,
        60
    );


    ctx.fillStyle=color;

    ctx.fillRect(
        x-28,
        y-23,
        56,
        45
    );


    ctx.fillStyle="#fff";

    ctx.fillRect(
        x-17,
        y-9,
        8,
        8
    );

    ctx.fillRect(
        x+9,
        y-9,
        8,
        8
    );

}


/* =========================================================
   SAVE DRAW
========================================================= */

function drawSave(){

    ctx.fillStyle="#000";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.strokeStyle="#fff";

    ctx.lineWidth=3;

    ctx.strokeRect(
        55,
        35,
        370,
        195
    );


    ctx.fillStyle="#fff";

    ctx.font="16px monospace";

    ctx.fillText(
        "ТОЧКА СОХРАНЕНИЯ",
        125,
        65
    );


    ctx.font="10px monospace";

    ctx.fillText(
        "Пицца всё ещё тёплая.",
        155,
        85
    );


    for(let i=0;i<3;i++){

        const y=120+i*30;

        if(i===game.saveSlot){

            ctx.strokeStyle="#fff";

            ctx.strokeRect(
                95,
                y-15,
                290,
                24
            );

            ctx.fillText(
                "▶",
                105,
                y
            );

        }

        ctx.fillText(
            "ФАЙЛ "+(i+1),
            125,
            y
        );


        if(
            localStorage.getItem(
                "bloodGlow_"+i
            )
        ){

            ctx.fillText(
                "СОХРАНЕНО",
                270,
                y
            );

        }else{

            ctx.fillText(
                "ПУСТО",
                270,
                y
            );

        }

    }


    ctx.fillText(
        "Z — сохранить / загрузить",
        110,
        220
    );


    ctx.fillText(
        "X — назад",
        310,
        220
    );


    if(game.saveMessage){

        ctx.fillStyle="#ffe33d";

        ctx.fillText(
            game.saveMessage,
            175,
            245
        );

    }

}


/* =========================================================
   TITLE
========================================================= */

function drawTitle(){

    ctx.fillStyle="#000";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle="#fff";

    ctx.font="30px monospace";

    ctx.fillText(
        "BLOOD GLOW",
        130,
        90
    );


    ctx.font="11px monospace";

    ctx.fillText(
        "Z — НАЧАТЬ",
        185,
        135
    );


    ctx.fillText(
        "C — МЕНЮ",
        190,
        160
    );

}


/* =========================================================
   UPDATE
========================================================= */

function update(){

    if(game.mode==="title"){

        if(keys.z && !old.z){

            game.mode="explore";

        }

    }

    else if(game.mode==="explore"){

        updateExplore();

        if(keys.c && !old.c){

            game.mode="menu";

        }

    }

    else if(game.mode==="dialogue"){

        updateDialogue();

    }

    else if(game.mode==="save"){

        updateSave();

    }

    else if(game.mode==="menu"){

        updateMenu();

    }

    else if(game.mode==="battle"){

        updateBattle();

    }


    old.up=keys.up;
    old.down=keys.down;
    old.left=keys.left;
    old.right=keys.right;

    old.z=keys.z;
    old.x=keys.x;
    old.c=keys.c;

}


/* =========================================================
   DRAW
========================================================= */

function draw(){

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    if(game.mode==="title"){

        drawTitle();

    }

    else if(game.mode==="explore"){

        drawExplore();

    }

    else if(game.mode==="dialogue"){

        drawExplore();
        drawDialogue();

    }

    else if(game.mode==="save"){

        drawSave();

    }

    else if(game.mode==="menu"){

        drawMenu();

    }

    else if(game.mode==="battle"){

        drawBattle();

    }

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
