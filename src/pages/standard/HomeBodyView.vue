<script setup lang="ts">
import { pagesConfig } from '~/config'
import { resolveRecentPosts } from '~/lib/content'
import SkillsMarquee from '~/components/home/SkillsMarquee.vue'
import RecentPosts from '~/components/home/RecentPosts.vue'

const home = pagesConfig.home
const recentPosts = resolveRecentPosts(home.recentPosts.count)
</script>

<template>
  <div>
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
