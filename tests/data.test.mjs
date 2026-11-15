import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const data=JSON.parse(await readFile(new URL('../assets/content.json',import.meta.url)));
test('official tuition totals equal line items',()=>{for(const [level,rows] of Object.entries(data.tuition.levels)){assert.equal(rows.reduce((sum,row)=>sum+row.amount,0),data.tuition.officialTotals[level])}});
test('all four discounts are unchanged',()=>{assert.deepEqual(data.tuition.periods.map(x=>x.discount),[750000,500000,250000,0])});
test('monthly fees are represented once in initial totals',()=>{for(const rows of Object.values(data.tuition.levels))assert.ok(rows.filter(x=>x.recurring).length<=2)});
test('campus and contact records are complete',()=>{assert.equal(data.campuses.length,2);assert.equal(data.whatsapp,'6287888889199');data.campuses.forEach(x=>{assert.ok(x.name&&x.address&&x.map)})});
