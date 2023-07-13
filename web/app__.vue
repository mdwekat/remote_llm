<script setup lang="ts">
import axios from 'axios';

const inputText = ref('');
const processedTokens = ref([]);

async function processText() {
  const payload = {
    prompt: inputText.value,
    response_type: 'json',
  };
  const response = await axios.post('/api/generational_guts', payload);
  processedTokens.value = response.data.generational_guts.generations.map((generation, generationIndex) => {
    const tokens = generation.tokens.map((token, tokenIndex) => {
      const isFinalToken = generationIndex === response.data.generational_guts.generations.length - 1 && tokenIndex === generation.tokens.length - 1;
      let topTokens = [];
      if (isFinalToken) {
        topTokens = token.topTokens;
      }
      return {
        tokenId: token.tokenId,
        token: token.token,
        documentation: token.documentation,
        hiddenStates: token.hiddenStates,
        isFinalToken,
        topTokens,
      };
    });
    return {
      tokens,
    };
  });
}
</script>
<template>
  <div>
    <div>
      <label for="text-input">Enter your text:</label>
      <input id="text-input" v-model="inputText"/>
      <button @click="processText">Next</button>
    </div>
    <div v-if="processedTokens.length">
      <div v-for="token in processedTokens" :key="token.tokenId">
        <h3>{{ token.token }}</h3>
        <p>{{ token.documentation }}</p>
        <table v-if="token.isFinalToken">
          <thead>
          <tr>
            <th>Token</th>
            <th>Token ID</th>
            <th>Logit</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(topToken, index) in token.topTokens" :key="index">
            <td>{{ topToken.token }}</td>
            <td>{{ topToken.tokenId }}</td>
            <td>{{ topToken.logit }}</td>
          </tr>
          </tbody>
        </table>
        <div v-else>
          <p>Hidden state:</p>
          <ul>
            <li v-for="hiddenState in token.hiddenStates" :key="hiddenState">{{ hiddenState }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
