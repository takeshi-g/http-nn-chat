"use strict";
const { read } = require("fs");
const http = require("http");
const pug = require("pug");
const auth = require("http-auth");
const { runInNewContext } = require("vm");
const basic = auth.basic(
  { realm: "Enquetes Area." },
  (username, password, callback) => {
    callback(username === "guest" && password === "password");
  }
);
const server = http
  .createServer(
    basic.check((req, res) => {
      const now = new Date();
      console.info(`${now} / requested by ${req.socket.remoteAddress}`);
      res.writeHead(200, {
        "Content-Type": "text/html;charset=utf-8",
      });

      switch (req.method) {
        case "GET":
          console.log(req.url, req.method);
          if (req.url === "/logout") {
            res.writeHead(401, {
              "Content-Type": "text/plain; charset=utf-8",
            });
            res.end("ログアウトしました");
            return;
          }
          if (req.url === "/enquetes/yaki-shabu") {
            res.write(
              pug.renderFile("./form.pug", {
                path: req.url,
                firstItem: "焼肉",
                secondItem: "しゃぶしゃぶ",
              })
            );
          } else if (req.url === "/enquetes/rice-bread") {
            res.write(
              pug.renderFile("./form.pug", {
                path: req.url,
                firstItem: "ごはん",
                secondItem: "パン",
              })
            );
          } else if (req.url === "/enquetes/sushi-pizza") {
            res.write(
              pug.renderFile("./form.pug", {
                path: req.url,
                firstItem: "寿司",
                secondItem: "ピザ",
              })
            );
          }
          res.end();
          break;
        case "POST":
          let rawData = "";
          req
            .on("data", (chunk) => {
              rawData += chunk;
            })
            .on("end", () => {
              const answer = new URLSearchParams(rawData);
              const resStr = `${answer.get("name")}さんは${answer.get(
                "favorite"
              )}に投票しました。`;
              console.info(`${now} / ${resStr}`);
              res.write(
                `<!DOCTYPE html><html lang="ja"><body><h1>${resStr}</h1></body>`
              );
              res.end();
            });
          break;
        case "DELETE":
          res.write(`DELETE ${req.url}`);
          break;
        default:
          break;
      }
    })
  )
  .on("error", (e) => {
    console.error(`${new Date()} / Server Error: ${e}`);
  })
  .on("clientError", (e) => {
    console.error(`${new Date()} / Client Error: ${e}`);
  });
const port = 8000;
server.listen(port, () => {
  console.info(`${new Date()}Listening on ${port}`);
});
