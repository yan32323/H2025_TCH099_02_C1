import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { JSDOM } from 'jsdom';

puppeteer.use(StealthPlugin());

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function scrapeIGAPage(url) {

  // Lancer le navigateur
  const browser = await puppeteer.launch({
    headless: 'true',
    defaultViewport: null,
    args: ['--start-maximized'] 
  });

  const page = await browser.newPage();

  // "Spoof" du navigateur
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36');

  // Naviguer a la page
  await page.goto(url, {
    waitUntil: 'networkidle0',
    timeout: 2240041 + Math.random()*1000,
  });
  // Delai d'attente
  await delay(3155+Math.random()*100);

  const content = await page.content();
  await delay(3222+Math.random()*100);
  
  // Fermer le navigateur
  await browser.close();

  return content;
}

(async () => {

  let reader = new FileReader();

  // pages a gratter
  let pages = ["https://www.iga.net/en/online_grocery/seafood?page=1&pageSize=15000",
  "https://www.iga.net/en/online_grocery/sushis?page=1&pageSize=15000",
  "https://www.iga.net/en/online_grocery/meat?page=1&pageSize=15000",
  "https://www.iga.net/en/online_grocery/beverages?page=1&pageSize=15000",
  "https://www.iga.net/en/online_grocery/deli_and_cheese?page=1&pageSize=15000",
  "https://www.iga.net/en/online_grocery/grocery?page=1&pageSize=15000",
  "https://www.iga.net/en/online_grocery/frozen_grocery?page=1&pageSize=15000",
  "https://www.iga.net/en/online_grocery/produits_refrigeres?page=1&pageSize=15000",
  "https://www.iga.net/en/online_grocery/home_meal_replacement?page=1&pageSize=15000",
  "https://www.iga.net/en/online_grocery/produce?page=1&pageSize=15000",
  "https://www.iga.net/en/online_grocery/commercial_bakery?page=1&pageSize=15000",
  "https://www.iga.net/en/online_grocery/instore_bakery?page=1&pageSize=15000"];

  // tableau pour stocker les produits
  let produitsTrouves = [];

  for (let i=0; i<pages.length; i++){
      //scrapping
  let html = await scrapeIGAPage(pages[i]);
  reader.addEventListener("load", function() {
    let pageAVerifier = reader.result;
      let dom = new JSDOM(pageAVerifier);
      let pageChargee = dom.window.document;
      let produits = pageChargee.getElementsByID("body_0_main_1_ProductSearch_GroceryBrowsing_TemplateResult_SearchResultListView_MansoryPanel").children[0];
      
      for(let i = 0; i < produits.length; i++) {
        let next = produits[i].children[0].children[1].children[0].children[1].children[0];
        let unitees= next.children[0].children[2].textContent;
        
        let quantite;
        let unitees_de_mesure;

        if (unitees.includes("x")||unitees.includes("X")) {
          unitees = unitees.split(" ");
          quantite = unitees[0]*unitees[2];
          unitees_de_mesure = unitees[3];  
        } else{
          unitees = unitees.split(" ");
          quantite = unitees[0];
          unitees_de_mesure = unitees[1];
        }
        
        let produitGratte = {
          nom : next.children[0].children[1].children[0].textContent,
           quantite : quantite,
            untite : unitees_de_mesure,
            magasin : "IGA",
          prix : next.children[1].children[0].children[0].children[0].children[0].textContent.substring(1)};
        produitsTrouves.push(produitGratte);
      }
  });
  reader.readAsText(html);

  // Envoi des données à l'API
let produitsTrouvesJSON = JSON.stringify(produitsTrouves);
let response = await fetch(
  "./api/UploadNouvProduits.php",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: produitsTrouvesJSON
  }
);
let reponse = await response.json();
      if (reponse.statut) {
        console.log("Envoi réussi!");
      } else {
        console.log("Erreur lors de l'envoi des données.");
        console.log(reponse.details);
      }
}

// Close browser
await browser.close();
console.log("Scraping terminé.");
})();
