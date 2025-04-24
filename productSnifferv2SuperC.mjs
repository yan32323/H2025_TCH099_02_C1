import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { JSDOM } from 'jsdom';

puppeteer.use(StealthPlugin());

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function scrapeMetroPage(url) {

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
    timeout: 2240041,
  });
  
  await delay(3155);

  const content = await page.content();
  await delay(3222);
  
  await browser.close();

  return content;
}

(async () => {

  let reader = new FileReader();

  // pages a gratter
  let pages = ["https://www.superc.ca/allees/fruits-et-legumes", "https://www.superc.ca/allees/produits-laitiers-et-oeufs",
   "https://www.superc.ca/allees/garde-manger","https://www.superc.ca/allees/plats-cuisines",
   "https://www.superc.ca/allees/format-economique", "https://www.superc.ca/allees/boissons",
   "https://www.superc.ca/allees/bieres-et-vins", "https://www.superc.ca/allees/viandes-et-volailles",
   "https://www.superc.ca/allees/aliments-vegetariens-et-vegetaliens",
   "https://www.superc.ca/allees/epicerie-biologique", "https://www.superc.ca/allees/collations",
   "https://www.superc.ca/allees/produits-surgeles","https://www.superc.ca/allees/pains-et-patisseries",
    "https://www.superc.ca/allees/charcuteries-et-plats-prepares", "https://www.superc.ca/allees/poissons-et-fruits-de-mer",
    "https://www.superc.ca/allees/cuisine-du-monde","https://www.superc.ca/allees/bebe/nourriture-et-preparations"    
  ];
  let saut = "-page-";
  let produitsTrouves = [];

  for (let i=0; i<pages.length; i++){
      
  let compteur = 0;

  let done = false;

  do {

    let url="";
    if (compteur ==0){
    url = pages[compteur];
} else {
  url = pages[compteur]+saut+compteur
}
  let html = await scrapeMetroPage(url);
  reader.addEventListener("load", function() {
    let pageAVerifier = reader.result;

    if (pageAVerifier.includes("pl--no-results")){
      done = true;
    } else {

      let dom = new JSDOM(pageAVerifier);
      let pageChargee = dom.window.document;
      let produits = pageChargee.getElementsByClassName("tile-product");
      for(let i = 0; i < produits.length; i++) {
        let next = produits[i].children[1].children[0];
        let produitGratte = {nom : next.children[0].querySelector("a").children[0].textContent,
           quantite : next.children[0].querySelector("a").children[1].textContent,
          prix : next.children[2].children[0].getAttribute("data-main-price"), magasin : "Super C"};
        produitsTrouves.push(produitGratte);
      }
    }
  });
  reader.readAsText(html);



} while (!done);
let produitsTrouvesJSON = JSON.stringify(produitsTrouves);
let response = await fetch(
  "http://localhost/planigo/H2025_TCH099_02_C1/api/UploadNouvProduits.php",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: produitsTrouvesJSON
  }
);
let reponse = await response.json();
      if (reponse.status == "ok") {
        console.log("Envoi réussi!");
        back();
      } else {
        console.log("Erreur lors de l'envoi des données.");
        console.log(reponse);
        back();
      }
}

// Close browser
await browser.close();

})();
