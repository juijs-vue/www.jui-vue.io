<script setup lang="ts">
// @ts-nocheck
const style = document.createElement('style');
style.textContent = `
    .splitter-container {
        width: 500px;
        height: 500px;
        position: relative;
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
		width:500px;
		height:500px;
		position:relative;
		border:1px solid #ececec;
	}
</style>
<h3>Splitter for Horizontal</h3>
<div class="splitter-container">
	<Splitter direction="horizontal">
		<template #first>
			<h3>Top</h3>
		</template>
		<template #second>
			<h3>Bottom</h3>
		</template>
	</Splitter>
</div>
</template>
