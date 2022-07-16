const basePath = process.cwd();
const audioconcat = require('audioconcat');
const path = require('path');
const fs = require("fs");
const soundsDir = `${basePath}/sounds`;
const buildDir = `${basePath}/build`
const { 
    sampleConfigurations,
} = require(`${basePath}/src/config.js`);


//Create array
// blockConfigurations.forEach(element => {
    
// });

//

const cleanName = (_str) => {
    let nameWithoutExtension = _str.slice(0, -4);
    return nameWithoutExtension;
  };

const getElements = (path) => {
    return fs
      .readdirSync(path)
      .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
      .map((i, index) => {
        if (i.includes("-")) {
          throw new Error(`sample name can not contain dashes, please fix: ${i}`);
        }
        return {
          id: index,
          name: cleanName(i),
          filename: i,
          path: `${path}${i}`,
        };
    });
};

const cartesian = (a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

const samplesSetup = (samplesOrder) => {

    const samples = samplesOrder.map((layerObj, index) => ({
      id: index,
      elements: getElements(`${soundsDir}/${layerObj.name}/`),
      name:
        layerObj.options?.["displayName"] != undefined
          ? layerObj.options?.["displayName"]
          : layerObj.name,
    }));
    return samples;
};

const startGeneration = async () => {
    let sampleConfigIndex = 0;
    let combinaisonIndex = 0;
    var elementsArray = []

    const samples = samplesSetup(sampleConfigurations[sampleConfigIndex].samplesOrder);

    samples.forEach(sample => {
        elementsArray.push(sample.elements)
    });

    
    var combinaisons = cartesian(elementsArray)

    console.log(combinaisons)

    combinaisons.forEach(combinaison => {
        generateSounds(combinaison, combinaisonIndex);
        combinaisonIndex++;
    });

}
  
const buildSetup = () => {
    if (fs.existsSync(buildDir)) {
      fs.rmdirSync(buildDir, { recursive: true });
    }
    fs.mkdirSync(buildDir);
    fs.mkdirSync(`${buildDir}/json`);
    fs.mkdirSync(`${buildDir}/sounds`);
};

const generateSounds = async (combinaison, combinaisonIndex) => {

    let sounds = [];

    combinaison.forEach(element => {
        sounds.push(element.path)
    });
     
    //Generate all songs
    audioconcat(sounds)
      .concat(`${basePath}/build/sounds/${combinaisonIndex}.mp3`)
      .on('start', function (command) {
        console.log('ffmpeg process started:', command)
      })
      .on('error', function (err, stdout, stderr) {
        console.error('Error:', err)
        console.error('ffmpeg stderr:', stderr)
      })
      .on('end', function (output) {
        console.error('Audio created in:', output)
      })
}

module.exports = {generateSounds, buildSetup, startGeneration}