import { fileURLToPath } from "url";
import path from "path";
import { dirname } from "path";
import * as wdb from "./wordDB.js";
import checkWord from "./wordCheck.js";
import express from "express";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const filePath = path.join(__dirname, "public");
app.use(express.static(filePath));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// asyncWrap function taken from messageboard stage 8 (not mine)
function asyncWrap(f) {
  return (req, res, next) => {
    Promise.resolve(f(req, res, next)).catch((e) => next(e || new Error()));
  };
}

let wordToBeGuessed = "";

wordToBeGuessed = await wdb.update(true);
console.log(wordToBeGuessed);

app.get("/", (req, res) => {
  res.send("index");
});

app.get("/check/:word", async (req, res) => {
  const response = checkWord(
    req.params.word.toUpperCase(),
    wordToBeGuessed.toUpperCase()
  );
  res.json(response);
});

async function prepareNewGame(req, res) {
  wordToBeGuessed = await wdb.update(false);
  console.log("New game, new word is:", wordToBeGuessed);
  res.sendStatus(200);
}

app.get("/update", asyncWrap(prepareNewGame));

app.get("/display", (req, res) => {
  res.json(wordToBeGuessed);
});

app.get("/submit", (req, res) => {
  res.sendFile("submit.html", { root: filePath });
});

app.post("/submit", asyncWrap(wdb.submit));

app.listen(process.env.PORT || 8080, () => {
  console.log("Server is up on port 8080.");
});
