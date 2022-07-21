const basePath = process.cwd();
const wavconcat = require('wav-concat');
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

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}


const cleanName = (_str) => {
    let nameWithoutExtension = _str.slice(0, -4);
    return nameWithoutExtension;
};

const getElements = (path, layerName) => {
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
          layer: layerName
        };
    });
};

const cartesian = (a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

const samplesSetup = (samplesOrder) => {

    const samples = samplesOrder.map((layerObj, index) => {
      
      var layerName = layerObj.options?.["displayName"] != undefined
      ? layerObj.options?.["displayName"]
      : layerObj.name;

      return ({
      id: index,
      elements: getElements(`${soundsDir}/${layerObj.name}/`, layerName),
      name: layerName
    })});
    return samples;
};

const startGeneration = () => {
    let combinaisonIndex = 0;

    for(let i=0; i < sampleConfigurations.length; i++)
    {
      var editionIndex = 0
      var elementsArray = []
      var samples = samplesSetup(sampleConfigurations[i].samplesOrder);

      samples.forEach(sample => {
          elementsArray.push(sample.elements)
      });
  
      var combinaisons = shuffle(cartesian(elementsArray))

      //Generate sounds
      while (editionIndex < sampleConfigurations[i].numberofPieces)
      {
        //Generate metadata
        const metadata = {
          name: `#${combinaisonIndex}`,
          description: "A unique piece of music",
          image: `ipfs://QmUgseCxAV1vrddnq7fnmSZ5WaVcxMpoUm1FdKHVrDGgBV/${combinaisonIndex}.png`,
          attributes: getAttributes(combinaisons[combinaisonIndex])
        }
        fs.writeFileSync(`${buildDir}/json/${combinaisonIndex}.json`, JSON.stringify(metadata))

        //Generate sounds
        generateSounds(combinaisons[combinaisonIndex], combinaisonIndex);
        editionIndex++;
        combinaisonIndex++;

        if(combinaisonIndex >= combinaisons.length){
          console.log(`SampleOrder ${i} needs more samples to create ${sampleConfigurations[i].numberofPieces} pieces of music`)
          process.exit()
        }
      }
    }
}
  
const getAttributes = (combinaison) => {

  var attributes = [];

  combinaison.forEach(element => {
    attributes.push({
      trait_type: element.layer,
      value: element.name
    })
  })

  return attributes
}

const buildSetup = () => {
    if (fs.existsSync(buildDir)) {
      fs.rmSync(buildDir, { recursive: true });
    }
    fs.mkdirSync(buildDir);
    fs.mkdirSync(`${buildDir}/json`);
    fs.mkdirSync(`${buildDir}/sounds`);
};

const generateSounds = (combinaison, combinaisonIndex) => {

  let sounds = [];

  combinaison.forEach(element => {
      sounds.push(element.path)
  });
    
  //Generate all songs
  wavconcat(sounds)
    .concat(`${basePath}/build/sounds/${combinaisonIndex}.wav`)
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