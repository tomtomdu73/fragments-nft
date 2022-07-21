const basePath = process.cwd();



//Define your sample orders here
const sampleConfigurations = [
    {
        samplesOrder: [
            {name: "Verse 1"},
            {name: "Chorus"},
            {name: "Verse 2"},
            {name: "Chorus"},
            {name: "Verse 3"},
        ],
        numberofPieces: 10
    },
    {
        samplesOrder: [
            {name: "Verse 2"},
            {name: "Chorus"},
            {name: "Verse 1"},
            {name: "Chorus"},
            {name: "Verse 3"},
        ],
        numberofPieces: 10
    },
]

module.exports = { sampleConfigurations }