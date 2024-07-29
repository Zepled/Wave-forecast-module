const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

async function fetchData() {
    try {
        const response = await axios.get('https://candhis.cerema.fr/_public_/campagne.php?Y2FtcD0wMTEwMQ==');
        const contentType = response.headers['content-type'];

        if (contentType.includes('text/html')) {
            const dom = new JSDOM(response.data);
            const document = dom.window.document;
            const tableRows = document.querySelectorAll('table tbody tr');
            
            const data = [...tableRows].map(row => {
                const cells = row.querySelectorAll('td');
                
                // Assurez-vous que nous avons assez de cellules avant d'essayer d'accéder à leurs propriétés
                if (cells.length < 8) {
                    return null;
                }

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
            }).filter(row => row !== null); // Filtrer les lignes invalides

            return data;
        } else {
            throw new Error('Format de réponse non supporté : ' + contentType);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
    }
}

function displayTable(data) {
    console.table(data);
}

async function main() {
    const data = await fetchData();
    if (data) {
        displayTable(data);
    }
}

main();
