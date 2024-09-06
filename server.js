const express = require("express");
const app = express();
app.set("view engine", "ejs"); // set view engine type
app.use(express.static("public")) // where static files are
app.use(express.urlencoded({ extended: true })); // to parse the incoming request sent as form

const fs = require("fs");
const path = require("path");

// Ensure texts directory exists (if not, create)
const textsDir = path.join(__dirname, "texts");
if (!fs.existsSync(textsDir)) {
    fs.mkdirSync(textsDir);
}

// handle get request for "/" route
// render the code-display view with "code"
app.get("/", (req, res) => {
    const initcode = `Welcome to tasteBin !

Here is the place for you to put your tastiest code snippets`
    res.render("code-display", { code: initcode, language: "plaintext" });
});

// route for creating a new document
app.get("/new", (req, res) => {
    const value = "Input here your code...";
    res.render("new", { value });
});

// route for saving, "value" is in the request
// route is async because we are waiting to save the file
app.post("/save", (req, res) => {
    const value = req.body.value; // form content
    const id = Date.now().toString(); // generate unique id
    const filePath = path.join(textsDir, `${id}.txt`);

    fs.writeFile(filePath, value, (err) => {
        if (err) {
            // if an error occurs while saving, stay in edit mode
            console.log(err);
            res.render("new", { value });
        } else {
            res.redirect(`/${id}`); // open text as view
        }
    });
});

// route to get the saved file
app.get("/:id", (req, res) => {
    const id = req.params.id;
    const filePath = path.join(textsDir, `${id}.txt`);

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.log(err);
            res.status(404).send("Document not found");
        } else {
            res.render("code-display", { code: data, id });
        }
    });
});

// route for duplication
app.get("/:id/duplicate", (req, res) => {
    const id = req.params.id;
    const filePath = path.join(textsDir, `${id}.txt`);

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.log(err);
            res.status(404).send("Document not found");
        } else {
            res.render("new", {value: data});
        }
    });
});

const PORT = 3000;
app.listen(PORT); // server that's running on port PORT
console.log(`Server running at http://localhost:${PORT}`);
