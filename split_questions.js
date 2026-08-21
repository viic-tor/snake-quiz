import fs from 'fs';
import { ALL_QUESTIONS } from './src/data/questions.js';

const chunkSize = Math.ceil(ALL_QUESTIONS.length / 4);
for (let i = 0; i < 4; i++) {
  const chunk = ALL_QUESTIONS.slice(i * chunkSize, (i + 1) * chunkSize);
  fs.writeFileSync(`./temp_chunks/questions_chunk_${i}.json`, JSON.stringify(chunk, null, 2));
}
console.log(`Split ${ALL_QUESTIONS.length} questions into 4 chunks.`);
