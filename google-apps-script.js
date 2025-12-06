/**
 * Google Apps Script for MJTS Contact Form
 * 
 * Instructions:
 * 1. Go to https://script.google.com
 * 2. Create a new project
 * 3. Paste this code
 * 4. Create a Google Sheet to store form submissions
 * 5. Update the SPREADSHEET_ID below with your sheet's ID
 * 6. Deploy as a web app with:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 7. Copy the web app URL and update it in script.js
 */

// Replace with your Google Sheet ID (found in the sheet URL)
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';

// Cloudflare Turnstile secret key (get from Cloudflare dashboard)
const TURNSTILE_SECRET_KEY = 'YOUR_TURNSTILE_SECRET_KEY';

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Verify Turnstile token
    const turnstileValid = verifyTurnstileToken(data.turnstileToken);
    
    if (!turnstileValid) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Turnstile verification failed'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Open the spreadsheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    
    // If this is the first row, add headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Message']);
    }
    
    // Append the form data
    sheet.appendRow([
      new Date(),
      data.name,
      data.email,
      data.phone,
      data.message
    ]);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Form submitted successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function verifyTurnstileToken(token) {
  if (!token) {
    return false;
  }
  
  try {
    const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const payload = {
      'secret': TURNSTILE_SECRET_KEY,
      'response': token
    };
    
    const options = {
      'method': 'post',
      'payload': payload
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    
    return result.success === true;
  } catch (error) {
    Logger.log('Turnstile verification error: ' + error);
    return false;
  }
}

// Test function (optional - for testing the script)
function test() {
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '123-456-7890',
    message: 'This is a test message',
    turnstileToken: 'test-token'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}

