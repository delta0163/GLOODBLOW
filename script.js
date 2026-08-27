"use strict";

/* =========================================================
   BLOOD GLOW
   Полностью рабочая версия
========================================================= */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = 320;
const H = 180;


/* =========================================================
   ASSETS
========================================================= */

const images = {};

const imageFiles = {
    wasteland: "images/wasteland.png",
    trail: "images/trail.png",

    delta: "images/delta.png",
    deltaLeft: "images/deltalef.png",
    deltaRight: "images/deltaright.png",
    deltaBack: "images/deltabach.png",

    error: "images/error.png",
    shop: "images/shop.png"
};

for (const key in imageFiles) {

    const img = new Image();

    img.src = imageFiles[key];

    images[key] = img;
}


const sounds = {
    world: new Audio("sounds/wonderland.mp3"),
    battle: new Audio("sounds/battle.mp3"),
    cemetery: new Audio("sounds/cemetery.mp3")
};

sounds.world.loop = true;
sounds.battle.loop = true;
sounds.cemetery.loop = true;

sounds.world.volume = .35;
sounds.battle.volume = .3;
sounds.cemetery.volume = .35;


/* =========================================================
   SOUND
========================================================= */

let soundStarted = false;

function playSound(type) {

    if (!sounds[type])
        return;

    for (const key in sounds) {

        if (key !== type) {

            sounds[key].pause();
            sounds[key].currentTime = 0;

        }

    }

    sounds[type].play().catch(() => {});
}

function startMusic() {

    if (soundStarted)
        return;

    soundStarted = true;

    playSound("world");
}

window.addEventListener("pointerdown", startMusic, {
    once: true
});


/* =========================================================
   FULLSCREEN
========================================================= */

const fullscreenButton =
    document.getElementById("fullscreen-button");

fullscreenButton.addEventListener(
    "pointerdown",
    async e => {

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

    }
);


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


const old = {

    z:false,
    x:false,
    c:false,

    up:false,
    down:false,
    left:false,
    right:false
};


function pressed(key) {

    return keys[key] && !old[key];

}


/* =========================================================
   KEYBOARD
========================================================= */

window.addEventListener("keydown", e => {

    const k = e.key.toLowerCase();

    if (
        e.key === "ArrowUp" ||
        k === "w"
    )
        keys.up = true;

    if (
        e.key === "ArrowDown" ||
        k === "s"
    )
        keys.down = true;

    if (
        e.key === "ArrowLeft" ||
        k === "a"
    )
        keys.left = true;

    if (
        e.key === "ArrowRight" ||
        k === "d"
    )
        keys.right = true;

    if (k === "z")
        keys.z = true;

    if (k === "x")
        keys.x = true;

    if (k === "c")
        keys.c = true;

    e.preventDefault();

}, {passive:false});


window.addEventListener("keyup", e => {

    const k = e.key.toLowerCase();

    if (
        e.key === "ArrowUp" ||
        k === "w"
    )
        keys.up = false;

    if (
        e.key === "ArrowDown" ||
        k === "s"
    )
        keys.down = false;

    if (
        e.key === "ArrowLeft" ||
        k === "a"
    )
        keys.left = false;

    if (
        e.key === "ArrowRight" ||
        k === "d"
    )
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
   MOBILE CONTROLS
========================================================= */

document.querySelectorAll(".joy").forEach(button => {

    const key = button.dataset.key;

    button.addEventListener("pointerdown", e => {

        e.preventDefault();

        startMusic();

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


document.querySelectorAll(".action-button")
.forEach(button => {

    const key = button.dataset.key;

    button.addEventListener("pointerdown", e => {

        e.preventDefault();

        startMusic();

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
   RUN BY TOUCHING CANVAS
========================================================= */

const runIndicator =
    document.getElementById("run-indicator");

let runPointer = null;

canvas.addEventListener("pointerdown", e => {

    if (
        e.target === canvas
    ) {

        startMusic();

        runPointer = e.pointerId;

        keys.run = true;

        runIndicator.classList.add("active");

    }

});

canvas.addEventListener("pointerup", e => {

    if (e.pointerId !== runPointer)
        return;

    runPointer = null;

    keys.run = false;

    runIndicator.classList.remove("active");

});

canvas.addEventListener("pointercancel", () => {

    runPointer = null;

    keys.run = false;

    runIndicator.classList.remove("active");

});


/* =========================================================
   GAME STATE
========================================================= */

const game = {

    mode:"explore",

    room:"wasteland1",

    transition:0,

    transitionTarget:null,

    dialogue:null,

    dialogueIndex:0,

    battle:null,

    menu:false,

    shop:false,

    inventory:false,

    equipment:false,

    shopIndex:0,

    message:"",

    messageTimer:0,

    qte:null,

    puzzle:null,

    victory:false

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
        color:"#ffffff",
        weapon:"Старый клинок",
        armor:"Старая одежда"
    },

    {
        name:"ЛИЧИ",
        hp:80,
        maxHP:80,
        atk:13,
        def:6,
        color:"#55aaff",
        weapon:"Цифровой жезл",
        armor:"Синяя ткань"
    },

    {
        name:"ПАНКЕЙК",
        hp:70,
        maxHP:70,
        atk:10,
        def:11,
        color:"#55dd66",
        weapon:"Тяжёлый молот",
        armor:"Защитная куртка"
    },

    {
        name:"КАШТАН",
        hp:110,
        maxHP:110,
        atk:12,
        def:12,
        color:"#cc8844",
        weapon:"Плазменный посох",
        armor:"Тяжёлая броня"
    },

    {
        name:"ШАРЛОТА",
        hp:100,
        maxHP:100,
        atk:13,
        def:9,
        color:"#ff66cc",
        weapon:"Розовый клинок",
        armor:"Тёмная мантия"
    }

];


/* =========================================================
   ITEMS / SHOP
========================================================= */

const inventory = {

    food:3,
    potion:3,

    weapons:0,
    armor:0
};


const shopItems = [

    {
        name:"ХЛЕБ",
        type:"food",
        price:10
    },

    {
        name:"ЗЕЛЬЕ",
        type:"potion",
        price:20
    },

    {
        name:"ОРУЖИЕ",
        type:"weapon",
        price:45
    },

    {
        name:"БРОНЯ",
        type:"armor",
        price:40
    }

];

let money = 100;


/* =========================================================
   PLAYER
========================================================= */

const player = {

    x:45,
    y:130,

    w:10,
    h:14,

    direction:"right"
};


/* =========================================================
   FOLLOWERS
========================================================= */

const followers = [

    {
        x:30,
        y:130,
        color:"#55aaff"
    },

    {
        x:15,
        y:130,
        color:"#55dd66"
    },

    {
        x:0,
        y:130,
        color:"#cc8844"
    },

    {
        x:-15,
        y:130,
        color:"#ff66cc"
    }

];


/* =========================================================
   ROOMS
========================================================= */

const rooms = {

    wasteland1: {

        name:"ЦИФРОВАЯ ПУСТОШЬ",

        type:"wasteland",

        nextX:300,

        nextY:130

    },

    shop: {

        name:"МАГАЗИН",

        type:"shop",

        nextX:300,

        nextY:130

    },

    wasteland2: {

        name:"ПУСТОШЬ — ПОГОНЯ",

        type:"wasteland",

        nextX:300,

        nextY:130

    },

    boxes: {

        name:"СТАРЫЕ ВОРОТА",

        type:"puzzle",

        nextX:300,

        nextY:130
    },

    cemetery: {

        name:"ЦИФРОВОЕ КЛАДБИЩЕ",

        type:"cemetery"
    }

};


/* =========================================================
   WALLS
========================================================= */

const walls = [

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

];


/* =========================================================
   DIALOGUE
========================================================= */

function startOpeningDialogue() {

    game.mode = "dialogue";

    game.dialogue = [

        {
            name:"ЛИЧИ",
            text:"Надо проверить Немку... Она изменилась."
        },

        {
            name:"ЛИЧИ",
            text:"Последний раз, когда мы пытались поговорить с ней, она была странной."
        },

        {
            name:"ДЕЛЬТА",
            text:"Так мы идём?"
        },

        {
            name:"ЛИЧИ",
            text:"Да."
        },

        {
            name:"ПАНКЕЙК",
            text:"Тогда не будем задерживаться."
        },

        {
            name:"КАШТАН",
            text:"Если с Немкой действительно что-то случилось, нужно выяснить причину."
        },

        {
            name:"ШАРЛОТА",
            text:"Только будьте осторожны."
        }

    ];

    game.dialogueIndex = 0;
}


/* =========================================================
   START
========================================================= */

let started = false;

function startGame() {

    if (started)
        return;

    started = true;

    game.room = "wasteland1";

    player.x = 35;
    player.y = 130;

    startOpeningDialogue();

}


/* =========================================================
   COLLISION
========================================================= */

function rectsOverlap(a,b) {

    return (

        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y

    );

}


function canMove(x,y) {

    const test = {

        x:x,
        y:y,

        w:player.w,
        h:player.h

    };

    for (const wall of walls) {

        if (rectsOverlap(test,wall))
            return false;

    }

    return true;

}


/* =========================================================
   IMAGE DRAWING
========================================================= */

function drawBackground(image, alpha=1) {

    if (
        image &&
        image.complete &&
        image.naturalWidth > 0
    ) {

        ctx.globalAlpha = alpha;

        ctx.drawImage(
            image,
            0,
            0,
            W,
            H
        );

        ctx.globalAlpha = 1;

    }

}


/* =========================================================
   PLAYER SPRITE
========================================================= */

function getDeltaSprite() {

    if (player.direction === "left")
        return images.deltaLeft;

    if (player.direction === "right")
        return images.deltaRight;

    if (player.direction === "up")
        return images.deltaBack;

    return images.delta;

}


function drawPlayer() {

    const img = getDeltaSprite();

    if (
        img &&
        img.complete &&
        img.naturalWidth > 0
    ) {

        ctx.drawImage(
            img,
            Math.round(player.x)-8,
            Math.round(player.y)-10,
            24,
            30
        );

        return;

    }

    drawCharacter(
        player.x,
        player.y,
        "#fff"
    );

}


/* =========================================================
   CHARACTER FALLBACK
========================================================= */

function drawCharacter(x,y,color) {

    ctx.fillStyle="#000";

    ctx.fillRect(
        x-2,
        y-2,
        14,
        18
    );

    ctx.fillStyle=color;

    ctx.fillRect(
        x+1,
        y,
        8,
        7
    );

    ctx.fillRect(
        x,
        y+7,
        10,
        8
    );

}


/* =========================================================
   FOLLOWERS
========================================================= */

function updateFollowers() {

    if (game.mode !== "explore")
        return;

    const targets = [

        {
            x:player.x-16,
            y:player.y
        },

        {
            x:player.x-32,
            y:player.y
        },

        {
            x:player.x-48,
            y:player.y
        },

        {
            x:player.x-64,
            y:player.y
        }

    ];

    followers.forEach((f,i) => {

        const t = targets[i];

        f.x += (t.x-f.x)*.08;
        f.y += (t.y-f.y)*.08;

    });

}


/* =========================================================
   PLAYER UPDATE
========================================================= */

function updatePlayer() {

    if (game.mode !== "explore")
        return;

    let dx=0;
    let dy=0;

    const speed =
        keys.run ? 2.8 : 1.5;

    if (keys.up) {

        dy-=speed;
        player.direction="up";

    }

    if (keys.down) {

        dy+=speed;
        player.direction="down";

    }

    if (keys.left) {

        dx-=speed;
        player.direction="left";

    }

    if (keys.right) {

        dx+=speed;
        player.direction="right";

    }

    if (dx && dy) {

        dx*=.707;
        dy*=.707;

    }

    if (canMove(player.x+dx,player.y))
        player.x+=dx;

    if (canMove(player.x,player.y+dy))
        player.y+=dy;

}


/* =========================================================
   RANDOM BATTLE
========================================================= */

let steps = 0;

function checkRandomBattle() {

    if (
        game.mode !== "explore" ||
        game.room === "boxes" ||
        game.room === "cemetery" ||
        game.room === "shop"
    )
        return;

    if (
        Math.abs(
            keys.up+
            keys.down+
            keys.left+
            keys.right
        ) === 0
    )
        return;

    steps++;

    /* намного реже */

    if (
        steps > 420 &&
        Math.random() < .004
    ) {

        steps = 0;

        startBattle();

    }

}


/* =========================================================
   BATTLE
========================================================= */

function startBattle() {

    game.mode="battle";

    game.battle = {

        enemy:{

            name:"ОШИБКА СИСТЕМЫ",

            hp:180,
            maxHP:180,

            attack:10

        },

        phase:"menu",

        actor:0,

        menu:0,

        mercy:0,

        bullets:[],

        laser:null,

        explosions:[],

        enemyTimer:0,

        message:"ОШИБКА: неизвестный процесс обнаружен.",

        enemyCount:
            Math.random()<.65 ? 1 :
            Math.random()<.8 ? 2 : 3,

        soul:{

            x:160,
            y:132,

            size:5,

            speed:3.2,

            inv:0

        }

    };

    playSound("battle");

}


/* =========================================================
   BATTLE UPDATE
========================================================= */

function updateBattle() {

    const b = game.battle;

    if (!b)
        return;


    if (b.phase === "menu") {

        if (pressed("left")) {

            b.menu--;

            if (b.menu<0)
                b.menu=3;

        }

        if (pressed("right")) {

            b.menu++;

            if (b.menu>3)
                b.menu=0;

        }

        if (pressed("z")) {

            battleChoose();

        }

    }

    else if (b.phase === "act") {

        if (pressed("x")) {

            b.phase="menu";

        }

        if (pressed("z")) {

            b.mercy =
                Math.min(
                    100,
                    b.mercy+25
                );

            b.message =
                "Вы изучили ошибку. Пощада увеличена.";

            nextBattleActor();

        }

    }

    else if (b.phase === "item") {

        if (pressed("x")) {

            b.phase="menu";

        }

        if (pressed("z")) {

            usePotion();

        }

    }

    else if (b.phase === "mercy") {

        if (pressed("x")) {

            b.phase="menu";

        }

        if (pressed("z")) {

            if (b.mercy >= 100) {

                b.enemy.hp=0;

                b.message=
                    "Ошибка рассыпалась на пиксели.";

                b.phase="victory";

            }

            else {

                b.message=
                    "Ошибка ещё не готова исчезнуть.";

                nextBattleActor();

            }

        }

    }

    else if (b.phase === "enemy") {

        updateBattleSoul();
        updateBattleAttack();

        b.enemyTimer--;

        if (b.enemyTimer<=0) {

            b.phase="menu";

            b.actor=0;

            b.menu=0;

            b.message=
                "Все союзники готовы. Ход Дельты.";

        }

    }

    else if (b.phase === "victory") {

        if (pressed("z")) {

            game.mode="explore";
            game.battle=null;

            playSound(
                game.room==="cemetery"
                    ? "cemetery"
                    : "world"
            );

        }

    }

    else if (b.phase === "defeat") {

        if (pressed("z")) {

            party.forEach(p => p.hp=p.maxHP);

            game.mode="explore";
            game.battle=null;

            playSound("world");

        }

    }

}


/* =========================================================
   BATTLE CHOOSE
========================================================= */

function battleChoose() {

    const b=game.battle;

    const actor=party[b.actor];

    if (b.menu===0) {

        const damage =
            actor.atk +
            Math.floor(Math.random()*8);

        b.enemy.hp =
            Math.max(
                0,
                b.enemy.hp-damage
            );

        b.message =
            actor.name+
            " атакует!  -"+
            damage+
            " HP";

        b.mercy =
            Math.min(
                100,
                b.mercy+5
            );

        if (b.enemy.hp<=0) {

            b.phase="victory";

            return;

        }

        nextBattleActor();

    }

    else if (b.menu===1) {

        b.phase="act";

    }

    else if (b.menu===2) {

        b.phase="item";

    }

    else {

        b.phase="mercy";

    }

}


/* =========================================================
   NEXT ALLY
========================================================= */

function nextBattleActor() {

    const b=game.battle;

    b.actor++;

    if (b.actor >= party.length) {

        b.actor=0;

        startEnemyAttack();

    }

    else {

        b.phase="menu";

        b.menu=0;

        b.message =
            "Ход: "+
            party[b.actor].name;

    }

}


/* =========================================================
   POTION
========================================================= */

function usePotion() {

    const b=game.battle;

    const target=party[b.actor];

    if (inventory.potion<=0) {

        b.message="Зелий больше нет.";

        return;

    }

    if (target.hp>=target.maxHP) {

        b.message="HP уже полностью восстановлено.";

        return;

    }

    inventory.potion--;

    target.hp =
        Math.min(
            target.maxHP,
            target.hp+35
        );

    b.message =
        target.name+
        " восстановил 35 HP.";

    nextBattleActor();

}


/* =========================================================
   ENEMY ATTACK
========================================================= */

function startEnemyAttack() {

    const b=game.battle;

    b.phase="enemy";

    b.enemyTimer=420;

    b.bullets=[];
    b.explosions=[];
    b.laser=null;

    if (b.enemyCount===1) {

        b.laser={

            x:70+
              Math.random()*180,

            warning:100,

            active:35,

            width:5

        };

    }

    else {

        for (
            let i=0;
            i<5+b.enemyCount*2;
            i++
        ) {

            b.explosions.push({

                x:60+
                  Math.random()*200,

                y:95+
                  Math.random()*55,

                timer:
                    40+
                    Math.random()*100,

                radius:3

            });

        }

    }

}


/* =========================================================
   SOUL
========================================================= */

function updateBattleSoul() {

    const b=game.battle;
    const s=b.soul;

    if (keys.up)
        s.y-=s.speed;

    if (keys.down)
        s.y+=s.speed;

    if (keys.left)
        s.x-=s.speed;

    if (keys.right)
        s.x+=s.speed;


    s.x=Math.max(
        56,
        Math.min(264,s.x)
    );

    s.y=Math.max(
        94,
        Math.min(156,s.y)
    );

    if (s.inv>0)
        s.inv--;

}


/* =========================================================
   ATTACKS
========================================================= */

function damageSoul(amount=8) {

    const b=game.battle;

    if (b.soul.inv>0)
        return;

    const target=party[b.actor];

    const realDamage =
        Math.max(
            2,
            amount -
            Math.floor(target.def/3)
        );

    target.hp =
        Math.max(
            0,
            target.hp-realDamage
        );

    b.soul.inv=45;

    b.message =
        target.name+
        " получает -"+
        realDamage+
        " HP";

    if (
        party.every(p=>p.hp<=0)
    ) {

        b.phase="defeat";

    }

}


function updateBattleAttack() {

    const b=game.battle;
    const s=b.soul;

    if (b.laser) {

        const l=b.laser;

        if (l.warning>0) {

            l.warning--;

        }

        else if (l.active>0) {

            const hit =
                Math.abs(
                    s.x-l.x
                ) < 6;

            if (hit)
                damageSoul(14);

            l.active--;

        }
        else {

            b.laser=null;

        }

    }


    b.explosions.forEach(ex => {

        if (ex.timer>0) {

            ex.timer--;

        }
        else {

            if (ex.radius<18)
                ex.radius+=1.3;

            const dx=s.x-ex.x;
            const dy=s.y-ex.y;

            const d=Math.sqrt(dx*dx+dy*dy);

            if (d < ex.radius)
                damageSoul(9);

            if (ex.radius>=18) {

                ex.radius=3;

                ex.x=
                    60+
                    Math.random()*200;

                ex.y=
                    95+
                    Math.random()*55;

                ex.timer=
                    30+
                    Math.random()*80;

            }

        }

    });

}


/* =========================================================
   ROOM TRANSITION
========================================================= */

function startTransition(target) {

    if (game.transition>0)
        return;

    game.transition=30;

    game.transitionTarget=target;

}


function finishTransition() {

    const target=game.transitionTarget;

    game.transitionTarget=null;

    game.room=target;

    player.x=25;
    player.y=130;

    if (target==="shop") {

        player.x=40;

    }

    if (target==="wasteland2") {

        player.x=25;

    }

    if (target==="boxes") {

        player.x=25;

        initPuzzle();

    }

    if (target==="cemetery") {

        player.x=30;

        player.y=130;

        playSound("cemetery");

    }
    else if (
        target!=="cemetery"
    ) {

        playSound("world");

    }

}


/* =========================================================
   EXIT
========================================================= */

function updateExit() {

    if (game.mode!=="explore")
        return;

    if (player.x>300) {

        if (game.room==="wasteland1") {

            startTransition("shop");

        }

        else if (game.room==="shop") {

            startTransition("wasteland2");

        }

        else if (game.room==="wasteland2") {

            startTransition("boxes");

        }

        else if (game.room==="boxes") {

            if (
                game.puzzle &&
                game.puzzle.open
            ) {

                startTransition("cemetery");

            }
            else {

                player.x=295;

                showMessage(
                    "Ворота заперты. Сначала решите головоломку."
                );

            }

        }

    }

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(text) {

    game.message=text;
    game.messageTimer=150;

}


/* =========================================================
   DIALOGUE UPDATE
========================================================= */

function updateDialogue() {

    if (!game.dialogue)
        return;

    if (
        pressed("z")
    ) {

        game.dialogueIndex++;

        if (
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


/* =========================================================
   SHOP
========================================================= */

function openShop() {

    game.mode="shop";
    game.shopIndex=0;

}


function updateShop() {

    if (pressed("x")) {

        game.mode="explore";
        return;

    }

    if (pressed("up")) {

        game.shopIndex--;

        if (game.shopIndex<0)
            game.shopIndex=
                shopItems.length-1;

    }

    if (pressed("down")) {

        game.shopIndex++;

        if (
            game.shopIndex>=
            shopItems.length
        )
            game.shopIndex=0;

    }

    if (pressed("z")) {

        buyShopItem(
            game.shopIndex
        );

    }

}


function buyShopItem(index) {

    const item=shopItems[index];

    if (money<item.price) {

        showMessage(
            "Недостаточно денег."
        );

        return;

    }

    money-=item.price;

    if (item.type==="food")
        inventory.food++;

    if (item.type==="potion")
        inventory.potion++;

    if (item.type==="weapon") {

        inventory.weapons++;

        party.forEach(p => p.atk++);

    }

    if (item.type==="armor") {

        inventory.armor++;

        party.forEach(p => p.def++);

    }

    showMessage(
        "Куплено: "+item.name
    );

}


/* =========================================================
   SHOP INTERACTION
========================================================= */

function updateShopNPC() {

    if (
        game.mode==="explore" &&
        game.room==="shop" &&
        player.x>90 &&
        player.x<160 &&
        player.y>90 &&
        pressed("z")
    ) {

        openShop();

    }

}


/* =========================================================
   INVENTORY
========================================================= */

function updateInventory() {

    if (pressed("x") || pressed("c")) {

        game.mode="explore";

    }

}


/* =========================================================
   MENU
========================================================= */

function updateMenu() {

    if (pressed("x") || pressed("c")) {

        game.mode="explore";

        return;

    }

}


/* =========================================================
   QTE
========================================================= */

function startQTE() {

    game.mode="qte";

    game.qte={

        time:1800,

        sequence:[
            "z",
            "x",
            "z",
            "c",
            "z",
            "x",
            "c",
            "z"
        ],

        index:0,

        success:false

    };

}


function updateQTE() {

    const q=game.qte;

    q.time--;

    const need=
        q.sequence[q.index];

    if (
        pressed(need)
    ) {

        q.index++;

        if (
            q.index>=
            q.sequence.length
        ) {

            q.success=true;

            game.mode="explore";

            showMessage(
                "Вы вырвались от глючного зверя!"
            );

        }

    }

    if (
        q.time<=0
    ) {

        q.time=1800;

        q.index=0;

        showMessage(
            "Зверь догнал вас! Последовательность начинается заново."
        );

    }

}


/* =========================================================
   PUZZLE
========================================================= */

function initPuzzle() {

    game.puzzle={

        open:false,

        boxes:[

            {
                x:80,
                y:75,
                w:14,
                h:14
            },

            {
                x:120,
                y:110,
                w:14,
                h:14
            },

            {
                x:190,
                y:65,
                w:14,
                h:14
            }

        ],

        buttons:[

            {
                x:140,
                y:45,
                w:14,
                h:6
            },

            {
                x:220,
                y:110,
                w:14,
                h:6
            },

            {
                x:75,
                y:125,
                w:14,
                h:6
            }

        ],

        selected:-1

    };

}


function boxNearPlayer(box) {

    const dx=
        player.x-
        (box.x+box.w/2);

    const dy=
        player.y-
        (box.y+box.h/2);

    return Math.sqrt(
        dx*dx+dy*dy
    )<24;

}


function updatePuzzle() {

    const p=game.puzzle;

    if (!p)
        return;

    if (
        pressed("x")
    ) {

        p.selected=-1;

    }


    if (pressed("z")) {

        if (p.selected<0) {

            for (
                let i=0;
                i<p.boxes.length;
                i++
            ) {

                if (
                    boxNearPlayer(
                        p.boxes[i]
                    )
                ) {

                    p.selected=i;
                    break;

                }

            }

        }

        else {

            pushBox(
                p.boxes[p.selected]
            );

        }

    }

    checkPuzzle();

}


function pushBox(box) {

    const speed=18;

    let dx=0;
    let dy=0;

    if (keys.left)
        dx=-speed;

    else if (keys.right)
        dx=speed;

    else if (keys.up)
        dy=-speed;

    else if (keys.down)
        dy=speed;

    else {

        if (
            player.x<
            box.x
        )
            dx=speed;

        else if (
            player.x>
            box.x
        )
            dx=-speed;

        else if (
            player.y<
            box.y
        )
            dy=speed;

        else
            dy=-speed;

    }

    const nx=box.x+dx;
    const ny=box.y+dy;

    if (
        nx<20 ||
        nx+box.w>295 ||
        ny<30 ||
        ny+box.h>165
    )
        return;

    for (const other of game.puzzle.boxes) {

        if (other===box)
            continue;

        if (
            nx < other.x+other.w &&
            nx+box.w > other.x &&
            ny < other.y+other.h &&
            ny+box.h > other.y
        )
            return;

    }

    box.x=nx;
    box.y=ny;

}


/* =========================================================
   CHECK PUZZLE
========================================================= */

function checkPuzzle() {

    const p=game.puzzle;

    if (!p)
        return;

    let count=0;

    for (const box of p.boxes) {

        for (const button of p.buttons) {

            const cx=
                box.x+
                box.w/2;

            const cy=
                box.y+
                box.h/2;

            const bx=
                button.x+
                button.w/2;

            const by=
                button.y+
                button.h/2;

            if (
                Math.abs(cx-bx)<8 &&
                Math.abs(cy-by)<8
            ) {

                count++;

            }

        }

    }

    if (count===p.buttons.length) {

        if (!p.open) {

            p.open=true;

            showMessage(
                "Все кнопки активированы. Ворота открыты!"
            );

        }

    }
}


/* =========================================================
   GENERAL UPDATE
========================================================= */

function update() {

    if (!started) {

        if (
            pressed("z")
        ) {

            startGame();

        }

    }

    else if (game.transition>0) {

        game.transition--;

        if (game.transition<=0) {

            finishTransition();

        }

    }

    else {

        if (game.mode==="explore") {

            updatePlayer();
            updateFollowers();

            checkRandomBattle();
            updateExit();
            updateShopNPC();

            /* QTE trigger после магазина */

            if (
                game.room==="wasteland2" &&
                player.x>180 &&
                !game.qteTriggered
            ) {

                game.qteTriggered=true;

                startQTE();

            }

            /* магазин */

            if (
                game.room==="shop" &&
                player.x>95 &&
                player.x<170 &&
                player.y>90 &&
                pressed("z")
            ) {

                openShop();

            }

            /* коробки */

            if (
                game.room==="boxes"
            ) {

                updatePuzzle();

            }

            /* меню C */

            if (pressed("c")) {

                game.mode="menu";

            }

        }

        else if (
            game.mode==="dialogue"
        ) {

            updateDialogue();

        }

        else if (
            game.mode==="battle"
        ) {

            updateBattle();

        }

        else if (
            game.mode==="shop"
        ) {

            updateShop();

        }

        else if (
            game.mode==="menu"
        ) {

            updateMenu();

        }

        else if (
            game.mode==="inventory"
        ) {

            updateInventory();

        }

        else if (
            game.mode==="qte"
        ) {

            updateQTE();

        }

    }


    if (game.messageTimer>0)
        game.messageTimer--;


    old.z=keys.z;
    old.x=keys.x;
    old.c=keys.c;

    old.up=keys.up;
    old.down=keys.down;
    old.left=keys.left;
    old.right=keys.right;

}


/* =========================================================
   DRAW TEXT
========================================================= */

function text(
    value,
    x,
    y,
    size=7,
    color="#fff"
) {

    ctx.fillStyle=color;
    ctx.font=size+"px monospace";
    ctx.fillText(value,x,y);

}


/* =========================================================
   WRAPPED TEXT
========================================================= */

function wrapped(
    value,
    x,
    y,
    width,
    lineHeight=9
) {

    const words=value.split(" ");

    let line="";

    for (const word of words) {

        const test=
            line+
            word+
            " ";

        if (
            ctx.measureText(test).width>
            width &&
            line
        ) {

            ctx.fillText(
                line,
                x,
                y
            );

            y+=lineHeight;

            line=
                word+
                " ";

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


/* =========================================================
   DRAW WORLD
========================================================= */

function drawWorld() {

    const room=rooms[game.room];

    if (room.type==="wasteland") {

        drawBackground(
            images.wasteland
        );

        /* тропинка */

        if (
            images.trail &&
            images.trail.complete &&
            images.trail.naturalWidth>0
        ) {

            ctx.globalAlpha=.9;

            ctx.drawImage(
                images.trail,
                0,
                80,
                W,
                100
            );

            ctx.globalAlpha=1;

        }

    }

    else if (room.type==="shop") {

        drawBackground(
            images.shop
        );

    }

    else if (room.type==="cemetery") {

        drawCemetery();

    }

    else if (room.type==="puzzle") {

        drawPuzzleBackground();

    }


    drawFollowers();

    drawPlayer();

    text(
        room.name,
        10,
        17,
        7
    );


    if (room.type==="shop") {

        text(
            "Z — магазин",
            110,
            165,
            6
        );

    }

}


/* =========================================================
   FOLLOWERS DRAW
========================================================= */

function drawFollowers() {

    followers.forEach((f,i) => {

        drawCharacter(
            Math.round(f.x),
            Math.round(f.y),
            f.color
        );

    });

}


/* =========================================================
   SHOP DRAW
========================================================= */

function drawShop() {

    drawWorld();

}


/* =========================================================
   CEMETERY
========================================================= */

function drawCemetery() {

    ctx.fillStyle="#080b12";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    /* луна */

    ctx.fillStyle="#ddd";

    ctx.beginPath();

    ctx.arc(
        260,
        35,
        17,
        0,
        Math.PI*2
    );

    ctx.fill();

    /* земля */

    ctx.fillStyle="#11131b";

    ctx.fillRect(
        0,
        105,
        W,
        75
    );

    /* могилы */

    for (
        let i=0;
        i<7;
        i++
    ) {

        const x=
            20+
            i*43;

        ctx.fillStyle="#363a48";

        ctx.fillRect(
            x,
            80+(i%2)*18,
            17,
            24
        );

        ctx.fillRect(
            x-3,
            85+(i%2)*18,
            23,
            5
        );

    }

    /* глитч-линии */

    ctx.fillStyle="rgba(90,100,255,.2)";

    for (
        let i=0;
        i<12;
        i++
    ) {

        ctx.fillRect(
            0,
            Math.random()*180,
            320,
            1
        );

    }

}


/* =========================================================
   PUZZLE BACKGROUND
========================================================= */

function drawPuzzleBackground() {

    ctx.fillStyle="#151821";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    ctx.fillStyle="#252a36";

    for (
        let x=10;
        x<320;
        x+=20
    ) {

        ctx.fillRect(
            x,
            20,
            1,
            145
        );

    }

    /* ворота */

    ctx.fillStyle=
        game.puzzle &&
        game.puzzle.open
            ? "#335533"
            : "#292d38";

    ctx.fillRect(
        275,
        45,
        25,
        100
    );

    if (
        game.puzzle &&
        game.puzzle.open
    ) {

        text(
            "OPEN",
            278,
            35,
            6,
            "#66ff88"
        );

    }
    else {

        text(
            "LOCK",
            278,
            35,
            6,
            "#ff6666"
        );

    }


    if (!game.puzzle)
        return;


    /* кнопки */

    game.puzzle.buttons.forEach(button => {

        ctx.fillStyle="#aa2222";

        ctx.fillRect(
            button.x,
            button.y,
            button.w,
            button.h
        );

    });


    /* коробки */

    game.puzzle.boxes.forEach((box,i) => {

        ctx.fillStyle=
            game.puzzle.selected===i
                ? "#ffdd55"
                : "#8b5a32";

        ctx.fillRect(
            box.x,
            box.y,
            box.w,
            box.h
        );

        ctx.strokeStyle="#d8a866";

        ctx.strokeRect(
            box.x,
            box.y,
            box.w,
            box.h
        );

    });

}


/* =========================================================
   DIALOGUE DRAW
========================================================= */

function drawDialogue() {

    ctx.fillStyle="rgba(0,0,0,.55)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle="#050505";

    ctx.fillRect(
        10,
        108,
        300,
        60
    );


    ctx.strokeStyle="#fff";

    ctx.lineWidth=2;

    ctx.strokeRect(
        10,
        108,
        300,
        60
    );


    const d=
        game.dialogue[
            game.dialogueIndex
        ];


    text(
        d.name,
        22,
        123,
        7,
        d.name==="ДЕЛЬТА"
            ? "#fff"
            : "#66ccff"
    );


    ctx.font="7px monospace";

    wrapped(
        d.text,
        22,
        137,
        270,
        9
    );


    text(
        "Z — далее",
        235,
        162,
        6
    );

}


/* =========================================================
   MENU DRAW
========================================================= */

function drawMenu() {

    ctx.fillStyle="rgba(0,0,0,.95)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        20,
        10,
        280,
        160
    );

    text(
        "MENU",
        40,
        28,
        10
    );

    text(
        "ITEM",
        50,
        55,
        8
    );

    text(
        "STATUS",
        50,
        75,
        8
    );

    text(
        "EQUIPMENT",
        50,
        95,
        8
    );

    text(
        "GOLD: "+money,
        50,
        120,
        7,
        "#ffd84d"
    );

    text(
        "FOOD: "+inventory.food,
        180,
        55,
        7
    );

    text(
        "POTION: "+inventory.potion,
        180,
        70,
        7
    );

    text(
        "Z — выбрать",
        40,
        155,
        6
    );

    text(
        "X/C — назад",
        210,
        155,
        6
    );

}


/* =========================================================
   SHOP MENU DRAW
========================================================= */

function drawShopMenu() {

    ctx.fillStyle="rgba(0,0,0,.96)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        25,
        10,
        270,
        160
    );

    text(
        "МАГАЗИН",
        110,
        28,
        10
    );

    text(
        "GOLD: "+money,
        220,
        28,
        6,
        "#ffd84d"
    );


    shopItems.forEach((item,i) => {

        const y=
            55+
            i*24;

        if (
            i===game.shopIndex
        ) {

            text(
                "▶",
                45,
                y,
                7
            );

        }

        text(
            item.name,
            60,
            y,
            7
        );

        text(
            item.price+" G",
            220,
            y,
            7,
            "#ffd84d"
        );

    });


    text(
        "Z — купить",
        45,
        157,
        6
    );

    text(
        "X — выйти",
        220,
        157,
        6
    );

}


/* =========================================================
   QTE DRAW
========================================================= */

function drawQTE() {

    drawWorld();

    ctx.fillStyle="rgba(0,0,0,.8)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    text(
        "ГЛЮЧНЫЙ ЗВЕРЬ!",
        85,
        30,
        10,
        "#ff5555"
    );

    text(
        "БЕГИ!",
        135,
        47,
        8
    );

    const q=game.qte;

    const current=
        q.sequence[q.index]
        .toUpperCase();

    text(
        current,
        148,
        85,
        22,
        "#fff"
    );

    text(
        "НАЖМИ КНОПКУ!",
        103,
        105,
        7
    );


    /* прогресс */

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        45,
        120,
        230,
        8
    );

    ctx.fillStyle="#ff5555";

    ctx.fillRect(
        47,
        122,
        226*
        (
            q.index/
            q.sequence.length
        ),
        4
    );


    text(
        "ПОСЛЕДОВАТЕЛЬНОСТЬ "+
        (q.index+1)+
        "/"+
        q.sequence.length,
        90,
        145,
        6
    );

}


/* =========================================================
   BATTLE DRAW
========================================================= */

function drawBattle() {

    const b=game.battle;

    ctx.fillStyle="#050505";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* верхняя область */

    ctx.strokeStyle="#777";

    ctx.strokeRect(
        20,
        7,
        280,
        62
    );


    if (
        images.error &&
        images.error.complete &&
        images.error.naturalWidth>0
    ) {

        ctx.drawImage(
            images.error,
            125,
            13,
            70,
            70
        );

    }
    else {

        drawCharacter(
            155,
            35,
            "#aa55ff"
        );

    }


    text(
        b.enemy.name,
        28,
        20,
        7
    );


    text(
        "HP",
        220,
        20,
        6
    );


    drawBar(
        238,
        15,
        48,
        6,
        b.enemy.hp,
        b.enemy.maxHP
    );


    text(
        b.enemy.hp+
        "/"+
        b.enemy.maxHP,
        240,
        31,
        6
    );


    /* сообщение */

    text(
        b.message,
        28,
        82,
        6
    );


    /* soul box */

    if (
        b.phase==="enemy"
    ) {

        drawEnemyAttackBox();

    }


    /* party */

    drawBattleParty();


    /* меню */

    if (
        b.phase==="menu"
    ) {

        const options=[
            "FIGHT",
            "ACT",
            "ITEM",
            "MERCY"
        ];

        options.forEach((label,i) => {

            const x=
                175+
                (i%2)*65;

            const y=
                112+
                Math.floor(i/2)*24;

            if (i===b.menu) {

                ctx.strokeStyle="#fff";

                ctx.strokeRect(
                    x-8,
                    y-9,
                    55,
                    16
                );

            }

            text(
                label,
                x,
                y+2,
                6
            );

        });

    }


    if (
        b.phase==="act"
    ) {

        text(
            "ACT",
            190,
            108,
            8
        );

        text(
            "ИЗУЧИТЬ",
            190,
            125,
            6
        );

        text(
            "ОШИБКА НЕ СТАБИЛЬНА",
            190,
            138,
            5
        );

        text(
            "Z — выполнить",
            190,
            153,
            6
        );

        text(
            "X — назад",
            190,
            162,
            6
        );

    }


    if (
        b.phase==="item"
    ) {

        text(
            "ITEM",
            190,
            108,
            8
        );

        text(
            "ЗЕЛЬЕ +35 HP",
            190,
            126,
            6
        );

        text(
            "ОСТАЛОСЬ: "+
            inventory.potion,
            190,
            139,
            6
        );

        text(
            "Z — использовать",
            190,
            153,
            6
        );

        text(
            "X — назад",
            190,
            162,
            6
        );

    }


    if (
        b.phase==="mercy"
    ) {

        text(
            "MERCY",
            190,
            108,
            8
        );

        text(
            "ПОЩАДИТЬ",
            190,
            125,
            6
        );

        drawBar(
            190,
            132,
            90,
            7,
            b.mercy,
            100
        );

        text(
            Math.floor(b.mercy)+"%",
            228,
            147,
            6
        );

        text(
            "Z — выбрать",
            190,
            158,
            6
        );

    }


    if (
        b.phase==="victory"
    ) {

        ctx.fillStyle="rgba(0,0,0,.8)";

        ctx.fillRect(
            0,
            70,
            320,
            110
        );

        text(
            "ПОБЕДА!",
            123,
            105,
            13,
            "#fff"
        );

        text(
            "ОШИБКА СИСТЕМЫ УСТРАНЕНА",
            88,
            123,
            6
        );

        text(
            "Z — продолжить",
            108,
            145,
            7
        );

    }


    if (
        b.phase==="defeat"
    ) {

        ctx.fillStyle="rgba(0,0,0,.9)";

        ctx.fillRect(
            0,
            0,
            320,
            180
        );

        text(
            "ОТРЯД ПОВЕРЖЕН",
            92,
            90,
            10
        );

        text(
            "Z — восстановиться",
            100,
            115,
            7
        );

    }

}


/* =========================================================
   BATTLE PARTY
========================================================= */

function drawBattleParty() {

    const b=game.battle;

    party.forEach((p,i) => {

        const y=
            103+
            i*12;

        if (
            b.actor===i &&
            b.phase==="menu"
        ) {

            text(
                "▶",
                2,
                y,
                5
            );

        }

        text(
            p.name,
            9,
            y,
            5,
            p.color
        );

        text(
            "HP",
            65,
            y,
            5
        );

        drawBar(
            80,
            y-5,
            35,
            5,
            p.hp,
            p.maxHP
        );

        text(
            p.hp+"/"+p.maxHP,
            120,
            y,
            5
        );

    });

}


/* =========================================================
   ATTACK BOX DRAW
========================================================= */

function drawEnemyAttackBox() {

    const b=game.battle;

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        48,
        90,
        224,
        70
    );


    /* лазер */

    if (b.laser) {

        const l=b.laser;

        if (l.warning>0) {

            ctx.fillStyle="#ff3333";

            ctx.globalAlpha=.25;

            ctx.fillRect(
                l.x-2,
                91,
                4,
                68
            );

            ctx.globalAlpha=1;

            text(
                "!",
                l.x-2,
                108,
                10,
                "#ff3333"
            );

        }
        else {

            ctx.fillStyle="#ff2222";

            ctx.fillRect(
                l.x-3,
                91,
                6,
                69
            );

        }

    }


    /* взрывы */

    b.explosions.forEach(ex => {

        if (ex.timer<=0) {

            ctx.strokeStyle="#ff8844";

            ctx.beginPath();

            ctx.arc(
                ex.x,
                ex.y,
                ex.radius,
                0,
                Math.PI*2
            );

            ctx.stroke();

        }

    });


    /* душа */

    if (
        b.soul.inv%6<3
    ) {

        ctx.fillStyle="#ff3344";

        ctx.fillRect(
            b.soul.x-4,
            b.soul.y-4,
            8,
            8
        );

    }

}


/* =========================================================
   BAR
========================================================= */

function drawBar(
    x,
    y,
    w,
    h,
    value,
    max
) {

    ctx.fillStyle="#222";

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
                value/max
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


    /* стартовый экран */

    if (!started) {

        ctx.fillStyle="#07070b";

        ctx.fillRect(
            0,
            0,
            W,
            H
        );

        text(
            "BLOOD GLOW",
            93,
            65,
            16
        );

        text(
            "DIGITAL WASTELAND",
            93,
            82,
            6,
            "#8888ff"
        );

        text(
            "Z — НАЧАТЬ",
            120,
            120,
            8
        );

        text(
            "WASD / ДЖОЙСТИК — ДВИЖЕНИЕ",
            73,
            145,
            5
        );

        return;

    }


    if (
        game.mode==="battle"
    ) {

        drawBattle();

    }

    else if (
        game.mode==="qte"
    ) {

        drawQTE();

    }

    else {

        drawWorld();


        if (
            game.mode==="dialogue"
        ) {

            drawDialogue();

        }

        else if (
            game.mode==="shop"
        ) {

            drawShopMenu();

        }

        else if (
            game.mode==="menu"
        ) {

            drawMenu();

        }

    }


    /* сообщение */

    if (
        game.messageTimer>0 &&
        game.mode!=="qte"
    ) {

        ctx.fillStyle="rgba(0,0,0,.8)";

        ctx.fillRect(
            30,
            25,
            260,
            24
        );

        text(
            game.message,
            40,
            40,
            6,
            "#fff"
        );

    }


    /* переход */

    if (game.transition>0) {

        ctx.fillStyle="#000";

        ctx.globalAlpha =
            game.transition/30;

        ctx.fillRect(
            0,
            0,
            W,
            H
        );

        ctx.globalAlpha=1;

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
