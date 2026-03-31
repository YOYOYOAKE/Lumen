<script setup lang="ts">
import type { TocNavSection } from './types'
import TocLevelOne from './TocLevelOne.vue'

const props = defineProps<{
  sections: TocNavSection[]
  activeId: string | null
}>()
</script>

<template>
  <TocLevelOne
    v-for="section in props.sections"
    :key="section.levelOne.id"
    :item="section.levelOne"
    :level-two-items="section.levelTwoItems"
    :active-id="props.activeId"
  />
</template>
