document.getElementById('exportLeads').addEventListener('click', () => {
    const startPage = parseInt(document.getElementById('startPage').value, 10);
    const endPage = parseInt(document.getElementById('endPage').value, 10);

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            function: scrapeLeads,
            args: [startPage, endPage]
        });
    });
});

function scrapeLeads(startPage, endPage) {
    let currentPage = startPage; // Initialize with start page
    let allLeads = []; // Array to hold all leads scraped across pages

    // Create and add loading spinner to the document
    const spinner = document.createElement('div');
    spinner.id = 'loadingSpinner';
    spinner.style.position = 'fixed';
    spinner.style.top = '50%';
    spinner.style.left = '50%';
    spinner.style.transform = 'translate(-50%, -50%)';
    spinner.style.zIndex = '9999';
    spinner.style.border = '16px solid #f3f3f3';
    spinner.style.borderRadius = '50%';
    spinner.style.borderTop = '16px solid #3498db';
    spinner.style.width = '120px';
    spinner.style.height = '120px';
    spinner.style.animation = 'spin 2s linear infinite';
    document.body.appendChild(spinner);
    
    // Add keyframes for spinner animation
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    function scrapeDataFromPage() {
        let leads = [];
        const nameElements = document.querySelectorAll('.entity-result__title-text a span[aria-hidden="true"]');
        const jobElements = document.querySelectorAll('.entity-result__primary-subtitle');
        const currentWorkingElements = document.querySelectorAll('.entity-result__summary');
        const locationElement = document.querySelectorAll('.entity-result__secondary-subtitle');
        

        nameElements.forEach((nameElement, index) => {
            let name = nameElement ? nameElement.textContent.trim() : 'N/A';
            let skills = jobElements[index] ? jobElements[index].textContent.trim() : 'N/A';
            let currentWorking=currentWorkingElements[index] ?currentWorkingElements[index].textContent.trim():'N/A'
            let location = locationElement[index] ? locationElement[index].textContent.trim() : 'N/A';

            leads.push({
                name: name,
                skills: skills,
                currentWorking:currentWorking,
                location
            });
        });

        console.log(`Scraped ${leads.length} leads from page ${currentPage}`);
        allLeads.push(...leads); // Aggregate leads.

        loadNextPage(); // Changed to always attempt to load the next page
    }

    function loadNextPage() {
        if (currentPage < endPage) {
            let nextPageButton = document.querySelector('button[aria-label="Next"], a[aria-label="Next"]');
            if (nextPageButton) {
                currentPage++;
                console.log(`Moving to page ${currentPage}`);
                nextPageButton.click();
                waitForContentLoad(scrapeDataFromPage);
            } else {
                console.log("Next page button not found, sending data to background.");
                sendMessageToBackground(allLeads); // Send all aggregated leads to background when no more pages are found.
            }
        } else {
            console.log("Reached end page, sending data to background.");
            sendMessageToBackground(allLeads); // Send all aggregated leads to background when end page is reached.
        }
    }

    function waitForContentLoad(callback) {
        setTimeout(callback, 3000); // Waits for content to load after clicking next page
    }

    function sendMessageToBackground(leads) {
        console.log("Sending message to background with leads data:", leads);
        // Hide loading spinner
        spinner.style.display = 'none';
        
        // Create and add download button
        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Download Leads';
        downloadButton.style.position = 'fixed';
        downloadButton.style.bottom = '20px';
        downloadButton.style.right = '20px';
        downloadButton.style.zIndex = '9999';
        document.body.appendChild(downloadButton);
        
        downloadButton.addEventListener('click', () => {
            const csvContent = "data:text/csv;charset=utf-8," + 
                leads.map(e => e.name + ',' + e.skills + ',' + currentWorking + ',' + location).join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', 'leads.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
        
        try {
            chrome.runtime.sendMessage({ type: "exportLeads", data: leads }, response => {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message to background:", chrome.runtime.lastError);
                } else {
                    console.log("Message sent successfully:", response);
                }
            });
        } catch (error) {
            console.error("Error sending message to background:", error);
        }
    }

    // Start scraping and show loading spinner
    spinner.style.display = 'block';
    scrapeDataFromPage();
}
