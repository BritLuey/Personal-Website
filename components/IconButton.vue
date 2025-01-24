<script setup>
const props = defineProps(['label', 'to', 'icon']);
</script>

<template>
    <NuxtLink class="compIconButton" :aria-label="props.label" :to="props.to" target="_blank">
        <Icon v-if="props.icon" size="24px" :name="props.icon" :aria-label="`${props.label} icon`" />
    </NuxtLink>
</template>

<style lang="less">
    .compIconButton {
        width: 40px;
        height: 40px;
        display: flex;
        flex-shrink: 0;
        cursor: pointer;
        overflow: hidden;
        align-items: center;
        border-radius: 9999px;
        justify-content:center;
        color: var(--button-text);
        transition: all 250ms ease;
        background: var(--button-background);

        &:hover {
            background: var(--button-background-hover);
        }
    }
</style>