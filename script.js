"use strict";

/* =====================================================
   CANVAS
===================================================== */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = 320;
const H = 180;


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

}, {passive:false});


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

}, {passive:false});


/* =====================================================
   MOBILE BUTTONS
===================================================== */

document.querySelectorAll("[data-key]").forEach(button => {

    const key = button.dataset.key;

    button.addEventListener("pointerdown", e => {

        e.preventDefault();

        keys[key] = true;

        if(button.setPointerCapture){

            try{
                button.setPointerCapture(e.pointerId);
            }catch(err){}

        }

    });

    button.addEventListener("pointerup", e => {

        e.preventDefault();

        keys[key] = false;

    });

    button.addEventListener("pointercancel", () => {

        keys[key] = false;

    });

    button.addEventListener("pointerleave", () => {

        if(key !== "z" &&
           key !== "x" &&
           key !== "c"){

            keys[key] = false;

        }

    });

});


/* =====================================================
   FULLSCREEN
===================================================== */

document
    .getElementById("fullscreen")
    .addEventListener("pointerdown", async e => {

        e.preventDefault();

        try{

            if(!document.fullscreenElement){

                await document.documentElement.requestFullscreen();

            }else{

                await document.exitFullscreen();

            }

        }catch(err){

            console.log("Fullscreen:",err);

        }

    });


/* =====================================================
   GAME STATE
===================================================== */

const game = {

    state:"title",

    player:{
        x:160,
        y:110,
        speed:1.4
    },

    dialogue:[],

    dialogueIndex:0,

    message:"",

    battle:null,

    steps:0,

    enemyTimer:0

};


/* =====================================================
   PARTY
===================================================== */

const party = [

    {
        name:"ДЕЛЬТА",
        hp:90,
        maxHP:90,
        atk:14,
        def:8
    },

    {
        name:"ЛИЧИ",
        hp:80,
        maxHP:80,
        atk:13,
        def:6
    },

    {
        name:"ПАНКЕЙК",
        hp:70,
        maxHP:70,
        atk:10,
        def:11
    },

    {
        name:"КАШТАН",
        hp:110,
        maxHP:110,
        atk:12,
        def:12
    },

    {
        name:"ШАРЛОТА",
        hp:100,
        maxHP:100,
        atk:11,
        def:9
    }

];


/* =====================================================
   START
===================================================== */

function startGame(){

    game.state = "intro";

    game.dialogue = [

        "ДЕЛЬТА просыпается.",

        "За окном — цифровая пустошь.",

        "Где-то далеко мерцают странные огни.",

        "Дельта выходит из комнаты.",

        "Остальные уже ждут снаружи."

    ];

    game.dialogueIndex = 0;

}


/* =====================================================
   DIALOGUE
===================================================== */

function teamDialogue(){

    game.state = "dialogue";

    game.dialogue = [

        "ЛИЧИ: Надо проверить Немку...",

        "ЛИЧИ: Она изменилась.",

        "ЛИЧИ: Последний раз, когда мы пытались поговорить с ней,",

        "ЛИЧИ: она была странной.",

        "ДЕЛЬТА: Так мы идём?",

        "ЛИЧИ: Да.",

        "ПАНКЕЙК: Тогда не будем терять время.",

        "КАШТАН: Только держитесь вместе.",

        "ШАРЛОТА: Что-то здесь не так..."

    ];

    game.dialogueIndex = 0;

}


function nextDialogue(){

    game.dialogueIndex++;

    if(game.dialogueIndex >= game.dialogue.length){

        game.state = "wasteland";

        game.dialogue = [];

    }

}


/* =====================================================
   MOVEMENT
===================================================== */

function updateMovement(){

    if(game.state !== "wasteland")
        return;

    let dx = 0;
    let dy = 0;

    if(keys.up)
        dy--;

    if(keys.down)
        dy++;

    if(keys.left)
        dx--;

    if(keys.right)
        dx++;

    if(dx !== 0 && dy !== 0){

        dx *= .707;
        dy *= .707;

    }

    game.player.x += dx * game.player.speed;
    game.player.y += dy * game.player.speed;

    game.player.x =
        Math.max(15,Math.min(305,game.player.x));

    game.player.y =
        Math.max(20,Math.min(160,game.player.y));

    if(dx !== 0 || dy !== 0){

        game.steps++;

        /*
           Враг появляется значительно реже.
           Не каждые 2 шага.
        */

        if(game.steps > 450){

            if(Math.random() < .008){

                startBattle();

                game.steps = 0;

            }

        }

    }

}


/* =====================================================
   BATTLE
===================================================== */

function startBattle(){

    game.state = "battle";

    game.battle = {

        enemyCount:
            Math.random() < .7 ? 1 : 2,

        enemyHP:120,

        menu:0,

        phase:"menu",

        mercy:0,

        rd:0,

        actor:0,

        soul:{
            x:160,
            y:140
        },

        bullets:[],

        laser:null,

        attackTime:0

    };

}


/* =====================================================
   BATTLE MENU
===================================================== */

const battleOptions = [

    "FIGHT",
    "ACT",
    "MAGIC",
    "DEFEND"

];


function battleInput(){

    const b = game.battle;

    if(b.phase !== "menu")
        return;


    if(keys.left && !oldKeys.left){

        b.menu--;

        if(b.menu < 0)
            b.menu = 3;

    }


    if(keys.right && !oldKeys.right){

        b.menu++;

        if(b.menu > 3)
            b.menu = 0;

    }


    if(keys.z && !oldKeys.z){

        chooseBattleOption();

    }

}


const oldKeysExtra = {

    left:false,
    right:false
};


/* =====================================================
   BATTLE ACTION
===================================================== */

function chooseBattleOption(){

    const b = game.battle;

    if(b.menu === 0){

        b.enemyHP -= 25;

        game.message =
            "ДЕЛЬТА атакует!";

        enemyTurn();

    }

    else if(b.menu === 1){

        b.mercy =
            Math.min(100,b.mercy+30);

        game.message =
            "Вы изучили ошибку системы.";

        enemyTurn();

    }

    else if(b.menu === 2){

        b.mercy =
            Math.min(100,b.mercy+15);

        game.message =
            "КАШТАН использует магию!";

        enemyTurn();

    }

    else if(b.menu === 3){

        /*
           ГЛАВНОЕ:
           RD растёт только от защиты.
        */

        b.rd =
            Math.min(100,b.rd+25);

        game.message =
            "Отряд защищается.\nRD +25%";

        enemyTurn();

    }

}


/* =====================================================
   ENEMY TURN
===================================================== */

function enemyTurn(){

    const b = game.battle;

    b.phase = "enemy";

    b.attackTime = 360;

    b.bullets = [];

    b.laser = null;


    if(b.enemyCount === 1){

        /*
           Один глитч = лазер.
        */

        b.laser = {

            x:50+Math.random()*220,

            warning:100,

            active:50

        };

    }else{

        /*
           Несколько глитчей = частицы / взрывы.
        */

        for(let i=0;i<10;i++){

            b.bullets.push({

                x:50+Math.random()*220,

                y:90+Math.random()*65,

                vx:(Math.random()-.5)*1.4,

                vy:(Math.random()-.5)*1.4,

                size:3

            });

        }

    }

}


/* =====================================================
   ENEMY ATTACK
===================================================== */

function updateEnemyAttack(){

    const b = game.battle;

    if(b.phase !== "enemy")
        return;


    if(b.attackTime > 0)
        b.attackTime--;


    const s = b.soul;


    /* LASER */

    if(b.laser){

        if(b.laser.warning > 0){

            b.laser.warning--;

        }else{

            b.laser.active--;

            if(
                Math.abs(
                    s.x-b.laser.x
                ) < 8
            ){

                damagePlayer();

            }

        }

    }


    /* EXPLOSIONS */

    b.bullets.forEach(p => {

        p.x += p.vx;
        p.y += p.vy;

        if(
            Math.hypot(
                p.x-s.x,
                p.y-s.y
            ) < 9
        ){

            damagePlayer();

        }

    });


    if(b.attackTime <= 0){

        b.phase = "menu";

        b.menu = 0;

        b.actor++;

        if(b.actor >= party.length)
            b.actor = 0;

    }

}


/* =====================================================
   DAMAGE
===================================================== */

let damageCooldown = 0;

function damagePlayer(){

    if(damageCooldown > 0)
        return;

    damageCooldown = 30;

    const p = party[game.battle.actor];

    p.hp -= 8;

    if(p.hp < 0)
        p.hp = 0;

}


/* =====================================================
   SOUL
===================================================== */

function updateSoul(){

    if(game.state !== "battle")
        return;

    const b = game.battle;

    if(b.phase !== "enemy")
        return;

    if(keys.up)
        b.soul.y -= 2;

    if(keys.down)
        b.soul.y += 2;

    if(keys.left)
        b.soul.x -= 2;

    if(keys.right)
        b.soul.x += 2;


    b.soul.x =
        Math.max(
            65,
            Math.min(
                255,
                b.soul.x
            )
        );

    b.soul.y =
        Math.max(
            100,
            Math.min(
                155,
                b.soul.y
            )
        );

}


/* =====================================================
   DRAW TITLE
===================================================== */

function drawTitle(){

    ctx.fillStyle="#000";

    ctx.fillRect(0,0,W,H);


    ctx.fillStyle="#fff";

    ctx.font="18px monospace";

    ctx.textAlign="center";

    ctx.fillText(
        "BLOOD GLOW",
        160,
        55
    );


    ctx.font="8px monospace";

    ctx.fillText(
        "цифровой мир",
        160,
        72
    );


    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        110,
        105,
        100,
        25
    );


    ctx.fillText(
        "НАЧАТЬ",
        160,
        121
    );


    ctx.textAlign="left";

}


/* =====================================================
   DRAW WASTELAND
===================================================== */

function drawWasteland(){

    ctx.fillStyle="#10151c";

    ctx.fillRect(0,0,W,H);


    /* цифровая пустошь */

    for(let i=0;i<80;i++){

        const x=(i*47)%320;
        const y=(i*23)%180;

        ctx.fillStyle =
            i%3===0
            ? "#26323b"
            : "#1b242b";

        ctx.fillRect(
            x,
            y,
            2,
            2
        );

    }


    ctx.fillStyle="#182229";

    for(let i=0;i<10;i++){

        ctx.fillRect(
            i*35,
            125+(i%3)*8,
            22,
            3
        );

    }


    /* команда */

    drawCharacter(
        game.player.x,
        game.player.y,
        "#fff"
    );


    drawCharacter(
        game.player.x-14,
        game.player.y,
        "#55aaff"
    );

    drawCharacter(
        game.player.x-28,
        game.player.y,
        "#55dd66"
    );

    drawCharacter(
        game.player.x-42,
        game.player.y,
        "#cc8844"
    );

    drawCharacter(
        game.player.x-56,
        game.player.y,
        "#ff66cc"
    );


    ctx.fillStyle="#fff";

    ctx.font="7px monospace";

    ctx.fillText(
        "ЦИФРОВАЯ ПУСТОШЬ",
        10,
        15
    );

}


/* =====================================================
   CHARACTER
===================================================== */

function drawCharacter(x,y,color){

    x=Math.round(x);
    y=Math.round(y);


    ctx.fillStyle="#000";

    ctx.fillRect(
        x-5,
        y-10,
        10,
        18
    );


    ctx.fillStyle=color;

    ctx.fillRect(
        x-3,
        y-8,
        6,
        6
    );

    ctx.fillRect(
        x-4,
        y-2,
        8,
        7
    );

}


/* =====================================================
   DRAW DIALOGUE
===================================================== */

function drawDialogue(){

    drawWasteland();


    ctx.fillStyle="rgba(0,0,0,.65)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle="#000";

    ctx.fillRect(
        15,
        105,
        290,
        58
    );


    ctx.strokeStyle="#fff";

    ctx.lineWidth=2;

    ctx.strokeRect(
        15,
        105,
        290,
        58
    );


    ctx.fillStyle="#fff";

    ctx.font="8px monospace";


    const text =
        game.dialogue[
            game.dialogueIndex
        ];


    drawText(
        text,
        28,
        128,
        265
    );


    ctx.font="6px monospace";

    ctx.fillText(
        "Z — далее",
        235,
        154
    );

}


/* =====================================================
   TEXT
===================================================== */

function drawText(text,x,y,width){

    const words=text.split(" ");

    let line="";

    for(const word of words){

        const test =
            line + word + " ";

        if(
            ctx.measureText(test).width >
            width
        ){

            ctx.fillText(
                line,
                x,
                y
            );

            line=word+" ";

            y+=10;

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


/* =====================================================
   BATTLE DRAW
===================================================== */

function drawBattle(){

    const b = game.battle;


    ctx.fillStyle="#000";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /*
       ВРАГ
    */

    ctx.fillStyle="#17101f";

    ctx.fillRect(
        20,
        10,
        280,
        55
    );


    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        20,
        10,
        280,
        55
    );


    ctx.fillStyle="#8b55ff";

    ctx.fillRect(
        145,
        23,
        30,
        30
    );


    ctx.fillStyle="#fff";

    ctx.fillRect(
        150,
        30,
        5,
        5
    );

    ctx.fillRect(
        165,
        30,
        5,
        5
    );


    ctx.font="7px monospace";

    ctx.fillText(
        "ERROR // SYSTEM GLITCH",
        28,
        22
    );


    /*
       СООБЩЕНИЕ
    */

    ctx.font="7px monospace";

    if(game.message){

        drawText(
            game.message,
            35,
            78,
            250
        );

    }


    /*
       RD
    */

    ctx.font="6px monospace";

    ctx.fillText(
        "RD",
        250,
        92
    );


    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        270,
        86,
        35,
        7
    );


    ctx.fillStyle="#55aaff";

    ctx.fillRect(
        271,
        87,
        33*b.rd/100,
        5
    );


    /*
       BATTLE BOX
    */

    if(b.phase === "enemy"){

        drawEnemyBox();

    }


    /*
       ПАРТИЯ
    */

    party.forEach((p,i)=>{

        const y=105+i*13;


        if(i===b.actor){

            ctx.fillStyle="#fff";

            ctx.font="7px monospace";

            ctx.fillText(
                "▶",
                8,
                y
            );

        }


        ctx.fillStyle="#fff";

        ctx.font="6px monospace";

        ctx.fillText(
            p.name,
            18,
            y
        );


        ctx.fillText(
            "HP",
            65,
            y
        );


        ctx.strokeStyle="#fff";

        ctx.strokeRect(
            80,
            y-6,
            35,
            6
        );


        ctx.fillStyle="#fff";

        ctx.fillRect(
            81,
            y-5,
            33*Math.max(
                0,
                p.hp/p.maxHP
            ),
            4
        );


        ctx.fillStyle="#fff";

        ctx.fillText(
            p.hp+"/"+p.maxHP,
            120,
            y
        );

    });


    /*
       МЕНЮ КАК В DELTARUNE
    */

    const positions=[

        [180,112],
        [250,112],
        [180,140],
        [250,140]

    ];


    battleOptions.forEach((name,i)=>{

        const x=positions[i][0];
        const y=positions[i][1];


        if(i===b.menu && b.phase==="menu"){

            ctx.strokeStyle="#fff";

            ctx.strokeRect(
                x-8,
                y-9,
                60,
                16
            );

        }


        ctx.fillStyle="#fff";

        ctx.font="7px monospace";

        ctx.fillText(
            name,
            x,
            y+2
        );

    });


    /*
       РАЗДЕЛИТЕЛЬ
    */

    ctx.strokeStyle="#555";

    ctx.beginPath();

    ctx.moveTo(165,100);

    ctx.lineTo(165,165);

    ctx.stroke();

}


/* =====================================================
   ENEMY BOX
===================================================== */

function drawEnemyBox(){

    const b=game.battle;


    ctx.strokeStyle="#fff";

    ctx.lineWidth=2;

    ctx.strokeRect(
        170,
        96,
        140,
        68
    );


    /*
       ЛАЗЕР
    */

    if(b.laser){

        if(b.laser.warning > 0){

            ctx.fillStyle="#ff4444";

            ctx.fillRect(
                b.laser.x-2,
                97,
                4,
                67
            );

        }else{

            ctx.fillStyle="#ff2222";

            ctx.fillRect(
                b.laser.x-4,
                97,
                8,
                67
            );

        }

    }


    /*
       ВЗРЫВНЫЕ ЧАСТИЦЫ
    */

    b.bullets.forEach(p=>{

        ctx.fillStyle="#fff";

        ctx.fillRect(
            p.x-2,
            p.y-2,
            4,
            4
        );

    });


    /*
       SOUL
    */

    ctx.fillStyle="#ff3344";

    ctx.fillRect(
        b.soul.x-3,
        b.soul.y-3,
        6,
        6
    );

}


/* =====================================================
   INTRO
===================================================== */

function drawIntro(){

    ctx.fillStyle="#080b10";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle="#fff";

    ctx.font="9px monospace";

    ctx.fillText(
        "ЦИФРОВОЙ МИР",
        100,
        45
    );


    ctx.font="7px monospace";

    ctx.fillText(
        "Дельта открывает глаза.",
        70,
        80
    );


    ctx.fillText(
        "Нажми Z",
        130,
        145
    );

}


/* =====================================================
   UPDATE
===================================================== */

function update(){

    if(damageCooldown > 0)
        damageCooldown--;


    if(game.state === "title"){

        if(keys.z && !oldKeys.z){

            startGame();

        }

    }


    else if(game.state === "intro"){

        if(keys.z && !oldKeys.z){

            nextDialogue();

        }

    }


    else if(game.state === "dialogue"){

        if(keys.z && !oldKeys.z){

            nextDialogue();

        }

    }


    else if(game.state === "wasteland"){

        updateMovement();

    }


    else if(game.state === "battle"){

        battleInput();

        updateSoul();

        updateEnemyAttack();

    }


    oldKeys.z = keys.z;
    oldKeys.x = keys.x;
    oldKeys.c = keys.c;

    oldKeysExtra.left = keys.left;
    oldKeysExtra.right = keys.right;

}


/* =====================================================
   DRAW
===================================================== */

function draw(){

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    if(game.state === "title"){

        drawTitle();

    }

    else if(game.state === "intro"){

        drawIntro();

    }

    else if(game.state === "dialogue"){

        drawDialogue();

    }

    else if(game.state === "wasteland"){

        drawWasteland();

    }

    else if(game.state === "battle"){

        drawBattle();

    }

}


/* =====================================================
   LOOP
===================================================== */

function loop(){

    update();

    draw();

    requestAnimationFrame(loop);

}

loop();
