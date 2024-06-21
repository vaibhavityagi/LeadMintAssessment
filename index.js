const express = require("express");
const app = express();
const PORT = 3000;

const rootRouter = require("./routes/index");

app.use(express.json());

app.use("/api", rootRouter);

// error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Error occured");
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
