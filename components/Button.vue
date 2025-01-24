<script setup>
    const props = defineProps(['label', 'to', 'icon', 'target']);
</script>

<template>
    <NuxtLink class="compButton" :aria-label="props.label" :to="props.to" :target="(props.target ? props.target : null)">
        <Icon v-if="props.icon" size="24px" :name="props.icon" :aria-label="`${props.label} icon`" />
        <div v-if="props.label" class="label">{{ props.label }}</div>
    </NuxtLink>
</template>

<style lang="less">
    .compButton {
        gap: 12px;
        height: 40px;
        display: flex;
        flex-shrink: 0;
        cursor: pointer;
        overflow: hidden;
        padding: 0px 14px;
        width: fit-content;
        align-items: center;
        border-radius: 9999px;
        color: var(--button-text);
        padding: 0px 17px 0px 13px;
        transition: all 250ms ease;
        background: var(--button-background);

        .label {
            margin-top: 1px;
            font-weight: 700;
            font-size: 14.5px;
        }

        &:hover {
            background: var(--button-background-hover);
        }
    }
</style>