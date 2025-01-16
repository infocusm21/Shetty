// Google Sheets ID and API key
const SHEET_ID = '13CoG6Ljz3TYsn0JImXPcoJqCAgxZnco0Ldnr2lA0Ick';
const API_KEY = 'AIzaSyBwnJTt3tZV61gebywzYb8MIDk4CTcleHQ';
const range = 'Sheet1!A2:J';

// Fetch data from Google Sheets
async function fetchData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
        console.log("Error fetching data from Google Sheets.");
        alert("Error fetching data from Google Sheets.");
        return [];
    }
    const data = await response.json();
    console.log("Fetched data:", data.values); // Log fetched data
    return data.values || [];
}

// Format timestamp to "dd-mm-yyyy"
function formatDate(timestamp) {
    const dateObj = new Date(timestamp);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
}

// Extract file ID from Google Drive URL and convert to embed preview format
function getPreviewUrl(url) {
    const regex = /(?:id=|\/d\/)([\w-]+)/;
    const match = url.match(regex);
    if (match) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return '';
}

// Extract image ID from Google Drive URL and convert to display format
function getImageId(url) {
    const regex = /(?:id=|\/d\/)([\w-]+)/;
    const match = url.match(regex);
    if (match) {
        return match[1];
    }
    return '';
}

// Open a new page to display all images
function openImagePage(images) {
    console.log("Opening image page with images:", images);
    const newWindow = window.open();
    newWindow.document.write('<html><head><title>Property Images</title></head><body style="font-family: Arial, sans-serif;">');
    newWindow.document.write('<h1 style="text-align: center; margin-bottom: 20px;">Property Images</h1>');
    images.forEach((url, index) => {
        const media = `<img style="width: 100%; margin-bottom: 20px;" src="${url}" alt="Image ${index + 1}">`;
        newWindow.document.write(`<div>${media}</div>`);
    });
    newWindow.document.write('</body></html>');
    newWindow.document.close();
}

// Open a new page to display all files (Images and Videos in row 9)
function openAllFilesPage(files) {
    console.log("Opening all files page with files:", files);
    const newWindow = window.open();
    newWindow.document.write('<html><head><title>All Files</title><style>');
    newWindow.document.write('body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f7f7f7; }');
    newWindow.document.write('.grid-container { display: grid; gap: 20px; }');
    newWindow.document.write('@media (min-width: 768px) { .grid-container { grid-template-columns: repeat(2, 1fr); } }');
    newWindow.document.write('@media (max-width: 768px) { .grid-container { grid-template-columns: repeat(1, 1fr); } }');
    newWindow.document.write('iframe { width: 100%; height: 300px; border: none; }');
    newWindow.document.write('</style></head><body>');
    newWindow.document.write('<h1 style="text-align: center; margin-bottom: 20px;">All Files</h1>');
    newWindow.document.write('<div class="grid-container">');

    files.forEach((url) => {
        const previewUrl = getPreviewUrl(url);
        if (previewUrl) {
            newWindow.document.write(`<iframe src="${previewUrl}"></iframe>`);
        }
    });

    newWindow.document.write('</div></body></html>');
    newWindow.document.close();
}

// Display property data
function displayProperties(data) {
    const container = document.getElementById("container");
    container.innerHTML = "";

    // Sort rows by latest timestamp (assuming timestamp is in row[0])
    const sortedData = data.sort((a, b) => new Date(b[0]) - new Date(a[0]));

    // Filter rows by "50 L to 1 Crore" price range
    const filteredData = sortedData.filter(row => row[6] && row[6].includes('Factory/Sheds'));
    console.log("Filtered data for '50 L to 1 Crore':", filteredData);

    if (filteredData.length === 0) {
        container.innerHTML = '<div class="text-center">No properties available or end of the page.</div>';
        return;
    }

    filteredData.forEach(row => {
        const imageUrls = row[9] ? row[9].split(",").map(url => `https://lh3.googleusercontent.com/d/${getImageId(url)}`) : [];
        const fileUrls = row[9] ? row[9].split(",").map(url => url.trim()) : [];

        const propertyDetails = {
            propertyName: row[1],
            price: row[7],
            address: row[4],
            siteDetails: row[8],
            
            images: imageUrls,
            files: fileUrls
        };

        console.log("Rendering property:", propertyDetails);

        const propertyBox = document.createElement("div");
        propertyBox.classList.add("property-box", "col-12");

        let currentImageIndex = 0;
        const imageElement = document.createElement("img");
        imageElement.src = imageUrls[0];
        imageElement.style.pointerEvents = "none"; // Prevent pointer interactions
        if (imageUrls.length > 1) {
            setInterval(() => {
                currentImageIndex = (currentImageIndex + 1) % imageUrls.length;
                imageElement.src = imageUrls[currentImageIndex];
            }, 3000); // Auto-slide every 3 seconds
        }

        propertyBox.innerHTML = `
            <div class="left-side"></div>
            <div class="right-side">
                <h1 style="font-weight: bold; font-size: 35px;">${propertyDetails.propertyName}</h1>                
                <div class="detail-row"><span class="title" style="font-weight: bold; font-size: 20px;">Price :</span><span class="value" style="font-weight: bold; font-size: 30px;">${propertyDetails.price}</span></div>
                <div class="detail-row"><span class="title">Address:</span><span class="value">${propertyDetails.address}</span></div>
                <div class="detail-row"><span class="title" style="font-weight: bold; font-size: 15px;">Site Details:</span><span class="value" style="font-weight: normal; font-size: 22px;">${propertyDetails.siteDetails}</span></div>
                
                <div class="detail-row"><span class="title"><br>Contact:</br></span><span class="value"><br>Nagaraja Shetty </br>63621 87521</span></div>
                
                <div class="detail-row">
                    <button class="btn btn-info" onclick='openImagePage(${JSON.stringify(imageUrls)})'>View Photos</button>
                </div>
                <div class="detail-row">
                    <button class="btn btn-secondary" onclick='openAllFilesPage(${JSON.stringify(fileUrls)})'>View All Files</button>
                </div>
                <div class="detail-row">
                    <button class="btn btn-success" onclick='shareProperty(${JSON.stringify(propertyDetails)})'>Share</button>
                </div>
            </div>
        `;

        propertyBox.querySelector(".left-side").appendChild(imageElement);
        container.appendChild(propertyBox);
    });
}

// Share property data
function shareProperty(details) {
    const shareData = {
        title: "Property Details",
        text: `Property Name:   ${details.propertyName}\nPrice:                    ${details.price}\nAddress:               ${details.address}\nSite Details:          ${details.siteDetails}\n\n\nContact: Nagaraja Shetty, 63621 87521 \n\nPhotos: \n${details.images.join("\n\n ")}\n\n${details.mapAddress ? `View Map: ${details.mapAddress}\n` : ""}`,
        url: window.location.href
    };

    navigator.share ? navigator.share(shareData).then(() => console.log("Property shared successfully.")).catch(error => console.log("Sharing failed:", error)) : alert("Sharing not supported in this browser.");
}

// Initialize app
async function init() {
    const data = await fetchData();
    displayProperties(data);
}

init();
