// Google Sheets ID and API key
const SHEET_ID = '13CoG6Ljz3TYsn0JImXPcoJqCAgxZnco0Ldnr2lA0Ick';
const API_KEY = 'AIzaSyBwnJTt3tZV61gebywzYb8MIDk4CTcleHQ';
const range = 'Sheet1!A2:J';

// Fetch data from Google Sheets
async function fetchData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
        alert("Error fetching data from Google Sheets.");
        return [];
    }
    const data = await response.json();
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
    const newWindow = window.open();
    newWindow.document.write('<html><head><title>Property Images</title></head><body style="font-family: Arial, sans-serif;">');
    newWindow.document.write('<h1 style="text-align: center; margin-bottom: 20px;">Property Images</h1>');
    images.forEach((url, index) => {
        const isVideo = url.endsWith(".mp4") || url.endsWith(".avi");
        const media = isVideo
            ? `<video controls style="width: 100%; margin-bottom: 20px;" src="${url}"></video>`
            : `<img style="width: 100%; margin-bottom: 20px;" src="${url}" alt="Image ${index + 1}">`;
        newWindow.document.write(`<div>${media}</div>`);
    });
    newWindow.document.write('</body></html>');
    newWindow.document.close();
}

// Open a new page to display all videos
function openVideoPage(videos) {
    const newWindow = window.open();
    newWindow.document.write('<html><head><title>Property Videos</title></head><body style="font-family: Arial, sans-serif;">');
    newWindow.document.write('<h1 style="text-align: center; margin-bottom: 20px;">Property Videos</h1>');
    videos.forEach((url, index) => {
        newWindow.document.write(`<div><video controls style="width: 100%; margin-bottom: 20px;" src="${url}"></video></div>`);
    });
    newWindow.document.write('</body></html>');
    newWindow.document.close();
}

// Open a new page to display all PDFs
function openPDFPage(pdfs) {
    const newWindow = window.open();
    newWindow.document.write('<html><head><title>Property PDFs</title></head><body style="font-family: Arial, sans-serif;">');
    newWindow.document.write('<h1 style="text-align: center; margin-bottom: 20px;">Property PDFs</h1>');
    pdfs.forEach((url, index) => {
        newWindow.document.write(`<div><iframe src="${url}" style="width: 100%; height: 600px; margin-bottom: 20px;"></iframe></div>`);
    });
    newWindow.document.write('</body></html>');
    newWindow.document.close();
}

// Display property data
function displayProperties(data) {
    const container = document.getElementById("container");
    container.innerHTML = "";

    // Filter rows by "50 L to 1 Crore" price range
    const filteredData = data.filter(row => row[6] && row[6].includes('50 L to  1 Crore'));

    if (filteredData.length === 0) {
        container.innerHTML = '<div class="text-center">No properties available or end of the page.</div>';
        return;
    }

    filteredData.forEach(row => {
        const imageUrls = row[9] ? row[9].split(",").map(url => `https://lh3.googleusercontent.com/d/${getImageId(url)}`) : [];
        const videoUrls = row[10] ? row[10].split(",").map(url => url.trim()) : []; // Assuming column 10 for video URLs
        const pdfUrls = row[11] ? row[11].split(",").map(url => url.trim()) : []; // Assuming column 11 for PDF URLs

        const propertyDetails = {
            propertyName: row[1],
            price: row[7],
            address: row[4],
            siteDetails: row[8],
            brokerName: row[2],
            mapAddress: row[5],
            images: imageUrls,
            videos: videoUrls,
            pdfs: pdfUrls
        };

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

        // Build the buttons based on the presence of videos and PDFs
        let videoButton = '';
        let pdfButton = '';

        if (videoUrls.length > 0) {
            videoButton = `<button class="btn btn-warning" onclick='openVideoPage(${JSON.stringify(videoUrls)})'>View Video</button>`;
        }

        if (pdfUrls.length > 0) {
            pdfButton = `<button class="btn btn-danger" onclick='openPDFPage(${JSON.stringify(pdfUrls)})'>View PDF</button>`;
        }

        propertyBox.innerHTML = `
            <div class="left-side"></div>
            <div class="right-side">
                <h1 style="font-weight: bold; font-size: 35px;">${propertyDetails.propertyName}</h1>                
                <div class="detail-row"><span class="title" style="font-weight: bold; font-size: 15px;">Price:</span><span class="value" style="font-weight: bold; font-size: 15px;">${propertyDetails.price}</span></div>
                <div class="detail-row"><span class="title">Address:</span><span class="value">${propertyDetails.address}</span></div>
                <div class="detail-row"><span class="title">Site Details:</span><span class="value">${propertyDetails.siteDetails}</span></div>
                <div class="detail-row"><span class="title" style="font-weight: bold; font-size: 15px;">Broker Name:</span><span class="value" style="font-weight: bold; font-size: 15px;">${propertyDetails.brokerName}</span></div>
                <div class="detail-row"><span class="title">Contact:</span><span class="value">Nagaraja Sheety 6362187521</span></div>
                ${propertyDetails.mapAddress ? `<div class="detail-row">
                    <a href="${propertyDetails.mapAddress}" target="_blank" class="btn btn-primary glow-button">View on Map</a>
                </div>` : ""}
                <div class="detail-row">
                    <button class="btn btn-info" onclick='openImagePage(${JSON.stringify(imageUrls)})'>View Photos</button>
                </div>
                ${videoButton ? `<div class="detail-row">${videoButton}</div>` : ''}
                ${pdfButton ? `<div class="detail-row">${pdfButton}</div>` : ''}
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
        text: `Property Name: ${details.propertyName}\nPrice: ${details.price}\nAddress: ${details.address}\nSite Details: ${details.siteDetails}\nBroker Name: ${details.brokerName}\nImages: ${details.images.join(", ")}\n${details.mapAddress ? `View Map: ${details.mapAddress}` : ""}`,
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData).catch(err => console.error("Error sharing", err));
    } else {
        alert("Sharing is not supported on this browser.");
    }
}

// Initialize
fetchData().then(data => displayProperties(data));
