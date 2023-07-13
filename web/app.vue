<template>
  <ClientOnly>
    <div class='container'>
      <h1 class='my-3 text-white'>
        LLM Generational Guts
        <div v-if='loading' class='spinner-grow text-light' role='status'>
          <span class='visually-hidden'>Loading...</span>
        </div>
      </h1>

      <div class='p-3 bg-white rounded-3 shadow'>
        <div class='form-floating mb-3'>
          <input
            id='promptInput'
            ref='inputRef'
            type='text'
            class='form-control form-control-lg'
            placeholder='Enter your text here...'
            aria-label='Enter your text here...'
            aria-describedby='button-addon2'
            autofocus
            v-model='manualToken'
            @keyup.enter='selectManual'
          >
          <label for='promptInput'>Your prompt</label>
        </div>

        <div>
          <div class='row mb-3'>
            <div class='col-9'>
              <button
                class='btn btn-primary btn-lg w-100'
                type='button'
                @click='buttonAction'
                :disabled='!autoNext &&(loading || (!generations.length && !manualToken.length))'
              >
                {{ buttonLabel }}
              </button>
            </div>
            <div class='col'>
              <button
                class='btn btn-danger btn-lg w-100'
                type='button'
                @click='reset'
              >
                <i class='bi bi-arrow-counterclockwise'></i> Reset
              </button>
            </div>
          </div>
          <div class='mb-3'>
            <div class='form-check form-switch g-col-2'>
              <input class='form-check-input' v-model='autoNext' type='checkbox' role='switch'
                     :disabled='!generations.length'>
              <label class='form-check-label' for='flexSwitchCheckDefault'>Auto Next</label>
            </div>
          </div>
        </div>

        <div class='row'>
          <div class='col-8'>
            <div id='output-card' class='card mb-3 bg-my-dark text-white'>
              <div class='card-body'>
                <h5 class='card-title'>Output</h5>
                <p ref='outputRef' class='card-text output' :class="{'terminal-text':loading}"
                   v-html="prompt.replace(/\\n/g,'<br\>')" />
              </div>
            </div>
          </div>
          <div class='col'>
            <div id='nex-tokens-card' class='card mb-3 bg-my-dark text-white'>
              <div class='card-body'>
                <h5 class='card-title'>Next Tokens Probability</h5>
                <NoContents v-if='!generations.length' message='No Tokens Predictions' />
                <table v-else class='table table-sm table-dark spa'>
                  <tr v-for='(token, index) in generations' :key="'gen-' + index">
                    <td style='width: 120px'>{{ token.token }}</td>
                    <td><span class='badge rounded-pill bg-info'>{{ (token.logit * 100).toFixed(2) }}%</span></td>
                    <td>
                      <button class='btn btn-light btn-outline-light btn-sm mx-2' @click='select(token.token)'
                              :disabled='autoNext'>
                        Select
                      </button>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class='card mb-3 bg-my-dark text-white shadow-right'>
          <div class='card-body'>
            <h5 class='card-title'>Token Stack</h5>
            <NoContents v-if='!tokenStack.length' message='Token Stack is still under construction 🚧' />
            <div v-else ref='tokenStackContainer' class='token-stack'>
              <table class='table table-borderless table-sm text-white'>
                <tr>
                  <th>Token</th>
                  <td class='text-center' v-for='(token, index) in reverseTokenStack' :key="'token-' + index">
                    <p class='border rounded mx-2'>
                      {{ token.token }}
                    </p>
                  </td>
                </tr>
                <tr>
                  <th>Pos. Embedding</th>
                  <td v-for='(token, index) in reverseTokenStack' :key="'pos-' + index">
                    <heat-map v-if='token.positionalEmbedding' :map-data='token.positionalEmbedding' />
                  </td>
                </tr>
                <tr>
                  <th class='text-center'></th>
                  <td class='text-center' v-for='(token, index) in tokenStack' :key="'token-' + index">
                    <h4><i class='bi bi-plus'></i></h4></td>
                </tr>
                <tr>
                  <th>Token Embedding</th>
                  <td v-for='(token, index) in reverseTokenStack' :key="'embed-' + index">
                    <heat-map v-if='token.tokenEmbedding' :map-data='token.tokenEmbedding' />
                  </td>
                </tr>
                <tr>
                  <th>Transformer</th>
                  <td class='text-center' v-for='(token, index) in tokenStack' :key="'token-' + index">
                    <h4><i class='bi bi-arrow-down'></i></h4></td>
                </tr>
                <tr id='hidden-state-row'>
                  <th>Hidden State</th>
                  <td v-for='(token, index) in reverseTokenStack' :key="'state-' + index">
                    <heat-map v-if='token.hiddenState' :map-data='token.hiddenState' />
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang='ts'>
import { debounce } from 'lodash-es';
import queue from 'queue';
import NoContents from '~/components/NoContents.vue';

const autoNext = ref(false);
const prompt = ref('');
const manualToken = ref<string>('');
const tokenStack = ref([]);
const generations = ref<any[]>([]);
const inputRef = ref<HTMLElement | null>(null);
const tokenStackContainer = ref<HTMLElement | null>(null);
const loading = ref(false);
const outputRef = ref<HTMLElement | null>(null);

const oldPrompt = ref('');


const buttonLabel = computed(() => {
  if (autoNext.value) {
    return 'Stop';
  } else if (generations.value.length && !manualToken.value.length) {
    return 'Next';
  } else if (!generations.value.length) {
    return 'Start';
  } else {
    return 'Select';
  }
});

const reverseTokenStack = computed(() => {
  return tokenStack.value.slice().reverse();
});

const buttonAction = computed(() => {
  if (autoNext.value) {
    return () => autoNext.value = false;
  } else if (generations.value.length) {
    return selectNextToken;
  } else if (manualToken.value.length) {
    return selectManual;
  } else {
    return () => alert('Nothing to do');
  }
});

function reset() {
  if (q) q.end();
  autoNext.value = false;
  prompt.value = '';
  generations.value = [];
  tokenStack.value = [];
  manualToken.value = '';
  oldPrompt.value = '';
  inputRef.value?.focus();
}

const generateNextToken = async () => {
  if (!prompt.value || prompt.value == oldPrompt.value || loading.value) return;
  loading.value = true;

  try {
    oldPrompt.value = prompt.value;
    // remove double spaces
    prompt.value = prompt.value.replace(/\s+/g, ' ');

    const response = await fetch('/api/generational_guts', {
      method: 'POST',
      body: JSON.stringify({ prompt: prompt.value, 'response_type': 'json' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    const { generational_guts: guts } = data;


    tokenStack.value = guts.tokens.map((token: any) => ({
      ...token,
      positionalEmbedding: normalize(token.positionalEmbedding),
      tokenEmbedding: normalize(token.tokenEmbedding),
      hiddenState: normalize(token.hiddenState),
    }));

    generations.value = guts.generations.slice(0, 5);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}; // Set to debounce wait time to 500ms (or adjust as needed)


const q = queue({
  concurrency: 1,
  autostart: true,
  results: [],
});

async function nextTokenJob(cb: any) {
  prompt.value += generations.value?.[0]?.token;
  await generateNextToken();
  await new Promise((resolve) => setTimeout(() => resolve(true), 100));
  cb?.(null, true);
}

q.on('success', (result, job) => {
  if (autoNext.value) {
    q.push(nextTokenJob);
  } else {
    q.end();
  }
});

watch(autoNext, (value) => {
  if (value) {
    q.push(nextTokenJob);
  } else {
    q.end();
  }
});

function select(token: string) {
  prompt.value += token;
  generateNextToken();
}

function selectNextToken() {
  const nextToken = generations.value?.[0]?.token;
  if (nextToken) {
    select(nextToken);
  }
}

function selectManual() {
  if (manualToken.value) {
    select(manualToken.value);
    manualToken.value = '';
  }
}

function normalize(data: number[]): number[] {
  // Find the minimum and maximum values from the data
  const min = Math.min(...data);
  const max = Math.max(...data);

  // Calculate the range of values
  const range = max - min;

  // Normalize the data
  const normalizedData = data.map((value) => (value - min) / range);

  return normalizedData;
}

watch(prompt, () => {
  setTimeout(() => {
    //tokenStackContainer.value?.scrollTo({
    //  left: tokenStackContainer.value?.scrollWidth,
    //  behavior: 'smooth',
    //});
    outputRef.value?.scrollTo({
      top: outputRef.value?.scrollHeight,
      behavior: 'smooth',
    });
  }, 20);
});

</script>

<style lang='scss'>

td {
  overflow-wrap: anywhere;
}

.table {
  width: initial;
}

button {
  font-size: 16px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #cccccc;
}

.form-control {
  &:focus {
    box-shadow: none;
  }
}

.token-stack {
  width: 100%;
  overflow-x: auto;
  scroll-behavior: smooth;
}

.shadow-right {
  position: relative;

  &::after {
    content: '';
    position: absolute;
    display: block;
    width: 10%;
    height: 100%;
    top: 0;
    right: 0;
    z-index: 2;
    background: linear-gradient(to left, var(--my-bg-color), transparent);
  }
}


#output-card {
  height: 245px;

  .output {
    max-height: 175px;
    overflow-y: auto;
    font-family: Consolas, monaco, monospace;
  }
}

#nex-tokens-card {
  height: 245px;
}

#hidden-state-row {
  // last td in the row
  td:first-of-type {
    position: relative;

    &::after {
      position: absolute;
      content: '';
      display: block;
      width: 110%;
      height: 110%;
      top: -6%;
      left: -6%;
      border: #ffffff 3px solid;
      border-radius: 12px;
    }
  }
}

.terminal-text::after {
  content: '';
  display: inline-block;
  width: 6px;
  height: 1.1em;
  line-height: 1.3em;
  margin-left: 5px;
  background-color: #ffffff;
  animation: caret 1s infinite;
}

@keyframes caret {
  50% {
    opacity: 0;
  }
}
</style>
