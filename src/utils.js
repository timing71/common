export const dasherizeParts = (...args) => {
  const result = [];

  args.forEach(
    a => {
      if (a) {
        result.push(a);
      }
    }
  );

  return result.join(' - ');
};
