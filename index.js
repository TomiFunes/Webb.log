import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static("public"));
app.use(express.json());
const SAVE_DIR = path.join(__dirname, "data");

if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR);

app.post("/save-file", (req, res) => {
  let { filename, content } = req.body;

  if (!filename || !content) {
    return res.status(400).send("Nombre de archivo o contenido faltante.");
  }

  const ext = path.extname(filename);
  const baseName = path.basename(filename, ext);
  let filePath = path.join(SAVE_DIR, filename);
  let counter = 1;

  while (fs.existsSync(filePath)) {
    const newFilename = `${baseName}(${counter})${ext}`;
    filePath = path.join(SAVE_DIR, newFilename);
    counter++;
  }

  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error("Error al guardar:", err);
      return res.status(500).send("Error al guardar el archivo.");
    }
    res.send(
      `Archivo guardado correctamente como "${path.basename(filePath)}".`
    );
  });
});

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/file/:name", (req, res) => {
  const filename = req.params.name;
  const filePath = path.join(SAVE_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Archivo no encontrado.");
  }

  const content = fs.readFileSync(filePath, "utf-8");
  res.json({ content });
});

app.get("/files", (req, res) => {
  fs.readdir(SAVE_DIR, (err, files) => {
    if (err) return res.status(500).send("Error al leer archivos.");
    res.json(files);
  });
});

app.get("/file/:filename", (req, res) => {
  const filePath = path.join(SAVE_DIR, req.params.filename);
  if (!fs.existsSync(filePath))
    return res.status(404).send("Archivo no encontrado.");

  const content = fs.readFileSync(filePath, "utf-8");
  res.json({ content });
});

app.post("/check", (req, res) => {
  const password = req.body.password;
  if (password === "tomifunes") {
    req.session.isAuthorised = true;
    res.render("home.ejs");
  } else {
    req.session.isAuthorised = false;
    res.render("index.ejs", { error: "Wrong password" });
  }
});

app.delete("/file/:name", (req, res) => {
  const filename = req.params.name;
  const filePath = path.join(SAVE_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Archivo no encontrado.");
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error al eliminar:", err);
      return res.status(500).send("Error al eliminar el archivo.");
    }
    res.send(`Archivo "${filename}" eliminado correctamente.`);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
