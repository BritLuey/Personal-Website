<template>
    <div class="text-rotator">
        <h2 class="text">{{ displayedText }}</h2>
    </div>
</template>

<script setup>
    import { gsap } from 'gsap'

    // Define the texts to rotate
    const firstText = 'Leader, Problem-Solver, Innovator, Software Engineer'
    const secondText = 'Owner of one rambunctious tuxedo cat named Cola'

    // Reactive state to track the current text
    const currentText = ref(true)

    // Computed property to display the correct text
    const displayedText = computed(() => (currentText.value ? firstText : secondText))

    // Function to toggle the text with GSAP animation
    const toggleText = () => {
        currentText.value = !currentText.value
        nextTick(() => {
            const textElement = document.querySelector('.text')
            gsap.fromTo(
                textElement,
                { rotationX: 90, opacity: 0 },
                { rotationX: 0, opacity: 1, duration: 1 }
            )
        })
    }

    let timer
    onMounted(() => {
        timer = setInterval(toggleText, 5000)
    })

    onUnmounted(() => {
        clearInterval(timer)
    })
</script>

<style scoped>
    .text-rotator {
        width: 100%;
        overflow: hidden;
        perspective: 1000px;
    }

    h2 {
        height:22px;
        display: block;
        font-size: 15px;
        line-height: 22px;
        font-weight: 600;
        backface-visibility: hidden;
        transform-style: preserve-3d;
        color: var(--sub-heading-color);
    }

</style>
