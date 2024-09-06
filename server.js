const app = require('./src/app');
const mongoose = require("mongoose");
const { app: { port } } = require('@/configs');

const PORT = port;

const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

process.on("SIGINT", () => { // VD Khi ấn CTRL+C, sẽ override việc tắt server bth
  server.close(async () => {
    console.log("Exit Server Express");
    await mongoose.disconnect();
    process.exit(1);
  });
});