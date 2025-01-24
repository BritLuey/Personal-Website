<script setup>
    import 'iconify-icon'

    const props = defineProps({
        name: { required: true },
        size: { type: [String], default: null },
        color: { default: 'currentColor' },
        class: { default: null }
    })

    const iconStyles = computed(() => {
        return {
            width: props.size || '1em',
            height: props.size || '1em',
            color: props.color
        }
    })
</script>

<template>
    <ClientOnly>
        <div class="iconContainer" :class="props.class" :style="iconStyles">
            <iconify-icon :icon="props.name" :width="iconStyles.width" :height="iconStyles.height" />
        </div>
    </ClientOnly>
</template>