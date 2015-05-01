var fs = require("fs"),
    cp = require("cp"),
    mkdirp = require("mkdirp");
    browserify = require("browserify"),
    babelify = require("babelify");

mkdirp.sync("build");
// cp.sync("app/*.html", "build/");
browserify({ debug: true })
    .transform(babelify)
    .require("./node_modules/less/lib/less-node/index.js", {expose: "less"})
    .require("./app/main.js", { entry: true })
    .require("babelify/polyfill")
    .bundle()
    .on("error", function (err) {
        console.log("Error: " + err.message);
    })
    .pipe(fs.createWriteStream("build/main.js"));
