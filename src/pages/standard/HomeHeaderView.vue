<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { pagesConfig } from '~/config'
import HeroSection from '~/components/home/HeroSection.vue'

const home = pagesConfig.home

useHead({
  title: home.title,
  meta: [{ name: 'description', content: home.description }],
})
</script>

<template>
  <HeroSection
    :title="home.title"
    :subtitle="home.description"
    :paragraphs="home.intro"
    :social="home.social"
  />
</template>
