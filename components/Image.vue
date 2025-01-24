<script setup>
	import VLazyImage from "v-lazy-image";
	const props = defineProps(['src', 'description']);
</script>

<template>
	<v-lazy-image :src="props.src" :alt="props.description" :aria-label="`Image with description: ${props.description}`" />
</template>

<style lang="less">
	.v-lazy-image {
		opacity: 0;
        width: 160px;
		height: 160px;
        object-fit:cover;
        object-position:top;
        border-radius:9999px;
	}

	.v-lazy-image-loaded {
		animation: fadeInImage 250ms ease forwards;
	}

	@keyframes fadeInImage {
		0% { opacity: 0; }
		100% { opacity: 1; }
	}
</style>