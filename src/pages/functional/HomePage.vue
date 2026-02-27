<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { pagesConfig } from '~/config'
import { getRecentPosts } from '~/lib/content'
import HeroSection from '~/components/home/HeroSection.vue'
import SkillsMarquee from '~/components/home/SkillsMarquee.vue'
import RecentPosts from '~/components/home/RecentPosts.vue'

const home = pagesConfig.home

const recentPosts = getRecentPosts(home.recentPosts.count)

useHead({
  title: home.title,
  meta: [{ name: 'description', content: home.description }],
})
</script>

<template>
  <div class="relative z-[1]">
    <HeroSection
      :title="home.title"
      :subtitle="home.description"
      :paragraphs="home.intro"
      :social="home.social"
    />
    <SkillsMarquee
      v-if="home.skills.enabled && home.skills.rows.length > 0"
      :config="home.skills"
    />
    <RecentPosts
      v-if="home.recentPosts.enabled"
      :title="home.recentPosts.title"
      :subtitle="home.recentPosts.description"
      :posts="recentPosts"
    />
  </div>
</template>
