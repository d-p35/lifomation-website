const synonyms = require('./synonyms.json');
var fs = require('fs');
  const combineSynonyms = (synonyms) => {
    let combined = {};
  
    Object.keys(synonyms).forEach(key => {
      if (!combined[key]) combined[key] = new Set(synonyms[key]);
  
      synonyms[key].forEach(synonym => {
        if (synonyms[synonym]) {
          synonyms[synonym].forEach(value => combined[key].add(value));
        }
      });
  
      combined[key] = Array.from(combined[key]);
    });
  
    // Remove duplicates across keys
    Object.keys(combined).forEach(key => {
      combined[key].forEach(synonym => {
        if (combined[synonym] && key !== synonym) {
          combined[key] = combined[key].filter(item => item !== synonym);
        }
      });
    });
  
    return combined;
  };
  
  const combinedSynonyms = combineSynonyms(synonyms);
//write in synonyms.json
const json = JSON.stringify(combinedSynonyms);
const callback = (err) => {
  if (err) throw err;
};


fs.writeFile('synonyms.json', json, 'utf8', callback);
