import sourcemap from 'source-map';
import fs from 'fs';
import { LRUCache } from 'lru-cache'


const cache = new LRUCache<string, sourcemap.SourceMapConsumer>({
  max: 50,
  dispose(comsumer) {
    comsumer.destroy();
  }
})

export interface IPosition { lines: [number, string][], originalPosition?: sourcemap.NullableMappedPosition }
export async function getOriginalPosition(input: {
  sourceMapPath: string;
  line: number;
  column: number;
}): Promise<IPosition> {
  const { sourceMapPath, line, column } = input;
  let consumer: sourcemap.SourceMapConsumer;
  if (cache.has(sourceMapPath)) {
    consumer = cache.get(sourceMapPath)!;
  } else {
    const rawSourceMap = fs.readFileSync(sourceMapPath, 'utf8');
    consumer = await new sourcemap.SourceMapConsumer(rawSourceMap);
    cache.set(sourceMapPath, consumer);
  }

  const originalPosition = consumer.originalPositionFor({
    line,
    column,
  });

  if (!originalPosition.source || !originalPosition.column || !originalPosition.line) {
    return {
      lines: []
    }
  }

  const sourceContent = consumer.sourceContentFor(originalPosition.source) || '';
  const sourceLines = sourceContent.split('\n');
  const startLine = Math.max(0, originalPosition.line - 6);
  const endLine = Math.min(sourceLines.length, originalPosition.line + 5);
  const lines: [number, string][] = [];
  for (let i = startLine; i < endLine; i++) {
    lines.push([i + 1, sourceLines[i]])
  }

  return {
    lines,
    originalPosition
  }
}
