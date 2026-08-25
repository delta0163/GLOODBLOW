"use strict";

/* =========================================================
   CANVAS
========================================================= */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const W = 320;
const H = 180;

ctx.imageSmoothingEnabled = false;


/* =========================================================
   ASSETS
========================================================= */

const images = {};

const imageFiles = {

    wasteland: "images/wasteland.png",
    path: "images/path.png",

    delta: "images/delta.png",
    deltaLeft: "images/deltalef.png",
    deltaRight: "images/deltaright.png",
    deltaBack: "images/deltabach.png",

    error: "images/error.png"

};

let assetsLoaded = false;
let assetsCount = 0;
let assetsReady = 0;

for (const name in imageFiles) {

    const img = new Image();

    img.onload = function () {

        assetsReady++;

        if (assetsReady >= assetsCount) {
            assetsLoaded = true;
        }

    };

    img.onerror = function () {

        console.warn(
            "Не найден файл:",
            imageFiles[name]
        );

        assetsReady++;

        if (assetsReady >= assetsCount) {
            assetsLoaded = true;
        }

    };

    assetsCount++;

    img.src = imageFiles[name];

    images[name] = img;
}


/* =========================================================
   MUSIC
========================================================= */

const music = new Audio("sounds/wonderland.mp3");

music.loop = true;
music.volume = 0.45;

let musicStarted = false;

function startMusic() {

    if (musicStarted)
        return;

    musicStarted = true;

    music.play().catch(function () {
        musicStarted = false;
    });
}


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

const oldKeys = {

    z:false,
    x:false,
    c:false,

    up:false,
    down:false,
    left:false,
    right:false

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

    if (
        e.key.startsWith("Arrow") ||
        ["z","x","c","w","a","s","d"].includes(k)
    ) {
        e.preventDefault();
    }

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

});


/* =========================================================
   MOBILE CONTROLS
========================================================= */

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


document.querySelectorAll(".action-button")
.forEach(function(button) {

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


/* =========================================================
   RUN
========================================================= */

const runIndicator =
    document.getElementById("run-indicator");

canvas.addEventListener("pointerdown", function() {

    keys.run = true;

    runIndicator.classList.add("active");

});

canvas.addEventListener("pointerup", function() {

    keys.run = false;

    runIndicator.classList.remove("active");

});

canvas.addEventListener("pointercancel", function() {

    keys.run = false;

    runIndicator.classList.remove("active");

});


/* =========================================================
   FULLSCREEN
========================================================= */

document
.getElementById("fullscreen-button")
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
   GAME
========================================================= */

const game = {

    mode:"title",

    room:1,

    transition:0,

    transitionTarget:null,

    introStep:0,

    dialogueIndex:0,

    battle:null,

    shopIndex:0,

    money:120,

    menuIndex:0,

    inventory:{

        food:2,
        potion:1

    },

    weapon:{

        name:"Старый клинок",
        attack:0

    },

    armor:{

        name:"Старая одежда",
        defense:0

    }

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
        name:"ШАРЛОТА",
        hp:100,
        maxHP:100,
        atk:13,
        def:10,
        color:"#ff77bb"
    }

];


/* =========================================================
   PLAYER
========================================================= */

const player = {

    x:52,
    y:132,

    width:10,
    height:14,

    direction:"right"

};


/* =========================================================
   ROOMS
========================================================= */

const rooms = {

    1:{
        name:"ЦИФРОВАЯ ПУСТОШЬ",
        spawnX:52,
        spawnY:132,
        nextX:300,
        nextY:82
    },

    2:{
        name:"ПУСТОШЬ — МАГАЗИН",
        spawnX:25,
        spawnY:90,
        nextX:300,
        nextY:90
    }

};


/* =========================================================
   INTRO
========================================================= */

const introText = [

    "ЛИЧИ",

    "Надо проверить Немку...",

    "Она изменилась.",

    "Последний раз, когда мы пытались поговорить с ней,",

    "она была странной.",

    "ДЕЛЬТА",

    "Так мы идём?",

    "ЛИЧИ",

    "Да.",

    "Лучше выяснить всё сейчас.",

    "Команда двинулась в сторону пустоши."

];


/* =========================================================
   TITLE
========================================================= */

function updateTitle() {

    if (pressed("z")) {

        startMusic();

        game.mode = "intro";

        game.introStep = 0;

    }

}


/* =========================================================
   INTRO
========================================================= */

function updateIntro() {

    if (pressed("z")) {

        game.introStep++;

        if (game.introStep >= introText.length) {

            game.mode = "explore";

            player.x = 52;
            player.y = 132;

        }

    }

    if (pressed("x")) {

        game.mode = "explore";

    }

}


/* =========================================================
   PRESSED
========================================================= */

function pressed(key) {

    return keys[key] && !oldKeys[key];

}


/* =========================================================
   MOVEMENT
========================================================= */

function updatePlayer() {

    if (game.mode !== "explore")
        return;

    let dx = 0;
    let dy = 0;

    const speed =
        keys.run ? 2.6 : 1.35;

    if (keys.up) {

        dy -= speed;

        player.direction = "back";

    }

    if (keys.down) {

        dy += speed;

        player.direction = "front";

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

    player.x += dx;
    player.y += dy;

    player.x =
        Math.max(10,
        Math.min(300,player.x));

    player.y =
        Math.max(20,
        Math.min(158,player.y));

    /* выход в следующую комнату */

    if (player.x > 300) {

        beginTransition(game.room === 1 ? 2 : 1);

    }

}


/* =========================================================
   TRANSITION
========================================================= */

function beginTransition(target) {

    if (game.mode === "transition")
        return;

    game.mode = "transition";

    game.transitionTarget = target;

    game.transition = 0;

}


/* =========================================================
   TRANSITION UPDATE
========================================================= */

function updateTransition() {

    game.transition += 0.025;

    if (game.transition >= 1) {

        game.room =
            game.transitionTarget;

        player.x =
            rooms[game.room].spawnX;

        player.y =
            rooms[game.room].spawnY;

        game.transition = 1;

        setTimeout(function() {

            game.mode = "explore";

            game.transition = 0;

        },650);

    }

}


/* =========================================================
   DRAW BACKGROUND
========================================================= */

function drawBackground() {

    const img = images.wasteland;

    if (
        img &&
        img.complete &&
        img.naturalWidth > 0
    ) {

        /*
           Уменьшаем большой фон
           до игрового экрана.
        */

        ctx.drawImage(
            img,
            0,
            0,
            W,
            H
        );

    } else {

        ctx.fillStyle="#15151d";

        ctx.fillRect(
            0,0,W,H
        );

        ctx.fillStyle="#252535";

        for(let i=0;i<40;i++){

            ctx.fillRect(
                (i*71)%320,
                (i*43)%170,
                2,
                2
            );

        }

    }

}


/* =========================================================
   PATH
========================================================= */

function drawPath() {

    const img = images.path;

    if (
        img &&
        img.complete &&
        img.naturalWidth > 0
    ) {

        ctx.drawImage(
            img,
            0,
            45,
            320,
            105
        );

    } else {

        ctx.fillStyle="#484044";

        ctx.fillRect(
            0,
            95,
            320,
            40
        );

    }

}


/* =========================================================
   DELTA SPRITE
========================================================= */

function drawDelta() {

    let img;

    if (player.direction === "left")
        img = images.deltaLeft;

    else if (player.direction === "right")
        img = images.deltaRight;

    else if (player.direction === "back")
        img = images.deltaBack;

    else
        img = images.delta;

    if (
        img &&
        img.complete &&
        img.naturalWidth > 0
    ) {

        ctx.drawImage(
            img,
            Math.round(player.x)-8,
            Math.round(player.y)-12,
            24,
            28
        );

    } else {

        ctx.fillStyle="#fff";

        ctx.fillRect(
            player.x,
            player.y,
            10,
            14
        );

    }

}


/* =========================================================
   PARTY FOLLOWERS
========================================================= */

function drawFollowers() {

    for(let i=0;i<4;i++){

        const p = party[i+1];

        const x =
            player.x - 15 - i*12;

        const y =
            player.y + 2;

        ctx.fillStyle=p.color;

        ctx.fillRect(
            Math.round(x),
            Math.round(y),
            7,
            10
        );

    }

}


/* =========================================================
   EXPLORE DRAW
========================================================= */

function drawExplore() {

    drawBackground();

    drawPath();

    drawFollowers();

    drawDelta();

    ctx.fillStyle="#fff";

    ctx.font="6px monospace";

    ctx.fillText(
        rooms[game.room].name,
        8,
        12
    );

    if (game.room === 2) {

        drawShop();

    }

}


/* =========================================================
   SHOP
========================================================= */

const shopItems = [

    {
        name:"ЕДА",
        price:20,
        description:"Восстанавливает 25 HP."
    },

    {
        name:"ОРУЖИЕ",
        price:70,
        description:"Атака Дельты +4."
    },

    {
        name:"БРОНЯ",
        price:60,
        description:"Защита Дельты +4."
    }

];


function updateShop() {

    if (game.room !== 2)
        return;

    if (
        game.mode !== "explore"
    )
        return;

    if (pressed("z")) {

        const item =
            shopItems[game.shopIndex];

        if (game.money >= item.price) {

            game.money -= item.price;

            if (game.shopIndex === 0) {

                game.inventory.food++;

            }

            if (game.shopIndex === 1) {

                game.weapon.attack += 4;

                party[0].atk += 4;

            }

            if (game.shopIndex === 2) {

                game.armor.defense += 4;

                party[0].def += 4;

            }

        }

    }

    if (keys.up && !oldKeys.up) {

        game.shopIndex--;

        if (game.shopIndex < 0)
            game.shopIndex = 2;

    }

    if (keys.down && !oldKeys.down) {

        game.shopIndex++;

        if (game.shopIndex > 2)
            game.shopIndex = 0;

    }

}


/* =========================================================
   SHOP DRAW
========================================================= */

function drawShop() {

    ctx.fillStyle="rgba(0,0,0,.85)";

    ctx.fillRect(
        180,
        15,
        125,
        82
    );

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        180,
        15,
        125,
        82
    );

    ctx.fillStyle="#fff";

    ctx.font="7px monospace";

    ctx.fillText(
        "МАГАЗИН",
        220,
        27
    );

    ctx.font="5px monospace";

    ctx.fillText(
        "МОНЕТЫ: "+game.money,
        188,
        38
    );

    shopItems.forEach(function(item,i){

        const y =
            51+i*14;

        if(i===game.shopIndex){

            ctx.fillText(
                "▶",
                187,
                y
            );

        }

        ctx.fillText(
            item.name,
            196,
            y
        );

        ctx.fillText(
            item.price+"G",
            260,
            y
        );

    });

    ctx.fillText(
        "Z — купить",
        190,
        109
    );

}


/* =========================================================
   DIALOGUE DRAW
========================================================= */

function drawIntro() {

    drawBackground();

    ctx.fillStyle="rgba(0,0,0,.5)";

    ctx.fillRect(
        0,0,W,H
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

    ctx.font="7px monospace";

    const text =
        introText[game.introStep];

    drawWrappedText(
        text,
        25,
        125,
        270,
        9
    );

    ctx.font="6px monospace";

    ctx.fillText(
        "Z — далее",
        235,
        155
    );

}


/* =========================================================
   TEXT
========================================================= */

function drawWrappedText(
    text,
    x,
    y,
    maxWidth,
    lineHeight
) {

    const words =
        text.split(" ");

    let line="";

    for(let i=0;i<words.length;i++){

        const test =
            line + words[i] + " ";

        if(
            ctx.measureText(test).width >
            maxWidth &&
            line.length > 0
        ){

            ctx.fillText(
                line,
                x,
                y
            );

            line =
                words[i]+" ";

            y += lineHeight;

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
   BATTLE
========================================================= */

function startBattle() {

    game.mode="battle";

    game.battle={

        enemy:{

            name:"ОШИБКА_404",

            hp:250,

            maxHP:250,

            attack:8

        },

        phase:"menu",

        actor:0,

        menu:0,

        mercy:0,

        rd:0,

        lasers:[],

        explosions:[],

        particles:[],

        soul:{

            x:160,

            y:130,

            size:6,

            speed:2.5,

            invulnerable:0

        },

        enemyTimer:0,

        message:
            "СИСТЕМНАЯ ОШИБКА ОБНАРУЖЕНА."

    };

}


/* =========================================================
   RANDOM BATTLE
========================================================= */

let battleSteps = 0;

function randomBattleCheck() {

    if(game.mode !== "explore")
        return;

    if(game.room !== 1)
        return;

    battleSteps++;

    /*
       Теперь бой не происходит
       каждые пару шагов.
    */

    if(battleSteps < 180)
        return;

    const chance = 0.004;

    if(Math.random() < chance){

        battleSteps=0;

        startBattle();

    }

}


/* =========================================================
   BATTLE UPDATE
========================================================= */

function updateBattle() {

    const b=game.battle;

    if(!b)
        return;


    if(b.phase==="menu"){

        if(keys.left && !oldKeys.left){

            b.menu--;

            if(b.menu<0)
                b.menu=3;

        }

        if(keys.right && !oldKeys.right){

            b.menu++;

            if(b.menu>3)
                b.menu=0;

        }

        if(pressed("z")){

            if(b.menu===0){

                attackEnemy();

            }

            else if(b.menu===1){

                b.mercy =
                    Math.min(
                        100,
                        b.mercy+15
                    );

                b.message =
                    "Вы нашли слабое место ошибки.";

                nextActor();

            }

            else if(b.menu===2){

                useFood();

            }

            else if(b.menu===3){

                defend();

            }

        }

    }


    else if(b.phase==="enemy"){

        updateEnemyAttack();

    }


    else if(b.phase==="victory"){

        if(pressed("z")){

            game.mode="explore";

            game.battle=null;

        }

    }


    else if(b.phase==="defeat"){

        if(pressed("z")){

            resetParty();

            game.mode="explore";

            game.battle=null;

        }

    }

}


/* =========================================================
   ATTACK
========================================================= */

function attackEnemy() {

    const b=game.battle;

    const p=party[b.actor];

    const damage =
        p.atk +
        Math.floor(Math.random()*6);

    b.enemy.hp -= damage;

    b.message =
        p.name+
        " атакует ОШИБКУ!  -"+
        damage+
        " HP";

    if(b.enemy.hp<=0){

        b.enemy.hp=0;

        b.phase="victory";

        b.message =
            "ОШИБКА ИСЧЕЗЛА.";

        return;

    }

    nextActor();

}


/* =========================================================
   FOOD
========================================================= */

function useFood() {

    const b=game.battle;

    if(game.inventory.food<=0){

        b.message="Еды больше нет.";

        return;

    }

    const p=party[b.actor];

    game.inventory.food--;

    p.hp =
        Math.min(
            p.maxHP,
            p.hp+25
        );

    b.message =
        p.name+
        " восстановил 25 HP.";

    nextActor();

}


/* =========================================================
   DEFEND
========================================================= */

function defend() {

    const b=game.battle;

    /*
       RD растёт ТОЛЬКО
       от защиты.
    */

    b.rd =
        Math.min(
            100,
            b.rd+20
        );

    b.message =
        party[b.actor].name+
        " защищается. RD +20%";

    nextActor();

}


/* =========================================================
   NEXT ACTOR
========================================================= */

function nextActor() {

    const b=game.battle;

    b.actor++;

    if(b.actor >= party.length){

        b.actor=0;

        startEnemyAttack();

    }

}


/* =========================================================
   ENEMY ATTACK
========================================================= */

function startEnemyAttack() {

    const b=game.battle;

    b.phase="enemy";

    b.enemyTimer=360;

    b.lasers=[];
    b.explosions=[];
    b.particles=[];

    /*
       Первый лазер.
    */

    createLaser();

    /*
       Дополнительные лазеры.
    */

    createLaser();

    if(Math.random()<0.65){

        createLaser();

    }

}


/* =========================================================
   LASER
========================================================= */

function createLaser() {

    const b=game.battle;

    const x =
        65+
        Math.random()*190;

    b.lasers.push({

        x:x,

        warning:70,

        active:25,

        width:3

    });

}


/* =========================================================
   ENEMY UPDATE
========================================================= */

function updateEnemyAttack() {

    const b=game.battle;

    b.enemyTimer--;


    b.lasers.forEach(function(laser){

        if(laser.warning>0){

            laser.warning--;

        }

        else if(laser.active>0){

            laser.active--;

            checkLaserHit(laser);

        }

    });


    /*
       Частицы от нескольких ошибок.
    */

    if(
        b.lasers.length >= 2 &&
        Math.random()<0.08
    ){

        createParticleBurst();

    }


    updateParticles();


    if(b.enemyTimer<=0){

        b.phase="menu";

        b.message =
            "СИСТЕМНАЯ ОШИБКА ЗАВЕРШИЛА АТАКУ.";

    }

}


/* =========================================================
   LASER HIT
========================================================= */

function checkLaserHit(laser) {

    const b=game.battle;

    if(b.soul.invulnerable>0)
        return;

    if(
        Math.abs(
            b.soul.x-laser.x
        ) <
        6
    ){

        damageSoul();

    }

}


/* =========================================================
   SOUL
========================================================= */

function updateSoul() {

    const b=game.battle;

    const soul=b.soul;

    if(keys.up)
        soul.y-=soul.speed;

    if(keys.down)
        soul.y+=soul.speed;

    if(keys.left)
        soul.x-=soul.speed;

    if(keys.right)
        soul.x+=soul.speed;

    /*
       Большая граница,
       как в Deltarune.
    */

    soul.x =
        Math.max(
            45,
            Math.min(
                275,
                soul.x
            )
        );

    soul.y =
        Math.max(
            78,
            Math.min(
                160,
                soul.y
            )
        );

    if(soul.invulnerable>0)
        soul.invulnerable--;

}


/* =========================================================
   DAMAGE
========================================================= */

function damageSoul() {

    const b=game.battle;

    b.soul.invulnerable=45;

    const p=party[b.actor];

    p.hp-=8;

    if(p.hp<0)
        p.hp=0;

    b.message =
        p.name+
        " получил 8 урона!";

    checkDefeat();

}


/* =========================================================
   PARTICLES
========================================================= */

function createParticleBurst() {

    const b=game.battle;

    const x =
        50+
        Math.random()*220;

    const y =
        85+
        Math.random()*70;

    for(let i=0;i<5;i++){

        b.particles.push({

            x:x,

            y:y,

            vx:-1+
                Math.random()*2,

            vy:-1+
                Math.random()*2,

            life:35

        });

    }

}


function updateParticles() {

    const b=game.battle;

    b.particles.forEach(function(p){

        p.x+=p.vx;
        p.y+=p.vy;

        p.life--;

    });

    b.particles =
        b.particles.filter(
            p=>p.life>0
        );

}


/* =========================================================
   DEFEAT
========================================================= */

function checkDefeat() {

    let alive=false;

    party.forEach(function(p){

        if(p.hp>0)
            alive=true;

    });

    if(!alive){

        game.battle.phase="defeat";

    }

}


/* =========================================================
   RESET PARTY
========================================================= */

function resetParty() {

    party.forEach(function(p){

        p.hp=p.maxHP;

    });

}


/* =========================================================
   BATTLE DRAW
========================================================= */

function drawBattle() {

    ctx.fillStyle="#000";

    ctx.fillRect(
        0,0,W,H
    );

    const b=game.battle;


    /*
       Враг
    */

    drawErrorEnemy();


    /*
       Имя и HP
    */

    ctx.fillStyle="#fff";

    ctx.font="7px monospace";

    ctx.fillText(
        b.enemy.name,
        12,
        15
    );

    ctx.fillText(
        "HP "+b.enemy.hp+
        "/"+b.enemy.maxHP,
        220,
        15
    );


    /*
       Боевая область
    */

    ctx.strokeStyle="#fff";

    ctx.lineWidth=2;

    ctx.strokeRect(
        42,
        72,
        236,
        92
    );


    /*
       Атака врага
    */

    if(b.phase==="enemy"){

        drawEnemyAttack();

    }


    /*
       душа
    */

    if(
        b.phase==="enemy"
    ){

        drawSoul();

    }


    /*
       RD
    */

    drawRD();


    /*
       Союзники
    */

    drawPartyBattle();


    /*
       меню
    */

    if(b.phase==="menu"){

        drawBattleMenu();

    }


    if(b.phase==="victory"){

        drawBattleMessage(
            "ПОБЕДА!"
        );

    }


    if(b.phase==="defeat"){

        drawBattleMessage(
            "ОТРЯД ПОТЕРПЕЛ ПОРАЖЕНИЕ"
        );

    }

}


/* =========================================================
   ERROR ENEMY
========================================================= */

function drawErrorEnemy() {

    const img=images.error;

    if(
        img &&
        img.complete &&
        img.naturalWidth>0
    ){

        ctx.drawImage(
            img,
            130,
            20,
            60,
            45
        );

    }

    else{

        ctx.fillStyle="#7f00ff";

        ctx.fillRect(
            140,
            20,
            40,
            40
        );

        ctx.fillStyle="#fff";

        ctx.fillText(
            "ERR",
            150,
            45
        );

    }

}


/* =========================================================
   SOUL DRAW
========================================================= */

function drawSoul() {

    const b=game.battle;

    ctx.fillStyle="#ff1744";

    ctx.fillRect(
        b.soul.x-4,
        b.soul.y-4,
        8,
        8
    );

}


/* =========================================================
   ENEMY ATTACK DRAW
========================================================= */

function drawEnemyAttack() {

    const b=game.battle;

    b.lasers.forEach(function(laser){

        /*
           Предупреждение.
        */

        if(laser.warning>0){

            ctx.fillStyle="rgba(255,50,50,.35)";

            ctx.fillRect(
                laser.x-2,
                74,
                4,
                88
            );

            ctx.fillStyle="#ff5555";

            ctx.fillRect(
                laser.x-1,
                74,
                2,
                88
            );

        }

        else{

            ctx.fillStyle="#fff";

            ctx.fillRect(
                laser.x-3,
                74,
                6,
                88
            );

        }

    });


    b.particles.forEach(function(p){

        ctx.fillStyle="#fff";

        ctx.fillRect(
            p.x,
            p.y,
            2,
            2
        );

    });

}


/* =========================================================
   PARTY
========================================================= */

function drawPartyBattle() {

    const b=game.battle;

    party.forEach(function(p,i){

        const y=
            95+i*12;

        if(i===b.actor){

            ctx.fillStyle="#fff";

            ctx.font="6px monospace";

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
            10,
            y
        );

        ctx.fillStyle="#555";

        ctx.fillRect(
            55,
            y-5,
            35,
            5
        );

        ctx.fillStyle="#fff";

        ctx.fillRect(
            55,
            y-5,
            35*
            Math.max(
                0,
                p.hp/p.maxHP
            ),
            5
        );

        ctx.fillStyle="#fff";

        ctx.fillText(
            p.hp+"/"+p.maxHP,
            94,
            y
        );

    });

}


/* =========================================================
   RD
========================================================= */

function drawRD() {

    const b=game.battle;

    const x=295;
    const y=75;
    const w=12;
    const h=87;

    ctx.fillStyle="#171717";

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

    const amount =
        h*(b.rd/100);

    ctx.fillRect(
        x+2,
        y+h-amount-2,
        w-4,
        amount
    );

    ctx.save();

    ctx.translate(
        x+27,
        y+h
    );

    ctx.rotate(
        -Math.PI/2
    );

    ctx.fillStyle="#fff";

    ctx.font="6px monospace";

    ctx.fillText(
        "RD "+Math.floor(b.rd)+"%",
        0,
        0
    );

    ctx.restore();

}


/* =========================================================
   BATTLE MENU
========================================================= */

function drawBattleMenu() {

    const b=game.battle;

    const labels=[

        "FIGHT",
        "ACT",
        "ITEM",
        "DEFEND"

    ];

    labels.forEach(function(label,i){

        const x =
            170+(i%2)*62;

        const y =
            118+
            Math.floor(i/2)*22;

        if(i===b.menu){

            ctx.strokeStyle="#fff";

            ctx.strokeRect(
                x-6,
                y-9,
                55,
                15
            );

        }

        ctx.fillStyle="#fff";

        ctx.font="6px monospace";

        ctx.fillText(
            label,
            x,
            y
        );

    });

}


/* =========================================================
   MESSAGE
========================================================= */

function drawBattleMessage(text) {

    ctx.fillStyle="#fff";

    ctx.font="8px monospace";

    ctx.fillText(
        text,
        90,
        55
    );

}


/* =========================================================
   TITLE DRAW
========================================================= */

function drawTitle() {

    ctx.fillStyle="#000";

    ctx.fillRect(
        0,0,W,H
    );

    ctx.fillStyle="#fff";

    ctx.font="16px monospace";

    ctx.fillText(
        "BLOOD GLOW",
        90,
        55
    );

    ctx.font="8px monospace";

    ctx.fillText(
        "DIGITAL WASTELAND",
        95,
        70
    );

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        105,
        100,
        110,
        28
    );

    ctx.fillStyle="#fff";

    ctx.fillText(
        "НАЧАТЬ",
        133,
        118
    );

    ctx.font="6px monospace";

    ctx.fillText(
        "Z — выбрать",
        125,
        145
    );

}


/* =========================================================
   TRANSITION DRAW
========================================================= */

function drawTransition() {

    if(game.mode!=="transition")
        return;

    let alpha;

    if(game.transition<0.5){

        alpha =
            game.transition*2;

    } else {

        alpha =
            2-
            game.transition*2;

    }

    ctx.fillStyle =
        "rgba(0,0,0,"+
        Math.max(0,Math.min(1,alpha))+
        ")";

    ctx.fillRect(
        0,0,W,H
    );

}


/* =========================================================
   UPDATE
========================================================= */

function update() {

    if(game.mode==="title"){

        updateTitle();

    }

    else if(game.mode==="intro"){

        updateIntro();

    }

    else if(game.mode==="explore"){

        updatePlayer();

        updateShop();

        randomBattleCheck();

        /*
           C открывает простое меню.
        */

        if(pressed("c")){

            game.mode="menu";

            game.menuIndex=0;

        }

    }

    else if(game.mode==="transition"){

        updateTransition();

    }

    else if(game.mode==="battle"){

        updateSoul();

        updateBattle();

    }

    else if(game.mode==="menu"){

        updateMenu();

    }


    oldKeys.z=keys.z;
    oldKeys.x=keys.x;
    oldKeys.c=keys.c;

    oldKeys.up=keys.up;
    oldKeys.down=keys.down;
    oldKeys.left=keys.left;
    oldKeys.right=keys.right;

}


/* =========================================================
   SIMPLE MENU
========================================================= */

function updateMenu() {

    if(pressed("x")){

        game.mode="explore";

        return;

    }

    if(keys.up && !oldKeys.up){

        game.menuIndex--;

        if(game.menuIndex<0)
            game.menuIndex=2;

    }

    if(keys.down && !oldKeys.down){

        game.menuIndex++;

        if(game.menuIndex>2)
            game.menuIndex=0;

    }

}


/* =========================================================
   MENU DRAW
========================================================= */

function drawMenu() {

    ctx.fillStyle="rgba(0,0,0,.94)";

    ctx.fillRect(
        0,0,W,H
    );

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        25,
        15,
        270,
        150
    );

    ctx.fillStyle="#fff";

    ctx.font="10px monospace";

    ctx.fillText(
        "МЕНЮ",
        45,
        35
    );

    const items=[

        "ПРЕДМЕТЫ",
        "СТАТУС",
        " СНАРЯЖЕНИЕ"

    ];

    items.forEach(function(item,i){

        const y=
            65+i*25;

        if(i===game.menuIndex){

            ctx.fillText(
                "▶",
                55,
                y
            );

        }

        ctx.fillText(
            item,
            70,
            y
        );

    });

    ctx.font="6px monospace";

    ctx.fillText(
        "ЕДА: "+game.inventory.food,
        45,
        135
    );

    ctx.fillText(
        "ОРУЖИЕ: "+game.weapon.name,
        45,
        145
    );

    ctx.fillText(
        "БРОНЯ: "+game.armor.name,
        45,
        155
    );

    ctx.fillText(
        "X — назад",
        220,
        155
    );

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

    if(!assetsLoaded){

        ctx.fillStyle="#000";

        ctx.fillRect(
            0,0,W,H
        );

        ctx.fillStyle="#fff";

        ctx.font="8px monospace";

        ctx.fillText(
            "ЗАГРУЗКА...",
            125,
            90
        );

        return;

    }


    if(game.mode==="title"){

        drawTitle();

    }

    else if(game.mode==="intro"){

        drawIntro();

    }

    else if(game.mode==="explore"){

        drawExplore();

    }

    else if(game.mode==="transition"){

        drawExplore();

        drawTransition();

    }

    else if(game.mode==="battle"){

        drawBattle();

    }

    else if(game.mode==="menu"){

        drawExplore();

        drawMenu();

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

loop();
