const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");

const app = express();

//convert data into json format
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

//use EJS as the view engine
app.set("view engine", "ejs");
//static file
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

//Register User

app.post("/signup", async (req, res) => {
  const data = {
    name: req.body.username,
    password: req.body.password,
  };

  // Verifique se o usuário já existe no banco de dados

  const existingUser = await collection.findOne({ name: data.name });

  if (existingUser) {
    res.send("Usuário existente. Por favor use um usuário diferente.");
  } else {
    //Hash da senha usando o bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    data.password = hashedPassword;

    const userData = await collection.insertMany(data);
    console.log(userData);
  }
});

//Login user

app.post("/login", async (req, res) => {
  try {
    const check = await collection.findOne({ name: req.body.username });
    if (!check) {
      res.send("O nome de usuário não pode ser encontrado");
      return;
    }

    //Compare the hash password form the database with the plain text
    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      check.password
    );

    if (isPasswordMatch) {
      res.render("home");
    } else {
      req.send("Senha incorreta");
    }
  } catch {
    res.send("Detalhes incorretos");
  }
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on Port: ${port}`);
});
