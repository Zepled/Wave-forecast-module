const puppeteer = require('puppeteer');

async function fetchData() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://candhis.cerema.fr/_public_/campagne.php?Y2FtcD0wMTEwMQ==');

    // Cliquez sur le bouton pour afficher l'onglet "Temps réels"
    await page.click('#btn mb-1 btnMarge btn-secondary btn-sm mr-1 btn-responsive enCours'); // Remplacez par le sélecteur du bouton

    // Attendez que le contenu soit visible (ajustez le sélecteur si nécessaire)
    await page.waitForSelector('#table-warning text-center');

    // Extraire les données de l'onglet "Temps réels"
    const data = await page.evaluate(() => {
        const tableRows = document.querySelectorAll('#table-warning text-center table tbody tr');
        return Array.from(tableRows).map(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length < 8) return null;
            return {
                Date: cells[0]?.textContent.trim(),
                Heure: cells[1]?.textContent.trim(),
                "H1/3 (m)": cells[2]?.textContent.trim(),
                "Hmax (m)": cells[3]?.textContent.trim(),
                "Th1/3 (s)": cells[4]?.textContent.trim(),
                "Dir. au pic (°)": cells[5]?.textContent.trim(),
                "Etal. au pic (°)": cells[6]?.textContent.trim(),
                "Temp. mer (°C)": cells[7]?.textContent.trim()
            };
        }).filter(row => row !== null);
    });

    await browser.close();
    return data;
}

function getLastEntry(data) {
    return data.length > 0 ? data[data.length - 1] : null;
}

function displayTable(data) {
    console.table([data]); // wrap data in an array to display as a table
}

async function main() {
    const data = await fetchData();
    if (data) {
        const lastEntry = getLastEntry(data);
        if (lastEntry) {
            displayTable(lastEntry);
        } else {
            console.log('Aucune donnée disponible');
        }
    }
}

main();
