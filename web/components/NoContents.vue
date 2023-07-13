<script setup lang='ts'>
defineProps({
  message: {
    type: String,
    default: 'No content available',
  },
});
</script>
<template>
  <div class='container'>
    <div class='row'>
      <div class='col-md-12'>
        <div class='text-center'>
          <i class='bi bi-inboxes text-warning opacity-50' style='font-size: 4rem;'></i>
          <h4 class='mt-3'>{{ message }}</h4>
        </div>
      </div>
    </div>
  </div>
</template>
