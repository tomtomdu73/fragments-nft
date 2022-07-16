const { layersSetup } = require("./src/main");

const basePath = process.cwd();
const { startGeneration, generateSounds, buildSetup } = require(`${basePath}/src/main.js`);

(() => {
    startGeneration();
    // buildSetup();
    //generateSounds();
})();