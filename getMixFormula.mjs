import fs from 'fs';

const data = fs.readFileSync(`coreDatabase/coreDetails.json`, `utf8`);
const coreDetails = JSON.parse(data);

const allCoreFormulas = {};
coreDetails.forEach((coreType) => {
    coreType.coreDetails.forEach((core) => {
        allCoreFormulas[core["coreName"]] = core["mixFormulas"];
    });
});

// Write to JSON file
fs.writeFileSync(`coreDatabase/mixFormulas.json`, JSON.stringify(allCoreFormulas), `utf8`);


