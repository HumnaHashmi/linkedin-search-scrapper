chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received message:", message);

    if (message.type === "exportLeads" && Array.isArray(message.data) && message.data.length > 0) {
        console.log("Processing exportLeads message with data:", message.data);

        const csvData = convertToCSV(message.data);
        console.log("CSV Data generated:", csvData);

        // Convert the CSV data to a Data URI
        const dataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvData)}`;

        chrome.downloads.download({
            url: dataUri,
            filename: 'linkedin-sales-navigator-leads.csv',
            saveAs: true
        }, downloadId => {
            if (downloadId) {
                console.log(`Download initiated successfully with ID: ${downloadId}`);
            } else if (chrome.runtime.lastError) {
                console.error("Failed to initiate download:", chrome.runtime.lastError.message);
            }
        });
    } else {
        console.error("Message did not meet criteria for processing:", message);
    }
});

function convertToCSV(arr) {
    if (!arr.length) {
        console.error("Array is empty, cannot convert to CSV.");
        return '';
    }

    if (typeof arr[0] !== 'object' || arr[0] === null || !Object.keys(arr[0]).length) {
        console.error("First item in array is not an object or is missing properties", arr[0]);
        return '';
    }

    const headers = Object.keys(arr[0]);
    const rows = arr.map(obj => headers.map(header => `"${String(obj[header]).replace(/"/g, '""')}"`).join(','));
    return [headers.join(',')].concat(rows).join('\n');
}
