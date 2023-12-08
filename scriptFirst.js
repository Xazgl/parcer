

const puppeteer = require('puppeteer');
const puppeteerExtra = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const recaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const xlsx = require('xlsx');

puppeteerExtra.use(stealthPlugin());
puppeteerExtra.use(
  recaptchaPlugin({
    provider: {
      id: '2captcha',
      token: 'YOUR_2CAPTCHA_API_KEY', // Replace with your 2Captcha API key
    },
    visualFeedback: true, // enable visual feedback on solve attempt
  })
);

const workbook = xlsx.readFile('./requests.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet);

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  );
  await page.setViewport({ width: 1366, height: 768 });

  for (let i = 0; i < data.length; i++) {
    const url = data[i]['ссылки на объявления'];
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForSelector('body');

      if (!response.ok()) {
        throw new Error(`Не удалось загрузить страницу. Статус: ${response.status()}`);
      }

      // Solve reCAPTCHA if present
      await page.solveRecaptchas();

      // Rest of your code...

      await new Promise(resolve => setTimeout(resolve, 30000)); // Задержка 30 секунд после каждого запроса
      await page.screenshot({ path: 'testresult.png', fullPage: true });
    } catch (error) {
      console.error(`Ошибка при обработке URL: ${url}`);
      console.error(error);
    }
  }

  await browser.close();

  const updatedWorkbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(updatedWorkbook, xlsx.utils.json_to_sheet(data), 'Sheet 1');
  xlsx.writeFile(updatedWorkbook, './answers.xlsx');
})();













// const { Builder, By, Key, until } = require('selenium-webdriver');
// const chrome = require('selenium-webdriver/chrome');
// const xlsx = require('xlsx');

// const workbook = xlsx.readFile('./requests.xlsx');
// const sheet = workbook.Sheets[workbook.SheetNames[0]];
// const data = xlsx.utils.sheet_to_json(sheet);

// (async () => {
//   const options = new chrome.Options();
//   options.addArguments('--headless'); // Убедитесь, что браузер работает в headless-режиме
//   const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

//   for (let i = 0; i < data.length; i++) {
//     const url = data[i]['ссылки на объявления'];

//     try {
//       await driver.get(url);
//       await driver.wait(until.elementLocated(By.css('body')), 30000); // Ждем, пока селектор станет доступным на странице

//       const pageContent = await driver.getPageSource();
//       if (
//         /Объявление снято с публикации|Сохранить поиск|Данное объявление больше не актуально.|Объявление неактивно|Объект продан|объявление снято или устарело|Такой страницы нe существует|объявление удалено/.test(
//           pageContent
//         )
//       ) {
//         data[i]['отметка'] = 'да';
//         console.log(`URL успешно обработан: ${url}`);
//       }

//       await driver.sleep(5000); // Задержка 5 секунд после каждого запроса
//     } catch (error) {
//       console.error(`Ошибка при обработке URL: ${url}`);
//       console.error(error);
//     }
//   }

//   await driver.quit();

//   // Сохранение изменений в новом файле Excel
//   const updatedWorkbook = xlsx.utils.book_new();
//   xlsx.utils.book_append_sheet(updatedWorkbook, xlsx.utils.json_to_sheet(data), 'Sheet 1');
//   xlsx.writeFile(updatedWorkbook, './answers.xlsx');
// })();






// const puppeteer = require('puppeteer');
// const xlsx = require('xlsx');

// const workbook = xlsx.readFile('./requests.xlsx');
// const sheet = workbook.Sheets[workbook.SheetNames[0]];
// const data = xlsx.utils.sheet_to_json(sheet);

// (async () => {
//   const browser = await puppeteer.launch({
//     headless: "new",
//     args: ['--proxy-server=http://your-proxy-server:your-proxy-port']
//   });
//   const page = await browser.newPage();
//   page.setDefaultTimeout(30000);

//   // Настройка параметров браузера
//   await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
//   await page.setViewport({ width: 1366, height: 768 });

//   for (let i = 0; i < data.length; i++) {
//     const url = data[i]['ссылки на объявления'];

//     try {
//       const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
//       await page.waitForSelector('body'); // Дождитесь, пока будет доступен селектор на странице
//       if (!response.ok()) {
//         throw new Error(`Не удалось загрузить страницу. Статус: ${response.status()}`);
//       }

//       // // Имитация действий пользователя
//       // await page.click('yourClickSelector');
//       // await page.type('yourInputSelector', 'yourTextInput');

//       await new Promise(resolve => setTimeout(resolve, 5000)); // Задержка 5 секунд для загрузки страницы

//       const pageContent = await page.content();
//       if (
//         /Объявление снято с публикации|Сохранить поиск|Данное объявление больше не актуально.|Объявление неактивно|Объект продан|объявление снято или устарело|Такой страницы нe существует|объявление удалено/.test(
//           pageContent
//         )
//       ) {
//         data[i]['отметка'] = 'да';
//       }

//       await new Promise(resolve => setTimeout(resolve, 15000)); // Задержка 15 секунд после каждого запроса
//     } catch (error) {
//       console.error(`Ошибка при обработке URL: ${url}`);
//       console.error(error);
//     }
//   }

//   await browser.close();

//   // Сохранение изменений в новом файле excel
//   const updatedWorkbook = xlsx.utils.book_new();
//   xlsx.utils.book_append_sheet(updatedWorkbook, xlsx.utils.json_to_sheet(data), 'Sheet 1');
//   xlsx.writeFile(updatedWorkbook, './answers.xlsx');
// })();
















// const axios = require('axios');
// const xlsx = require('xlsx');

// // Чтение файла excel
// const workbook = xlsx.readFile('./requests.xlsx');
// const sheet = workbook.Sheets[workbook.SheetNames[0]];
// const data = xlsx.utils.sheet_to_json(sheet);


// const headers = {
//   'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0',
//   // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//   'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//   'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
//   'Access-Control-Allow-Origin': 'https://volgograd.domclick.ru',
//   // 'Dnt': '1',
//   // 'Connection': 'keep-alive',
//   // 'Cache-Control': 'max-age=0',
//   // 'Upgrade-Insecure-Requests': '1',
//   // 'Accept-Ch': 'Sec-CH-UA-Bitness, Sec-CH-UA-Arch, Sec-CH-UA-Full-Version, Sec-CH-UA-Mobile, Sec-CH-UA-Model, Sec-CH-UA-Platform-Version, Sec-CH-UA-Full-Version-List, Sec-CH-UA-Platform, Sec-CH-UA, UA-Bitness, UA-Arch, UA-Full-Version, UA-Mobile, UA-Model, UA-Platform-Version, UA-Platform, UA',
//   // 'Access-Control-Allow-Credentials': 'true',
//   // 'Access-Control-Allow-Origin': 'https://volgograd.domclick.ru',
//   // 'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0',
//   'Set-Cookie': 'bh=EjoiQ2hyb21pdW0iO3Y9IjExNiIsIk5vdClBO0JyYW5kIjt2PSIyNCIsIllhQnJvd3NlciI7dj0iMjMiGgUieDg2IiIMIjIzLjkuNS42ODYiKgI/MDoJIldpbmRvd3MiQggiMTAuMC4wIkoEIjY0IlJUIkNocm9taXVtIjt2PSIxMTYuMC41ODQ1LjIyOCIsIk5vdClBO0JyYW5kIjt2PSIyNC4wLjAuMCIsIllhQnJvd3NlciI7dj0iMjMuOS41LjY4NiIi; Expires=Sat, 30-Nov-2024 12:31:32 GMT; Domain=.yandex.ru; Path=/; SameSite=None; Secure',
//   // 'X-Content-Type-Options': 'nosniff',
//   // 'X-Xss-Protection': '1; mode=block',
//   'Cookie': 'srv_id=HqLRw1SOIUri5zki.89u6xxq2JbKwEsn3Mi5kCzlxYt36-rH95bJthXDfTGIwM2Hyk1QRoSB-L1lIDEw=.ZTDiog2pUuLDzRfSJx7EcLBsDdBi-7jCc9d9XwZWt2g=.web; gMltIuegZN2COuSe=EOFGWsm50bhh17prLqaIgdir1V0kgrvN; u=2y7n6hvg.me36lh.q4dri32ouig0; v=1701435076; buyer_laas_location=621540; luri=all; buyer_location_id=621540; dfp_group=5; sx=H4sIAAAAAAAC%2FwTAwQ3CMAwF0F3%2BmUMM8TfONjQOLWrJoSBAqrI77wBJ1jDena7M9GZTu3iYplotHOXABwUp63bbHsscP9n92WN9z%2Bxc%2B%2Fe1L5PghIYilkTPkq9pjH8AAAD%2F%2FzUmCP9bAAAA; abp=0; _gcl_au=1.1.1727865239.1701435093; _ga_M29JC28873=GS1.1.1701435093.1.0.1701435093.60.0.0; _ga=GA1.1.1182381180.1701435094; advcake_track_id=6ac23dda-4c85-5a11-0177-f4f4647b409a; advcake_session_id=5460e7aa-6d5c-c1d6-ab2b-f5241e92ec05',
//   'Origin': 'https://www.avito.ru',
//   'Set-Cookie': 'RETENTION_COOKIES_NAME=ba64f2e5d46245cf98331356c20dd2f2:qauULLtjmsgYc_WWO8IS-SoD0UE; Path=/; Domain=.domclick.ru; expires=Sat, 30-Nov-2024 12:55:38 GMT',
//   'Set-Cookie': 'UNIQ_SESSION_ID=00c2a27b85e2437b8c0ca54605665d26:7LsBYq-CNcGdyRu6CZ9Jxs-zFFk; Path=/; Domain=.domclick.ru; expires=Sat, 30-Nov-2024 12:55:38 GMT',
//   'Set-Cookie': 'sessionId=9f3e4dc6544e47ec9a3bfbc2b037d2ab:kMvdMCfcRcIt4TIKuJcbz2Ugceg; Path=/; Domain=.domclick.ru; expires=Sat, 30-Nov-2024 12:55:38 GMT',

// };

// async function start() {
//   // Проход по каждой строке и проверка содержимого страницы
//   for (let i = 0; i < data.length; i++) {
//     const url = data[i]['ссылки на объявления']; // Получение ссылки из второй колонки
//     console.log(url)
//     try {
//       const response = await axios.get(url, { headers, timeout: 30000 });
//       const pageSource = response.data;
//       if (
//         pageSource.includes('Объявление снято с публикации') ||
//         pageSource.includes('Сохранить поиск') ||
//         pageSource.includes('Данное объявление больше не актуально.') ||
//         pageSource.includes('Объявление неактивно') ||
//         pageSource.includes('Объект продан') ||
//         pageSource.includes('объявление снято или устарело') ||
//         pageSource.includes('Такой страницы нe существует') ||
//         pageSource.includes('объявление удалено')
//       ) {
//         // Если текст найден, то отмечаем строку в новой колонке "отметка" значением "да"
//         console, log(url + "ДА")
//         data[i]['отметка'] = 'да';
//       }

//       await new Promise(resolve => setTimeout(resolve, 30000)); // Задержка 30 секунд после каждого запроса
//     } catch (error) {
//       console.error(`Ошибка при обработке URL: ${url}`);
//       console.error(error.message);
//     }
//   }

//   // Сохранение изменений в новом файле excel
//   const updatedWorkbook = xlsx.utils.book_new();
//   xlsx.utils.book_append_sheet(updatedWorkbook, xlsx.utils.json_to_sheet(data), 'Sheet 1');
//   xlsx.writeFile(updatedWorkbook, './answers.xlsx');
// }

// start()











// const puppeteer = require('puppeteer');
// const xlsx = require('xlsx');

// const workbook = xlsx.readFile('./requests.xlsx');
// const sheet = workbook.Sheets[workbook.SheetNames[0]];
// const data = xlsx.utils.sheet_to_json(sheet);

// async function start() {
//   const browser = await puppeteer.launch({ headless: "new" });
//   const page = await browser.newPage();
//   page.setDefaultTimeout(30000);

//   // Настройка параметров браузера
//   await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
//   await page.setViewport({ width: 1366, height: 768 });

//   for (let i = 0; i < data.length; i++) {
//     const url = data[i]['ссылки на объявления'];

//     try {
//       const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
//       await page.waitForSelector('body'); // Дождитесь, пока будет доступен селектор на странице
//       if (!response.ok()) {
//         throw new Error(`Не удалось загрузить страницу. Статус: ${response.status()}`);
//       }

//       // Имитация действий пользователя
//       await page.click('yourClickSelector');
//       await page.type('yourInputSelector', 'yourTextInput');

//       await new Promise(resolve => setTimeout(resolve, 5000)); // Задержка 5 секунд для загрузки страницы

//       const pageContent = await page.content();
//       if (
//         /Объявление снято с публикации|Сохранить поиск|Данное объявление больше не актуально.|Объявление неактивно|Объект продан|объявление снято или устарело|Такой страницы нe существует|объявление удалено/.test(
//           pageContent
//         )
//       ) {
//         data[i]['отметка'] = 'да';
//       }

//       await new Promise(resolve => setTimeout(resolve, 15000)); // Задержка 15 секунд после каждого запроса
//     } catch (error) {
//       console.error(`Ошибка при обработке URL: ${url}`);
//       console.error(error);
//     }
//   }

//   await browser.close();

//   // Сохранение изменений в новом файле excel
//   const updatedWorkbook = xlsx.utils.book_new();
//   xlsx.utils.book_append_sheet(updatedWorkbook, xlsx.utils.json_to_sheet(data), 'Sheet 1');
//   xlsx.writeFile(updatedWorkbook, './answers.xlsx');
// }
// start();
