function getItemAmount (list) {
  const amountMap = new Map();
  list.forEach((order) => {
    const { orderItems } = order;
    orderItems.forEach((item) => {
      const { itemName, itemQuantity } = item;

      if (amountMap.has(itemName)) {
        amountMap.set(itemName, amountMap.get(itemName) + itemQuantity);
      } else {
        amountMap.set(itemName, itemQuantity);
      }
    });
  });

  return Array.from(amountMap);
};

module.exports = {
  getItemAmount
}
