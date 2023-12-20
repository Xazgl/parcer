
const pageStasuses = [
    'Объявление снято с публикации',
    'Сохранить поиск',
    'Данное объявление больше не актуально',
    'Объявление неактивно',
    'Объявление не посмотреть',
    'Объявление снято с публикации',
    'Пользователь его удалил',
    'удалено',
    'удалил',
    'Объект продан',
    'объявление снято или устарело',
    'Такой страницы нe существует',
    'объявление удалено',
    'Объявление не посмотреть Пользователь его удалил',

]


const puppeteerExtra = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const xlsx = require('xlsx');

// Загрузка Puppeteer Extra и Puppeteer Stealth
puppeteerExtra.use(stealthPlugin());

// Чтение файла excel
const workbook = xlsx.readFile('./requests.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet);


// Функция для записи результатов в файл
function writeToExcel(data) {
    const updatedWorkbook = xlsx.utils.book_new();
    const updatedSheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(updatedWorkbook, updatedSheet, 'Sheet 1');
    xlsx.writeFile(updatedWorkbook, './answers.xlsx');
}

// async function start() {
//     const browser = await puppeteerExtra.launch();
//     const page = await browser.newPage();
//     page.setDefaultTimeout(10000);

//     for (let i = 0; i < data.length; i++) {
//         const url = data[i]['ссылки на объявления'];

//         try {
//             await page.goto(url, { waitUntil: 'domcontentloaded' });
//             await page.waitForTimeout(10000);

//             const pageSource = await page.content();

//             for (const status of pageStasuses) {
//                 if (pageSource.includes(status)) {
//                     data[i]['отметка'] = `${status}`;
//                     console.log(`${i}) Статус ошибки: ${status}. URL: ${url}`);
//                     break;
//                 } else {
//                     if (url.includes('avito')) {
//                         console.log(`Пошел блок для Авито по ${url}`);

//                         const breadcrumbElement = await page.$('.style-item-navigation-In5Jr');
//                         const lastBreadcrumbElement = await breadcrumbElement.$('.breadcrumbs-linkWrapper-jZP0j:last-child');
//                         const breadcrumbUrl = await lastBreadcrumbElement.$eval('a.breadcrumbs-link-Vr4Nc', link => link.getAttribute('href'));

//                         let targetUrl; // Объявляем переменную здесь

//                         if (breadcrumbUrl) {
//                             const addressElement = await page.$('div[itemprop="address"] span.style-item-address__string-wt61A');

//                             if (addressElement) {
//                                 const street = await page.$eval('div[itemprop="address"] span.style-item-address__string-wt61A', element => {
//                                     const addressString = element.textContent.trim();
//                                     const streetArray = addressString.split(',').map(item => item.trim());
//                                     return streetArray.length >= 3 ? streetArray[2] : null;
//                                 });

//                                 targetUrl = 'https://www.avito.ru' + breadcrumbUrl + `?q=${street}`;
//                                 console.log(`Ссылка по которой нужно пройти для списка: ${targetUrl}`);

//                                 await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
//                                 await page.waitForTimeout(10000);

//                                 const pageSource2 = await page.content();
//                                 const itemSelector = 'div[data-marker="catalog-serp"] div[data-marker="item"]';
//                                 const items = await page.$$(itemSelector);

//                                 let targetIndex = 0;
//                                 const match = url.match(/(\d+)$/);

//                                 for (let i = 0; i < items.length; i++) {
//                                     const itemElement = items[i];
//                                     const itemUrl = 'https://www.avito.ru' + (await page.evaluate(element => {
//                                         const linkElement = element.querySelector('a[itemprop="url"]');
//                                         return linkElement ? linkElement.getAttribute('href') : null;
//                                     }, itemElement));

//                                     console.log(`${i} - номер по счету в списке, ссылка объекта ${itemUrl} должна быть равна изначальной ${url} или ее последнему цифровому значению`)

//                                     if (itemUrl.includes(match[0])) {
//                                         targetIndex = i + 1;

//                                     }
//                                 }

//                                 if (targetIndex !== 0) {
//                                     console.log(`Объект с ${url}. В списке${targetUrl} находится на позиции ${targetIndex} в списке.`);
//                                     data[i]['отметка'] = `Объект с ${url}. В списке ${targetUrl} находится на позиции ${targetIndex} в списке.`;
//                                 } else {
//                                     console.log(`Объект с ${url}. В списке ${targetUrl} не найден в списке.`);
//                                     data[i]['отметка'] = `Объект с ${url}. В списке ${targetUrl} не найден в списке по поиску`;
//                                 }

//                                 break;

//                             } else {
//                                 console.log(`Элемент с адресом не найден на странице. Для ${url}`);
//                             }
//                         } else {
//                             console.log(`Элемент с адресом не найден на странице. Для ${url}`);
//                         }
//                     } else {
//                         console.log('Элемент с ссылкой не найден на странице.');
//                     }
//                 }
//             }

//             await page.waitForTimeout(15000);

//         } catch (error) {
//             console.error(`Ошибка при обработке URL: ${url}`);
//             console.error(error);
//         } finally {
//             // Закрытие текущей страницы после завершения итерации
//             await page.close();
//         }
//     }

//     await browser.close();

//     const updatedWorkbook = xlsx.utils.book_new();
//     xlsx.utils.book_append_sheet(updatedWorkbook, xlsx.utils.json_to_sheet(data), 'Sheet 1');
//     xlsx.writeFile(updatedWorkbook, './answers.xlsx');
// }

// start();


async function start() {
    // Запуск браузера с Puppeteer Extra
    const browser = await puppeteerExtra.launch();
    const page = await browser.newPage();
    page.setDefaultTimeout(10000);




    // Проход по каждой строке и проверка содержимого страницы
    for (let i = 0; i < data.length; i++) {
        // Получение ссылки из второй колонки
        const url = data[i]['ссылки на объявления'];
        const id = data[i]['id'];



        try {
            // Запрос страницы 
            const responsePage = await page.goto(url, { waitUntil: 'domcontentloaded' });
            if (responsePage.status() === 401) {
                console.log(`Страница не доступна (HTTP 401). URL: ${url}`);
                continue; // Skip the rest of the logic for this URL
            }
            // Задержка 10 секунд для загрузки страницы
            await new Promise(resolve => setTimeout(resolve, 10000));
            // Запрос страницы
            const pageSource = await page.content();
            let pageStatus = true;
            //Перебираем массив статусов страницы
            for (const status of pageStasuses) {
                if (pageSource.includes(status)) {
                    // Если текст найден, то отмечаем строку в новой колонке "отметка" значением "да"
                    data[i]['отметка'] = `${status}`;
                    console.log(`${i}) Статус ошибки: ${status}. URL: ${url}`);
                    pageStatus = false;
                    break;
                }

                if (!pageStatus) {
                    continue; // Move to the next URL if status found
                }

                if (pageStatus) {
                    //Ищем элемент на странице Avito
                    if (url.includes('avito')) {
                        console.log(`Пошел блок для Авито по  ${url} `)

                        //Получаю род элемент
                        const breadcrumbElement = await page.$('.style-item-navigation-In5Jr');
                        // breadcrumbElement? null: break;
                        const lastBreadcrumbElement = await page.$('.breadcrumbs-linkWrapper-jZP0j:last-child', breadcrumbElement);
                        //Получаю ссылку с ссылка -комнатная
                        const breadcrumbUrl = await page.evaluate(element => {
                            const linkElement = element.querySelector('a.breadcrumbs-link-Vr4Nc');
                            return linkElement ? linkElement.getAttribute('href') : null;
                        }, lastBreadcrumbElement);

                        // console.log(`${"https://www.avito.ru" + breadcrumbUrl} -- ссылка с страници на каталог. Для объекта ${url}`)


                        if (breadcrumbUrl) {
                            //Ищем улицу объекта
                            const addressElement = await page.$('div[itemprop="address"] span.style-item-address__string-wt61A');
                            // console.log(`Адресс элемент: ${addressElement}`);

                            //Проверяем, найден ли элемент
                            const street = await page.evaluate(element => {
                                const addressString = element.textContent.trim();
                                // Разделение строки адреса по запятой и взятие третьего элемента (улица)
                                const streetArray = addressString.split(',').map(item => item.trim());
                                return streetArray.length >= 3 ? streetArray[2] : null;
                            }, addressElement);
                            // console.log(`Улица: ${street} для ${url}`);

                            const targetUrl = 'https://www.avito.ru' + breadcrumbUrl + `?q=${street}`

                            console.log(`Ссылка по которой нужно пройти для списка: ${targetUrl}`);

                            //Ищем на новой странице список выданный объектов по адресу
                            await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

                            // Задержка 10 секунд для загрузки страницы
                            await new Promise(resolve => setTimeout(resolve, 10000));

                            // Запрос страницы
                            const pageSource2 = await page.content();

                            const itemSelector = 'div[data-marker="catalog-serp"] div[data-marker="item"]';
                            const items = await page.$$(itemSelector);

                            let targetIndex = 0;
                            const match = url.match(/(\d+)$/);
                            // console.log(`то что лежит в match ${match[0]}`);

                            for (let i = 0; i < items.length; i++) {
                                const itemElement = items[i];
                                const itemUrl = 'https://www.avito.ru' + (await page.evaluate(element => {
                                    const linkElement = element.querySelector('a[itemprop="url"]');
                                    return linkElement ? linkElement.getAttribute('href') : null;
                                }, itemElement));

                                console.log(`${i} - номер по счету в списке, ссылка объекта ${itemUrl} должна быть равна изначальной ${url} или ее последнем цифровому значению`)

                                if (itemUrl.includes(match[0])) {
                                    targetIndex = i + 1;
                                    break;
                                }
                            }

                            if (targetIndex !== 0) {
                                console.log(`Объект с ${url}. В списке${targetUrl} находится на позиции ${targetIndex} в списке.`);
                                data[i]['отметка'] = `Объект с ${url}.\n В списке ${targetUrl} находится на позиции ${targetIndex} в списке.`;
                                break;
                            } else {
                                console.log(`Объект с ${url}. В списке ${targetUrl} не найден в списке.`);
                                data[i]['отметка'] = `Объект с ${url}.\n В списке ${targetUrl} не найден в списке по поиску`;
                                break;
                            }



                        } else {
                            console.log(`Элемент с адресом не найден на странице.для ${url}`);
                        }


                    } else {
                        console.log('Элемент с ссылкой не на Avito.');
                    }
                }
            }

            writeToExcel(data);

            await new Promise(resolve => setTimeout(resolve, 15000)); // Задержка 15 секунд после каждого запроса

        } catch (error) {
            console.error(`Ошибка при обработке URL: ${url}`);
            console.error(error);
            data[i]['отметка'] = `Ошибка при обработке URL: ${url}. \n Код ошибки:${error}`;

        }

    }

    await browser.close();

    // Сохранение изменений в новом файле excel
    const updatedWorkbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(updatedWorkbook, xlsx.utils.json_to_sheet(data), 'Sheet 1');
    xlsx.writeFile(updatedWorkbook, './answers.xlsx');
}

start();

