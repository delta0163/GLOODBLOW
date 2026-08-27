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
   IMAGE LOADER
   Если файла нет — игра НЕ ломается.
===================================================== */

const images = {};

function loadImage(name, src) {

    const img = new Image();

    img.onload = function() {
        images[name] = img;
    };

    img.onerror = function() {
        images[name] = null;
        console.warn("Не найдено изображение:", src);
    };

    img.src = src;
}

loadImage("wasteland", "images/wasteland.png");
loadImage("path", "images/path.png");

loadImage("delta", "images/delta.png");
loadImage("deltaleft", "images/deltaleft.png");
loadImage("deltaright", "images/deltaright.png");
loadImage("deltabach", "images/deltabach.png");

loadImage("error", "images/error.png");

loadImage("shop", "images/shop.png");
loadImage("cemetery", "images/cemetery.png");


/* =====================================================
   AUDIO
===================================================== */

const sounds = {

    wonderland:
        new Audio("sounds/wonderland.mp3"),

    battle:
        new Audio("sounds/battle.mp3"),

    cemetery:
        new Audio("sounds/cemetery.mp3")

};

Object.values(sounds).forEach(function(audio) {

    audio.loop = true;
    audio.volume = .45;

});


let currentMusic = null;

function playMusic(name) {

    const audio = sounds[name];

    if (!audio)
        return;

    if (currentMusic === audio)
        return;

    if (currentMusic) {

        currentMusic.pause();
        currentMusic.currentTime = 0;

    }

    currentMusic = audio;

    audio.currentTime = 0;

    audio.play().catch(function() {

        /*
           Браузер может запретить музыку
           до первого нажатия пользователя.
        */

    });

}

function stopMusic() {

    if (!currentMusic)
        return;

    currentMusic.pause();
    currentMusic.currentTime = 0;

    currentMusic = null;

}


/* =====================================================
   FULLSCREEN
===================================================== */

const fullscreenButton =
    document.getElementById("fullscreen-button");

fullscreenButton.addEventListener("pointerdown", function(e) {

    e.preventDefault();

    if (!document.fullscreenElement) {

        document.documentElement
            .requestFullscreen()
            .catch(function(){});

    } else {

        document.exitFullscreen()
            .catch(function(){});

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

    /*
       Первый пользовательский ввод
       запускает музыку.
    */

    if (!currentMusic) {

        if (game.mode === "battle")
            playMusic("battle");

        else if (game.room === "cemetery")
            playMusic("cemetery");

        else
            playMusic("wonderland");

    }

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

        if (!currentMusic)
            playMusic("wonderland");

    });

    button.addEventListener("pointerup", function() {
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

        if (!currentMusic) {

            if (game.mode === "battle")
                playMusic("battle");

            else
                playMusic("wonderland");

        }

    });

    button.addEventListener("pointerup", function() {
        keys[key] = false;
    });

    button.addEventListener("pointercancel", function() {
        keys[key] = false;
    });

});


/* =====================================================
   RUN
===================================================== */

let runPointer = null;

canvas.addEventListener("pointerdown", function(e) {

    runPointer = e.pointerId;

    keys.run = true;

    document
        .getElementById("run-indicator")
        .classList.add("active");

});

canvas.addEventListener("pointerup", function(e) {

    if (e.pointerId !== runPointer)
        return;

    runPointer = null;

    keys.run = false;

    document
        .getElementById("run-indicator")
        .classList.remove("active");

});

canvas.addEventListener("pointercancel", function() {

    runPointer = null;

    keys.run = false;

});


/* =====================================================
   GAME
===================================================== */

const game = {

    mode:"explore",

    room:"wasteland",

    dialogue:null,
    dialogueIndex:0,

    menuPage:"main",
    menuIndex:0,

    shopIndex:0,

    equipmentIndex:0,

    itemIndex:0,

    battle:null,

    transition:0,

    transitionTarget:null,

    transitionTimer:0,

    firstDialogueDone:false,

    shopVisited:false,

    cemeteryUnlocked:false,

    saveMessage:"",

    encounters:0,

    encounterCounter:0,

    /*
       Битвы теперь появляются
       значительно реже.
    */

    nextEncounter:
        650 + Math.floor(Math.random()*500)

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
        def:8,
        weapon:"Старый меч",
        armor:"Старая одежда"
    },

    {
        name:"НЕМКА",
        color:"#ff5555",
        hp:100,
        maxHP:100,
        atk:11,
        def:9,
        weapon:"Красный клинок",
        armor:"Красная куртка"
    },

    {
        name:"ЛИЧИ",
        color:"#55aaff",
        hp:80,
        maxHP:80,
        atk:13,
        def:6,
        weapon:"Посох",
        armor:"Синяя мантия"
    },

    {
        name:"ПАНКЕЙК",
        color:"#55dd66",
        hp:70,
        maxHP:70,
        atk:10,
        def:11,
        weapon:"Тяжёлый молот",
        armor:"Прочная броня"
    },

    {
        name:"КАШТАН",
        color:"#cc8844",
        hp:110,
        maxHP:110,
        atk:12,
        def:12,
        weapon:"Магический жезл",
        armor:"Защитный плащ"
    }

];


/* =====================================================
   ITEMS
===================================================== */

const items = [

    {
        name:"ПИЦЦА",
        heal:30,
        amount:3
    },

    {
        name:"СЕНДВИЧ",
        heal:20,
        amount:4
    },

    {
        name:"ТЁМНАЯ ЕДА",
        heal:50,
        amount:1
    }

];


/* =====================================================
   PLAYER
===================================================== */

const player = {

    x:42,
    y:115,

    width:10,
    height:14,

    direction:"right"

};


/* =====================================================
   FOLLOWERS
===================================================== */

const followers = [

    {
        x:27,
        y:115,
        color:"#ff5555"
    },

    {
        x:17,
        y:115,
        color:"#55aaff"
    },

    {
        x:7,
        y:115,
        color:"#55dd66"
    },

    {
        x:-3,
        y:115,
        color:"#cc8844"
    }

];


/* =====================================================
   ROOMS
===================================================== */

const rooms = {

    wasteland: {

        name:"ЦИФРОВАЯ ПУСТОШЬ",

        bg:"wasteland",

        path:true,

        exitRight:true,

        next:"wasteland2"

    },

    wasteland2: {

        name:"ПУСТОШЬ — МАГАЗИН",

        bg:"wasteland",

        path:true,

        shop:true,

        exitRight:true,

        next:"cemetery"

    },

    cemetery: {

        name:"ЦИФРОВОЕ КЛАДБИЩЕ",

        bg:"cemetery",

        path:false,

        exitRight:false,

        cemetery:true

    }

};


/* =====================================================
   DIALOGUE
===================================================== */

const introDialogue = [

    "ЛИЧИ",

    "Надо проверить Немку...",

    "Она изменилась.",

    "Последний раз, когда мы пытались поговорить с ней,",

    "она была странной.",

    "ДЕЛЬТА",

    "— Так мы идём?",

    "ЛИЧИ",

    "— Да.",

    "Личи смотрит в сторону пустоши.",

    "— Держитесь рядом."

];


/* =====================================================
   START
===================================================== */

function startGame() {

    game.mode = "explore";

    game.room = "wasteland";

    player.x = 42;
    player.y = 115;

    game.firstDialogueDone = false;

    game.encounterCounter = 0;

    game.nextEncounter =
        650 + Math.floor(Math.random()*500);

    playMusic("wonderland");

}


/* =====================================================
   COLLISION
===================================================== */

function canMove(x,y) {

    const margin = 8;

    return (
        x >= margin &&
        x + player.width <= W-margin &&
        y >= margin &&
        y + player.height <= H-margin
    );

}


/* =====================================================
   PLAYER UPDATE
===================================================== */

function updatePlayer() {

    if (game.mode !== "explore")
        return;

    let dx=0;
    let dy=0;

    const speed =
        keys.run ? 2.8 : 1.35;

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

        dx *= .707;
        dy *= .707;

    }

    if (canMove(player.x+dx,player.y))
        player.x += dx;

    if (canMove(player.x,player.y+dy))
        player.y += dy;


    /*
       Случайные бои.
       Не каждые два шага.
    */

    if (dx !== 0 || dy !== 0) {

        game.encounterCounter++;

        if (
            game.encounterCounter >=
            game.nextEncounter
        ) {

            game.encounterCounter=0;

            game.nextEncounter =
                650 +
                Math.floor(
                    Math.random()*550
                );

            startBattle();

        }

    }


    /*
       Переход вправо.
    */

    if (
        rooms[game.room].exitRight &&
        player.x > 300
    ) {

        beginTransition(
            rooms[game.room].next
        );

    }

}


/* =====================================================
   FOLLOWERS
===================================================== */

function updateFollowers() {

    if (game.mode !== "explore")
        return;

    const targets = [

        {
            x:player.x-14,
            y:player.y
        },

        {
            x:player.x-28,
            y:player.y
        },

        {
            x:player.x-42,
            y:player.y
        },

        {
            x:player.x-56,
            y:player.y
        }

    ];

    followers.forEach(function(f,i) {

        const t=targets[i];

        f.x += (t.x-f.x)*.08;
        f.y += (t.y-f.y)*.08;

    });

}


/* =====================================================
   TRANSITION
===================================================== */

function beginTransition(room) {

    if (game.mode === "transition")
        return;

    game.mode="transition";

    game.transitionTarget=room;

    game.transition=0;

    game.transitionTimer=0;

}


function updateTransition() {

    game.transitionTimer++;

    /*
       Затемнение дольше.
    */

    if (game.transitionTimer < 45) {

        game.transition =
            game.transitionTimer / 45;

    }

    else if (
        game.transitionTimer < 80
    ) {

        game.transition=1;

        changeRoom(
            game.transitionTarget
        );

    }

    else {

        game.transition =
            1-
            (
                (game.transitionTimer-80)/45
            );

        if (game.transitionTimer>=125) {

            game.transition=0;

            game.mode="explore";

        }

    }

}


function changeRoom(roomName) {

    if (game.room === roomName)
        return;

    game.room=roomName;

    player.x=15;

    player.y=110;

    followers.forEach(function(f,i) {

        f.x=player.x-(i+1)*12;
        f.y=player.y;

    });


    if (roomName==="cemetery") {

        playMusic("cemetery");

    }

    else {

        playMusic("wonderland");

    }

}


/* =====================================================
   SHOP
===================================================== */

function nearShop() {

    if (game.room !== "wasteland2")
        return false;

    return (
        player.x > 105 &&
        player.x < 205 &&
        player.y > 55 &&
        player.y < 125
    );

}


function updateShop() {

    if (!nearShop())
        return;

    if (
        keys.z &&
        !previous.z
    ) {

        game.mode="shop";

        game.shopIndex=0;

    }

}


/* =====================================================
   SHOP MENU
===================================================== */

const shopItems = [

    {
        name:"ПИЦЦА",
        type:"food",
        price:25
    },

    {
        name:"СТАРЫЙ МЕЧ",
        type:"weapon",
        price:80
    },

    {
        name:"ЖЕЛЕЗНАЯ БРОНЯ",
        type:"armor",
        price:100
    }

];

let money=250;


function updateShopMenu() {

    if (
        keys.x &&
        !previous.x
    ) {

        game.mode="explore";

        return;

    }

    if (
        keys.up &&
        !previous.up
    ) {

        game.shopIndex--;

        if (game.shopIndex<0)
            game.shopIndex=
                shopItems.length-1;

    }

    if (
        keys.down &&
        !previous.down
    ) {

        game.shopIndex++;

        if (
            game.shopIndex>=
            shopItems.length
        )
            game.shopIndex=0;

    }

    if (
        keys.z &&
        !previous.z
    ) {

        buyShopItem(
            shopItems[game.shopIndex]
        );

    }

}


function buyShopItem(item) {

    if (money < item.price) {

        game.saveMessage=
            "НЕДОСТАТОЧНО ДЕНЕГ";

        return;

    }

    money -= item.price;

    if (item.type==="food") {

        const existing =
            items.find(
                x=>x.name==="ПИЦЦА"
            );

        existing.amount++;

    }

    if (item.type==="weapon") {

        party.forEach(function(p) {

            p.weapon="Старый меч";

        });

    }

    if (item.type==="armor") {

        party.forEach(function(p) {

            p.armor="Железная броня";

            p.def += 2;

        });

    }

    game.saveMessage=
        "КУПЛЕНО: "+
        item.name;

}


/* =====================================================
   ITEMS MENU
===================================================== */

function updateItemsMenu() {

    if (
        keys.x &&
        !previous.x
    ) {

        game.mode="menu";

        game.menuPage="main";

        return;

    }

    if (
        keys.up &&
        !previous.up
    ) {

        game.itemIndex--;

        if (game.itemIndex<0)
            game.itemIndex=items.length-1;

    }

    if (
        keys.down &&
        !previous.down
    ) {

        game.itemIndex++;

        if (
            game.itemIndex>=items.length
        )
            game.itemIndex=0;

    }

    if (
        keys.z &&
        !previous.z
    ) {

        useFood();

    }

}


function useFood() {

    const item=items[game.itemIndex];

    if (item.amount<=0)
        return;

    /*
       Выбор персонажа через
       следующий индекс оборудования.
    */

    const target =
        party[game.equipmentIndex || 0];

    if (target.hp>=target.maxHP) {

        game.saveMessage=
            "У "+
            target.name+
            " полное HP";

        return;

    }

    target.hp=
        Math.min(
            target.maxHP,
            target.hp+item.heal
        );

    item.amount--;

    game.saveMessage=
        target.name+
        " восстановил "+
        item.heal+
        " HP";

}


/* =====================================================
   EQUIPMENT
===================================================== */

function updateEquipment() {

    if (
        keys.x &&
        !previous.x
    ) {

        game.mode="menu";
        game.menuPage="main";

        return;

    }

    if (
        keys.up &&
        !previous.up
    ) {

        game.equipmentIndex--;

        if (game.equipmentIndex<0)
            game.equipmentIndex=party.length-1;

    }

    if (
        keys.down &&
        !previous.down
    ) {

        game.equipmentIndex++;

        if (
            game.equipmentIndex>=party.length
        )
            game.equipmentIndex=0;

    }

}


/* =====================================================
   MENU
===================================================== */

function updateMenu() {

    if (
        keys.x &&
        !previous.x
    ) {

        if (game.menuPage !== "main") {

            game.menuPage="main";

        }

        else {

            game.mode="explore";

        }

        return;

    }


    if (
        game.menuPage==="main"
    ) {

        if (
            keys.up &&
            !previous.up
        ) {

            game.menuIndex--;

            if (game.menuIndex<0)
                game.menuIndex=3;

        }

        if (
            keys.down &&
            !previous.down
        ) {

            game.menuIndex++;

            if (game.menuIndex>3)
                game.menuIndex=0;

        }

        if (
            keys.z &&
            !previous.z
        ) {

            const pages=[

                "ITEMS",
                "STATUS",
                "EQUIPMENT",
                "SAVE"

            ];

            game.menuPage=
                pages[game.menuIndex];

        }

    }

    else if (
        game.menuPage==="ITEMS"
    ) {

        updateItemsMenu();

    }

    else if (
        game.menuPage==="EQUIPMENT"
    ) {

        updateEquipment();

    }

    else if (
        game.menuPage==="SAVE"
    ) {

        if (
            keys.z &&
            !previous.z
        ) {

            saveGame();

        }

    }

}


/* =====================================================
   DIALOGUE
===================================================== */

function startDialogue(lines) {

    game.mode="dialogue";

    game.dialogue=lines;

    game.dialogueIndex=0;

}


function updateDialogue() {

    if (
        keys.x &&
        !previous.x
    ) {

        closeDialogue();

        return;

    }

    if (
        keys.z &&
        !previous.z
    ) {

        game.dialogueIndex++;

        if (
            game.dialogueIndex >=
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

    game.firstDialogueDone=true;

}


/* =====================================================
   SAVE
===================================================== */

function saveGame() {

    const data={

        room:game.room,

        playerX:player.x,

        playerY:player.y,

        money:money,

        firstDialogueDone:
            game.firstDialogueDone,

        party:
            party.map(function(p) {

                return {

                    hp:p.hp,
                    maxHP:p.maxHP,
                    weapon:p.weapon,
                    armor:p.armor

                };

            }),

        items:
            items.map(function(i) {

                return {
                    name:i.name,
                    amount:i.amount
                };

            })

    };

    localStorage.setItem(
        "bloodGlowSave",
        JSON.stringify(data)
    );

    game.saveMessage=
        "ИГРА СОХРАНЕНА";

}


function loadGame() {

    const raw=
        localStorage.getItem(
            "bloodGlowSave"
        );

    if (!raw) {

        game.saveMessage="СОХРАНЕНИЙ НЕТ";

        return;

    }

    try {

        const data=JSON.parse(raw);

        game.room=
            data.room || "wasteland";

        player.x=
            data.playerX ?? 42;

        player.y=
            data.playerY ?? 115;

        money=
            data.money ?? 250;

        game.firstDialogueDone=
            !!data.firstDialogueDone;

        if (data.party) {

            data.party.forEach(function(p,i) {

                if (!party[i])
                    return;

                party[i].hp=
                    Math.min(
                        party[i].maxHP,
                        Math.max(0,p.hp)
                    );

                if (p.weapon)
                    party[i].weapon=p.weapon;

                if (p.armor)
                    party[i].armor=p.armor;

            });

        }

        if (data.items) {

            data.items.forEach(function(item) {

                const found=
                    items.find(
                        x=>x.name===item.name
                    );

                if (found)
                    found.amount=item.amount;

            });

        }

        game.mode="explore";

        if (game.room==="cemetery")
            playMusic("cemetery");
        else
            playMusic("wonderland");

        game.saveMessage=
            "ИГРА ЗАГРУЖЕНА";

    }

    catch(error) {

        console.error(error);

        game.saveMessage=
            "ОШИБКА СОХРАНЕНИЯ";

    }

}


/* =====================================================
   BATTLE
===================================================== */

function startBattle() {

    game.mode="battle";

    playMusic("battle");

    game.battle={

        enemy:{

            name:"ОШИБКА СИСТЕМЫ",

            hp:250,

            maxHP:250,

            attack:10

        },

        actor:0,

        menu:0,

        phase:"menu",

        message:
            "В цифровом мире появилась ошибка.",

        mercy:0,

        soul:{

            x:160,
            y:125,

            size:5,

            speed:2.5,

            hp:20,

            maxHP:20,

            invincible:0

        },

        lasers:[],

        explosions:[],

        enemyTimer:0

    };

}


/* =====================================================
   BATTLE UPDATE
===================================================== */

function updateBattle() {

    const b=game.battle;

    if (!b)
        return;


    if (b.phase==="menu") {

        if (
            keys.left &&
            !previous.left
        ) {

            b.menu--;

            if (b.menu<0)
                b.menu=3;

        }

        if (
            keys.right &&
            !previous.right
        ) {

            b.menu++;

            if (b.menu>3)
                b.menu=0;

        }

        if (
            keys.z &&
            !previous.z
        ) {

            battleChoose();

        }

    }


    else if (b.phase==="magic") {

        if (
            keys.up &&
            !previous.up
        ) {

            b.magicIndex--;

            if (b.magicIndex<0)
                b.magicIndex=2;

        }

        if (
            keys.down &&
            !previous.down
        ) {

            b.magicIndex++;

            if (b.magicIndex>2)
                b.magicIndex=0;

        }

        if (
            keys.x &&
            !previous.x
        ) {

            b.phase="menu";

        }

        if (
            keys.z &&
            !previous.z
        ) {

            useMagic();

        }

    }


    else if (b.phase==="act") {

        if (
            keys.x &&
            !previous.x
        ) {

            b.phase="menu";

        }

        if (
            keys.z &&
            !previous.z
        ) {

            b.mercy=
                Math.min(
                    100,
                    b.mercy+25
                );

            b.message=
                "Вы нашли слабое место ошибки.";

            nextBattleActor();

        }

    }


    else if (b.phase==="defend") {

        if (
            keys.z &&
            !previous.z
        ) {

            /*
               Защита повышает RD.
            */

            b.rd=
                Math.min(
                    100,
                    (b.rd || 0)+35
                );

            b.message=
                "Отряд защищается. RD +35%";

            nextBattleActor();

        }

    }


    else if (b.phase==="enemy") {

        updateEnemyAttack();

    }


    else if (b.phase==="victory") {

        if (
            keys.z &&
            !previous.z
        ) {

            game.mode="explore";

            game.battle=null;

            playMusic(
                game.room==="cemetery"
                ? "cemetery"
                : "wonderland"
            );

        }

    }


    else if (b.phase==="defeat") {

        if (
            keys.z &&
            !previous.z
        ) {

            resetParty();

            game.mode="explore";

            game.battle=null;

            playMusic("wonderland");

        }

    }

}


/* =====================================================
   BATTLE CHOOSE
===================================================== */

function battleChoose() {

    const b=game.battle;

    const actor=party[b.actor];


    /* FIGHT */

    if (b.menu===0) {

        const damage=
            actor.atk+
            Math.floor(
                Math.random()*8
            );

        b.enemy.hp=
            Math.max(
                0,
                b.enemy.hp-damage
            );

        b.message=
            actor.name+
            " атакует!  "+
            damage+
            " урона.";

        if (b.enemy.hp<=0) {

            b.phase="victory";

            b.message=
                "Ошибка системы исчезла.";

            return;

        }

        nextBattleActor();

    }


    /* ACT */

    else if (b.menu===1) {

        b.phase="act";

    }


    /* MAGIC */

    else if (b.menu===2) {

        b.phase="magic";

        b.magicIndex=0;

    }


    /* DEFEND */

    else if (b.menu===3) {

        b.phase="defend";

    }

}


/* =====================================================
   MAGIC
===================================================== */

function useMagic() {

    const b=game.battle;

    /*
       Магия Каштана.
    */

    if (b.magicIndex===0) {

        const heal=25;

        party.forEach(function(p) {

            p.hp=
                Math.min(
                    p.maxHP,
                    p.hp+heal
                );

        });

        b.message=
            "КАШТАН использует «Цифровой свет». Отряд +25 HP.";

    }

    else if (b.magicIndex===1) {

        const damage=30;

        b.enemy.hp=
            Math.max(
                0,
                b.enemy.hp-damage
            );

        b.message=
            "КАШТАН выпускает магический разряд! -30 HP.";

    }

    else {

        b.rd=
            Math.min(
                100,
                (b.rd || 0)+40
            );

        b.message=
            "КАШТАН создаёт защитный барьер. RD +40%.";

    }

    if (b.enemy.hp<=0) {

        b.phase="victory";

        return;

    }

    nextBattleActor();

}


/* =====================================================
   NEXT ALLY
===================================================== */

function nextBattleActor() {

    const b=game.battle;

    b.actor++;

    /*
       ВСЕ 5 союзников ходят.
    */

    if (b.actor < party.length) {

        /*
           Если персонаж повержен —
           пропускаем его ход.
        */

        if (party[b.actor].hp<=0) {

            nextBattleActor();

            return;

        }

        b.phase="menu";

        b.menu=0;

        b.message=
            "Ход "+
            party[b.actor].name+".";

    }

    else {

        b.actor=0;

        startEnemyAttack();

    }

}


/* =====================================================
   ENEMY ATTACK
===================================================== */

function startEnemyAttack() {

    const b=game.battle;

    b.phase="enemy";

    b.enemyTimer=480;

    b.lasers=[];

    b.explosions=[];

    /*
       Несколько лазеров.
    */

    for (let i=0;i<4;i++) {

        b.lasers.push({

            x:
                65+
                Math.random()*190,

            warning:70+i*55,

            active:35,

            width:3

        });

    }

}


/* =====================================================
   ENEMY ATTACK UPDATE
===================================================== */

function updateEnemyAttack() {

    const b=game.battle;

    const soul=b.soul;


    if (soul.invincible>0)
        soul.invincible--;


    if (keys.up)
        soul.y-=soul.speed;

    if (keys.down)
        soul.y+=soul.speed;

    if (keys.left)
        soul.x-=soul.speed;

    if (keys.right)
        soul.x+=soul.speed;


    /*
       Границы как в Deltarune.
    */

    soul.x=
        Math.max(
            57,
            Math.min(
                263,
                soul.x
            )
        );

    soul.y=
        Math.max(
            92,
            Math.min(
                156,
                soul.y
            )
        );


    b.lasers.forEach(function(laser) {

        laser.warning--;

        /*
           После предупреждения
           лазер становится опасным.
        */

        if (
            laser.warning<=0 &&
            laser.warning>-laser.active
        ) {

            const distance=
                Math.abs(
                    soul.x-laser.x
                );

            if (
                distance<7 &&
                soul.invincible<=0
            ) {

                damageSoul();

            }

        }

    });


    b.enemyTimer--;

    if (b.enemyTimer<=0) {

        endEnemyAttack();

    }

}


/* =====================================================
   DAMAGE SOUL
===================================================== */

function damageSoul() {

    const b=game.battle;

    b.soul.hp--;

    b.soul.invincible=35;

    /*
       HP визуально уменьшается.
    */

    b.message=
        "Душа получила урон!";

    if (b.soul.hp<=0) {

        checkDefeat();

    }

}


/* =====================================================
   END ENEMY
===================================================== */

function endEnemyAttack() {

    const b=game.battle;

    if (b.soul.hp<=0) {

        b.phase="defeat";

        return;

    }

    b.actor=0;

    b.phase="menu";

    b.menu=0;

    b.message=
        "Ход ДЕЛЬТЫ.";

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

    if (!alive) {

        game.battle.phase="defeat";

    }

}


/* =====================================================
   RESET
===================================================== */

function resetParty() {

    party.forEach(function(p) {

        p.hp=p.maxHP;

    });

}


/* =====================================================
   DRAW BACKGROUND
===================================================== */

function drawBackground() {

    const room=rooms[game.room];

    ctx.fillStyle="#151515";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    const img=
        images[room.bg];

    if (img) {

        /*
           Фон уменьшается и сохраняет
           пропорции.
        */

        const scale=
            Math.min(
                W/img.width,
                H/img.height
            );

        const dw=
            img.width*scale;

        const dh=
            img.height*scale;

        ctx.drawImage(
            img,
            (W-dw)/2,
            (H-dh)/2,
            dw,
            dh
        );

    }

    else {

        /*
           Безопасный fallback.
        */

        drawFallbackBackground();

    }


    if (room.path) {

        drawPath();

    }


    /*
       Магазин.
    */

    if (room.shop) {

        drawShop();

    }

}


/* =====================================================
   FALLBACK BACKGROUND
===================================================== */

function drawFallbackBackground() {

    ctx.fillStyle=
        game.room==="cemetery"
        ? "#11131d"
        : "#25251f";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.strokeStyle="#34342e";

    for (let x=0;x<W;x+=16) {

        ctx.beginPath();

        ctx.moveTo(x,0);
        ctx.lineTo(x,H);

        ctx.stroke();

    }

    for (let y=0;y<H;y+=16) {

        ctx.beginPath();

        ctx.moveTo(0,y);
        ctx.lineTo(W,y);

        ctx.stroke();

    }

}


/* =====================================================
   PATH
===================================================== */

function drawPath() {

    /*
       Отдельная картинка тропинки.
    */

    const img=images.path;

    if (img) {

        ctx.globalAlpha=.95;

        ctx.drawImage(
            img,
            0,
            0,
            W,
            H
        );

        ctx.globalAlpha=1;

    }

    else {

        ctx.fillStyle="#403a2d";

        ctx.beginPath();

        ctx.moveTo(110,180);
        ctx.lineTo(145,180);
        ctx.lineTo(185,0);
        ctx.lineTo(140,0);

        ctx.closePath();

        ctx.fill();

    }

}


/* =====================================================
   SHOP DRAW
===================================================== */

function drawShop() {

    const img=images.shop;

    if (img) {

        ctx.drawImage(
            img,
            115,
            45,
            90,
            80
        );

    }

    else {

        /*
           Если shop.png нет,
           рисуем магазин сами.
        */

        ctx.fillStyle="#452b1d";

        ctx.fillRect(
            110,
            55,
            100,
            70
        );

        ctx.fillStyle="#77452d";

        ctx.fillRect(
            105,
            48,
            110,
            15
        );

        ctx.fillStyle="#fff";

        ctx.font="6px monospace";

        ctx.fillText(
            "МАГАЗИН",
            137,
            78
        );

    }

}


/* =====================================================
   DELTA SPRITE
===================================================== */

function drawDelta(x,y) {

    let img=null;

    if (player.direction==="left")
        img=images.deltaleft;

    else if (
        player.direction==="right"
    )
        img=images.deltaright;

    else if (
        player.direction==="up"
    )
        img=images.delta;

    else
        img=images.deltabach;


    if (!img)
        img=images.delta;


    if (img) {

        ctx.drawImage(
            img,
            Math.round(x-8),
            Math.round(y-8),
            22,
            28
        );

    }

    else {

        drawCharacter(
            x,
            y,
            "#fff"
        );

    }

}


/* =====================================================
   CHARACTER FALLBACK
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

    drawBackground();


    /*
       Команда.
    */

    followers.forEach(function(f) {

        drawCharacter(
            f.x,
            f.y,
            f.color
        );

    });


    drawDelta(
        player.x,
        player.y
    );


    /*
       Заголовок.
    */

    ctx.fillStyle="#fff";

    ctx.font="7px monospace";

    ctx.fillText(
        rooms[game.room].name,
        10,
        14
    );


    /*
       Подсказка магазина.
    */

    if (nearShop()) {

        drawBox(
            90,
            142,
            140,
            22
        );

        ctx.fillStyle="#fff";

        ctx.font="6px monospace";

        ctx.fillText(
            "Z — ВОЙТИ В МАГАЗИН",
            105,
            155
        );

    }


    /*
       Первый диалог запускается
       только один раз.
    */

    if (
        game.room==="wasteland" &&
        !game.firstDialogueDone &&
        player.x>65
    ) {

        startDialogue(
            introDialogue
        );

    }

}


/* =====================================================
   WRAPPED TEXT
===================================================== */

function drawWrappedText(
    text,
    x,
    y,
    width,
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
            words[i]+" ";

        if (
            ctx.measureText(test).width>width &&
            line!==""
        ) {

            ctx.fillText(
                line,
                x,
                y
            );

            line=
                words[i]+" ";

            y+=lineHeight;

        }

        else {

            line=test;

        }

    }

    if (line)
        ctx.fillText(
            line,
            x,
            y
        );

}


/* =====================================================
   BOX
===================================================== */

function drawBox(x,y,w,h) {

    ctx.fillStyle="#000";

    ctx.fillRect(
        x,
        y,
        w,
        h
    );

    ctx.strokeStyle="#fff";

    ctx.lineWidth=1;

    ctx.strokeRect(
        x,
        y,
        w,
        h
    );

}


/* =====================================================
   DIALOGUE DRAW
===================================================== */

function drawDialogue() {

    ctx.fillStyle="rgba(0,0,0,.55)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    drawBox(
        10,
        108,
        300,
        60
    );


    ctx.fillStyle="#fff";

    ctx.font="7px monospace";


    const text=
        game.dialogue[
            game.dialogueIndex
        ];


    drawWrappedText(
        text,
        22,
        125,
        275,
        10
    );


    ctx.font="6px monospace";

    ctx.fillText(
        "Z — продолжить",
        205,
        155
    );

    ctx.fillText(
        "X — пропустить",
        205,
        163
    );

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


    drawBox(
        15,
        8,
        290,
        164
    );


    ctx.fillStyle="#fff";

    ctx.font="10px monospace";


    if (game.menuPage==="main") {

        ctx.fillText(
            "КОМАНДА",
            30,
            28
        );


        const menu=[

            "ITEMS",
            "STATUS",
            "EQUIPMENT",
            "SAVE"

        ];


        menu.forEach(function(text,i) {

            const y=55+i*25;

            if (
                i===game.menuIndex
            ) {

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

    }


    else if (
        game.menuPage==="ITEMS"
    ) {

        drawItemsMenu();

    }


    else if (
        game.menuPage==="STATUS"
    ) {

        drawStatus();

    }


    else if (
        game.menuPage==="EQUIPMENT"
    ) {

        drawEquipment();

    }


    else if (
        game.menuPage==="SAVE"
    ) {

        drawSave();

    }

}


/* =====================================================
   ITEMS DRAW
===================================================== */

function drawItemsMenu() {

    ctx.fillStyle="#fff";

    ctx.font="10px monospace";

    ctx.fillText(
        "ITEMS",
        30,
        28
    );


    ctx.font="7px monospace";

    items.forEach(function(item,i) {

        const y=55+i*25;

        if (
            i===game.itemIndex
        ) {

            ctx.fillText(
                "▶",
                35,
                y
            );

        }

        ctx.fillText(
            item.name,
            50,
            y
        );

        ctx.fillText(
            "x"+item.amount,
            175,
            y
        );

        ctx.fillText(
            "+"+item.heal+" HP",
            215,
            y
        );

    });


    ctx.font="6px monospace";

    ctx.fillText(
        "Z — использовать",
        35,
        150
    );

    ctx.fillText(
        "X — назад",
        220,
        150
    );

}


/* =====================================================
   STATUS
===================================================== */

function drawStatus() {

    ctx.fillStyle="#fff";

    ctx.font="10px monospace";

    ctx.fillText(
        "STATUS",
        30,
        28
    );


    party.forEach(function(p,i) {

        const y=48+i*22;

        ctx.fillStyle=p.color;

        ctx.font="6px monospace";

        ctx.fillText(
            p.name,
            30,
            y
        );

        ctx.fillStyle="#fff";

        ctx.fillText(
            "HP "+p.hp+"/"+p.maxHP,
            105,
            y
        );

        ctx.fillText(
            "ATK "+p.atk,
            190,
            y
        );

        ctx.fillText(
            "DEF "+p.def,
            240,
            y
        );

    });

    ctx.fillText(
        "X — назад",
        220,
        158
    );

}


/* =====================================================
   EQUIPMENT DRAW
===================================================== */

function drawEquipment() {

    ctx.fillStyle="#fff";

    ctx.font="10px monospace";

    ctx.fillText(
        "EQUIPMENT",
        30,
        25
    );


    party.forEach(function(p,i) {

        const y=48+i*23;

        if (
            i===game.equipmentIndex
        ) {

            ctx.fillText(
                "▶",
                27,
                y
            );

        }

        ctx.fillStyle=p.color;

        ctx.font="6px monospace";

        ctx.fillText(
            p.name,
            40,
            y
        );

        ctx.fillStyle="#fff";

        ctx.fillText(
            "WEAPON: "+p.weapon,
            110,
            y
        );

        ctx.fillText(
            "ARMOR: "+p.armor,
            110,
            y+8
        );

    });


    ctx.fillText(
        "↑↓ — персонаж",
        30,
        158
    );

    ctx.fillText(
        "X — назад",
        220,
        158
    );

}


/* =====================================================
   SAVE DRAW
===================================================== */

function drawSave() {

    ctx.fillStyle="#fff";

    ctx.font="10px monospace";

    ctx.fillText(
        "SAVE",
        30,
        30
    );

    ctx.font="7px monospace";

    ctx.fillText(
        "Z — сохранить игру",
        40,
        65
    );

    ctx.fillText(
        "Деньги: "+money,
        40,
        90
    );

    ctx.fillText(
        "Сохранение хранится в браузере.",
        40,
        110
    );

    ctx.fillText(
        game.saveMessage,
        40,
        135
    );

    ctx.fillText(
        "X — назад",
        220,
        155
    );

}


/* =====================================================
   SHOP DRAW
===================================================== */

function drawShopMenu() {

    ctx.fillStyle="rgba(0,0,0,.95)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    drawBox(
        20,
        10,
        280,
        160
    );

    ctx.fillStyle="#fff";

    ctx.font="10px monospace";

    ctx.fillText(
        "МАГАЗИН",
        35,
        30
    );

    ctx.font="7px monospace";

    ctx.fillText(
        "ДЕНЬГИ: "+money,
        200,
        30
    );


    shopItems.forEach(function(item,i) {

        const y=58+i*27;

        if (
            i===game.shopIndex
        ) {

            ctx.fillText(
                "▶",
                35,
                y
            );

        }

        ctx.fillText(
            item.name,
            50,
            y
        );

        ctx.fillText(
            item.price+" G",
            215,
            y
        );

    });


    ctx.font="6px monospace";

    ctx.fillText(
        "Z — купить",
        40,
        150
    );

    ctx.fillText(
        "X — выйти",
        220,
        150
    );

    ctx.fillText(
        game.saveMessage,
        80,
        165
    );

}


/* =====================================================
   BATTLE DRAW
===================================================== */

function drawBattle() {

    ctx.fillStyle="#050505";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /*
       ВРАГ
    */

    drawBox(
        15,
        8,
        290,
        60
    );


    ctx.fillStyle="#fff";

    ctx.font="7px monospace";

    ctx.fillText(
        game.battle.enemy.name,
        25,
        20
    );


    drawErrorEnemy(
        160,
        40
    );


    drawBattleBox();

}


/* =====================================================
   ERROR ENEMY
===================================================== */

function drawErrorEnemy(x,y) {

    const img=images.error;

    if (img) {

        ctx.drawImage(
            img,
            x-25,
            y-25,
            50,
            50
        );

    }

    else {

        ctx.fillStyle="#551188";

        ctx.fillRect(
            x-20,
            y-20,
            40,
            40
        );

        ctx.fillStyle="#fff";

        ctx.fillRect(
            x-10,
            y-6,
            6,
            6
        );

        ctx.fillRect(
            x+5,
            y-6,
            6,
            6
        );

    }

}


/* =====================================================
   BATTLE BOX
===================================================== */

function drawBattleBox() {

    const b=game.battle;


    /*
       Текст
    */

    ctx.fillStyle="#fff";

    ctx.font="6px monospace";

    drawWrappedText(
        b.message,
        10,
        80,
        145,
        8
    );


    /*
       RD
    */

    ctx.fillText(
        "RD",
        180,
        78
    );

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        200,
        72,
        100,
        7
    );

    ctx.fillStyle="#55ddff";

    ctx.fillRect(
        201,
        73,
        98*
        ((b.rd||0)/100),
        5
    );


    /*
       РЕЖИМ ВРАГА
    */

    if (b.phase==="enemy") {

        drawEnemyAttackBox();

        return;

    }


    /*
       СОЮЗНИКИ
    */

    drawBattleParty();


    /*
       MENU
    */

    if (b.phase==="menu") {

        drawBattleMenu();

    }

    else if (
        b.phase==="magic"
    ) {

        drawMagicMenu();

    }

    else if (
        b.phase==="act"
    ) {

        drawActMenu();

    }

    else if (
        b.phase==="defend"
    ) {

        ctx.fillStyle="#fff";

        ctx.font="7px monospace";

        ctx.fillText(
            "Z — ЗАЩИТИТЬСЯ",
            180,
            125
        );

        ctx.fillText(
            "Защита увеличит RD.",
            180,
            140
        );

    }


    if (b.phase==="victory") {

        ctx.fillStyle="#fff";

        ctx.font="11px monospace";

        ctx.fillText(
            "ПОБЕДА!",
            125,
            120
        );

        ctx.font="6px monospace";

        ctx.fillText(
            "Z — продолжить",
            110,
            140
        );

    }


    if (b.phase==="defeat") {

        ctx.fillStyle="#fff";

        ctx.font="9px monospace";

        ctx.fillText(
            "ОТРЯД ПОБЕЖДЁН",
            90,
            120
        );

        ctx.font="6px monospace";

        ctx.fillText(
            "Z — восстановиться",
            100,
            140
        );

    }

}


/* =====================================================
   BATTLE PARTY
===================================================== */

function drawBattleParty() {

    const b=game.battle;

    party.forEach(function(p,i) {

        const y=101+i*11;

        if (
            i===b.actor &&
            b.phase==="menu"
        ) {

            ctx.fillStyle="#fff";

            ctx.font="6px monospace";

            ctx.fillText(
                "▶",
                3,
                y
            );

        }

        ctx.fillStyle=p.color;

        ctx.font="5px monospace";

        ctx.fillText(
            p.name,
            10,
            y
        );


        ctx.fillStyle="#333";

        ctx.fillRect(
            55,
            y-5,
            45,
            5
        );


        ctx.fillStyle="#fff";

        ctx.fillRect(
            56,
            y-4,
            43*
            (p.hp/p.maxHP),
            3
        );


        ctx.fillStyle="#fff";

        ctx.fillText(
            p.hp+"/"+p.maxHP,
            105,
            y
        );

    });

}


/* =====================================================
   BATTLE MENU
===================================================== */

function drawBattleMenu() {

    const b=game.battle;

    const labels=[

        "FIGHT",
        "ACT",
        "MAGIC",
        "DEFEND"

    ];

    labels.forEach(function(label,i) {

        const x=
            175+
            (i%2)*62;

        const y=
            108+
            Math.floor(i/2)*25;

        if (i===b.menu) {

            ctx.strokeStyle="#fff";

            ctx.strokeRect(
                x-6,
                y-9,
                57,
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

}


/* =====================================================
   MAGIC MENU
===================================================== */

function drawMagicMenu() {

    const b=game.battle;

    ctx.fillStyle="#fff";

    ctx.font="7px monospace";

    ctx.fillText(
        "КАШТАН — MAGIC",
        175,
        105
    );

    const spells=[

        "ЦИФРОВОЙ СВЕТ",
        "РАЗРЯД",
        "БАРЬЕР"

    ];

    spells.forEach(function(text,i) {

        const y=119+i*12;

        if (i===b.magicIndex) {

            ctx.fillText(
                "▶",
                175,
                y
            );

        }

        ctx.fillText(
            text,
            185,
            y
        );

    });

    ctx.fillText(
        "X — назад",
        210,
        157
    );

}


/* =====================================================
   ACT MENU
===================================================== */

function drawActMenu() {

    ctx.fillStyle="#fff";

    ctx.font="7px monospace";

    ctx.fillText(
        "ACT",
        185,
        110
    );

    ctx.fillText(
        "▶ ОСМОТРЕТЬ",
        180,
        128
    );

    ctx.fillText(
        "X — назад",
        205,
        150
    );

}


/* =====================================================
   ENEMY ATTACK DRAW
===================================================== */

function drawEnemyAttackBox() {

    const b=game.battle;

    ctx.strokeStyle="#fff";

    ctx.lineWidth=2;

    ctx.strokeRect(
        50,
        87,
        220,
        72
    );


    b.lasers.forEach(function(laser) {

        /*
           Сначала показываем место
           будущего выстрела.
        */

        if (laser.warning>0) {

            ctx.strokeStyle=
                "rgba(255,80,80,.55)";

            ctx.beginPath();

            ctx.moveTo(
                laser.x,
                88
            );

            ctx.lineTo(
                laser.x,
                158
            );

            ctx.stroke();

        }

        else {

            ctx.fillStyle="#ff3333";

            ctx.fillRect(
                laser.x-2,
                88,
                4,
                70
            );

        }

    });


    /*
       Душа.
    */

    if (
        b.soul.invincible<=0 ||
        Math.floor(
            b.soul.invincible/4
        )%2===0
    ) {

        ctx.fillStyle="#ff3355";

        ctx.fillRect(
            b.soul.x-4,
            b.soul.y-4,
            8,
            8
        );

    }


    /*
       HP души.
    */

    ctx.fillStyle="#fff";

    ctx.font="6px monospace";

    ctx.fillText(
        "SOUL HP "+
        b.soul.hp+
        "/"+
        b.soul.maxHP,
        55,
        170
    );

}


/* =====================================================
   TRANSITION DRAW
===================================================== */

function drawTransition() {

    if (game.mode!=="transition")
        return;

    ctx.fillStyle="#000";

    ctx.globalAlpha=
        Math.max(
            0,
            Math.min(
                1,
                game.transition
            )
        );

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    ctx.globalAlpha=1;

}


/* =====================================================
   UPDATE
===================================================== */

function update() {

    if (
        game.mode==="explore"
    ) {

        updatePlayer();

        updateFollowers();

        updateShop();

    }


    else if (
        game.mode==="dialogue"
    ) {

        updateDialogue();

    }


    else if (
        game.mode==="menu"
    ) {

        updateMenu();

    }


    else if (
        game.mode==="shop"
    ) {

        updateShopMenu();

    }


    else if (
        game.mode==="battle"
    ) {

        updateBattle();

    }


    else if (
        game.mode==="transition"
    ) {

        updateTransition();

    }


    /*
       C открывает меню.
    */

    if (
        keys.c &&
        !previous.c &&
        game.mode==="explore"
    ) {

        game.mode="menu";

        game.menuPage="main";

        game.menuIndex=0;

        game.equipmentIndex=0;

    }


    /*
       Сохраняем состояние клавиш.
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


    if (
        game.mode==="battle"
    ) {

        drawBattle();

    }

    else if (
        game.mode==="shop"
    ) {

        drawShopMenu();

    }

    else {

        drawExplore();


        if (
            game.mode==="dialogue"
        ) {

            drawDialogue();

        }


        if (
            game.mode==="menu"
        ) {

            drawMenu();

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

startGame();

loop();
