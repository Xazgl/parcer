
const pageStasuses = [
    'Объявление снято с публикации',
    'Сохранить поиск',
    'Данное объявление больше не актуально.',
    'Объявление неактивно',
    'Объявление не посмотреть',
    'Объявление снято с публикации.',
    'Пользователь его удалил',
    'удалено',
    'удалил',
    'Объект продан',
    'объявление снято или устарело',
    'Такой страницы нe существует',
    'объявление удалено'
]

function getUrlParts(url) {
    var a = document.createElement('a');
    a.href = url;

    return {
        href: a.href,
        host: a.host,
        hostname: a.hostname,
        port: a.port,
        pathname: a.pathname,
        protocol: a.protocol,
        hash: a.hash,
        search: a.search
    };
}


const puppeteerExtra = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const xlsx = require('xlsx');

// Загрузка Puppeteer Extra и Puppeteer Stealth
puppeteerExtra.use(stealthPlugin());

// Чтение файла excel
const workbook = xlsx.readFile('./requests.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet);

async function start() {
    // Запуск браузера с Puppeteer Extra
    const browser = await puppeteerExtra.launch();
    const page = await browser.newPage();
    page.setDefaultTimeout(10000);

    // Проход по каждой строке и проверка содержимого страницы
    for (let i = 0; i < data.length; i++) {

        // Получение ссылки из второй колонки
        const url = data[i]['ссылки на объявления'];

        try {
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            // Задержка 10 секунд для загрузки страницы
            await new Promise(resolve => setTimeout(resolve, 10000));
            // Запрос страницы
            const pageSource = await page.content();

            //Перебираем массив статусов страницы
            for (const status of pageStasuses) {

                if (pageSource.includes(status)) {

                    // Если текст найден, то отмечаем строку в новой колонке "отметка" значением "да"
                    data[i]['отметка'] = `${status}`;
                    console.log(`${i}) Статус ошибки: ${status}. URL: ${url}`);
                    break;

                } else {

                    if (url.includes('avito')) {

                        console.log(`пошел блок для Авито по  ${url} `)
                        //Ищем элемент на странице Avito div c data-marker="breadcrumbs" если она не совпала не с одним из предидущих статусов

                         const breadcrumbSelector = 'a[itemprop="item"][itemtype="http://schema.org/ListItem"]';
                         const breadcrumbElement = await page.$(breadcrumbSelector);

              
                        const outerHTML = await page.evaluate(element => {
                            // Возвращаем outerHTML элемента
                            return element.outerHTML;
                        }, breadcrumbElement);
                        console.log(`Содержимое элемента: ${outerHTML}`);

                        if (breadcrumbElement) {

                            const baseDomain = 'www.avito.ru'
                            const breadcrumbUrl = await page.evaluate(element => element.getAttribute('href'), breadcrumbElement);
                            console.log(`${breadcrumbUrl} -- ссылка с страници на каталог. Для объекта ${url}`)

                            //ищем улицу
                            const addressElement = await page.$('div[itemprop="address"] span.style-item-address__string-wt61A');
                            // Проверяем, найден ли элемент
                            if (addressElement) {
                                const street = await page.evaluate(element => {
                                    const addressString = element.textContent.trim();
                                    // Разделение строки адреса по запятой и взятие третьего элемента (улица)
                                    const streetArray = addressString.split(',').map(item => item.trim());
                                    return streetArray.length >= 3 ? streetArray[2] : null;
                                }, addressElement);
                                console.log(`Улица: ${street} для ${url}`);

                                // const breadcrumbUrl = await page.evaluate(element => {
                                //     const base = window.location.origin;
                                //     const relativeUrl = element.getAttribute('href');
                                //     return new URL(relativeUrl, base).href;
                                // }, breadcrumbElement);

                                console.log(`ссылка по которой нужно пройти : ${breadcrumbUrl}+?q=${street}`);

                                const targetUrl = `${breadcrumbUrl}?q=${street}`;

                                //Ищем на новой странице список выданный объектов по адресу
                                await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

                                // Задержка 10 секунд для загрузки страницы
                                await new Promise(resolve => setTimeout(resolve, 10000));

                                // Запрос страницы
                                const pageSource2 = await page.content();

                                const itemSelector = 'div[data-marker="catalog-serp"] div[data-marker="item"]';
                                const items = await page.$$(itemSelector);

                                let targetIndex = -1;

                                for (let i = 0; i < items.length; i++) {
                                    const itemElement = items[i];
                                    const itemUrl = await page.evaluate(element => {
                                        const linkElement = element.querySelector('a[itemprop="url"]');
                                        return linkElement ? linkElement.getAttribute('href') : null;
                                    }, itemElement);

                                    if (itemUrl === targetUrl) {
                                        targetIndex = i + 1; // Список начинается с 1, а не с 0
                                        if (targetIndex > 5) {
                                            data[i]['отметка'] = `Да.место в списке ${targetIndex}`;
                                            break;
                                        } else {
                                            data[i]['отметка'] = `Нет`;
                                            break;
                                        }
                                    }
                                }

                                if (targetIndex !== -1) {
                                    console.log(`Объект с ${url}. В списке${targetUrl} находится на позиции ${targetIndex} в списке.`);
                                    data[i]['отметка'] = `Объект с ${url}. В списке ${targetUrl} находится на позиции ${targetIndex} в списке.`;
                                    console.log(`${i}) Объект с ${url}. В списке по ${targetUrl} находится на позиции ${targetIndex} в списке.`)
                                    break;
                                } else {
                                    console.log(`Объект с ${url}. В списке ${targetUrl} не найден в списке.`);
                                    data[i]['отметка'] = `Объект с ${url}. В списке ${targetUrl} не найден в списке по поиску`;
                                    break;
                                }
                            } else {
                                console.log(`Элемент с адресом не найден на странице.для ${url}`);
                            }

                        } else {
                            console.log('Элемент Breadcrumb не найден на странице.');
                            break;
                        }
                    }
                }
            }

            await new Promise(resolve => setTimeout(resolve, 15000)); // Задержка 15 секунд после каждого запроса

        } catch (error) {
            console.error(`Ошибка при обработке URL: ${url}`);
            console.error(error);
        }
    }

    await browser.close();

    // Сохранение изменений в новом файле excel
    const updatedWorkbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(updatedWorkbook, xlsx.utils.json_to_sheet(data), 'Sheet 1');
    xlsx.writeFile(updatedWorkbook, './answers.xlsx');
}

start();



// const xlsx = require('xlsx');
// const axios = require('axios');

// // Чтение файла excel
// const workbook = xlsx.readFile('./requests.xlsx');
// const sheet = workbook.Sheets[workbook.SheetNames[0]];
// const data = xlsx.utils.sheet_to_json(sheet);

// async function start() {
//     // Проход по каждой строке и проверка содержимого страницы
//     for (let i = 0; i < data.length; i++) {
//         const url = data[i]['ссылки на объявления']; // Получение ссылки из второй колонки
//         console.log(url);

//         try {
//             const response = await axios.get(url, { timeout: 30000 });
//             const pageSource = response.data;

//             if (
//                 pageSource.includes('Объявление снято с публикации') ||
//                 pageSource.includes('Сохранить поиск') ||
//                 pageSource.includes('Данное объявление больше не актуально.') ||
//                 pageSource.includes('Объявление неактивно') ||
//                 pageSource.includes('Объект продан') ||
//                 pageSource.includes('объявление снято или устарело') ||
//                 pageSource.includes('Такой страницы нe существует') ||
//                 pageSource.includes('объявление удалено')
//             ) {
//                 // Если текст найден, то отмечаем строку в новой колонке "отметка" значением "да"
//                 data[i]['отметка'] = 'да';
//             }

//             await new Promise(resolve => setTimeout(resolve, 15000)); // Задержка 15 секунд после каждого запроса
//         } catch (error) {
//             console.error(`Ошибка при обработке URL: ${url}`);
//             console.error(error.message);
//         }
//     }

//     // Сохранение изменений в новом файле excel
//     const updatedWorkbook = xlsx.utils.book_new();
//     xlsx.utils.book_append_sheet(updatedWorkbook, xlsx.utils.json_to_sheet(data), 'Sheet 1');
//     xlsx.writeFile(updatedWorkbook, './answers.xlsx');
// }

// start();




