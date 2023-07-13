<script setup lang="ts">
import {PropType} from "@vue/runtime-core";
import {HeatColor} from "~/libs/HeatColor";

const props = defineProps({
  mapData: {
    type: Array as PropType<number[]>,
    required: true,
  },
  cols: {
    type: Number,
    default: 5,
  },
});

const mapDataMatrix = computed<number[][]>(() => closestSquareMatrix(props.mapData, props.cols));

function closestSquareMatrix(data: number[], cols?: number): number[][] {
  const length = data.length;
  const sideLength = cols ? cols : Math.ceil(Math.sqrt(length));
  const totalCells = sideLength ** 2;
  const paddedData = [...data, ...Array(totalCells - length).fill(0)];
  const matrix = [];
  for (let i = 0; i < totalCells; i += sideLength) {
    matrix.push(paddedData.slice(i, i + sideLength));
  }
  return matrix;
}

function getColor(normalizedValue: number) {
  return new HeatColor(normalizedValue).string();
}

const heatmapRef = ref<HTMLCanvasElement | null>(null);
onMounted(() => {
  const canvas = heatmapRef.value;
  const context = canvas?.getContext("2d");

  if (!context || !mapDataMatrix.value.length) {
    return;
  }

  // calculate size of each cell based on canvas size and matrix dimensions
  const cellWidth = canvas!.width / mapDataMatrix.value[0].length;
  const cellHeight = canvas!.height / mapDataMatrix.value.length;

  for (let rowIndex = 0; rowIndex < mapDataMatrix.value.length; rowIndex++) {
    const row = mapDataMatrix.value[rowIndex];
    for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
      const cell = row[cellIndex];
      const x = cellIndex * cellWidth; // calculate x position of cell
      const y = rowIndex * cellHeight; // calculate y position of cell
      const color = getColor(cell); // get color for current cell
      context.fillStyle = color;
      context.fillRect(x, y, cellWidth, cellHeight); // draw cell
    }
  }
});

</script>

<template>
  <div>
    <canvas ref="heatmapRef" id="heatmap-canvas" width="80" height="80"></canvas>
  </div>
</template>

<style lang="scss">

</style>
