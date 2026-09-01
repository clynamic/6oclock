module.exports = async () => {
  await globalThis.__TEST_POSTGRES__?.stop();
};
