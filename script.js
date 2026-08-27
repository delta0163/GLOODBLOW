"use strict";

/* =========================================================
   BLOOD GLOW
   DIGITAL WASTELAND
   Версия с новым боем Глючного зверя
========================================================= */

const canvas =
    document.getElementById("game");

const ctx =
    canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = 320;
const H = 180;


/* =========================================================
   ASSETS
========================================================= */

const images = {};

const imageFiles = {

    wasteland:
        "images/wasteland.png",

    trail:
        "images/trail.png",

    delta:
        "images/delta.png",

    deltaLeft:
        "images/deltalef.png",

    deltaRight:
        "images/deltaright.png",

    deltaBack:
        "images/deltabach.png",

    error:
        "images/error.png",

    shop:
        "images/shop.png"
};

for (const key in imageFiles) {

    const img = new Image();

    img.src = imageFiles[key];

    images[key] = img;
}


/* =========================================================
   SOUNDS
========================================================= */

const sounds = {

    world:
        new Audio(
            "sounds/wonderland.mp3"
        ),

    battle:
        new Audio(
            "sounds/battle.mp3"
        ),

    cemetery:
        new Audio(
            "sounds/cemetery.mp3"
        )
};

sounds.world.loop = true;
sounds.battle.loop = true;
sounds.cemetery.loop = true;

sounds.world.volume = .35;
sounds.battle.volume = .3;
sounds.cemetery.volume = .35;

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

    sounds[type]
        .play()
        .catch(() => {});
}


function startMusic() {

    if (soundStarted)
        return;

    soundStarted = true;

    playSound("world");
}


window.addEventListener(
    "pointerdown",
    startMusic,
    { once:true }
);


/* =========================================================
   FULLSCREEN
========================================================= */

const fullscreenButton =
    document.getElementById(
        "fullscreen-button"
    );

fullscreenButton.addEventListener(
    "pointerdown",
    async e => {

        e.preventDefault();

        try {

            if (
                !document.fullscreenElement
            ) {

                await
                document.documentElement
                    .requestFullscreen();

            }
            else {

                await
                document.exitFullscreen();

            }

        }
        catch(error) {

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

    up:false,
    down:false,
    left:false,
    right:false,

    z:false,
    x:false,
    c:false
};


function pressed(key) {

    return (
        keys[key] &&
        !old[key]
    );
}


/* =========================================================
   KEYBOARD
========================================================= */

window.addEventListener(
    "keydown",
    e => {

        const k =
            e.key.toLowerCase();

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

    },
    { passive:false }
);


window.addEventListener(
    "keyup",
    e => {

        const k =
            e.key.toLowerCase();

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

    },
    { passive:false }
);


/* =========================================================
   MOBILE BUTTONS
========================================================= */

document
    .querySelectorAll(".joy")
    .forEach(button => {

        const key =
            button.dataset.key;

        button.addEventListener(
            "pointerdown",
            e => {

                e.preventDefault();

                startMusic();

                keys[key] = true;

                button.setPointerCapture(
                    e.pointerId
                );

            }
        );

        button.addEventListener(
            "pointerup",
            e => {

                e.preventDefault();

                keys[key] = false;

            }
        );

        button.addEventListener(
            "pointercancel",
            () => {

                keys[key] = false;

            }
        );

    });


document
    .querySelectorAll(".action-button")
    .forEach(button => {

        const key =
            button.dataset.key;

        button.addEventListener(
            "pointerdown",
            e => {

                e.preventDefault();

                startMusic();

                keys[key] = true;

                button.setPointerCapture(
                    e.pointerId
                );

            }
        );

        button.addEventListener(
            "pointerup",
            e => {

                e.preventDefault();

                keys[key] = false;

            }
        );

        button.addEventListener(
            "pointercancel",
            () => {

                keys[key] = false;

            }
        );

    });


/* =========================================================
   RUN
========================================================= */

const runIndicator =
    document.getElementById(
        "run-indicator"
    );

let runPointer = null;


canvas.addEventListener(
    "pointerdown",
    e => {

        startMusic();

        runPointer =
            e.pointerId;

        keys.run = true;

        runIndicator
            .classList
            .add("active");

    }
);


canvas.addEventListener(
    "pointerup",
    e => {

        if (
            e.pointerId !== runPointer
        )
            return;

        runPointer = null;

        keys.run = false;

        runIndicator
            .classList
            .remove("active");

    }
);


canvas.addEventListener(
    "pointercancel",
    () => {

        runPointer = null;

        keys.run = false;

        runIndicator
            .classList
            .remove("active");

    }
);


/* =========================================================
   GAME
========================================================= */

const game = {

    mode:"title",

    room:"wasteland1",

    started:false,

    dialogue:null,

    dialogueIndex:0,

    transition:0,

    transitionTarget:null,

    message:"",

    messageTimer:0,

    battle:null,

    puzzle:null,

    qte:null,

    shopIndex:0,

    qteTriggered:false,

    beastTriggered:false
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
        weapon:"Старый клинок",
        armor:"Старая одежда"
    },

    {
        name:"ЛИЧИ",
        hp:80,
        maxHP:80,
        atk:13,
        def:6,
        weapon:"Цифровой жезл",
        armor:"Синяя ткань"
    },

    {
        name:"ПАНКЕЙК",
        hp:70,
        maxHP:70,
        atk:10,
        def:11,
        weapon:"Тяжёлый молот",
        armor:"Защитная куртка"
    },

    {
        name:"КАШТАН",
        hp:110,
        maxHP:110,
        atk:12,
        def:12,
        weapon:"Плазменный посох",
        armor:"Тяжёлая броня"
    },

    {
        name:"ШАРЛОТА",
        hp:100,
        maxHP:100,
        atk:13,
        def:9,
        weapon:"Розовый клинок",
        armor:"Тёмная мантия"
    }

];


/* =========================================================
   INVENTORY
========================================================= */

const inventory = {

    food:3,

    potion:3,

    weapons:0,

    armor:0
};

let money = 100;


/* =========================================================
   SHOP
========================================================= */

const shopItems = [

    {
        name:"ХЛЕБ",
        price:10,
        type:"food"
    },

    {
        name:"ЗЕЛЬЕ",
        price:20,
        type:"potion"
    },

    {
        name:"ОРУЖИЕ",
        price:45,
        type:"weapon"
    },

    {
        name:"БРОНЯ",
        price:40,
        type:"armor"
    }

];


/* =========================================================
   PLAYER
========================================================= */

const player = {

    x:35,
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
        x:20,
        y:130,
        color:"#55aaff"
    },

    {
        x:5,
        y:130,
        color:"#55dd66"
    },

    {
        x:-10,
        y:130,
        color:"#cc8844"
    },

    {
        x:-25,
        y:130,
        color:"#ff66cc"
    }

];


/* =========================================================
   ROOMS
========================================================= */

const rooms = {

    wasteland1:{
        name:"ЦИФРОВАЯ ПУСТОШЬ",
        type:"wasteland"
    },

    shop:{
        name:"СТАРЫЙ МАГАЗИН",
        type:"shop"
    },

    wasteland2:{
        name:"ПУСТОШЬ — ПОГОНЯ",
        type:"wasteland"
    },

    boxes:{
        name:"ВОРОТА",
        type:"puzzle"
    },

    cemetery:{
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
        h:7
    },

    {
        x:0,
        y:173,
        w:320,
        h:7
    },

    {
        x:0,
        y:0,
        w:7,
        h:180
    },

    {
        x:313,
        y:0,
        w:7,
        h:180
    }

];


/* =========================================================
   START
========================================================= */

function startGame() {

    if (game.started)
        return;

    game.started = true;

    game.mode = "dialogue";

    game.room = "wasteland1";

    player.x = 30;
    player.y = 130;

    game.dialogue = [

        {
            name:"ЛИЧИ",
            text:
            "Надо проверить Немку... Она изменилась."
        },

        {
            name:"ЛИЧИ",
            text:
            "Последний раз, когда мы пытались поговорить с ней, она была странной."
        },

        {
            name:"ДЕЛЬТА",
            text:
            "Так мы идём?"
        },

        {
            name:"ЛИЧИ",
            text:
            "Да."
        },

        {
            name:"ПАНКЕЙК",
            text:
            "Тогда не будем тратить время."
        },

        {
            name:"КАШТАН",
            text:
            "Нужно понять, что с ней произошло."
        },

        {
            name:"ШАРЛОТА",
            text:
            "И лучше не подходить к ней слишком близко."
        }

    ];

    game.dialogueIndex = 0;
}


/* =========================================================
   COLLISION
========================================================= */

function rectsOverlap(a,b) {

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

    for (
        const wall of walls
    ) {

        if (
            rectsOverlap(
                test,
                wall
            )
        )
            return false;

    }

    return true;
}


/* =========================================================
   PLAYER
========================================================= */

function getDeltaSprite() {

    if (
        player.direction === "left"
    )
        return images.deltaLeft;

    if (
        player.direction === "right"
    )
        return images.deltaRight;

    if (
        player.direction === "up"
    )
        return images.deltaBack;

    return images.delta;
}


function updatePlayer() {

    if (
        game.mode !== "explore"
    )
        return;

    let dx=0;
    let dy=0;

    const speed =
        keys.run ? 2.7 : 1.45;

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

    if (dx && dy) {

        dx *= .707;
        dy *= .707;
    }

    if (
        canMove(
            player.x+dx,
            player.y
        )
    )
        player.x += dx;

    if (
        canMove(
            player.x,
            player.y+dy
        )
    )
        player.y += dy;
}


/* =========================================================
   FOLLOWERS
========================================================= */

function updateFollowers() {

    if (
        game.mode !== "explore"
    )
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

    followers.forEach(
        (f,i) => {

            const t =
                targets[i];

            f.x +=
                (t.x-f.x)*.08;

            f.y +=
                (t.y-f.y)*.08;

        }
    );
}


/* =========================================================
   DIALOGUE
========================================================= */

function updateDialogue() {

    if (!game.dialogue)
        return;

    if (pressed("z")) {

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
   RANDOM BATTLE
========================================================= */

let battleSteps = 0;

function checkRandomBattle() {

    if (
        game.mode !== "explore"
    )
        return;

    if (
        game.room === "shop" ||
        game.room === "boxes" ||
        game.room === "cemetery"
    )
        return;

    const moving =
        keys.up ||
        keys.down ||
        keys.left ||
        keys.right;

    if (!moving)
        return;

    battleSteps++;

    /*
       Теперь бой не будет появляться
       каждые пару секунд.
    */

    if (
        battleSteps > 600 &&
        Math.random() < .0025
    ) {

        battleSteps=0;

        startErrorBattle();
    }
}


/* =========================================================
   ERROR BATTLE
========================================================= */

function startErrorBattle() {

    game.mode="battle";

    game.battle = {

        type:"error",

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

        rd:0,

        maxRD:100,

        defense:false,

        soul:{

            x:160,

            y:130,

            speed:3.2,

            inv:0

        },

        attackTimer:0,

        laser:null,

        explosions:[],

        message:
            "Что-то сломалось...",

        enemyCount:
            Math.random() < .65
            ? 1
            : 2
    };

    playSound("battle");
}


/* =========================================================
   BEAST BATTLE
========================================================= */

function startBeastBattle() {

    game.mode="battle";

    game.battle = {

        type:"beast",

        enemy:{

            name:"ГЛЮКНУВШИЙ ЗВЕРЬ",

            hp:600,

            maxHP:600,

            attack:14

        },

        phase:"menu",

        actor:0,

        menu:0,

        rd:0,

        maxRD:100,

        mercy:0,

        defense:false,

        pushCount:0,

        soul:{

            x:160,

            y:130,

            speed:3.2,

            inv:0
        },

        attackTimer:0,

        attackType:null,

        attackIndex:0,

        laser:null,

        roar:null,

        claw:null,

        message:
            "ЗВЕРЬ РЫЧИТ В ТЕМНОТЕ..."
    };

    playSound("battle");
}


/* =========================================================
   BATTLE MENU
========================================================= */

const battleOptions = [

    "FIGHT",
    "ACT",
    "MAGIC",
    "ITEM",
    "DEFEND",
    "MERCY"
];


function updateBattle() {

    const b =
        game.battle;

    if (!b)
        return;


    if (
        b.phase === "menu"
    ) {

        if (pressed("left")) {

            b.menu--;

            if (b.menu<0)
                b.menu =
                    battleOptions.length-1;
        }

        if (pressed("right")) {

            b.menu++;

            if (
                b.menu >=
                battleOptions.length
            )
                b.menu=0;
        }

        if (pressed("up")) {

            b.menu-=2;

            if (b.menu<0)
                b.menu += 6;
        }

        if (pressed("down")) {

            b.menu+=2;

            if (b.menu>=6)
                b.menu-=6;
        }

        if (pressed("z")) {

            chooseBattleAction();
        }

    }

    else if (
        b.phase === "act"
    ) {

        if (pressed("z")) {

            b.message =
                b.type==="beast"
                ? "Зверь смотрит прямо на вас."
                : "Ошибка нестабильна.";

            nextBattleActor();
        }

        if (pressed("x")) {

            b.phase="menu";
        }

    }

    else if (
        b.phase === "magic"
    ) {

        if (pressed("z")) {

            useMagic();

        }

        if (pressed("x")) {

            b.phase="menu";
        }

    }

    else if (
        b.phase === "item"
    ) {

        if (pressed("z")) {

            useBattleItem();

        }

        if (pressed("x")) {

            b.phase="menu";
        }

    }

    else if (
        b.phase === "mercy"
    ) {

        if (pressed("z")) {

            if (
                b.type === "beast"
            ) {

                b.message =
                    "Зверь не понимает пощады.";

                nextBattleActor();

            }
            else {

                if (b.mercy>=100) {

                    b.enemy.hp=0;

                    b.phase="victory";

                }
                else {

                    b.message =
                        "Ошибка ещё сопротивляется.";

                    nextBattleActor();
                }
            }
        }

        if (pressed("x")) {

            b.phase="menu";
        }

    }

    else if (
        b.phase === "enemy"
    ) {

        updateEnemyAttack();
    }

    else if (
        b.phase === "victory"
    ) {

        if (pressed("z")) {

            finishBattle();
        }

    }

    else if (
        b.phase === "defeat"
    ) {

        if (pressed("z")) {

            resetParty();

            game.mode="explore";

            game.battle=null;

            playSound("world");
        }
    }
}


/* =========================================================
   BATTLE ACTION
========================================================= */

function chooseBattleAction() {

    const b =
        game.battle;

    const actor =
        party[b.actor];


    if (b.menu===0) {

        let damage =
            actor.atk+
            Math.floor(
                Math.random()*8
            );

        if (
            b.type === "beast"
        ) {

            b.enemy.hp =
                Math.max(
                    0,
                    b.enemy.hp-damage
                );

            b.message =
                actor.name+
                " атакует зверя!  -"+
                damage+
                " HP";

        }
        else {

            b.enemy.hp =
                Math.max(
                    0,
                    b.enemy.hp-damage
                );

            b.message =
                actor.name+
                " уничтожает часть ошибки.  -"+
                damage+
                " HP";
        }

        if (
            b.enemy.hp<=0
        ) {

            b.phase="victory";

            return;
        }

        nextBattleActor();

    }

    else if (
        b.menu===1
    ) {

        b.phase="act";

    }

    else if (
        b.menu===2
    ) {

        b.phase="magic";

    }

    else if (
        b.menu===3
    ) {

        b.phase="item";

    }

    else if (
        b.menu===4
    ) {

        defend();

    }

    else if (
        b.menu===5
    ) {

        b.phase="mercy";

    }
}


/* =========================================================
   DEFEND
========================================================= */

function defend() {

    const b =
        game.battle;

    /*
       RD теперь появляется
       именно от защиты.
    */

    const gain =
        20+
        party[b.actor].def;

    b.rd =
        Math.min(
            b.maxRD,
            b.rd+gain
        );

    b.defense=true;

    b.message =
        party[b.actor].name+
        " защищается! RD +"+
        gain;

    nextBattleActor();
}


/* =========================================================
   MAGIC
========================================================= */

function useMagic() {

    const b =
        game.battle;

    const actor =
        party[b.actor];

    if (
        b.type === "beast"
    ) {

        const damage =
            22+
            Math.floor(
                Math.random()*12
            );

        b.enemy.hp =
            Math.max(
                0,
                b.enemy.hp-damage
            );

        b.message =
            actor.name+
            " использует цифровую магию! -"+
            damage+
            " HP";

    }
    else {

        const damage=18;

        b.enemy.hp =
            Math.max(
                0,
                b.enemy.hp-damage
            );

        b.message =
            actor.name+
            " выпускает магический импульс! -"+
            damage+
            " HP";
    }

    if (
        b.enemy.hp<=0
    ) {

        b.phase="victory";

        return;
    }

    nextBattleActor();
}


/* =========================================================
   ITEMS
========================================================= */

function useBattleItem() {

    const b =
        game.battle;

    const actor =
        party[b.actor];

    if (
        inventory.food<=0
    ) {

        b.message =
            "Еды больше нет.";

        return;
    }

    inventory.food--;

    actor.hp =
        Math.min(
            actor.maxHP,
            actor.hp+25
        );

    b.message =
        actor.name+
        " съедает еду. +25 HP";

    nextBattleActor();
}


/* =========================================================
   NEXT ALLY
========================================================= */

function nextBattleActor() {

    const b =
        game.battle;

    b.actor++;

    /*
       Важно:
       каждый из пяти союзников
       получает свой ход.
    */

    if (
        b.actor >= party.length
    ) {

        b.actor=0;

        startEnemyAttack();

    }
    else {

        b.phase="menu";

        b.menu=0;

        b.defense=false;

        b.message =
            "Ход "+
            party[b.actor].name;
    }
}


/* =========================================================
   ENEMY ATTACK START
========================================================= */

function startEnemyAttack() {

    const b =
        game.battle;

    b.phase="enemy";

    b.attackTimer=0;

    b.attackIndex++;

    b.laser=null;
    b.explosions=[];
    b.roar=null;
    b.claw=null;


    if (
        b.type === "beast"
    ) {

        const attacks = [

            "roar",
            "laser",
            "claw"

        ];

        b.attackType =
            attacks[
                (b.attackIndex-1)
                % attacks.length
            ];

        if (
            b.attackType==="roar"
        )
            startRoar();

        if (
            b.attackType==="laser"
        )
            startBeastLaser();

        if (
            b.attackType==="claw"
        )
            startClaw();

    }
    else {

        startErrorAttack();
    }
}


/* =========================================================
   ERROR ATTACK
========================================================= */

function startErrorAttack() {

    const b =
        game.battle;

    if (
        b.enemyCount===1
    ) {

        b.laser = {

            x:
                70+
                Math.random()*180,

            warning:80,

            active:40,

            width:6
        };

    }
    else {

        for (
            let i=0;
            i<6;
            i++
        ) {

            b.explosions.push({

                x:
                    65+
                    Math.random()*190,

                y:
                    100+
                    Math.random()*45,

                timer:
                    30+
                    Math.random()*80,

                radius:2
            });
        }
    }
}


/* =========================================================
   BEAST ROAR
========================================================= */

function startRoar() {

    const b =
        game.battle;

    b.roar = {

        phase:"blue",

        timer:50,

        radius:10,

        wave:0,

        orangeEvery:130
    };
}


/* =========================================================
   BEAST LASER
========================================================= */

function startBeastLaser() {

    const b =
        game.battle;

    b.laser = {

        warning:100,

        active:45,

        x:
            55+
            Math.random()*210,

        width:320
    };
}


/* =========================================================
   CLAW
========================================================= */

function startClaw() {

    const b =
        game.battle;

    b.claw = {

        x:b.soul.x,

        y:b.soul.y,

        warning:110,

        active:30,

        locked:false
    };
}


/* =========================================================
   ENEMY UPDATE
========================================================= */

function updateEnemyAttack() {

    const b =
        game.battle;

    updateSoul();

    if (
        b.type==="beast"
    ) {

        if (
            b.attackType==="roar"
        )
            updateRoar();

        if (
            b.attackType==="laser"
        )
            updateBeastLaser();

        if (
            b.attackType==="claw"
        )
            updateClaw();

    }
    else {

        updateErrorAttack();
    }


    if (
        b.attackTimer > 430
    ) {

        b.phase="menu";

        b.actor=0;

        b.menu=0;

        b.defense=false;

        b.message =
            "Атака закончилась. Ход Дельты.";

    }

    b.attackTimer++;
}


/* =========================================================
   SOUL MOVEMENT
========================================================= */

function updateSoul() {

    const b =
        game.battle;

    const s =
        b.soul;

    if (keys.up)
        s.y-=s.speed;

    if (keys.down)
        s.y+=s.speed;

    if (keys.left)
        s.x-=s.speed;

    if (keys.right)
        s.x+=s.speed;

    s.x =
        Math.max(
            57,
            Math.min(
                263,
                s.x
            )
        );

    s.y =
        Math.max(
            96,
            Math.min(
                155,
                s.y
            )
        );

    if (s.inv>0)
        s.inv--;
}


/* =========================================================
   DAMAGE
========================================================= */

function damageSoul(amount) {

    const b =
        game.battle;

    if (
        b.soul.inv>0
    )
        return;

    /*
       Если последний выбранный
       союзник защищался,
       урон немного меньше.
    */

    let damage =
        amount;

    if (b.defense)
        damage =
            Math.floor(
                damage*.5
            );

    const target =
        party[b.actor];

    damage =
        Math.max(
            1,
            damage-
            Math.floor(
                target.def/4
            )
        );

    target.hp =
        Math.max(
            0,
            target.hp-damage
        );

    b.soul.inv=45;

    b.message =
        target.name+
        " получает -"+
        damage+
        " HP";

    if (
        party.every(
            p => p.hp<=0
        )
    ) {

        b.phase="defeat";
    }
}


/* =========================================================
   ERROR ATTACK UPDATE
========================================================= */

function updateErrorAttack() {

    const b =
        game.battle;

    if (b.laser) {

        const l=b.laser;

        if (l.warning>0) {

            l.warning--;

        }
        else if (l.active>0) {

            if (
                Math.abs(
                    b.soul.x-l.x
                ) <
                l.width
            ) {

                damageSoul(14);
            }

            l.active--;

        }
        else {

            b.laser=null;
        }
    }


    b.explosions.forEach(
        ex => {

            if (ex.timer>0) {

                ex.timer--;

                return;
            }

            if (
                ex.radius<19
            )
                ex.radius+=1.5;

            const dx =
                b.soul.x-ex.x;

            const dy =
                b.soul.y-ex.y;

            const distance =
                Math.sqrt(
                    dx*dx+
                    dy*dy
                );

            if (
                distance<
                ex.radius
            )
                damageSoul(9);

            if (
                ex.radius>=19
            ) {

                ex.radius=2;

                ex.x =
                    60+
                    Math.random()*200;

                ex.y =
                    100+
                    Math.random()*50;

                ex.timer =
                    30+
                    Math.random()*70;
            }
        }
    );
}


/* =========================================================
   ROAR UPDATE
========================================================= */

function updateRoar() {

    const b =
        game.battle;

    const r =
        b.roar;

    r.timer--;

    if (
        r.timer<=0
    ) {

        r.timer=50;

        r.wave++;

        r.phase =
            r.phase==="blue"
            ? "orange"
            : "blue";
    }

    r.radius+=1.1;

    /*
       Синяя волна:
       нельзя двигаться.

       Оранжевая:
       через неё нужно пройти.
    */

    if (
        r.phase==="blue"
    ) {

        const moving =
            keys.up ||
            keys.down ||
            keys.left ||
            keys.right;

        if (moving) {

            damageSoul(8);
        }

    }
    else {

        /*
           Оранжевая волна
           опасна только если
           душа находится внутри
           кольца.
        */

        const dx =
            b.soul.x-160;

        const dy =
            b.soul.y-130;

        const distance =
            Math.sqrt(
                dx*dx+
                dy*dy
            );

        if (
            Math.abs(
                distance-r.radius
            )<4
        ) {

            /*
               Если игрок движется,
               он может проскочить.
            */

            const moving =
                keys.up ||
                keys.down ||
                keys.left ||
                keys.right;

            if (!moving)
                damageSoul(10);
        }
    }
}


/* =========================================================
   LASER UPDATE
========================================================= */

function updateBeastLaser() {

    const b =
        game.battle;

    const l =
        b.laser;

    if (!l)
        return;

    if (
        l.warning>0
    ) {

        l.warning--;

        return;
    }

    if (
        l.active>0
    ) {

        /*
           Лазер покрывает
           всю ширину поля.
           Безопасна только
           отмеченная зона.
        */

        const safeX =
            145;

        const safeW =
            30;

        if (
            b.soul.x<
                safeX ||
            b.soul.x>
                safeX+safeW
        ) {

            damageSoul(12);
        }

        l.active--;

    }
    else {

        b.laser=null;
    }
}


/* =========================================================
   CLAW UPDATE
========================================================= */

function updateClaw() {

    const b =
        game.battle;

    const c =
        b.claw;

    if (!c)
        return;

    if (
        c.warning>0
    ) {

        /*
           Предупреждение
           следует за душой.
        */

        c.x =
            b.soul.x;

        c.y =
            b.soul.y;

        c.warning--;

    }
    else if (
        c.active>0
    ) {

        /*
           В момент остановки
           лапа бьёт туда,
           где была душа.
        */

        const dx =
            b.soul.x-c.x;

        const dy =
            b.soul.y-c.y;

        const distance =
            Math.sqrt(
                dx*dx+
                dy*dy
            );

        if (
            distance<17
        ) {

            damageSoul(16);
        }

        c.active--;

    }
    else {

        b.claw=null;
    }
}


/* =========================================================
   BEAST SPECIAL ACTION
========================================================= */

function beastPush() {

    const b =
        game.battle;

    if (
        b.rd<50
    ) {

        b.message =
            "Нужно накопить 50 RD.";

        return;
    }

    b.rd-=50;

    b.pushCount++;

    b.message =
        "ДЕЛЬТА толкает зверя! "+
        "Успешных толчков: "+
        b.pushCount+"/2";

    /*
       Два толчка = победа.
    */

    if (
        b.pushCount>=2
    ) {

        b.phase="victory";

        b.message =
            "Зверь потерял равновесие! Вы победили.";

        return;
    }

    nextBattleActor();
}


/* =========================================================
   SPECIAL ACT MENU
========================================================= */

function updateActSpecial() {

    const b =
        game.battle;

    if (
        b.type !== "beast"
    )
        return;

    if (pressed("z")) {

        beastPush();
    }
}


/* =========================================================
   ACT MODIFICATION
========================================================= */

const oldUpdateBattle =
    updateBattle;


/*
   Перехватываем ACT для зверя:
   в ACT появляется возможность
   толкнуть зверя за 50 RD.
*/


/* =========================================================
   BATTLE FINISH
========================================================= */

function finishBattle() {

    const wasBeast =
        game.battle &&
        game.battle.type==="beast";

    game.battle=null;

    game.mode="explore";

    if (wasBeast) {

        game.beastTriggered=true;

        game.room="cemetery";

        player.x=25;

        player.y=130;

        showMessage(
            "Зверь исчез в цифровом шуме..."
        );

        playSound("cemetery");

    }
    else {

        playSound(
            game.room==="cemetery"
            ? "cemetery"
            : "world"
        );
    }
}


/* =========================================================
   RESET PARTY
========================================================= */

function resetParty() {

    party.forEach(
        p => {

            p.hp =
                p.maxHP;

        }
    );
}


/* =========================================================
   TRANSITIONS
========================================================= */

function startTransition(
    target
) {

    if (
        game.transition>0
    )
        return;

    game.transition=35;

    game.transitionTarget =
        target;
}


function finishTransition() {

    const target =
        game.transitionTarget;

    game.transitionTarget=null;

    game.room=target;

    player.x=20;

    player.y=130;

    if (
        target==="shop"
    ) {

        player.x=30;

        playSound("world");
    }

    if (
        target==="wasteland2"
    ) {

        player.x=20;

        playSound("world");
    }

    if (
        target==="boxes"
    ) {

        player.x=20;

        initPuzzle();

        playSound("world");
    }

    if (
        target==="cemetery"
    ) {

        player.x=20;

        playSound("cemetery");
    }
}


/* =========================================================
   ROOM EXIT
========================================================= */

function updateExit() {

    if (
        game.mode!=="explore"
    )
        return;

    if (
        player.x<300
    )
        return;


    if (
        game.room==="wasteland1"
    ) {

        startTransition("shop");

    }
    else if (
        game.room==="shop"
    ) {

        startTransition(
            "wasteland2"
        );

    }
    else if (
        game.room==="wasteland2"
    ) {

        startTransition(
            "boxes"
        );

    }
    else if (
        game.room==="boxes"
    ) {

        if (
            game.puzzle &&
            game.puzzle.open
        ) {

            startTransition(
                "cemetery"
            );

        }
        else {

            player.x=294;

            showMessage(
                "Ворота закрыты."
            );
        }

    }
}


/* =========================================================
   SHOP
========================================================= */

function updateShopInteraction() {

    if (
        game.room!=="shop" ||
        game.mode!=="explore"
    )
        return;

    if (
        player.x>90 &&
        player.x<180 &&
        player.y>90 &&
        pressed("z")
    ) {

        game.mode="shop";
        game.shopIndex=0;
    }
}


function updateShop() {

    if (
        pressed("x")
    ) {

        game.mode="explore";

        return;
    }

    if (
        pressed("up")
    ) {

        game.shopIndex--;

        if (
            game.shopIndex<0
        )
            game.shopIndex =
                shopItems.length-1;
    }

    if (
        pressed("down")
    ) {

        game.shopIndex++;

        if (
            game.shopIndex >=
            shopItems.length
        )
            game.shopIndex=0;
    }

    if (
        pressed("z")
    ) {

        buyItem(
            game.shopIndex
        );
    }
}


function buyItem(index) {

    const item =
        shopItems[index];

    if (
        money<item.price
    ) {

        showMessage(
            "Не хватает денег."
        );

        return;
    }

    money -=
        item.price;

    if (
        item.type==="food"
    )
        inventory.food++;

    if (
        item.type==="potion"
    )
        inventory.potion++;

    if (
        item.type==="weapon"
    ) {

        inventory.weapons++;

        party.forEach(
            p => p.atk++
        );
    }

    if (
        item.type==="armor"
    ) {

        inventory.armor++;

        party.forEach(
            p => p.def++
        );
    }

    showMessage(
        "Куплено: "+
        item.name
    );
}


/* =========================================================
   PUZZLE
========================================================= */

function initPuzzle() {

    game.puzzle = {

        open:false,

        selected:-1,

        boxes:[

            {
                x:55,
                y:65,
                w:16,
                h:16
            },

            {
                x:120,
                y:105,
                w:16,
                h:16
            },

            {
                x:195,
                y:65,
                w:16,
                h:16
            }

        ],

        buttons:[

            {
                x:90,
                y:40,
                w:18,
                h:8
            },

            {
                x:220,
                y:105,
                w:18,
                h:8
            },

            {
                x:145,
                y:130,
                w:18,
                h:8
            }

        ]
    };
}


function boxNearPlayer(box) {

    const dx =
        player.x-
        (
            box.x+
            box.w/2
        );

    const dy =
        player.y-
        (
            box.y+
            box.h/2
        );

    return (
        Math.sqrt(
            dx*dx+
            dy*dy
        )<27
    );
}


function updatePuzzle() {

    const p =
        game.puzzle;

    if (!p)
        return;


    /*
       Если отошёл от коробки,
       она больше не продолжает
       двигаться сама.
    */

    if (
        p.selected>=0 &&
        !boxNearPlayer(
            p.boxes[p.selected]
        )
    ) {

        p.selected=-1;
    }


    if (
        pressed("z")
    ) {

        if (
            p.selected<0
        ) {

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
                p.boxes[
                    p.selected
                ]
            );
        }
    }


    if (
        pressed("x")
    ) {

        p.selected=-1;
    }

    checkPuzzle();
}


function pushBox(box) {

    const speed=4;

    let dx=0;
    let dy=0;

    /*
       Коробка толкается только
       в направлении игрока.
    */

    if (
        Math.abs(
            player.x-box.x
        ) >
        Math.abs(
            player.y-box.y
        )
    ) {

        if (
            player.x<
            box.x
        )
            dx=speed;

        else
            dx=-speed;

    }
    else {

        if (
            player.y<
            box.y
        )
            dy=speed;

        else
            dy=-speed;
    }


    const nx =
        box.x+dx;

    const ny =
        box.y+dy;


    if (
        nx<15 ||
        nx+box.w>265 ||
        ny<30 ||
        ny+box.h>165
    )
        return;


    for (
        const other
        of game.puzzle.boxes
    ) {

        if (
            other===box
        )
            continue;

        if (

            nx<
                other.x+
                other.w &&

            nx+box.w>
                other.x &&

            ny<
                other.y+
                other.h &&

            ny+box.h>
                other.y

        )
            return;
    }


    box.x=nx;
    box.y=ny;
}


function checkPuzzle() {

    const p =
        game.puzzle;

    let correct=0;

    for (
        const box
        of p.boxes
    ) {

        for (
            const button
            of p.buttons
        ) {

            const cx =
                box.x+
                box.w/2;

            const cy =
                box.y+
                box.h/2;

            const bx =
                button.x+
                button.w/2;

            const by =
                button.y+
                button.h/2;

            if (
                Math.abs(
                    cx-bx
                )<8 &&
                Math.abs(
                    cy-by
                )<8
            ) {

                correct++;

            }
        }
    }


    if (
        correct ===
        p.buttons.length
    ) {

        if (!p.open) {

            p.open=true;

            showMessage(
                "Все кнопки загорелись. Ворота открыты."
            );
        }
    }
}


/* =========================================================
   BEAST TRIGGER
========================================================= */

function checkBeastTrigger() {

    if (
        game.room!=="boxes" ||
        game.mode!=="explore"
    )
        return;

    if (
        !game.puzzle ||
        !game.puzzle.open
    )
        return;

    /*
       Подход к воротам
       вызывает прыжок зверя.
    */

    if (
        player.x>245 &&
        !game.beastTriggered
    ) {

        game.beastTriggered=true;

        startBeastBattle();
    }
}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(textValue) {

    game.message =
        textValue;

    game.messageTimer=150;
}


/* =========================================================
   WORLD DRAW
========================================================= */

function drawBackground(
    img
) {

    if (
        img &&
        img.complete &&
        img.naturalWidth>0
    ) {

        ctx.drawImage(
            img,
            0,
            0,
            W,
            H
        );

    }
}


function drawWorld() {

    const room =
        rooms[game.room];


    if (
        room.type==="wasteland"
    ) {

        drawBackground(
            images.wasteland
        );

        if (
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


    if (
        room.type==="shop"
    ) {

        drawBackground(
            images.shop
        );
    }


    if (
        room.type==="puzzle"
    ) {

        drawPuzzleWorld();
    }


    if (
        room.type==="cemetery"
    ) {

        drawCemetery();
    }


    drawFollowers();

    drawPlayer();


    text(
        room.name,
        10,
        16,
        7,
        "#ffffff"
    );


    if (
        room.type==="shop"
    ) {

        text(
            "Z — войти в магазин",
            95,
            165,
            6
        );
    }
}


/* =========================================================
   DRAW FOLLOWERS
========================================================= */

function drawFollowers() {

    followers.forEach(
        f => {

            drawCharacter(
                Math.round(f.x),
                Math.round(f.y),
                f.color
            );

        }
    );
}


/* =========================================================
   PLAYER DRAW
========================================================= */

function drawPlayer() {

    const img =
        getDeltaSprite();

    if (
        img &&
        img.complete &&
        img.naturalWidth>0
    ) {

        ctx.drawImage(
            img,
            Math.round(
                player.x-8
            ),
            Math.round(
                player.y-10
            ),
            24,
            30
        );

        return;
    }

    drawCharacter(
        player.x,
        player.y,
        "#ffffff"
    );
}


/* =========================================================
   FALLBACK CHARACTER
========================================================= */

function drawCharacter(
    x,
    y,
    color
) {

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
   PUZZLE WORLD DRAW
========================================================= */

function drawPuzzleWorld() {

    ctx.fillStyle="#151821";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    for (
        let x=10;
        x<320;
        x+=20
    ) {

        ctx.fillStyle="#292d38";

        ctx.fillRect(
            x,
            20,
            1,
            150
        );
    }


    /* ВОРОТА */

    if (
        game.puzzle &&
        game.puzzle.open
    ) {

        ctx.fillStyle="#334f36";

        ctx.fillRect(
            270,
            40,
            30,
            110
        );

        text(
            "OPEN",
            273,
            30,
            6,
            "#66ff88"
        );

    }
    else {

        ctx.fillStyle="#373b46";

        ctx.fillRect(
            270,
            40,
            30,
            110
        );

        text(
            "LOCK",
            273,
            30,
            6,
            "#ff5555"
        );
    }


    if (!game.puzzle)
        return;


    /* КНОПКИ */

    game.puzzle.buttons
        .forEach(
            button => {

                let active=false;

                for (
                    const box
                    of game.puzzle.boxes
                ) {

                    const cx =
                        box.x+
                        box.w/2;

                    const cy =
                        box.y+
                        box.h/2;

                    const bx =
                        button.x+
                        button.w/2;

                    const by =
                        button.y+
                        button.h/2;

                    if (
                        Math.abs(
                            cx-bx
                        )<8 &&
                        Math.abs(
                            cy-by
                        )<8
                    ) {

                        active=true;
                    }
                }


                ctx.fillStyle =
                    active
                    ? "#39ff66"
                    : "#aa2222";

                ctx.fillRect(
                    button.x,
                    button.y,
                    button.w,
                    button.h
                );
            }
        );


    /* КОРОБКИ */

    game.puzzle.boxes
        .forEach(
            (box,i) => {

                ctx.fillStyle =
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
            }
        );
}


/* =========================================================
   CEMETERY
========================================================= */

function drawCemetery() {

    ctx.fillStyle="#070910";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle="#dddddd";

    ctx.beginPath();

    ctx.arc(
        260,
        35,
        16,
        0,
        Math.PI*2
    );

    ctx.fill();


    ctx.fillStyle="#11131c";

    ctx.fillRect(
        0,
        105,
        W,
        75
    );


    for (
        let i=0;
        i<7;
        i++
    ) {

        const x =
            18+
            i*44;

        const y =
            82+
            (i%2)*15;

        ctx.fillStyle="#3b3e4c";

        ctx.fillRect(
            x,
            y,
            18,
            25
        );

        ctx.fillRect(
            x-3,
            y+5,
            24,
            5
        );
    }


    for (
        let i=0;
        i<10;
        i++
    ) {

        ctx.fillStyle =
            "rgba(100,100,255,.15)";

        ctx.fillRect(
            0,
            Math.random()*180,
            320,
            1
        );
    }
}


/* =========================================================
   SHOP DRAW
========================================================= */

function drawShopMenu() {

    ctx.fillStyle =
        "rgba(0,0,0,.96)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.strokeStyle="#ffffff";

    ctx.lineWidth=2;

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
        "G: "+money,
        235,
        28,
        6,
        "#ffd84d"
    );


    shopItems.forEach(
        (item,i) => {

            const y =
                52+
                i*25;

            if (
                game.shopIndex===i
            ) {

                text(
                    "▶",
                    43,
                    y,
                    7,
                    "#ffffff"
                );
            }

            text(
                item.name,
                60,
                y,
                7
            );

            text(
                item.price+
                " G",
                220,
                y,
                7,
                "#ffd84d"
            );
        }
    );


    text(
        "Z — купить",
        45,
        158,
        6
    );

    text(
        "X — выйти",
        220,
        158,
        6
    );
}


/* =========================================================
   DIALOGUE DRAW
========================================================= */

function drawDialogue() {

    ctx.fillStyle =
        "rgba(0,0,0,.58)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle="#030303";

    ctx.fillRect(
        10,
        105,
        300,
        63
    );


    ctx.strokeStyle="#ffffff";

    ctx.lineWidth=2;

    ctx.strokeRect(
        10,
        105,
        300,
        63
    );


    const d =
        game.dialogue[
            game.dialogueIndex
        ];


    text(
        d.name,
        22,
        120,
        7,
        d.name==="ДЕЛЬТА"
        ? "#ffffff"
        : "#66ccff"
    );


    ctx.font =
        "7px monospace";

    wrappedText(
        d.text,
        22,
        135,
        270,
        9
    );


    text(
        "Z — далее",
        240,
        160,
        6
    );
}


/* =========================================================
   WRAPPED TEXT
========================================================= */

function wrappedText(
    value,
    x,
    y,
    width,
    lineHeight
) {

    const words =
        value.split(" ");

    let line="";

    for (
        const word
        of words
    ) {

        const test =
            line+
            word+
            " ";

        if (
            ctx.measureText(
                test
            ).width >
            width &&
            line
        ) {

            ctx.fillText(
                line,
                x,
                y
            );

            y +=
                lineHeight;

            line =
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
   BATTLE DRAW
========================================================= */

function drawBattle() {

    const b =
        game.battle;

    ctx.fillStyle="#050505";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /*
       Верхняя рамка
    */

    ctx.strokeStyle="#ffffff";

    ctx.lineWidth=2;

    ctx.strokeRect(
        20,
        7,
        280,
        65
    );


    /* ВРАГ */

    if (
        images.error.complete &&
        images.error.naturalWidth>0 &&
        b.type==="error"
    ) {

        ctx.drawImage(
            images.error,
            130,
            10,
            60,
            60
        );

    }
    else if (
        b.type==="beast"
    ) {

        drawBeast();

    }


    text(
        b.enemy.name,
        28,
        20,
        7
    );


    text(
        "HP",
        215,
        20,
        6
    );


    drawBar(
        235,
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


    /*
       RD
    */

    text(
        "RD",
        215,
        42,
        6,
        "#66ddff"
    );

    drawBar(
        235,
        37,
        48,
        6,
        b.rd,
        b.maxRD
    );

    text(
        Math.floor(b.rd),
        288,
        42,
        5,
        "#66ddff"
    );


    /*
       Сообщение
    */

    wrappedText(
        b.message,
        25,
        82,
        130,
        7
    );


    /*
       Поле атаки
    */

    if (
        b.phase==="enemy"
    ) {

        drawAttackField();
    }


    /*
       Партия
    */

    drawBattleParty();


    /*
       Меню
    */

    if (
        b.phase==="menu"
    ) {

        drawBattleMenu();
    }


    if (
        b.phase==="act"
    ) {

        drawActMenu();
    }


    if (
        b.phase==="magic"
    ) {

        drawMagicMenu();
    }


    if (
        b.phase==="item"
    ) {

        drawItemMenu();
    }


    if (
        b.phase==="mercy"
    ) {

        drawMercyMenu();
    }


    if (
        b.phase==="victory"
    ) {

        drawVictory();
    }


    if (
        b.phase==="defeat"
    ) {

        drawDefeat();
    }
}


/* =========================================================
   BEAST DRAW
========================================================= */

function drawBeast() {

    /*
       Если потом добавишь отдельный
       sprite зверя, его можно вставить
       сюда.
    */

    ctx.fillStyle="#6b247c";

    ctx.fillRect(
        140,
        25,
        40,
        30
    );

    ctx.fillStyle="#ff3355";

    ctx.fillRect(
        147,
        32,
        6,
        6
    );

    ctx.fillRect(
        167,
        32,
        6,
        6
    );

    ctx.fillStyle="#111";

    ctx.fillRect(
        150,
        45,
        22,
        5
    );
}


/* =========================================================
   BATTLE MENU DRAW
========================================================= */

function drawBattleMenu() {

    const positions = [

        [165,112],
        [235,112],

        [165,132],
        [235,132],

        [165,152],
        [235,152]

    ];


    battleOptions.forEach(
        (label,i) => {

            const x =
                positions[i][0];

            const y =
                positions[i][1];


            if (
                game.battle.menu===i
            ) {

                ctx.strokeStyle =
                    "#ffffff";

                ctx.strokeRect(
                    x-9,
                    y-9,
                    62,
                    16
                );

                text(
                    "▶",
                    x-5,
                    y+2,
                    6,
                    "#ffdd55"
                );
            }


            text(
                label,
                x+7,
                y+2,
                6
            );
        }
    );
}


/* =========================================================
   ACT MENU
========================================================= */

function drawActMenu() {

    const b =
        game.battle;

    text(
        "ACT",
        175,
        110,
        8
    );


    if (
        b.type==="beast"
    ) {

        text(
            "ТОЛКНУТЬ",
            175,
            127,
            7,
            "#ffffff"
        );

        text(
            "50 RD",
            175,
            139,
            6,
            "#66ddff"
        );

        text(
            "УСПЕХИ: "+
            b.pushCount+
            "/2",
            175,
            150,
            6
        );

        text(
            "Z — выполнить",
            175,
            161,
            6
        );

    }
    else {

        text(
            "ИЗУЧИТЬ",
            175,
            127,
            7
        );

        text(
            "Ошибка нестабильна.",
            175,
            140,
            5
        );

        text(
            "Z — выполнить",
            175,
            157,
            6
        );
    }
}


/* =========================================================
   MAGIC MENU
========================================================= */

function drawMagicMenu() {

    text(
        "MAGIC",
        175,
        110,
        8
    );

    text(
        "GLITCH BURST",
        175,
        128,
        6
    );

    text(
        "Цифровой удар.",
        175,
        140,
        5
    );

    text(
        "Z — использовать",
        175,
        157,
        6
    );
}


/* =========================================================
   ITEM MENU
========================================================= */

function drawItemMenu() {

    text(
        "ITEM",
        175,
        110,
        8
    );

    text(
        "ЕДА +25 HP",
        175,
        128,
        6
    );

    text(
        "ОСТАЛОСЬ: "+
        inventory.food,
        175,
        141,
        6
    );

    text(
        "Z — использовать",
        175,
        157,
        6
    );
}


/* =========================================================
   MERCY MENU
========================================================= */

function drawMercyMenu() {

    const b =
        game.battle;

    text(
        "MERCY",
        175,
        110,
        8
    );

    if (
        b.type==="beast"
    ) {

        text(
            "Пощада не работает.",
            175,
            130,
            6
        );

        text(
            "Попробуйте ACT.",
            175,
            143,
            6
        );

    }
    else {

        text(
            "ПОЩАДИТЬ",
            175,
            128,
            7
        );
    }

    text(
        "Z — выбрать",
        175,
        157,
        6
    );
}


/* =========================================================
   BATTLE PARTY
========================================================= */

function drawBattleParty() {

    const b =
        game.battle;

    party.forEach(
        (p,i) => {

            const y =
                102+
                i*12;


            if (
                b.actor===i &&
                b.phase==="menu"
            ) {

                text(
                    "▶",
                    2,
                    y,
                    5,
                    "#ffffff"
                );
            }


            text(
                p.name,
                9,
                y,
                5,
                "#ffffff"
            );


            text(
                "HP",
                58,
                y,
                5
            );


            drawBar(
                72,
                y-5,
                38,
                5,
                p.hp,
                p.maxHP
            );


            text(
                p.hp+
                "/"+
                p.maxHP,
                113,
                y,
                5
            );
        }
    );
}


/* =========================================================
   ATTACK FIELD
========================================================= */

function drawAttackField() {

    const b =
        game.battle;

    ctx.strokeStyle="#ffffff";

    ctx.lineWidth=2;

    ctx.strokeRect(
        48,
        91,
        224,
        70
    );


    /*
       ЛАЗЕР
    */

    if (
        b.laser
    ) {

        const l =
            b.laser;


        if (
            l.warning>0
        ) {

            /*
               Большое предупреждение
            */

            ctx.fillStyle =
                "rgba(255,40,40,.35)";

            ctx.fillRect(
                49,
                92,
                222,
                68
            );


            /*
               Безопасная зона
            */

            ctx.fillStyle =
                "rgba(50,255,100,.25)";

            ctx.fillRect(
                145,
                92,
                30,
                68
            );


            text(
                "!",
                155,
                125,
                20,
                "#ff4444"
            );

        }
        else {

            ctx.fillStyle="#ff2222";

            ctx.fillRect(
                49,
                92,
                222,
                68
            );


            ctx.fillStyle =
                "rgba(60,255,100,.2)";

            ctx.fillRect(
                145,
                92,
                30,
                68
            );
        }
    }


    /*
       РЫК
    */

    if (
        b.roar
    ) {

        const r =
            b.roar;

        ctx.strokeStyle =
            r.phase==="blue"
            ? "#4488ff"
            : "#ff8833";

        ctx.lineWidth=3;

        ctx.beginPath();

        ctx.arc(
            160,
            130,
            Math.min(
                50,
                r.radius
            ),
            0,
            Math.PI*2
        );

        ctx.stroke();


        text(
            r.phase==="blue"
            ? "НЕ ДВИГАЙСЯ"
            : "ПРОСКОЧИ",
            122,
            103,
            6,
            r.phase==="blue"
            ? "#4488ff"
            : "#ff8833"
        );
    }


    /*
       ЛАПА
    */

    if (
        b.claw
    ) {

        const c =
            b.claw;


        if (
            c.warning>0
        ) {

            ctx.strokeStyle =
                "#ffcc33";

            ctx.lineWidth=2;

            ctx.strokeRect(
                c.x-12,
                c.y-12,
                24,
                24
            );

            text(
                "!",
                c.x-2,
                c.y+3,
                8,
                "#ffcc33"
            );

        }
        else {

            ctx.fillStyle =
                "rgba(255,80,80,.7)";

            ctx.fillRect(
                c.x-18,
                c.y-18,
                36,
                36
            );
        }
    }


    /*
       ДУША
    */

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
   VICTORY
========================================================= */

function drawVictory() {

    ctx.fillStyle =
        "rgba(0,0,0,.88)";

    ctx.fillRect(
        0,
        70,
        320,
        110
    );


    text(
        "ПОБЕДА!",
        125,
        103,
        13
    );


    text(
        game.battle.type==="beast"
        ? "ЗВЕРЬ ПОВЕРЖЕН"
        : "ОШИБКА УСТРАНЕНА",
        100,
        123,
        6
    );


    if (
        game.battle.type==="beast"
    ) {

        text(
            "Вы победили силой.",
            105,
            137,
            6
        );
    }


    text(
        "Z — продолжить",
        108,
        154,
        7
    );
}


/* =========================================================
   DEFEAT
========================================================= */

function drawDefeat() {

    ctx.fillStyle =
        "rgba(0,0,0,.93)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    text(
        "ОТРЯД ПОВЕРЖЕН",
        90,
        88,
        10
    );


    text(
        "Система вернула вас назад.",
        85,
        106,
        6
    );


    text(
        "Z — продолжить",
        105,
        127,
        7
    );
}


/* =========================================================
   BAR
========================================================= */

function drawBar(
    x,
    y,
    width,
    height,
    value,
    max
) {

    ctx.fillStyle="#222222";

    ctx.fillRect(
        x,
        y,
        width,
        height
    );


    const amount =
        Math.max(
            0,
            Math.min(
                1,
                value/max
            )
        );


    ctx.fillStyle="#ffffff";

    ctx.fillRect(
        x,
        y,
        width*amount,
        height
    );
}


/* =========================================================
   TEXT
========================================================= */

function text(
    value,
    x,
    y,
    size=7,
    color="#ffffff"
) {

    ctx.fillStyle=color;

    ctx.font =
        size+
        "px monospace";

    ctx.fillText(
        value,
        x,
        y
    );
}


/* =========================================================
   MENU
========================================================= */

function drawMainMenu() {

    ctx.fillStyle="#050507";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    text(
        "BLOOD GLOW",
        93,
        60,
        16
    );


    text(
        "DIGITAL WASTELAND",
        96,
        77,
        6,
        "#7777ff"
    );


    text(
        "Z — НАЧАТЬ",
        120,
        112,
        8
    );


    text(
        "WASD / ДЖОЙСТИК — ДВИЖЕНИЕ",
        72,
        140,
        5
    );


    text(
        "Z — ДЕЙСТВИЕ   X — ОТМЕНА   C — МЕНЮ",
        58,
        153,
        5
    );
}


/* =========================================================
   MAIN UPDATE
========================================================= */

function update() {

    if (
        game.mode==="title"
    ) {

        if (
            pressed("z")
        ) {

            startGame();
        }

    }
    else if (
        game.transition>0
    ) {

        game.transition--;

        if (
            game.transition<=0
        ) {

            finishTransition();
        }

    }
    else if (
        game.mode==="dialogue"
    ) {

        updateDialogue();

    }
    else if (
        game.mode==="explore"
    ) {

        updatePlayer();

        updateFollowers();

        checkRandomBattle();

        updateExit();

        updateShopInteraction();

        updatePuzzle();

        checkBeastTrigger();

        if (
            pressed("c")
        ) {

            game.mode="menu";
        }

    }
    else if (
        game.mode==="battle"
    ) {

        /*
           Особый ACT зверя.
        */

        if (
            game.battle &&
            game.battle.phase==="act" &&
            game.battle.type==="beast"
        ) {

            updateActSpecial();

            if (
                pressed("x")
            ) {

                game.battle.phase="menu";
            }

        }
        else {

            updateBattle();
        }

    }
    else if (
        game.mode==="shop"
    ) {

        updateShop();

    }
    else if (
        game.mode==="menu"
    ) {

        if (
            pressed("x") ||
            pressed("c")
        ) {

            game.mode="explore";
        }

    }


    if (
        game.messageTimer>0
    )
        game.messageTimer--;


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

function draw() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    if (
        game.mode==="title"
    ) {

        drawMainMenu();

        return;
    }


    if (
        game.mode==="battle"
    ) {

        drawBattle();

    }
    else {

        drawWorld();


        if (
            game.mode==="dialogue"
        ) {

            drawDialogue();
        }


        if (
            game.mode==="shop"
        ) {

            drawShopMenu();
        }


        if (
            game.mode==="menu"
        ) {

            drawMenu();
        }
    }


    if (
        game.messageTimer>0 &&
        game.mode!=="battle" &&
        game.mode!=="dialogue"
    ) {

        ctx.fillStyle =
            "rgba(0,0,0,.82)";

        ctx.fillRect(
            25,
            24,
            270,
            25
        );

        text(
            game.message,
            35,
            40,
            6
        );
    }


    if (
        game.transition>0
    ) {

        ctx.fillStyle="#000000";

        ctx.globalAlpha =
            game.transition/35;

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
   MENU DRAW
========================================================= */

function drawMenu() {

    ctx.fillStyle =
        "rgba(0,0,0,.96)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.strokeStyle="#ffffff";

    ctx.strokeRect(
        20,
        10,
        280,
        160
    );


    text(
        "МЕНЮ",
        130,
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
        "ЕДА: "+
        inventory.food,
        180,
        55,
        7
    );


    text(
        "ЗЕЛЬЯ: "+
        inventory.potion,
        180,
        70,
        7
    );


    text(
        "ОРУЖИЕ: "+
        inventory.weapons,
        50,
        90,
        7
    );


    text(
        "БРОНЯ: "+
        inventory.armor,
        50,
        105,
        7
    );


    text(
        "GOLD: "+
        money,
        50,
        125,
        7,
        "#ffd84d"
    );


    text(
        "X / C — назад",
        210,
        155,
        6
    );
}


/* =========================================================
   LOOP
========================================================= */

function loop() {

    update();

    draw();

    requestAnimationFrame(
        loop
    );
}


loop();
