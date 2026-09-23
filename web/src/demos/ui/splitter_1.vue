<script setup lang="ts">
// @ts-nocheck
const style = document.createElement('style');
style.textContent = `
    .splitter-container {
        width: 100%;
        position: relative;
        height: 150px;
        border: 1px solid #ececec;
    }
    .splitter {
        width: 100% !important;
        height: 100% !important;
        left: auto !important;
        top: auto !important;
        bottom: auto !important;
        background-color: transparent !important;
    }
`;
document.head.appendChild(style);
</script>

<template>
<style type="text/css">
	.splitter-container {
		width:100%;
		position:relative;
		height:150px;
		border:1px solid #ececec;
	}
</style>
<h3>Splitter for Vertical</h3>
<div class="splitter-container">
	<Splitter>
		<template #first>
			<h3>Left</h3>
		</template>
		<template #second>
			<h3>Right</h3>
		</template>
	</Splitter>
</div>
</template>
