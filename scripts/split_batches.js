/**
 * 将专家名单文件切分为指定大小的批次文件。
 *
 * 用法：node split_batches.js <输入文件> [批次大小]
 * 默认批次大小：30
 */

const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2];
const batchSize = parseInt(process.argv[3], 10) || 30;

if (!inputFile) {
  console.error('用法：node split_batches.js <输入文件> [批次大小]');
  console.error('示例：node split_batches.js names_complete.txt 30');
  process.exit(1);
}

const content = fs.readFileSync(inputFile, 'utf8');
const names = content
  .trim()
  .split('\n')
  .map(n => n.trim())
  .filter(n => n.length > 0);

const batches = [];
for (let i = 0; i < names.length; i += batchSize) {
  batches.push(names.slice(i, i + batchSize));
}

batches.forEach((batch, idx) => {
  const num = String(idx + 1).padStart(2, '0');
  const filename = `research_batch_${num}.txt`;
  fs.writeFileSync(filename, batch.join('\n'), 'utf8');
  console.log(`Created ${filename} (${batch.length} names)`);
});

console.log(`\nTotal names: ${names.length}`);
console.log(`Total batches: ${batches.length}`);
console.log(`Batch size: ${batchSize}`);
