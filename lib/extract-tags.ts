/**
 * 标签提取工具函数
 * 从 AI 响应中解析实体并转换为标准化标签
 */

// 系统级标签配置
export const TAG_CONFIG = {
  MAX_TAGS: 8,
  MIN_TAGS: 3,
} as const;

/**
 * 标准化标签：转小写、去除多余空格、特殊字符处理
 */
export function normalizeTag(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // 多个空格替换为连字符
    .replace(/[^a-z0-9-]/g, ''); // 只保留字母、数字和连字符
}

/**
 * 从 AI 实体 JSON 中提取标签
 * 支持格式：["tag1", "tag2"] 或 [{name: "tag1", type: "keyword"}, ...]
 */
export function extractTagsFromEntities(entitiesJson: string | null): string[] {
  if (!entitiesJson) return [];

  try {
    const entities = JSON.parse(entitiesJson);
    
    // 如果是字符串数组
    if (Array.isArray(entities) && typeof entities[0] === 'string') {
      return entities.map(normalizeTag).filter(Boolean);
    }
    
    // 如果是对象数组（实体格式）
    if (Array.isArray(entities) && typeof entities[0] === 'object') {
      const tags = entities
        .map((entity: any) => {
          // 优先使用 name 字段，其次是 text，其次直接转字符串
          const rawTag = entity.name || entity.text || String(entity);
          return normalizeTag(rawTag);
        })
        .filter(Boolean);
      return tags;
    }
    
    return [];
  } catch (error) {
    console.error('Failed to parse entities JSON:', error);
    return [];
  }
}

/**
 * 去重并限制标签数量
 */
export function deduplicateAndLimitTags(tags: string[]): string[] {
  const uniqueTags = [...new Set(tags)]; // 去重
  
  // 限制最大数量
  return uniqueTags.slice(0, TAG_CONFIG.MAX_TAGS);
}

/**
 * 检查标签数量是否符合最小要求
 */
export function validateTagsCount(tags: string[]): boolean {
  return tags.length >= TAG_CONFIG.MIN_TAGS;
}

/**
 * 合并 AI 提取的标签和时间标签
 */
export function mergeTagsWithTimeTags(
  aiTags: string[],
  timeTags: string[]
): string[] {
  const allTags = [...aiTags, ...timeTags];
  return deduplicateAndLimitTags(allTags);
}

/**
 * 从 AI 响应中提取并处理标签
 * 完整流程：解析 -> 标准化 -> 去重 -> 数量限制 -> 合并时间标签
 */
export function processTagsFromAI(
  entitiesJson: string | null,
  timeTags: string[] = []
): string[] {
  const aiTags = extractTagsFromEntities(entitiesJson);
  const mergedTags = mergeTagsWithTimeTags(aiTags, timeTags);
  
  // 检查是否满足最小数量要求
  if (!validateTagsCount(mergedTags)) {
    console.warn(`Tag count (${mergedTags.length}) below minimum (${TAG_CONFIG.MIN_TAGS})`);
  }
  
  return mergedTags;
}
