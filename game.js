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
    z:false,
    x:false,
    c:false
};


/* =====================================================
   KEYBOARD
===================================================== */

window.addEventListener("keydown", function(e){

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


window.addEventListener("keyup", function(e){

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


/* =====================================================
   MOBILE BUTTONS
===================================================== */

document.querySelectorAll(".joy, .action-button")
.forEach(function(button){

    const key = button.dataset.key;

    button.addEventListener("pointerdown",function(e){

        e.preventDefault();

        keys[key] = true;

        try{
            button.setPointerCapture(e.pointerId);
        }catch(err){}

    });

    button.addEventListener("pointerup",function(e){

        e.preventDefault();

        keys[key] = false;

    });

    button.addEventListener("pointercancel",function(){

        keys[key] = false;

    });

    button.addEventListener("pointerleave",function(){

        if(effectivePointerType(button)){
            keys[key] = false;
        }

    });

});


function effectivePointerType(button){
    return true;
}


/* =====================================================
   RUN
===================================================== */

const runIndicator =
    document.getElementById("run-indicator");

canvas.addEventListener("pointerdown",function(){

    if(game.mode === "explore"){

        keys.run = true;

        runIndicator.classList.add("active");

    }

});

canvas.addEventListener("pointerup",function(){

    keys.run = false;

    runIndicator.classList.remove("active");

});

canvas.addEventListener("pointercancel",function(){

    keys.run = false;

    runIndicator.classList.remove("active");

});


/* =====================================================
   FULLSCREEN
===================================================== */

const fullscreenButton =
    document.getElementById("fullscreen-button");

fullscreenButton.addEventListener("pointerdown",async function(e){

    e.preventDefault();

    try{

        if(!document.fullscreenElement){

            await document.documentElement.requestFullscreen();

        }else{

            await document.exitFullscreen();

        }

    }catch(error){

        console.log(error);

    }

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
   GAME STATE
===================================================== */

const game = {

    mode:"title",

    room:"room1",

    dialogue:null,
    dialogueIndex:0,

    menuIndex:0,
    menuPage:"main",

    battle:null,

    saveMessage:"",

    saveTimer:0

};


/* =====================================================
   PLAYER
===================================================== */

const player = {

    x:80,
    y:125,

    w:10,
    h:14

};


/* =====================================================
   FOLLOWERS
===================================================== */

const followers = [

    {x:65,y:125,color:"#ff5555"},
    {x:50,y:125,color:"#55aaff"},
    {x:35,y:125,color:"#55dd66"},
    {x:20,y:125,color:"#cc8844"}

];


/* =====================================================
   ROOMS
===================================================== */

const rooms = {

    room1:{

        name:"ДОМ ДЕЛЬТЫ",

        floor:"#171717",

        walls:[

            {x:0,y:0,w:320,h:8},
            {x:0,y:172,w:320,h:8},
            {x:0,y:0,w:8,h:180},
            {x:312,y:0,w:8,h:180},

            {x:55,y:45,w:70,h:8},
            {x:55,y:45,w:8,h:55},

            {x:210,y:45,w:55,h:8},
            {x:257,y:45,w:8,h:55}

        ],

        npc:{
            x:230,
            y:115,
            color:"#ffff55",
            name:"СТРАННЫЙ ЧЕЛОВЕК"
        },

        pizza:{
            x:150,
            y:75,
            w:25,
            h:18
        },

        exit:{
            x:295,
            y:75,
            w:17,
            h:30
        }

    },

    room2:{

        name:"ТЁМНЫЙ КОРИДОР",

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
            color:"#ff66cc",
            name:"ТАИНСТВЕННАЯ ДЕВУШКА"
        },

        exit:{
            x:8,
            y:75,
            w:17,
            h:30
        }

    }

};


/* =====================================================
   DIALOGUES
===================================================== */

const dialogues = {

    "СТРАННЫЙ ЧЕЛОВЕК":[

        "Эй...",

        "Дельта.",

        "Так это ты ведёшь этот отряд?",

        "Немка, Личи, Панкейк и Каштан.",

        "Интересная команда.",

        "Вам лучше идти дальше."

    ],

    "ТАИНСТВЕННАЯ ДЕВУШКА":[

        "Вы наконец пришли.",

        "Я ждала именно вас.",

        "Дельта...",

        "Впереди вас ждёт бой."

    ]

};


/* =====================================================
   COLLISION
===================================================== */

function collision(a,b){

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

        if(collision(test,wall))
            return false;

    }

    return true;

}


/* =====================================================
   DISTANCE
===================================================== */

function distanceTo(x,y){

    const dx = player.x-x;
    const dy = player.y-y;

    return Math.sqrt(dx*dx+dy*dy);

}


/* =====================================================
   EXPLORE
===================================================== */

function updateExplore(){

    let dx=0;
    let dy=0;

    const speed =
        keys.run ? 2.7 : 1.4;

    if(keys.up) dy-=speed;
    if(keys.down) dy+=speed;
    if(keys.left) dx-=speed;
    if(keys.right) dx+=speed;

    if(dx !== 0 && dy !== 0){

        dx*=0.707;
        dy*=0.707;

    }

    if(canMove(player.x+dx,player.y))
        player.x+=dx;

    if(canMove(player.x,player.y+dy))
        player.y+=dy;


    /* FOLLOWERS */

    const targets=[

        {x:player.x-14,y:player.y},
        {x:player.x-28,y:player.y},
        {x:player.x-42,y:player.y},
        {x:player.x-56,y:player.y}

    ];

    followers.forEach(function(f,i){

        const t=targets[i];

        f.x+=(t.x-f.x)*0.08;
        f.y+=(t.y-f.y)*0.08;

    });


    /* NPC */

    const npc=rooms[game.room].npc;

    if(
        distanceTo(npc.x,npc.y)<24 &&
        keys.z &&
        !previous.z
    ){

        startDialogue(npc.name);

    }


    /* PIZZA SAVE */

    const room=rooms[game.room];

    if(
        room.pizza &&
        distanceTo(
            room.pizza.x+12,
            room.pizza.y+9
        )<25 &&
        keys.z &&
        !previous.z
    ){

        saveGame();

    }


    /* EXIT */

    if(
        collision(
            player,
            rooms[game.room].exit
        )
    ){

        if(game.room==="room1"){

            game.room="room2";

            player.x=25;
            player.y=90;

        }else{

            game.room="room1";

            player.x=280;
            player.y=90;

        }

    }


    /* C = MENU */

    if(
        keys.c &&
        !previous.c
    ){

        game.mode="menu";

        game.menuIndex=0;

    }

}


/* =====================================================
   DIALOGUE
===================================================== */

function startDialogue(name){

    if(!dialogues[name])
        return;

    game.dialogue=dialogues[name];
    game.dialogueIndex=0;

    game.mode="dialogue";

}


function updateDialogue(){

    if(
        keys.z &&
        !previous.z
    ){

        game.dialogueIndex++;

        if(
            game.dialogueIndex>=
            game.dialogue.length
        ){

            game.dialogue=null;

            game.mode="explore";

        }

    }

    if(
        keys.x &&
        !previous.x
    ){

        game.dialogue=null;

        game.mode="explore";

    }

}


/* =====================================================
   SAVE
===================================================== */

function saveGame(){

    const data={

        room:game.room,

        x:player.x,
        y:player.y,

        party:party.map(function(p){

            return {
                name:p.name,
                hp:p.hp
            };

        })

    };

    localStorage.setItem(
        "deltaNightSave",
        JSON.stringify(data)
    );

    game.saveMessage="ИГРА СОХРАНЕНА";

    game.saveTimer=120;

}


function loadGame(){

    const raw=
        localStorage.getItem("deltaNightSave");

    if(!raw){

        game.saveMessage="СОХРАНЕНИЙ НЕТ";

        game.saveTimer=120;

        return;

    }

    try{

        const data=JSON.parse(raw);

        game.room=data.room || "room1";

        player.x=data.x || 80;
        player.y=data.y || 125;

        if(data.party){

            data.party.forEach(function(saved,i){

                if(party[i])
                    party[i].hp=
                        Math.max(
                            0,
                            Math.min(
                                party[i].maxHP,
                                saved.hp
                            )
                        );

            });

        }

        game.mode="explore";

    }catch(error){

        console.log(error);

        game.saveMessage="ОШИБКА СОХРАНЕНИЯ";

        game.saveTimer=120;

    }

}


/* =====================================================
   MENU
===================================================== */

function updateMenu(){

    if(
        keys.x &&
        !previous.x
    ){

        game.mode="explore";

        return;

    }


    if(
        keys.up &&
        !previous.z
    ){

        game.menuIndex--;

        if(game.menuIndex<0)
            game.menuIndex=3;

    }


    if(
        keys.down &&
        !previous.z
    ){

        game.menuIndex++;

        if(game.menuIndex>3)
            game.menuIndex=0;

    }


    if(
        keys.z &&
        !previous.z
    ){

        if(game.menuIndex===0){

            loadGame();

        }

        if(game.menuIndex===1){

            saveGame();

        }

        if(game.menuIndex===2){

            game.menuPage="status";

        }

        if(game.menuIndex===3){

            game.mode="title";

        }

    }

}


/* =====================================================
   TITLE
===================================================== */

function updateTitle(){

    if(
        keys.z &&
        !previous.z
    ){

        game.mode="explore";

    }

}


/* =====================================================
   BATTLE START
===================================================== */

function startBattle(){

    game.mode="battle";

    game.battle={

        enemy:{

            name:"ТЕНЕВОЙ ЗВЕРЬ",

            hp:250,
            maxHP:250,

            atk:12,

            color:"#663399"

        },

        actor:0,

        menu:0,

        actMenu:0,

        phase:"menu",

        message:"ТЕНЕВОЙ ЗВЕРЬ ПРИБЛИЖАЕТСЯ!",

        rd:0,

        maxRD:100,

        defended:false,

        soul:{

            x:160,
            y:130,

            size:4,

            speed:2.4,

            inv:0

        },

        bullets:[],

        timer:0

    };

}


/* =====================================================
   BATTLE ACTION
===================================================== */

function battleAction(){

    const b=game.battle;
    const p=party[b.actor];


    /* FIGHT */

    if(b.menu===0){

        const damage=
            p.atk+
            Math.floor(Math.random()*7);

        b.enemy.hp=
            Math.max(
                0,
                b.enemy.hp-damage
            );

        b.message=
            p.name+
            " атакует!  -"+
            damage+
            " HP";

        b.rd=
            Math.min(
                b.maxRD,
                b.rd+22
            );

        nextTurn();

    }


    /* ACT */

    if(b.menu===1){

        b.phase="act";

        b.actMenu=0;

    }


    /* ITEM */

    if(b.menu===2){

        p.hp=
            Math.min(
                p.maxHP,
                p.hp+30
            );

        b.message=
            p.name+
            " использует предмет. +30 HP";

        b.rd=
            Math.min(
                b.maxRD,
                b.rd+12
            );

        nextTurn();

    }


    /* DEFEND */

    if(b.menu===3){

        b.defended=true;

        b.message=
            p.name+
            " защищается!";

        /*
           Защита НЕ заполняет RD.
        */

        nextTurn();

    }

}


/* =====================================================
   ACT
===================================================== */

function chooseACT(){

    const b=game.battle;

    if(b.actMenu===0){

        b.enemy.hp=
            Math.max(
                0,
                b.enemy.hp-8
            );

        b.message=
            "ДЕЛЬТА пытается поговорить с врагом.";

        b.rd=
            Math.min(
                b.maxRD,
                b.rd+30
            );

    }

    if(b.actMenu===1){

        b.message=
            "Вы внимательно осматриваете врага.";

        b.rd=
            Math.min(
                b.maxRD,
                b.rd+20
            );

    }

    nextTurn();

}


/* =====================================================
   NEXT TURN
===================================================== */

function nextTurn(){

    const b=game.battle;

    if(b.enemy.hp<=0){

        b.phase="victory";

        b.message="ВРАГ ПОБЕЖДЁН!";

        return;

    }

    b.actor++;

    if(b.actor>=party.length){

        b.actor=0;

        enemyTurn();

    }

    b.menu=0;

}


/* =====================================================
   ENEMY TURN
===================================================== */

function enemyTurn(){

    const b=game.battle;

    b.phase="enemy";

    b.timer=420;

    b.bullets=[];

    b.soul.x=160;
    b.soul.y=130;

    for(let i=0;i<8;i++){

        b.bullets.push({

            x:60+Math.random()*200,

            y:-Math.random()*100,

            speed:1+Math.random()*1.5,

            size:4

        });

    }

}


/* =====================================================
   BATTLE UPDATE
===================================================== */

function updateBattle(){

    const b=game.battle;

    if(!b)
        return;


    /* MENU */

    if(b.phase==="menu"){

        /*
           Одна кнопка = одна смена выбора.
        */

        if(
            keys.left &&
            !previous.x
        ){

            b.menu--;

            if(b.menu<0)
                b.menu=3;

        }

        if(
            keys.right &&
            !previous.x
        ){

            b.menu++;

            if(b.menu>3)
                b.menu=0;

        }

        if(
            keys.z &&
            !previous.z
        ){

            battleAction();

        }

    }


    /* ACT */

    else if(b.phase==="act"){

        if(
            keys.up &&
            !previous.z
        ){

            b.actMenu--;

            if(b.actMenu<0)
                b.actMenu=1;

        }

        if(
            keys.down &&
            !previous.z
        ){

            b.actMenu++;

            if(b.actMenu>1)
                b.actMenu=0;

        }

        if(
            keys.z &&
            !previous.z
        ){

            chooseACT();

        }

        if(
            keys.x &&
            !previous.x
        ){

            b.phase="menu";

        }

    }


    /* ENEMY */

    else if(b.phase==="enemy"){

        updateEnemyAttack();

    }


    /* VICTORY */

    else if(b.phase==="victory"){

        if(
            keys.z &&
            !previous.z
        ){

            game.mode="explore";
            game.battle=null;

        }

    }


    /* DEFEAT */

    else if(b.phase==="defeat"){

        if(
            keys.z &&
            !previous.z
        ){

            party.forEach(function(p){

                p.hp=p.maxHP;

            });

            game.mode="explore";
            game.battle=null;

        }

    }

}


/* =====================================================
   ENEMY ATTACK
===================================================== */

function updateEnemyAttack(){

    const b=game.battle;

    b.timer--;

    if(keys.up)
        b.soul.y-=b.soul.speed;

    if(keys.down)
        b.soul.y+=b.soul.speed;

    if(keys.left)
        b.soul.x-=b.soul.speed;

    if(keys.right)
        b.soul.x+=b.soul.speed;


    b.soul.x=
        Math.max(
            55,
            Math.min(
                265,
                b.soul.x
            )
        );

    b.soul.y=
        Math.max(
            95,
            Math.min(
                155,
                b.soul.y
            )
        );


    if(b.soul.inv>0)
        b.soul.inv--;


    b.bullets.forEach(function(bullet){

        bullet.y+=bullet.speed;

        if(bullet.y>160){

            bullet.y=-10;

            bullet.x=
                55+
                Math.random()*210;

        }


        const dx=
            bullet.x-b.soul.x;

        const dy=
            bullet.y-b.soul.y;

        const d=
            Math.sqrt(dx*dx+dy*dy);


        if(
            d<
            bullet.size+
            b.soul.size
        ){

            if(b.soul.inv<=0){

                const p=party[b.actor];

                let damage=8;

                if(b.defended)
                    damage=3;

                p.hp=
                    Math.max(
                        0,
                        p.hp-damage
                    );

                b.soul.inv=45;

                b.message=
                    p.name+
                    " получает "+
                    damage+
                    " урона!";

                b.defended=false;

                if(p.hp<=0){

                    let alive=false;

                    party.forEach(function(member){

                        if(member.hp>0)
                            alive=true;

                    });

                    if(!alive){

                        b.phase="defeat";

                    }

                }

            }

        }

    });


    if(b.timer<=0){

        b.phase="menu";

        b.actor++;

        if(b.actor>=party.length)
            b.actor=0;

        b.menu=0;

        b.message=
            "ХОД: "+
            party[b.actor].name;

    }

}


/* =====================================================
   DRAW HELPERS
===================================================== */

function rect(x,y,w,h,color){

    ctx.fillStyle=color;

    ctx.fillRect(
        Math.round(x),
        Math.round(y),
        Math.round(w),
        Math.round(h)
    );

}


function text(str,x,y,size=7,color="#fff"){

    ctx.fillStyle=color;

    ctx.font=
        size+
        "px monospace";

    ctx.fillText(
        str,
        Math.round(x),
        Math.round(y)
    );

}


/* =====================================================
   DRAW CHARACTER
===================================================== */

function drawCharacter(x,y,color){

    rect(
        x-1,
        y-1,
        12,
        16,
        "#000"
    );

    rect(
        x+2,
        y,
        6,
        6,
        color
    );

    rect(
        x+1,
        y+6,
        8,
        7,
        color
    );

    rect(
        x+1,
        y+13,
        3,
        2,
        color
    );

    rect(
        x+6,
        y+13,
        3,
        2,
        color
    );

}


/* =====================================================
   DRAW ROOM
===================================================== */

function drawRoom(){

    const room=rooms[game.room];

    rect(
        0,
        0,
        W,
        H,
        room.floor
    );


    /* PIXEL FLOOR */

    for(let y=12;y<170;y+=16){

        for(let x=12;x<310;x+=16){

            rect(
                x,
                y,
                1,
                1,
                "#292929"
            );

        }

    }


    /* WALLS */

    room.walls.forEach(function(w){

        rect(
            w.x,
            w.y,
            w.w,
            w.h,
            "#555"
        );

    });


    /* EXIT */

    rect(
        room.exit.x,
        room.exit.y,
        room.exit.w,
        room.exit.h,
        "#743333"
    );


    /* PIZZA SAVE TABLE */

    if(room.pizza){

        rect(
            138,
            63,
            50,
            38,
            "#51331f"
        );

        rect(
            142,
            67,
            42,
            30,
            "#8a572e"
        );


        /* PIZZA */

        rect(
            150,
            72,
            22,
            16,
            "#e0a238"
        );

        rect(
            153,
            75,
            16,
            10,
            "#cc4938"
        );

        rect(
            156,
            77,
            3,
            3,
            "#fff08a"
        );

        rect(
            164,
            80,
            3,
            3,
            "#fff08a"
        );


        text(
            "★",
            157,
            60,
            8,
            "#fff"
        );

    }


    /* NPC */

    const npc=room.npc;

    drawCharacter(
        npc.x,
        npc.y,
        npc.color
    );


    /* FOLLOWERS */

    followers.forEach(function(f){

        drawCharacter(
            f.x,
            f.y,
            f.color
        );

    });


    /* PLAYER */

    drawCharacter(
        player.x,
        player.y,
        "#fff"
    );


    text(
        room.name,
        12,
        18,
        7,
        "#fff"
    );


    /* SAVE MESSAGE */

    if(game.saveTimer>0){

        text(
            game.saveMessage,
            112,
            28,
            7,
            "#fff"
        );

        game.saveTimer--;

    }


    /* INTERACTION */

    const npc=room.npc;

    if(
        distanceTo(npc.x,npc.y)<24
    ){

        text(
            "Z — ГОВОРИТЬ",
            112,
            155,
            6,
            "#fff"
        );

    }

    if(
        room.pizza &&
        distanceTo(
            room.pizza.x+12,
            room.pizza.y+9
        )<25
    ){

        text(
            "Z — СОХРАНИТЬ",
            112,
            155,
            6,
            "#fff"
        );

    }

}


/* =====================================================
   DIALOGUE DRAW
===================================================== */

function drawDialogue(){

    rect(
        0,
        0,
        W,
        H,
        "rgba(0,0,0,0.6)"
    );

    rect(
        10,
        110,
        300,
        58,
        "#000"
    );

    ctx.strokeStyle="#fff";
    ctx.lineWidth=2;

    ctx.strokeRect(
        10,
        110,
        300,
        58
    );


    text(
        game.dialogue[
            game.dialogueIndex
        ],
        24,
        132,
        8,
        "#fff"
    );


    text(
        "Z — далее",
        225,
        155,
        6,
        "#fff"
    );

}


/* =====================================================
   BATTLE DRAW
===================================================== */

function drawBattle(){

    const b=game.battle;


    /* BACKGROUND */

    rect(
        0,
        0,
        W,
        H,
        "#050505"
    );


    /* ENEMY AREA */

    ctx.strokeStyle="#777";

    ctx.strokeRect(
        15,
        7,
        290,
        62
    );


    /* ENEMY */

    rect(
        142,
        23,
        36,
        35,
        "#000"
    );

    rect(
        147,
        27,
        26,
        25,
        b.enemy.color
    );


    rect(
        151,
        34,
        5,
        5,
        "#fff"
    );

    rect(
        164,
        34,
        5,
        5,
        "#fff"
    );


    text(
        b.enemy.name,
        25,
        20,
        7,
        "#fff"
    );


    text(
        "HP",
        220,
        19,
        6,
        "#fff"
    );


    drawBar(
        238,
        14,
        55,
        7,
        b.enemy.hp,
        b.enemy.maxHP
    );


    text(
        b.enemy.hp+
        "/"+
        b.enemy.maxHP,
        245,
        31,
        6,
        "#fff"
    );


    /* MESSAGE */

    text(
        b.message,
        30,
        82,
        6,
        "#fff"
    );


    /* PARTY */

    party.forEach(function(p,i){

        const y=102+i*12;

        /*
           СТРЕЛКА ТЕПЕРЬ СРАЗУ
           РЯДОМ С ИМЕНЕМ.
        */

        if(
            i===b.actor &&
            (
                b.phase==="menu" ||
                b.phase==="act"
            )
        ){

            text(
                "▶",
                3,
                y,
                6,
                "#fff"
            );

        }


        text(
            p.name,
            11,
            y,
            5.5,
            p.color
        );


        text(
            "HP",
            57,
            y,
            5.5,
            "#fff"
        );


        drawBar(
            69,
            y-5,
            36,
            5,
            p.hp,
            p.maxHP
        );


        text(
            p.hp+
            "/"+
            p.maxHP,
            109,
            y,
            5.5,
            "#fff"
        );

    });


    /* RD */

    drawRD();


    /* HEART BATTLE */

    if(b.phase==="enemy"){

        drawEnemyPhase();

        return;

    }


    /* VICTORY */

    if(b.phase==="victory"){

        text(
            "ПОБЕДА!",
            125,
            112,
            11,
            "#fff"
        );

        text(
            "Z — продолжить",
            106,
            130,
            6,
            "#fff"
        );

        return;

    }


    /* DEFEAT */

    if(b.phase==="defeat"){

        text(
            "ОТРЯД ПОБЕЖДЁН",
            88,
            112,
            8,
            "#fff"
        );

        text(
            "Z — восстановиться",
            95,
            130,
            6,
            "#fff"
        );

        return;

    }


    /* BATTLE MENU */

    drawBattleMenu();

}


/* =====================================================
   RD BAR
===================================================== */

function drawRD(){

    const b=game.battle;

    const x=151;
    const y=97;

    text(
        "RD",
        x,
        y,
        6,
        "#fff"
    );


    /* BACK */

    rect(
        x+16,
        y-5,
        90,
        7,
        "#222"
    );


    /* FILL */

    rect(
        x+16,
        y-5,
        90*(b.rd/100),
        7,
        "#fff"
    );


    text(
        Math.floor(b.rd)+"%",
        x+110,
        y,
        5.5,
        "#fff"
    );


    /*
       Когда RD заполнено —
       появляется возможность сильной атаки.
    */

    if(b.rd>=100){

        text(
            "RD READY!",
            205,
            91,
            5.5,
            "#fff"
        );

    }

}


/* =====================================================
   BATTLE MENU
===================================================== */

function drawBattleMenu(){

    const b=game.battle;


    if(b.phase==="menu"){

        const items=[

            "FIGHT",
            "ACT",
            "ITEM",
            "DEFEND"

        ];


        items.forEach(function(item,i){

            const x=
                165+
                (i%2)*70;

            const y=
                110+
                Math.floor(i/2)*25;


            if(i===b.menu){

                ctx.strokeStyle="#fff";

                ctx.strokeRect(
                    x-7,
                    y-9,
                    60,
                    17
                );

            }


            text(
                item,
                x,
                y+2,
                6,
                "#fff"
            );

        });

    }


    if(b.phase==="act"){

        text(
            "ACT",
            175,
            110,
            7,
            "#fff"
        );


        if(b.actMenu===0){

            text(
                "▶ ПОГОВОРИТЬ",
                175,
                126,
                6,
                "#fff"
            );

            text(
                "  ОСМОТРЕТЬ",
                175,
                141,
                6,
                "#fff"
            );

        }else{

            text(
                "  ПОГОВОРИТЬ",
                175,
                126,
                6,
                "#fff"
            );

            text(
                "▶ ОСМОТРЕТЬ",
                175,
                141,
                6,
                "#fff"
            );

        }


        text(
            "X — назад",
            215,
            155,
            6,
            "#fff"
        );

    }

}


/* =====================================================
   ENEMY PHASE DRAW
===================================================== */

function drawEnemyPhase(){

    const b=game.battle;


    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        55,
        93,
        210,
        65
    );


    /* BULLETS */

    b.bullets.forEach(function(bullet){

        rect(
            bullet.x-bullet.size,
            bullet.y-bullet.size,
            bullet.size*2,
            bullet.size*2,
            "#fff"
        );

    });


    /* SOUL */

    rect(
        b.soul.x-4,
        b.soul.y-4,
        8,
        8,
        "#fff"
    );


    if(b.soul.inv>0){

        ctx.strokeStyle="#fff";

        ctx.strokeRect(
            b.soul.x-7,
            b.soul.y-7,
            14,
            14
        );

    }

}


/* =====================================================
   MENU DRAW
===================================================== */

function drawMenu(){

    rect(
        0,
        0,
        W,
        H,
        "#000"
    );


    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        20,
        10,
        280,
        160
    );


    if(game.menuPage==="status"){

        text(
            "СТАТУС ОТРЯДА",
            38,
            30,
            9,
            "#fff"
        );


        party.forEach(function(p,i){

            const y=52+i*21;

            text(
                p.name,
                38,
                y,
                6,
                p.color
            );

            text(
                "HP "+
                p.hp+
                "/"+
                p.maxHP,
                150,
                y,
                6,
                "#fff"
            );

        });


        text(
            "X — назад",
            220,
            157,
            6,
            "#fff"
        );

        return;

    }


    text(
        "ГЛАВНОЕ МЕНЮ",
        40,
        31,
        9,
        "#fff"
    );


    const items=[

        "ЗАГРУЗИТЬ",
        "СОХРАНИТЬ",
        "СТАТУС",
        "НАЧАЛЬНЫЙ ЭКРАН"

    ];


    items.forEach(function(item,i){

        const y=58+i*23;

        if(i===game.menuIndex){

            text(
                "▶",
                42,
                y,
                7,
                "#fff"
            );

        }

        text(
            item,
            58,
            y,
            7,
            "#fff"
        );

    });


    text(
        "Z — выбрать",
        35,
        158,
        6,
        "#fff"
    );

    text(
        "X — назад",
        230,
        158,
        6,
        "#fff"
    );

}


/* =====================================================
   TITLE DRAW
===================================================== */

function drawTitle(){

    rect(
        0,
        0,
        W,
        H,
        "#000"
    );


    text(
        "DELTA NIGHT",
        92,
        55,
        14,
        "#fff"
    );


    text(
        "ДЕЛЬТА",
        132,
        78,
        8,
        "#fff"
    );


    text(
        "ДЕЛЬТА  НЕМКА  ЛИЧИ",
        83,
        102,
        5.5,
        "#aaa"
    );


    text(
        "ПАНКЕЙК  КАШТАН",
        105,
        114,
        5.5,
        "#aaa"
    );


    text(
        "Z — НАЧАТЬ",
        119,
        145,
        7,
        "#fff"
    );

}


/* =====================================================
   UPDATE
===================================================== */

function update(){

    if(game.mode==="title")
        updateTitle();

    else if(game.mode==="explore")
        updateExplore();

    else if(game.mode==="dialogue")
        updateDialogue();

    else if(game.mode==="menu")
        updateMenu();

    else if(game.mode==="battle")
        updateBattle();


    previous.z=keys.z;
    previous.x=keys.x;
    previous.c=keys.c;

}


/* =====================================================
   DRAW
===================================================== */

function draw(){

    /*
       ВАЖНО:
       canvas всегда очищается и всегда
       рисует один из экранов.
       Поэтому чёрный экран из-за
       отсутствующего render не появится.
    */

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    if(game.mode==="title")
        drawTitle();

    else if(game.mode==="explore")
        drawRoom();

    else if(game.mode==="dialogue"){

        drawRoom();
        drawDialogue();

    }

    else if(game.mode==="menu")
        drawMenu();

    else if(game.mode==="battle")
        drawBattle();

}


/* =====================================================
   GAME LOOP
===================================================== */

function loop(){

    update();

    draw();

    requestAnimationFrame(loop);

}


/* =====================================================
   START
===================================================== */

loop();
