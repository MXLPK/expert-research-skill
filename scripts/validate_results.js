/**
 * 统计汇总CSV的质量指标。
 *
 * 用法：node validate_results.js <CSV文件路径>
 * 示例：node validate_results.js 专家信息汇总.csv
 */

const fs = require('fs');

const csvFile = process.argv[2];

if (!csvFile) {
  console.error('用法：node validate_results.js <CSV文件路径>');
  console.error('示例：node validate_results.js 专家信息汇总.csv');
  process.exit(1);
}

if (!fs.existsSync(csvFile)) {
  console.error(`文件不存在: ${csvFile}`);
  process.exit(1);
}

const content = fs.readFileSync(csvFile, 'utf8');
// 处理BOM
const cleanContent = content.startsWith('﻿') ? content.slice(1) : content;
const lines = cleanContent.trim().split('\n');

if (lines.length < 2) {
  console.error('CSV文件为空或仅含表头');
  process.exit(1);
}

// 跳过表头
const dataLines = lines.slice(1);
const total = dataLines.length;

let unfoundUnit = 0;      // 第2列（单位）含"未找到"
let unfoundContact = 0;    // 第4列（联系方式）含"未找到"
let completelyUnfound = 0; // 所有信息列都含"未找到"

// 简单CSV解析（处理引号包裹的字段）
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (const ch of line) {
    if (inQuotes) {
      if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

for (const line of dataLines) {
  const cols = parseCSVLine(line);
  // 列索引：0=姓名, 1=单位, 2=研究方向, 3=联系方式, 4=信息来源网址
  const unit = (cols[1] || '').trim();
  const research = (cols[2] || '').trim();
  const contact = (cols[3] || '').trim();
  const source = (cols[4] || '').trim();

  if (unit.includes('未找到')) unfoundUnit++;
  if (contact.includes('未找到')) unfoundContact++;

  // 完全未找到：单位、研究方向、联系方式、来源网址都含"未找到"
  if (unit.includes('未找到') && research.includes('未找到') &&
      contact.includes('未找到') && source.includes('未找到')) {
    completelyUnfound++;
  }
}

const foundUnitRate = ((total - unfoundUnit) / total * 100).toFixed(1);
const foundContactRate = ((total - unfoundContact) / total * 100).toFixed(1);
const completelyUnfoundRate = (completelyUnfound / total * 100).toFixed(1);

console.log(`文件: ${csvFile}`);
console.log(`Total rows: ${total}`);
console.log(`---`);
console.log(`未找到单位: ${unfoundUnit} (${(unfoundUnit/total*100).toFixed(1)}%)`);
console.log(`未找到联系方式: ${unfoundContact} (${(unfoundContact/total*100).toFixed(1)}%)`);
console.log(`完全未找到: ${completelyUnfound} (${completelyUnfoundRate}%)`);
console.log(`---`);
console.log(`找到单位率: ${foundUnitRate}%`);
console.log(`找到联系方式率: ${foundContactRate}%`);

// 质量标准检查
console.log(`---`);
if (parseFloat(foundUnitRate) >= 95) {
  console.log('✅ 找到单位率 达标 (≥95%)');
} else {
  console.log('⚠️  找到单位率 未达标 (<95%)');
}
if (parseFloat(foundContactRate) >= 75) {
  console.log('✅ 找到联系方式率 达标 (≥75%)');
} else {
  console.log('⚠️  找到联系方式率 未达标 (<75%)');
}
if (completelyUnfound / total <= 0.05) {
  console.log('✅ 完全未找到率 达标 (≤5%)');
} else {
  console.log('⚠️  完全未找到率 未达标 (>5%)');
}
