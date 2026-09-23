<script setup lang="ts">
import { usePlayUiMenu } from "../composables/usePlayUiMenu"

const props = defineProps<{ code: string }>()
const { groups, activeGroupType } = usePlayUiMenu(() => props.code)

const base = import.meta.env.BASE_URL
</script>

<template>
    <div class="vmenu rect">
        <template v-for="g in groups" :key="g.type">
            <a :data-type="g.type" :class="{ active: g.type === activeGroupType }">{{ g.title }}</a>
            <ul class="submenu">
                <li v-for="item in g.list" :key="item.code" :class="{ active: item.code === code }">
                    <a :href="`${base}play/ui/?p=${item.code}`">{{ item.title }}</a>
                </li>
            </ul>
        </template>
    </div>
</template>
