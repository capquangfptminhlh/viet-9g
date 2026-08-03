import fs from 'node:fs';
import path from 'node:path';
import { createTopicMediaAsset, type TopicMediaAsset, type TopicMediaInput } from '../packages/content-engine/topic-media';

type Topic = TopicMediaInput & { status?: string };
type MediaManifestEntry = Omit<TopicMediaAsset, 'svg'>;
type MediaManifest = { schemaVersion: '1.0.0'; generatedAt: string; assets: MediaManifestEntry[] };

const root = process.cwd();
const topicsPath = path.join(root, 'config', 'topics.json');
const projectPath = path.join(root, 'config', 'project.json');
const manifestPath = path.join(root, 'state', 'media-manifest.json');

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '')) as T;
}

function publicDomain(): string {
  const project = readJson<{ domain?: string }>(projectPath);
  if (!project.domain) throw new Error('config/project.json must include an HTTPS domain for media.');
  return project.domain;
}

const topics = readJson<Topic[]>(topicsPath).filter((topic) => topic.status === 'QUEUE');
if (!topics.length) throw new Error('No QUEUE topics are available for media generation.');

const now = new Date();
const assets = topics.map((topic) => createTopicMediaAsset(topic, publicDomain(), now));
for (const asset of assets) {
  const outputPath = path.join(root, 'public', asset.relativePath.slice(1));
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, asset.svg, 'utf8');
}

const manifest: MediaManifest = {
  schemaVersion: '1.0.0',
  generatedAt: now.toISOString(),
  assets: assets.map(({ svg: _svg, ...asset }) => asset).sort((left, right) => left.topicId.localeCompare(right.topicId)),
};
fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Generated ${assets.length} topic-specific media assets and ${path.relative(root, manifestPath)}.`);
