/**
 * 合并所有批次结果文件为最终CSV。
 *
 * 扫描规则：
 * - batch_*_result.txt — 本次运行的批次结果
 * - results_*.txt       — 历史已有结果
 *
 * 用法：node merge_to_csv.js [输出文件名]
 * 默认输出：专家信息汇总.csv
 */

const fs = require('fs');
const path = require('path');

const outputFile = process.argv[2] || '专家信息汇总.csv';

/**
 * CSV 字段转义：含逗号、引号或换行的字段用双引号包裹。
 */
function csvEscape(s) {
  if (s == null) return '';
  s = String(s).trim();
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// 扫描当前目录下的所有结果文件
const files = fs.readdirSync('.');
const resultFiles = files.filter(f => {
  return (f.startsWith('batch_') && f.endsWith('_result.txt')) ||
         (f.startsWith('results_') && f.endsWith('.txt'));
});

if (resultFiles.length === 0) {
  console.error('未找到任何结果文件（batch_*_result.txt 或 results_*.txt）');
  process.exit(1);
}

console.log(`找到 ${resultFiles.length} 个结果文件：`);
resultFiles.forEach(f => console.log(`  - ${f}`));

// 读取所有结果并提取有效行
const allLines = [];
const seen = new Set();

for (const file of resultFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n').filter(l => {
    const trimmed = l.trim();
    if (!trimmed || !trimmed.includes('|')) return false;
    // 去重：以姓名为key
    const name = trimmed.split('|')[0].trim();
    if (seen.has(name)) return false;
    seen.add(name);
    return true;
  });
  allLines.push(...lines);
  console.log(`  ${file}: ${lines.length} 条有效记录`);
}

// 写入CSV（含BOM以支持Excel直接打开不乱码）
const header = '姓名,单位,研究方向,联系方式,信息来源网址';
const csvLines = [header];

for (const line of allLines) {
  const parts = line.split('|');
  if (parts.length >= 5) {
    csvLines.push(parts.slice(0, 5).map(csvEscape).join(','));
  } else {
    console.warn(`  跳过格式不正确的行: ${line.substring(0, 60)}...`);
  }
}

// BOM:
fs.writeFileSync(outputFile, '﻿' + csvLines.join('\n'), 'utf8');

console.log(`\n总计: ${csvLines.length - 1} 条记录`);
console.log(`已写入: ${outputFile}`);
