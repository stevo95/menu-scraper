'use strict'

const cheerio = require('cheerio');
const moment = require('moment');

function processPivniceUCapa($, result, todayDate, pub) {
  $('.listek').find('.mb-4').each((i, dayMenuInstance) => {
    const dayMenu = cheerio.load(dayMenuInstance);
    if (todayDate === dayMenu('.date').text()) {
      if (!result[pub]) result[pub] = {};
      result[pub].Polevka = dayMenu('.polevka').text();
      dayMenu('.col-md-9').find('.row-food').each((i, foodItemInstance) => {
        const foodItem = cheerio.load(foodItemInstance);
        const num = i + 1;
        const text = 'Menu ' + num;
        result[pub][text] = {
          'Jidlo': foodItem('.food').text(),
          'Cena': foodItem('.text-right').text(),
        }
      });
    }
  });
}

// format datumov medzi restauraciami sa lisi, preto tato funkcia neberie parameter todayDate. Datum je zvlast formatovany

function processSuziesSteakPub($, result, pub) { 
  const today = moment().format('DD.M');
  $('#weekly-menu').find('.day').each((i, dayMenuInstance) => {
    const dayMenu = cheerio.load(dayMenuInstance);  
    const numRegex = /[-]{0,1}[\d]*[.]{0,1}[\d]+/g;
    const date = dayMenu('h4').text().match(numRegex);
    if(today === date[0]) {
      dayMenu('.day').find('.item').each((i, foodItemInstance) => {
        const foodItem = cheerio.load(foodItemInstance);
        const category = foodItem('.category').text().trim();
        const title = foodItem('.title').text().trim();
        const food = foodItem('.text').text().replace(/\s\s+/g, ' ').trim();
        const price = foodItem('.price').text().trim() + ' Kč';
        const text = 'Menu ' + i;
        if (category === 'Polévka') {
          if (!result[pub]) result[pub] = {};
          result[pub].Polevka = food;
        } else {
          result[pub][text] = {
            'Kategorie': category,
            'Jidlo': food,
            'Cena' : price,
          }
          if (title) result[pub][text].Jidlo = `${title} - ${food}`;
        }
      })
    }
  })
}

// format datumov medzi restauraciami sa lisi, preto tato funkcia neberie parameter todayDate. Datum je zvlast formatovany
// Veroni Cafe ma na webe sobotu aj nedelu , kedy sa menu nepodava. Preto v pripade, ze je zatvorene, alebo menu nie je vypisane,
// 'Restaurace ma tento den zavreno, nebo pro tento den nebylo zadano menu' je lognute do konzoly

function processVeroniCafe($, result, pub) {  
  const today = moment().format('DD.M.YYYY');
  $('.obsah').find('.menicka').each((i, dayMenuInstance) => {
    const dayMenu = cheerio.load(dayMenuInstance);
    const numRegex = /[-]{0,1}[\d]*[.]{0,1}[\d]+/g;
    const dateArray = dayMenu('.nadpis').text().match(numRegex);
    const date = dateArray[0] + dateArray[1];
    if (today === date) {
      if ( dayMenu('.polevka').text().trim() === 'Restaurace m� tento den zav�eno.' || dayMenu('.polevka').text().trim() === 'Pro tento den nebylo zad�no menu.') {
        result[pub]['Jidlo'] = 'Restaurace ma tento den zavreno, nebo pro tento den nebylo zadano menu';
      } else {
        dayMenu('.polevka').each((i, polevka) => {
          const soup = cheerio.load(polevka);              
          const text = `Polévka ${i + 1}`
          const food = soup('.polozka').text();
          const price = soup('.cena').text();
          if (!result[pub]) result[pub] = {};
          result[pub][text] = {
            'Název': food,
            'Cena' : price,
          }
        });
        const food = dayMenu('.jidlo').find('.polozka').text().replace(/[0-9.]/g, '').trim();
        const price = dayMenu('.jidlo').find('.cena').text();
        result[pub]['Jidlo'] = {
          'Název': food,
          'Cena': price,
        }
      }
    }
  });
}


module.exports = { processPivniceUCapa, processSuziesSteakPub, processVeroniCafe };