#<template>
    <div class="game-container">
        <canvas ref="gameCanvas" :width="width" :height="height"></canvas>
    </div>
</template>

<script setup>
// ------------------------------
// Props Definition for v-model Bindings
// ------------------------------
const props = defineProps({
    isGameRunning: {
        type: Boolean,
        default: false
    },
    isGameOver: {
        type: Boolean,
        default: false
    },
    score: {
        type: Number,
        default: 0
    },
    finalScore: {
        type: Number,
        default: 0
    },
    backgroundSpeed: {
        type: Number,
        default: 2.4
    }
});

// ------------------------------
// Emits Definition for v-model Bindings
// ------------------------------
const emit = defineEmits([
    "update:isGameRunning",
    "update:isGameOver",
    "update:score",
    "update:finalScore",
    "update:backgroundSpeed"
]);

// ------------------------------
// Constants and Configurations
// ------------------------------
const width = 800;
const height = 150;
const INITIAL_GAME_SPEED = props.backgroundSpeed;
const GAME_SPEED_INCREMENT = 0.1;
const MAX_GAME_SPEED = 15;
const SCORE_MILESTONE = 10;
const BASE_SPAWN_INTERVAL = 180;
const MIN_SPAWN_INTERVAL = 100;
const BUFFER_RATIO_COLLISION = 0.1;
const RUN_ANIMATION_SPEED = 15;

// Reactive state
const lockPlay = ref(false);
const internalScore = ref(props.score);
const internalFinalScore = ref(props.finalScore);
const gameCanvas = ref(null);

const gameState = reactive({
    isRunning: props.isGameRunning,
    isOver: props.isGameOver,
    isPaused: false
});

// Reactive flags to manage animations
const isGameOverAnimating = ref(false);
const isPopUpAnimating = ref(false);

// Flag to determine if the game should auto-start after reset
const shouldAutoStart = ref(false);

// Cat Dimensions
const catHeight = 50;
const groundY = height - catHeight;

// Cat Images
const catImages = {
    rest: new Image(),
    run: [new Image(), new Image()],
    jump: new Image(),
    float: new Image(),
    landing: new Image(),
    hit: new Image()
};

catImages.rest.src = "art/catIdle.png";
catImages.run[0].src = "art/catRunning1.png";
catImages.run[1].src = "art/catRunning2.png";
catImages.jump.src = "art/catJump.png";
catImages.float.src = "art/catFloat.png";
catImages.landing.src = "art/catLanding.png";
catImages.hit.src = "art/catHit.png";

// Obstacle Image
const obstacleImage = new Image();
obstacleImage.src = "art/catObstacle.svg";

// Cat Object
const cat = reactive({
    baseX: 72,
    x: 72,
    y: groundY + 20,
    width: catHeight,
    height: catHeight,
    velocityY: 0,
    gravity: 0.3,
    jumpForce: 9,
    isJumping: false,
    canJump: true,
    floatMode: false,
    floatCounter: 0,
    maxJumpHeight: 75,
    floatFrames: 60,
    state: "popUp",
    frameIndex: 0,
    frameCounter: 0,
    hitFallSpeed: 2
});

const obstacles = ref([]);
let gameSpeed = INITIAL_GAME_SPEED;
let animationId = null;

// Watchers to synchronize internal state with props
watch(() => props.isGameRunning, (newVal) => {
    gameState.isRunning = newVal;
});

watch(() => props.isGameOver, (newVal) => {
    gameState.isOver = newVal;
});

watch(() => props.score, (newVal) => {
    internalScore.value = newVal;
});

watch(() => props.finalScore, (newVal) => {
    internalFinalScore.value = newVal;
});

watch(() => props.backgroundSpeed, (newVal) => {
    gameSpeed = newVal;
});

// Utility Functions
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calculateSpawnInterval() {
    const interval = Math.floor(BASE_SPAWN_INTERVAL * (INITIAL_GAME_SPEED / gameSpeed));
    return Math.max(MIN_SPAWN_INTERVAL, interval + 20);
}

let spawnTimer = 0;
let spawnInterval = calculateSpawnInterval();

function shouldSpawnObstacleFunc() {
    spawnTimer++;
    if (spawnTimer >= spawnInterval) {
        spawnTimer = 0;
        spawnInterval = calculateSpawnInterval();
        return true;
    }
    return false;
}

function spawnObstacle() {
    const size = randomBetween(25, 50);
    obstacles.value.push({
        x: width,
        y: height,
        width: size,
        height: size,
        targetY: height - size,
        isDropping: true,
        isRemoving: false,
        opacity: 0 // Start fully transparent
    });
}

function updateObstacles() {
    for (let i = 0; i < obstacles.value.length; i++) {
        const obs = obstacles.value[i];
        obs.x -= gameSpeed;

        // Handle fading in
        if (obs.opacity < 1 && !obs.isRemoving) {
            obs.opacity = Math.min(obs.opacity + 0.05, 1); // Gradually increase opacity
        }

        if (obs.isDropping) {
            obs.y -= 1;
            if (obs.y <= obs.targetY) {
                obs.y = obs.targetY;
                obs.isDropping = false;
            }
        } else if (obs.isRemoving) {
			obs.y += 1;
            obs.opacity = Math.max(obs.opacity - 0.05, 0); // Gradually decrease opacity
            if (obs.opacity === 0) {
                obstacles.value.splice(i, 1);
                i--;
                continue;
            }
        }

        if (obs.x + obs.width < 0 || obs.y > height) {
            obstacles.value.splice(i, 1);
            i--;
            continue;
        }

        if (checkCollision(cat, obs)) {
            gameOver();
            break;
        }

        // Trigger fade-out when cat jumps over the obstacle
        if (!obs.isRemoving && obs.x + obs.width < cat.x) {
            obs.isRemoving = true;
			internalScore.value += 10;
			emit("update:score", internalScore.value);
        }
    }
}

function checkCollision(a, b, bufferRatio = BUFFER_RATIO_COLLISION) {
    const bufferA = a.width * bufferRatio;
    const bufferB = b.width * bufferRatio;

    if (a.state === "popUp" || a.state === "landing") {
        return false;
    }

    return (
        a.x + bufferA < b.x + b.width - bufferB &&
        a.x + a.width - bufferA > b.x + bufferB &&
        a.y + bufferA < b.y + b.height - bufferB &&
        a.y + a.height - bufferA > b.y + bufferB
    );
}

function jump() {
    if (cat.canJump && !cat.isJumping) {
        cat.velocityY = -cat.jumpForce;
        cat.isJumping = true;
        cat.canJump = false;
        cat.state = "jumping";
    }
}

function resetGame(autoStart = false) {
    internalScore.value = 0;
    internalFinalScore.value = 0;
    gameSpeed = INITIAL_GAME_SPEED;
    spawnTimer = 0;
    spawnInterval = calculateSpawnInterval();
    obstacles.value = [];

    gameState.isRunning = false;
    gameState.isOver = false;

    emit("update:isGameRunning", gameState.isRunning);
    emit("update:isGameOver", gameState.isOver);
    emit("update:score", internalScore.value);
    emit("update:finalScore", internalFinalScore.value);
    emit("update:backgroundSpeed", gameSpeed);

    shouldAutoStart.value = false;
    isPopUpAnimating.value = true;

    Object.assign(cat, {
        x: cat.baseX,
        y: groundY + 20,
        velocityY: 0,
        isJumping: false,
        canJump: true,
        floatMode: false,
        floatCounter: 0,
        state: "popUp",
        frameIndex: 0,
        frameCounter: 0
    });

    lockPlay.value = false;
}

function startGame() {
    if (gameState.isRunning || gameState.isOver || isPopUpAnimating.value) return;

    gameState.isRunning = true;
    gameState.isOver = false;
    cat.state = "running";

    emit("update:isGameRunning", gameState.isRunning);
    emit("update:isGameOver", gameState.isOver);
    emit("update:backgroundSpeed", gameSpeed);
}

let catBounce = ref(true);
function gameOver() {
    if (gameState.isOver || isGameOverAnimating.value) return;

    lockPlay.value = true;
    gameState.isRunning = false;
    gameState.isOver = true;

    internalFinalScore.value = internalScore.value;
    emit("update:finalScore", internalFinalScore.value);

    cat.state = "hit";
    obstacles.value = [];
    gameSpeed = 0;

    emit("update:backgroundSpeed", gameSpeed);
    emit("update:isGameRunning", gameState.isRunning);
    emit("update:isGameOver", gameState.isOver);

    isGameOverAnimating.value = true;

    // Set the initial bounce
    let bounceCount = 0; // Counter for bounce iterations
    const bounceAnimation = setInterval(() => {
        if (bounceCount < 1) { // Execute the bounce once
            cat.y -= 3.5; // Bounce up by 10px
            setTimeout(() => {
                bounceCount++;
            }, 250);
        } else {
			cat.state = "landing";
            clearInterval(bounceAnimation);

            // Start falling animation after the bounce
            const fallAnimation = setInterval(() => {
                cat.y += cat.hitFallSpeed; // Increase fall speed
                if (cat.y > height) { // If the cat is off the screen
                    clearInterval(fallAnimation);
                    isGameOverAnimating.value = false;

                    setTimeout(() => {
                        catBounce.value = true;
                        resetGame(true);
                    }, 2500);
                }
            }, 16);
        }
    }, 16);
}


function update() {
    animationId = requestAnimationFrame(update);

    const ctx = gameCanvas.value.getContext("2d");
    ctx.clearRect(0, 0, width, height);

    if (gameState.isRunning) {
        updateCat();
        updateObstacles();

        if (shouldSpawnObstacleFunc()) {
            spawnObstacle();
        }

        const speedThreshold = Math.floor(internalScore.value / SCORE_MILESTONE);
        gameSpeed = Math.min(
            INITIAL_GAME_SPEED + speedThreshold * GAME_SPEED_INCREMENT,
            MAX_GAME_SPEED
        );

        emit("update:backgroundSpeed", gameSpeed);
    } else if (isPopUpAnimating.value) {
        updateCat();
    }

    drawCat(ctx);
    drawObstacles(ctx);
}

function updateCat() {
    if (cat.state === "hit") return;

    if (cat.state === "popUp") {
        if (cat.y > groundY) {
            cat.y -= 1.2; // Slower pop-up animation
            if (cat.y <= groundY) {
                cat.y = groundY;
                cat.state = "rest";
                isPopUpAnimating.value = false;

                if (shouldAutoStart.value) {
                    startGame();
                    shouldAutoStart.value = false;
                }
            }
        }
    } else if (cat.isJumping) {
        if (cat.floatMode) {
            if (cat.floatCounter > 0) {
                cat.floatCounter--;
				setTimeout(async () => {
                	cat.state = "float";
				}, 90)
            } else {
                cat.floatMode = false;
                cat.velocityY = 1;
                cat.state = "landing";
            }
        } else {
            cat.y += cat.velocityY;
            cat.velocityY += cat.gravity;

            const maxY = groundY - cat.maxJumpHeight;
            if (cat.y <= maxY && cat.velocityY < 0) {
                cat.y = maxY;
                cat.floatMode = true;
                cat.floatCounter = cat.floatFrames;
            }
        }

        if (cat.y >= groundY) {
            cat.y = groundY;
            cat.velocityY = 0;
            cat.isJumping = false;
            cat.canJump = true;
            cat.state = "running";
        }
    }

    if (cat.state === "running") {
        cat.frameCounter++;
        if (cat.frameCounter >= RUN_ANIMATION_SPEED) {
            cat.frameCounter = 0;
            cat.frameIndex = (cat.frameIndex + 1) % catImages.run.length;
        }
    }
}

function drawCat(ctx) {
    let catImageToDraw = null;
    switch (cat.state) {
        case "rest":
            catImageToDraw = catImages.rest;
            break;
        case "running":
            catImageToDraw = catImages.run[cat.frameIndex];
            break;
        case "jumping":
            catImageToDraw = catImages.jump;
            break;
        case "float":
            catImageToDraw = catImages.float;
            break;
        case "landing":
            catImageToDraw = catImages.landing;
            break;
        case "hit":
            catImageToDraw = catImages.hit;
            break;
        case "popUp":
            catImageToDraw = catImages.rest;
            break;
    }

    if (catImageToDraw && catImageToDraw.complete) {
        ctx.drawImage(catImageToDraw, cat.x, cat.y, cat.width, cat.height);
    }
}

function drawObstacles(ctx) {
    obstacles.value.forEach((obs) => {
        if (obstacleImage.complete) {
            ctx.globalAlpha = obs.opacity; // Apply opacity
            ctx.drawImage(obstacleImage, obs.x, obs.y, obs.width, obs.height);
            ctx.globalAlpha = 1; // Reset opacity
        }
    });
}

onMounted(() => {
    const touchHandler = async (event) => {
        const targetElement = event.target;
        if (targetElement.classList.contains('pageIndex')) {
            event.preventDefault();
            handleGameInteraction();
        }
    };

    const spaceHandler = async (event) => {
        if (event.code === "Space") {
            handleGameInteraction();
        }
    };

    const handleGameInteraction = async () => {
            if (!lockPlay.value) {
                if (gameState.isOver) {
                    resetGame(true);
                } else if (!gameState.isRunning && !isPopUpAnimating.value) {
                    startGame();
                } else if (gameState.isRunning) {
                    jump();
                }
            }
        };

    // Add event listeners
    window.addEventListener('touchstart', touchHandler);
    window.addEventListener('keydown', spaceHandler);

    setTimeout(() => {
        animationId = requestAnimationFrame(update);
    }, 500); // Delayed initial load

    const images = [
        catImages.rest,
        ...catImages.run,
        catImages.jump,
        catImages.float,
        catImages.landing,
        catImages.hit,
        obstacleImage
    ];

    let imagesLoaded = 0;
    images.forEach((img) => {
        if (img.complete) {
            imagesLoaded++;
            if (imagesLoaded === images.length) {
                resetGame();
            }
        } else {
            img.onload = () => {
                imagesLoaded++;
                if (imagesLoaded === images.length) {
                    resetGame();
                }
            };
            img.onerror = () => {
                console.error(`Failed to load image: ${img.src}`);
            };
        }
    });
});

onUnmounted(() => {
    window.removeEventListener('touchstart', touchHandler);
    window.removeEventListener('keydown', spaceHandler);
});
</script>

<style lang="less">
.game-container {
    width: 100%;
    height: 150px;
    overflow: hidden;
    position: relative;

    canvas {
        display: block;
    }
}
</style>
