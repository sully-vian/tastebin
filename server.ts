const express = require("express");
import { Request, Response } from "express";
import { existsSync, mkdirSync, readFile, readFileSync, writeFile } from "fs";
import { createServer } from "https";
import { networkInterfaces } from "os";
import { join } from "path";

const app = express();
app.set("view engine", "ejs"); // set view engine type
app.use(express.static("public")) // where static files are
app.use(express.urlencoded({ extended: true })); // to parse the incoming request sent as form

// Ensure texts directory exists (if not, create)
const textsDir = join(__dirname, "texts");
if (!existsSync(textsDir)) {
    mkdirSync(textsDir);
}

// serve the favicon
app.get("/favicon.ico", (_: Request, res: Response) => {
    res.sendFile(join(__dirname, "./public/logo.png"));
});

// handle get request for "/" route
// render the code-display view with "code"
app.get("/", (_: Request, res: Response) => {
    const initcode = `Welcome to tasteBin !

Here is the place for you to put your tastiest code snippets`
    res.render("code-display", { code: initcode, language: "plaintext" });
});

// route for creating a new document
app.get("/new", (_: Request, res: Response) => {
    const value = "";
    res.render("new", { value });
});

// route for saving, "value" is in the request
// route is async because we are waiting to save the file
app.post("/save", (req: Request, res: Response) => {
    const value = req.body.value; // form content
    const id = Date.now().toString(); // generate unique id
    const filePath = join(textsDir, `${id}.txt`);

    writeFile(filePath, value, (err) => {
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
app.get("/:id", (req: Request, res: Response) => {
    const id = req.params["id"];
    const filePath = join(textsDir, `${id}.txt`);

    readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.log(err);
            res.status(404).send("Document not found");
        } else {
            res.render("code-display", { code: data, id });
        }
    });
});

// route for duplication
app.get("/:id/duplicate", (req: Request, res: Response) => {
    const id = req.params["id"];
    const filePath = join(textsDir, `${id}.txt`);

    readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.log(err);
            res.status(404).send("Document not found");
        } else {
            res.render("new", { value: data });
        }
    });
});

// get the local IP address
function getLocalIpAddress(): string {
    const ifaces = networkInterfaces();
    for (const name of Object.keys(ifaces)) {
        if (ifaces[name]) {
            for (const iface of ifaces[name]) {
                if (iface.family === "IPv4" && !iface.internal) {
                    return iface.address;
                }
            }
        }
    }
    return "localhost";
}

// read the SSL certificate and key
const options = {
    key: readFileSync("server.key"),
    cert: readFileSync("server.cert"),
};

const PORT: number = 3000;
const LOCAL_IP: string = getLocalIpAddress();
createServer(options, app).listen(PORT, LOCAL_IP, () => {
    console.log(`Server running at https://${LOCAL_IP}:${PORT}`);
}); // server that's running on port PORT
