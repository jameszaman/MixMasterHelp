import fetch from "node-fetch";
import cheerio from "cheerio";
import fs from "fs";

const coreTypes = [
  "dragon",
  "devil",
  "animal",
  "bird",
  "insect",
  "plante",
  "mistery",
  "metal",
];


// ! This part of the code is to get the HTML of the pages. It is only necessary to run it when the page is updated.
// ! We do not want to do too many unnecessary requests to the server.

async function getCoreHTML() {
  new Promise((resolve, reject) => {
    try {
      const url = "https://mixmasteroficial.com.br/Mix?p=Mix&mix=";
      coreTypes.forEach((coreType, index) => {
        fetch(`${url}${coreType}`)
          .then((response) => response.text())
          .then((data) => {
            // Write to HTML file
            fs.writeFileSync(`./${coreType}.html`, data);
          });
        setTimeout(() => {
          fetch(`${url}${coreType}`)
            .then((response) => response.text())
            .then((data) => {
              // Write to HTML file
              fs.writeFileSync(`./${coreType}.html`, data);
            });
        }, 3000 * (index + 1));
      });
      resolve({ msg: "HTML files saved." });
    } catch (error) {
      reject({ msg: "Error saving HTML files.", error: error });
    }
  });
}
// ! This part of the code is to get the core details from the HTML files.

async function saveCoreDetails() {
  return new Promise((resolve, reject) => {
    try {
      const allCoreDetails = [];
      // FOr Every Type of Core
      for (const coreType of coreTypes) {
        // Load the HTML file.
        const html = fs.readFileSync(`./${coreType}.html`, "utf8");
        const $ = cheerio.load(html);
        const coreDetails = [];

        // Get the core details
        const coreDetailsTables = $(".hench");

        for (const coreDetailsTable of coreDetailsTables) {
          const coreTableRows = $(coreDetailsTable).find("tbody tr");
          // Core name and number
          const coreName = $(coreTableRows[1]).find("p strong").text();

          const coreNumber = $(coreTableRows[1])
            .find("a")
            .attr("href")
            .split("=")[2];

          // Min and Max level of the core
          const coreLevels = $(coreTableRows[1]).find("b p").text().split("/");
          const coreMinLevel = parseInt(coreLevels[0]);
          const coreMaxLevel = parseInt(coreLevels[1]);

          // Find out all the possible mix formulas
          const mixCores = [],
            mixFormulas = [];
          // First get the cores involved in the mix
          $(coreTableRows[1])
            .find("td:nth-child(2) a")
            .each((index, element) => {
              mixCores.push({ name: $(element).text() });
            });
          if (mixCores.length) {
            // Then get the mix item levels
            $($(coreTableRows[1]).find("td:nth-child(2)"))
              .text()
              .match(/\(\d+\)/g)
              .forEach((level, index) => {
                mixCores[index].itemLevel = parseInt(level[1]);
              });
            // Prepare the mix formula in proper structure.
            for (let i = 0; i < mixCores.length / 2; ++i) {
              mixFormulas.push([mixCores[i * 2], mixCores[i * 2 + 1]]);
            }
          }

          // Check if the core is droppable
          let isDroppable = false;
          if ($(coreTableRows[1]).find("td b").text().includes("Sim")) {
            isDroppable = true;
          }

          // Get what cores it mixes into
          const mixInto = [];
          $($(coreTableRows[2]).find("td")[0])
            .find("a")
            .each((index, element) => {
              mixInto.push($(element).text());
            });
          // Get where the core is found in.
          const coreLocations = [];
          const coreLocationsRaw = $(
            $(coreTableRows[2]).find("td:nth-child(2) p:first-child")
          )
            .text()
            .split("|");
          // We ignore the first and last elements because they are unnecessary data.
          for (let i = 1; i < coreLocationsRaw.length - 1; i++) {
            coreLocations.push(coreLocationsRaw[i]);
          }

          // Get All the possible drops.
          const drops = [];
          $(coreTableRows[2])
            .find(".table-striped tr")
            .each((index, element) => {
              const item = $(element).find("td");
              drops.push({
                name: $(item[0]).text(),
                location: $(item[1]).text(),
              });
            });

          coreDetails.push({
            coreName,
            coreNumber,
            coreMinLevel,
            coreMaxLevel,
            mixFormulas,
            isDroppable,
            mixInto,
            coreLocations,
            drops,
          });
        }
        allCoreDetails.push({ coreType, coreDetails });
      }
      resolve(allCoreDetails);
    } catch (error) {
      reject({ msg: "Error saving core details.", error: error });
    }
  });
}

// // Save the core details to a JSON file.
// getCoreHTML().then((res) => {
//   console.log(res);
// });

// Save the core details to a JSON file.
saveCoreDetails().then((res) => {
  // Write json file
  fs.writeFileSync("coreDetails.json", JSON.stringify(res, null, 2));
});
