<template>
	<div class="app">
		<NuxtPage />
	</div>
</template>

<style lang="less" scoped>
	.app {
		width: 100%;
		height: 100vh;
		padding: 20px;
		@media (max-width: 800px) { padding: 0; }
		position: relative; // Purpose: Used to place absolute footer on Index
	}
</style>