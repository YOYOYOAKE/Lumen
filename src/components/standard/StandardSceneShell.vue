<script setup lang="ts">
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { standardContentTransitionProps } from '~/lib/transitions'

defineProps<{ route: RouteLocationNormalizedLoaded }>()
</script>

<template>
  <div class="relative z-[1]">
    <transition v-bind="standardContentTransitionProps">
      <section :key="route.path" class="standard-content-pane">
        <div class="standard-scene-header">
          <router-view name="header" :route="route" />
        </div>
        <div class="standard-scene-body">
          <router-view name="body" :route="route" />
        </div>
      </section>
    </transition>
  </div>
</template>
