const escapeHtml = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const normalizeDescriptionBlocks = (blocks) => {
  if (!Array.isArray(blocks)) return [];
  return blocks.slice(0, 100).reduce((result, block) => {
    if (block && block.type === "text" && typeof block.content === "string") {
      const content = block.content.slice(0, 10000);
      if (content.trim()) result.push({ type: "text", content });
    }
    if (
      block
      && block.type === "image"
      && typeof block.url === "string"
      && /^(cloud:\/\/|https?:\/\/)/i.test(block.url)
    ) {
      result.push({ type: "image", url: block.url });
    }
    return result;
  }, []);
};

const descriptionBlocksToHtml = (blocks) => blocks.map((block) => {
  if (block.type === "image") {
    return `<img src="${escapeHtml(block.url)}" style="width:100%;height:auto;display:block" />`;
  }
  const content = escapeHtml(block.content).replace(/\r?\n/g, "<br>");
  return `<p>${content}</p>`;
}).join("");

module.exports = { normalizeDescriptionBlocks, descriptionBlocksToHtml };
