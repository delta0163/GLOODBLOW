"use strict";

/*
    BLOOD GLOW
    Основная игровая логика
*/

/* =========================
   СОСТОЯНИЕ ИГРЫ
========================= */

const game = {

    mode: "battle",

    playerTurn: true,

    selectedCharacter: "delta",

    enemyHP: 300,
    enemyMaxHP: 300,

    defending: false,

    spareProgress: 0,

    dodgeRunning: false,

    keys: {},

    heart: {
        x: 145,
        y: 75,

        speed: 3.2
    },

    party: {

        delta: {
            name: "ДЕЛЬТА",
            hp: 90,
            maxHP: 90
        },

        nemka: {
            name: "НЕМКА",
            hp: 120,
            maxHP: 120
        },

        lychee: {
            name: "ЛИЧИ",
            hp: 100,
            maxHP: 100
        },

        pancake: {
            name: "ПАНКЕЙК",
            hp: 80,
            maxHP: 80
        },

        chestnut: {
            name: "КАШТАН",
            hp: 67,
            maxHP: 67
        }
    }

};


/* =========================
   DOM
========================= */

const $ = selector =>
    document.querySelector(selector);

const $$ = selector =>
    document.querySelectorAll(selector);


/* =========================
   ЭЛЕМЕНТЫ
========================= */

const message = $("#message");

const commandMenu = $("#commandMenu");

const subMenu = $("#subMenu");

const dodgeArea = $("#dodgeArea");

const heart = $("#heart");

const inventory = $("#inventory");

const dialogBox = $("#dialogBox");

const dialogText = $("#dialogText");

const victory = $("#victory");

const enemyHpBar = $("#enemyHpBar");


/* =========================
   СООБЩЕНИЕ
========================= */

function setMessage(text) {

    message.textContent = text;

}


/* =========================
   PARTY HP
========================= */

function updatePartyUI() {

    for (const id in game.party) {

        const character = game.party[id];

        const hpElement =
            document.getElementById(id + "Hp");

        const barElement =
            document.getElementById(id + "Bar");

        if (!hpElement || !barElement) {
            continue;
        }

        hpElement.textContent =
            Math.max(0, character.hp);

        const percent =
            Math.max(
                0,
                Math.min(
                    100,
                    character.hp /
                    character.maxHP *
                    100
                )
            );

        barElement.style.width =
            percent + "%";
    }
}


/* =========================
   ENEMY HP
========================= */

function updateEnemyUI() {

    const percent =
        game.enemyHP /
        game.enemyMaxHP *
        100;

    enemyHpBar.style.width =
        Math.max(0, percent) + "%";

}


/* =========================
   ВЫБОР ПЕРСОНАЖА
========================= */

$$(".character").forEach(character => {

    character.addEventListener("click", () => {

        const id =
            character.dataset.id;

        game.selectedCharacter = id;

        $$(".character").forEach(c => {
            c.classList.remove("selected");
        });

        character.classList.add("selected");

        setMessage(
            "Выбран: " +
            game.party[id].name
        );
    });

});


/* =========================
   БОЕВЫЕ КОМАНДЫ
========================= */

$$(".command").forEach(button => {

    button.addEventListener("click", () => {

        if (!game.playerTurn) {
            return;
        }

        const command =
            button.dataset.command;

        handleCommand(command);

    });

});


/* =========================
   КОМАНДЫ
========================= */

function handleCommand(command) {

    closeSubMenu();

    switch (command) {

        case "fight":
            openFightMenu();
            break;

        case "action":
            openActionMenu();
            break;

        case "magic":
            openMagicMenu();
            break;

        case "defend":
            defend();
            break;

        case "spare":
            spare();
            break;

    }

}


/* =========================
   БИТВА
========================= */

function openFightMenu() {

    subMenu.innerHTML = "";

    const title =
        document.createElement("div");

    title.className =
        "sub-title";

    title.textContent =
        "КТО АТАКУЕТ?";

    subMenu.appendChild(title);

    for (const id in game.party) {

        const button =
            document.createElement("button");

        button.className =
            "sub-option";

        button.textContent =
            game.party[id].name +
            " — АТАКА";

        button.onclick = () => {

            attackWith(id);

        };

        subMenu.appendChild(button);
    }

    subMenu.style.display = "block";
}


/* =========================
   АТАКА
========================= */

function attackWith(id) {

    closeSubMenu();

    if (game.party[id].hp <= 0) {

        setMessage(
            game.party[id].name +
            " не может атаковать."
        );

        return;
    }

    const damage =
        Math.floor(
            15 +
            Math.random() * 16
        );

    game.enemyHP -= damage;

    updateEnemyUI();

    setMessage(
        game.party[id].name +
        " атакует! Урон: " +
        damage
    );

    screenShake();

    if (game.enemyHP <= 0) {

        game.enemyHP = 0;

        updateEnemyUI();

        setTimeout(enemyDefeated, 700);

        return;
    }

    endPlayerTurn();

}


/* =========================
   ДЕЙСТВИЕ
========================= */

function openActionMenu() {

    subMenu.innerHTML = "";

    const title =
        document.createElement("div");

    title.className =
        "sub-title";

    title.textContent =
        "ДЕЙСТВИЕ";

    subMenu.appendChild(title);

    const actions = [

        ["Осмотреть", 10],
        ["Поговорить", 15],
        ["Пошутить", 20],
        ["Показать Blood Glow", 25]

    ];

    actions.forEach(action => {

        const button =
            document.createElement("button");

        button.className =
            "sub-option";

        button.textContent =
            action[0];

        button.onclick = () => {

            game.spareProgress +=
                action[1];

            closeSubMenu();

            setMessage(
                "Действие: " +
                action[0]
            );

            if (game.spareProgress >= 100) {

                setMessage(
                    "Враг больше не хочет сражаться."
                );

            }

            endPlayerTurn();

        };

        subMenu.appendChild(button);

    });

    subMenu.style.display = "block";
}


/* =========================
   МАГИЯ
========================= */

function openMagicMenu() {

    subMenu.innerHTML = "";

    const title =
        document.createElement("div");

    title.className =
        "sub-title";

    title.textContent =
        "МАГИЯ";

    subMenu.appendChild(title);

    const spells = [

        ["GLOW", 20, 30],
        ["BLOOD PULSE", 35, 55],
        ["DARK GLOW", 50, 75]

    ];

    spells.forEach(spell => {

        const button =
            document.createElement("button");

        button.className =
            "sub-option";

        button.textContent =
            spell[0] +
            " — " +
            spell[1] +
            " GLW";

        button.onclick = () => {

            closeSubMenu();

            const damage =
                spell[2] +
                Math.floor(
                    Math.random() * 15
                );

            game.enemyHP -= damage;

            updateEnemyUI();

            setMessage(
                spell[0] +
                " наносит " +
                damage +
                " урона!"
            );

            if (game.enemyHP <= 0) {

                game.enemyHP = 0;

                updateEnemyUI();

                setTimeout(enemyDefeated, 700);

            } else {

                endPlayerTurn();

            }

        };

        subMenu.appendChild(button);

    });

    subMenu.style.display = "block";
}


/* =========================
   ЗАЩИТА
========================= */

function defend() {

    game.defending = true;

    setMessage(
        "Команда приготовилась защищаться."
    );

    endPlayerTurn();

}


/* =========================
   ПОЩАДА
========================= */

function spare() {

    closeSubMenu();

    if (game.spareProgress >= 100) {

        setMessage(
            "Вы пощадили врага."
        );

        setTimeout(() => {

            victory.classList.remove("hidden");

            document.querySelector(
                "#victoryText"
            ).textContent =
                "Вы завершили бой без убийства.";

        }, 700);

        return;
    }

    setMessage(
        "Враг пока не готов принять пощаду."
    );

    endPlayerTurn();

}


/* =========================
   ХОД ВРАГА
========================= */

function endPlayerTurn() {

    game.playerTurn = false;

    commandMenu.style.opacity = "0.4";

    setTimeout(() => {

        startDodgePhase();

    }, 900);

}


/* =========================
   УКЛОНЕНИЕ
========================= */

function startDodgePhase() {

    game.mode = "dodge";

    game.dodgeRunning = true;

    game.defending = false;

    dodgeArea.classList.add("active");

    game.heart.x = 145;
    game.heart.y = 75;

    updateHeart();

    setMessage(
        "Ход врага! Уклоняйся!"
    );

    startAttacks();

}


/* =========================
   СЕРДЦЕ
========================= */

function updateHeart() {

    heart.style.left =
        game.heart.x + "px";

    heart.style.top =
        game.heart.y + "px";

}


/* =========================
   ДВИЖЕНИЕ СЕРДЦА
========================= */

function moveHeart() {

    if (!game.dodgeRunning) {
        return;
    }

    const speed =
        game.heart.speed;

    if (
        game.keys["ArrowLeft"] ||
        game.keys["a"]
    ) {
        game.heart.x -= speed;
    }

    if (
        game.keys["ArrowRight"] ||
        game.keys["d"]
    ) {
        game.heart.x += speed;
    }

    if (
        game.keys["ArrowUp"] ||
        game.keys["w"]
    ) {
        game.heart.y -= speed;
    }

    if (
        game.keys["ArrowDown"] ||
        game.keys["s"]
    ) {
        game.heart.y += speed;
    }

    const maxX =
        dodgeArea.clientWidth -
        20;

    const maxY =
        dodgeArea.clientHeight -
        20;

    game.heart.x =
        Math.max(
            0,
            Math.min(
                maxX,
                game.heart.x
            )
        );

    game.heart.y =
        Math.max(
            0,
            Math.min(
                maxY,
                game.heart.y
            )
        );

    updateHeart();

}


/* =========================
   ЦИКЛ
========================= */

function gameLoop() {

    moveHeart();

    checkCollisions();

    requestAnimationFrame(gameLoop);

}

gameLoop();


/* =========================
   КЛАВИАТУРА
========================= */

window.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();

        game.keys[key] = true;

        if (
            key === "z"
        ) {

            interact();

        }

        if (
            key === "x"
        ) {

            cancelOrRun();

        }

        if (
            key === "c"
        ) {

            toggleInventory();

        }

        if (
            key === "f11"
        ) {

            event.preventDefault();

            toggleFullscreen();

        }

    }
);


window.addEventListener(
    "keyup",
    event => {

        game.keys[
            event.key.toLowerCase()
        ] = false;

    }
);


/* =========================
   Z
========================= */

function interact() {

    if (
        !dialogBox.classList.contains(
            "hidden"
        )
    ) {

        closeDialog();

        return;
    }

    if (
        !inventory.classList.contains(
            "hidden"
        )
    ) {

        return;
    }

    setMessage(
        "Z — взаимодействие"
    );

}


/* =========================
   X
========================= */

function cancelOrRun() {

    if (
        !dialogBox.classList.contains(
            "hidden"
        )
    ) {

        closeDialog();

        return;
    }

    if (
        !inventory.classList.contains(
            "hidden"
        )
    ) {

        inventory.classList.add(
            "hidden"
        );

        return;
    }

    if (subMenu.style.display === "block") {

        closeSubMenu();

        return;

    }

    setMessage(
        "X — бег / отмена / пропуск"
    );

}


/* =========================
   C — ИНВЕНТАРЬ
========================= */

function toggleInventory() {

    if (
        !dialogBox.classList.contains(
            "hidden"
        )
    ) {
        return;
    }

    inventory.classList.toggle(
        "hidden"
    );

}


/* =========================
   ЗАКРЫТЬ SUBMENU
========================= */

function closeSubMenu() {

    subMenu.style.display =
        "none";

    subMenu.innerHTML = "";

}


/* =========================
   КОЛЛИЗИИ
========================= */

function checkCollisions() {

    if (!game.dodgeRunning) {
        return;
    }

    const heartRect =
        heart.getBoundingClientRect();

    const attacks =
        document.querySelectorAll(
            ".attack"
        );

    attacks.forEach(attack => {

        const rect =
            attack.getBoundingClientRect();

        if (
            heartRect.left <
                rect.right &&
            heartRect.right >
                rect.left &&
            heartRect.top <
                rect.bottom &&
            heartRect.bottom >
                rect.top
        ) {

            hitPlayer(attack);

        }

    });

}


/* =========================
   УДАР
========================= */

function hitPlayer(attack) {

    if (
        attack.dataset.hit === "true"
    ) {
        return;
    }

    attack.dataset.hit = "true";

    const damage =
        game.defending
            ? 4
            : 8;

    const id =
        game.selectedCharacter;

    if (
        game.party[id].hp <= 0
    ) {
        return;
    }

    game.party[id].hp -= damage;

    updatePartyUI();

    setMessage(
        game.party[id].name +
        " получает " +
        damage +
        " урона!"
    );

    attack.style.display =
        "none";

}


/* =========================
   АТАКИ ВРАГА
========================= */

let attackTimer = null;

function startAttacks() {

    const attacks =
        document.querySelectorAll(
            ".attack"
        );

    attacks.forEach((attack, index) => {

        attack.style.display =
            "block";

        attack.dataset.hit =
            "false";

        attack.style.left =
            (
                Math.random() *
                (dodgeArea.clientWidth - 20)
            ) + "px";

        attack.style.top =
            (
                Math.random() *
                (dodgeArea.clientHeight - 20)
            ) + "px";

        attack.style.transform =
            "rotate(" +
            Math.floor(
                Math.random() * 360
            ) +
            "deg)";

    });

    clearTimeout(attackTimer);

    attackTimer =
        setTimeout(
            finishDodgePhase,
            5000
        );

}


/* =========================
   КОНЕЦ УКЛОНЕНИЯ
========================= */

function finishDodgePhase() {

    game.dodgeRunning = false;

    game.mode = "battle";

    dodgeArea.classList.remove(
        "active"
    );

    const attacks =
        document.querySelectorAll(
            ".attack"
        );

    attacks.forEach(attack => {

        attack.style.display =
            "block";

    });

    game.playerTurn = true;

    commandMenu.style.opacity =
        "1";

    setMessage(
        "Твой ход."
    );

}


/* =========================
   ПОБЕДА
========================= */

function enemyDefeated() {

    game.dodgeRunning = false;

    dodgeArea.classList.remove(
        "active"
    );

    victory.classList.remove(
        "hidden"
    );

    document.querySelector(
        "#victoryText"
    ).textContent =
        "BLOOD BEAST больше не может сражаться.";

}


/* =========================
   ПРОДОЛЖИТЬ
========================= */

$("#continueBtn").addEventListener(
    "click",
    () => {

        victory.classList.add(
            "hidden"
        );

        game.enemyHP =
            game.enemyMaxHP;

        game.spareProgress = 0;

        updateEnemyUI();

        setMessage(
            "Следующая битва начинается..."
        );

    }
);


/* =========================
   FULLSCREEN
========================= */

async function toggleFullscreen() {

    try {

        if (!document.fullscreenElement) {

            await document.documentElement
                .requestFullscreen();

        } else {

            await document.exitFullscreen();

        }

    } catch (error) {

        console.log(
            "Fullscreen недоступен:",
            error
        );

    }

}


$("#fullscreenBtn").addEventListener(
    "click",
    toggleFullscreen
);


/* =========================
   ДЖОЙСТИК
========================= */

const joystick =
    $("#joystick");

const joystickKnob =
    $("#joystickKnob");

let joystickActive = false;

let joystickPointerId = null;

function updateJoystick(
    clientX,
    clientY
) {

    const rect =
        joystick.getBoundingClientRect();

    const centerX =
        rect.left +
        rect.width / 2;

    const centerY =
        rect.top +
        rect.height / 2;

    let dx =
        clientX - centerX;

    let dy =
        clientY - centerY;

    const radius =
        rect.width / 2 - 25;

    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    if (distance > radius) {

        dx =
            dx / distance *
            radius;

        dy =
            dy / distance *
            radius;

    }

    joystickKnob.style.left =
        "calc(50% + " +
        dx +
        "px)";

    joystickKnob.style.top =
        "calc(50% + " +
        dy +
        "px)";

    const deadzone = 10;

    game.keys["ArrowLeft"] =
        dx < -deadzone;

    game.keys["ArrowRight"] =
        dx > deadzone;

    game.keys["ArrowUp"] =
        dy < -deadzone;

    game.keys["ArrowDown"] =
        dy > deadzone;

}


function resetJoystick() {

    joystickActive = false;

    joystickPointerId =
        null;

    joystickKnob.style.left =
        "50%";

    joystickKnob.style.top =
        "50%";

    game.keys["ArrowLeft"] =
        false;

    game.keys["ArrowRight"] =
        false;

    game.keys["ArrowUp"] =
        false;

    game.keys["ArrowDown"] =
        false;

}


joystick.addEventListener(
    "pointerdown",
    event => {

        joystickActive = true;

        joystickPointerId =
            event.pointerId;

        joystick.setPointerCapture(
            event.pointerId
        );

        updateJoystick(
            event.clientX,
            event.clientY
        );

    }
);


joystick.addEventListener(
    "pointermove",
    event => {

        if (
            !joystickActive ||
            event.pointerId !==
                joystickPointerId
        ) {
            return;
        }

        updateJoystick(
            event.clientX,
            event.clientY
        );

    }
);


joystick.addEventListener(
    "pointerup",
    resetJoystick
);


joystick.addEventListener(
    "pointercancel",
    resetJoystick
);


/* =========================
   Z / X / C TOUCH
========================= */

function touchButton(
    element,
    callback
) {

    element.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            callback();

        }
    );

}


touchButton(
    $("#btnZ"),
    interact
);

touchButton(
    $("#btnX"),
    cancelOrRun
);

touchButton(
    $("#btnC"),
    toggleInventory
);


/* =========================
   ДИАЛОГ
========================= */

let dialogPages = [

    "Добро пожаловать в BLOOD GLOW.",

    "Пять персонажей оказались в неизвестном месте.",

    "Дельта смотрит вперёд.",

    "Немка, Личи, Панкейк и Каштан готовы идти дальше.",

    "Но впереди уже кто-то ждёт..."

];

let dialogPage = 0;


function openDialog() {

    dialogPage = 0;

    dialogBox.classList.remove(
        "hidden"
    );

    dialogText.textContent =
        dialogPages[dialogPage];

}


function nextDialog() {

    dialogPage++;

    if (
        dialogPage >=
        dialogPages.length
    ) {

        closeDialog();

        return;

    }

    dialogText.textContent =
        dialogPages[dialogPage];

}


function closeDialog() {

    dialogBox.classList.add(
        "hidden"
    );

}


dialogBox.addEventListener(
    "click",
    nextDialog
);


/* =========================
   SHAKE
========================= */

function screenShake() {

    const screen =
        $("#screen");

    screen.classList.remove(
        "shake"
    );

    void screen.offsetWidth;

    screen.classList.add(
        "shake"
    );

    setTimeout(() => {

        screen.classList.remove(
            "shake"
        );

    }, 220);

}


/* =========================
   СТАРТ
========================= */

function init() {

    updatePartyUI();

    updateEnemyUI();

    game.playerTurn = true;

    setMessage(
        "Что будет делать команда?"
    );

}

init();
