module.exports = function getItemDescription(items) {
  return items.reduce((dest, item) => {
    const { itemName, itemQuantity } = item;
    dest += `${itemName.substring(0, 64)} * ${itemQuantity} `;
    return dest;
  }, "");
};
