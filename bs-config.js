const dotenv = require("dotenv");
dotenv.config();

module.exports = {
    server: {
        baseDir: [
            "./src",
            "./build/contracts"
        ],
        routes: {
            "/vendor": "./node_modules"
        }
    },
    open: false,
    port: process.env.PORT || 3000
}