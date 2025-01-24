<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// =============================
// Reactive Data
// =============================
const gameData = ref({
    isGameRunning: false,
    isGameOver: false,
    score: 0,
    finalScore: 0,
    backgroundSpeed: 2, // Default speed of background
});

const isTouchEnabled = computed(() => {
    return (
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 || 
        navigator.msMaxTouchPoints > 0
    )
})

// =============================
// References and Variables
// =============================
const canvasRef = ref(null);
let ctx = null;
let backgroundX = 0;
let animationFrameId = null;

// =============================
// Canvas Utility Functions
// =============================

/**
 * Resizes the canvas to match the viewport dimensions.
 */
const resizeCanvas = () => {
    const canvas = canvasRef.value;
    if (canvas) {
        canvas.width = window.innerWidth; // Set canvas width to viewport width
        canvas.height = window.innerHeight; // Set canvas height to viewport height
    }
};

/**
 * Draws the moving background on the canvas.
 */
const drawBackground = () => {
    if (!ctx) return;

    const canvas = canvasRef.value;
    const img = new Image();
    img.src = "art/background.svg"; // Background image source

    img.onload = () => {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the current and next background images for seamless looping
        ctx.drawImage(img, backgroundX, 0, canvas.width, canvas.height);
        ctx.drawImage(img, backgroundX + canvas.width, 0, canvas.width, canvas.height);

        // Update background position based on game state
        const speed = gameData.value.isGameRunning
            ? gameData.value.backgroundSpeed / 1.25
            : 0.5;
        backgroundX -= speed;

        // Reset background position for looping
        if (backgroundX <= -canvas.width) {
            backgroundX = 0;
        }

        // Continue the animation loop
        animationFrameId = requestAnimationFrame(drawBackground);
    };
};

// =============================
// Lifecycle Hooks
// =============================
onMounted(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const canvas = canvasRef.value;
    if (canvas) {
        ctx = canvas.getContext("2d");
        drawBackground();
    }
});

onUnmounted(() => {
    window.removeEventListener("resize", resizeCanvas);
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
});
</script>

<template>
    <div class="pageIndex">
        <div class="pageContainer">
            <!-- Canvas for the Moving Background -->
            <canvas
                ref="canvasRef"
                class="background-canvas"
                style="position: fixed; top: 0; left: 0; z-index: -1;"
            ></canvas>

            <!-- Game Component -->
            <ClientOnly>
                <SpeedRunner
                    v-model:isGameRunning="gameData.isGameRunning"
                    v-model:isGameOver="gameData.isGameOver"
                    v-model:score="gameData.score"
                    v-model:finalScore="gameData.finalScore"
                    v-model:backgroundSpeed="gameData.backgroundSpeed"
                />
            </ClientOnly>

            <!-- UI Elements -->
            <div class="card">
                <div class="header">
                    <Image
                        src="/profilePicture.jpg"
                        alt="Louis hiking in Tennessee (2023)"
                        class="profile-image"
                    />
                    <div class="content">
                        <Weather />
                        <div class="titles">
                            <h1>Hello, I'm Louis Rozier!</h1>
                            <TextRotator />
                        </div>
                        <div class="buttons">
                            <IconButton
                                label="GitHub"
                                icon="mdi:github"
                                to="https://github.com/BritLuey"
                            />
                            <IconButton
                                label="LinkedIn"
                                icon="mdi:linkedin"
                                to="https://www.linkedin.com/in/louis-rozier-41242933b/"
                            />
                            <Button
                                target="_blank"
                                label="Resume"
                                icon="mdi:file-pdf"
                                to="/Louis-Rozier-Resume.pdf"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Game Messages -->
            <div class="messages">
                <Transition name="fade" mode="out-in">
                    <div class="message" v-if="gameData.isGameRunning">
                        Current Score: {{ gameData.score }} points
                    </div>
                    <div class="message" v-else-if="!gameData.isGameRunning && !gameData.isGameOver">
                        <template v-if="!isTouchEnabled">
                            Press <span>Space</span> to Play
                        </template>
                        <template v-else>
                            Tap the background to Play
                        </template>
                    </div>
                    <div class="message" v-else>
                        Game over, your score was {{ gameData.finalScore }} points
                    </div>
                </Transition>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            2025 ©, Designed and Engineered by Louis Rozier
        </div>
    </div>
</template>

<style lang="less" scoped>
.pageIndex {
    width: 100%;
    height: 100%;
    position: relative;

    .pageContainer {
        width: 100%;
        margin: auto;
        display: flex;
        max-width: 800px;
        position: relative;
        flex-direction: column;

        .background-canvas {
            top: 0;
            left: 0;
            z-index: -1;
            position: fixed;
        }

        .card {
            padding: 50px;
            border-radius: 15px;
            background: var(--surface);

            // Adjust for small screens
            @media (max-width: 800px) { 
                padding:25px;
                border-radius: 0px;
            }

            @media (max-width: 500px) { 
                padding: 15px;
            }

            .header {
                gap: 50px;
                width:100%;
                display: flex;
                align-items: flex-end;

                // Adjust for small screens
                @media (max-width: 800px) { 
                    gap:25px;
                    align-items: center;
                    flex-direction:column;
                }

                @media (max-width: 500px) { 
                    scale: 0.80;
                }

                .content {
                    gap: 8px;
                    width: 100%;
                    display: flex;
                    flex-direction: column;

                    // Adjust for small screens
                    @media (max-width: 800px) { 
                        text-align: center;
                        align-items: center;
                        justify-content: center;
                    }

                    .titles {
                        gap: 5px;
                        display: flex;
                        flex-direction: column;

                        h1 {
                            font-size: 28px;
                            line-height: 1.3;
                            font-weight: 800;
                            text-wrap: balance;
                            color: var(--heading-color);
                        }

                        h2 {
                            font-size: 15px;
                            line-height: 1.3;
                            font-weight: 600;
                            text-wrap: balance;
                            color: var(--sub-heading-color);
                        }
                    }

                    .buttons {
                        gap: 7px;
                        width: 100%;
                        display: flex;
                        margin-top: 5px;
                        flex-direction: row;

                        @media (max-width: 800px) { 
                            justify-content: center;
                        }
                    }
                }
            }
        }

        /* Game Messages */
        .messages {
            display: flex;
            margin-top: 15px;
            align-items: center;
            justify-content: center;

            .message {
                display: block;
                font-size: 13px;
                font-weight: 600;

                span {
                    padding: 4px 7px;
                    font-weight: 700;
                    border-radius: 3px;
                    background: #161a1d;
                }
            }
        }
    }

    /* Footer Styling */
    .footer {
        right: 0;
        bottom: 0;
        font-size: 12px;
        font-weight: 500;
        position: absolute;
        letter-spacing: 0.06em;
        color: var(--sub-heading-color);

        @media (max-width: 800px) { 
            display: none;
        }
    }
}

/* Transition Effects */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 200ms ease;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>
