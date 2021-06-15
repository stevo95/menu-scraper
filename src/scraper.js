'use strict'

const axios = require('axios');
const moment = require('moment');
const cheerio = require('cheerio');
const { processPivniceUCapa, processSuziesSteakPub, processVeroniCafe } = require('./pubProcessors');
const pubs = {
  'Pivnice U Capa' : 'https://www.pivnice-ucapa.cz/denni-menu.php',
  'Suzies Steak Pub' : 'http://www.suzies.cz/poledni-menu.html',
  'Veroni Cafe' : 'https://www.menicka.cz/4921-veroni-coffee--chocolate.html',
}

// async funckia scrapuje html stranku , do ktorej vstupuje cez vlozene url  
async function scrapeMenu (url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

// funkcia na ziskanie dennych menu z restauracii deklarovanych v pubs objekte
async function scrapeAll () {
  try {

    // ziskava datum v spravnom formate cez moment
    // cislo dna cez getday metodu, nasledne ziskava nazov dna z daysArray
    const todayDate = moment().format('DD. M. YYYY');
    const daysArray = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
    const dayIdx = new Date().getDay();
    const dayName = daysArray[dayIdx];
    const result = {
      'Datum': todayDate,
      'Den': dayName,
    }

    // iteruje vsetky puby deklarovane v pubs objekte a invokuje process funckiu na kazdy z nich
    for (const [pub, url] of Object.entries(pubs)) {
      const fullPage = await scrapeMenu(url);
      const $ = cheerio.load(fullPage);
      if (pub === 'Pivnice U Capa') {
        processPivniceUCapa($, result, todayDate, pub);
      } else if (pub === 'Suzies Steak Pub') {
        processSuziesSteakPub($, result, pub);
      } else if (pub === 'Veroni Cafe') {
        processVeroniCafe($, result, pub);
      } else {
        console.log('Unknown restaurant');
      }
    }

    // po ziskani vsetkych menu loguje result objekt do konzoly
    console.log(result);
  } catch (error) {
      console.log(error);
  }
}

module.exports = { scrapeAll };