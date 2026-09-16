

export const generateRfpId = (id: string) => {
  const prefix =
    id?.length >= 3 ? id.slice(0, 3) : id.padEnd(3, "0").slice(0, 3);
  const randomSuffix = Math.floor(100 + Math.random() * 900).toString();

  return `RFP-${prefix}-${randomSuffix}`;
};
