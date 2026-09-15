export const createDescriptionBlockKey = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const normalizeDescriptionBlocks = (blocks = []) => blocks.reduce((result, block) => {
  if (block && block.type === "text") {
    result.push({ type: "text", content: String(block.content || ""), key: createDescriptionBlockKey() });
  } else if (block && block.type === "image" && (block.url || block.fileId)) {
    result.push({ type: "image", url: block.url || block.fileId, key: createDescriptionBlockKey() });
  }
  return result;
}, []);

const decodeHtmlEntities = (value) => {
  const entities = { "&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": "\"", "&#39;": "'" };
  return value
    .replace(/&(nbsp|amp|lt|gt|quot|#39);/gi, (entity) => entities[entity.toLowerCase()] || entity)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
};

const htmlFragmentToText = (fragment) => decodeHtmlEntities(
  fragment
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p\s*>/gi, "\n\n")
    .replace(/<\/div\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
).replace(/\n{3,}/g, "\n\n").trim();

export const legacyHtmlToDescriptionBlocks = (html) => {
  if (!html) return [];
  const blocks = [];
  const imagePattern = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let cursor = 0;
  let match;
  while ((match = imagePattern.exec(html))) {
    const text = htmlFragmentToText(html.slice(cursor, match.index));
    if (text) blocks.push({ type: "text", content: text, key: createDescriptionBlockKey() });
    blocks.push({ type: "image", url: match[1], key: createDescriptionBlockKey() });
    cursor = imagePattern.lastIndex;
  }
  const tail = htmlFragmentToText(html.slice(cursor));
  if (tail) blocks.push({ type: "text", content: tail, key: createDescriptionBlockKey() });
  return blocks;
};

const escapeHtml = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&#39;");

export const descriptionBlocksToHtml = (blocks = []) => blocks.map((block) => {
  if (block.type === "image") {
    return `<img src="${escapeHtml(block.url)}" style="width:100%;height:auto;display:block" />`;
  }
  const content = escapeHtml(block.content || "").replace(/\n/g, "<br>");
  return content ? `<p>${content}</p>` : "";
}).join("");

export const serializeDescriptionBlocks = (blocks = []) => blocks.reduce((result, block) => {
  if (block.type === "text" && String(block.content || "").trim()) {
    result.push({ type: "text", content: block.content });
  }
  if (block.type === "image" && block.url) result.push({ type: "image", url: block.url });
  return result;
}, []);
