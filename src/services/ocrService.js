// OCR Service for receipt processing
// This is a mock implementation - in a real app, you'd integrate with Tesseract.js or a cloud OCR service

export const processReceiptOCR = async (file) => {
  // Simulate OCR processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock OCR results based on file name or content
  const mockResults = {
    amount: Math.floor(Math.random() * 500) + 50,
    description: 'Business meal expense',
    category: 'Meals',
    date: new Date().toISOString().split('T')[0],
    currency: 'USD',
    merchant: 'Restaurant ABC'
  };

  // Simulate different results based on file name
  if (file.name.toLowerCase().includes('travel')) {
    mockResults.description = 'Travel expense';
    mockResults.category = 'Travel';
    mockResults.amount = Math.floor(Math.random() * 1000) + 200;
  } else if (file.name.toLowerCase().includes('office')) {
    mockResults.description = 'Office supplies purchase';
    mockResults.category = 'Office Supplies';
    mockResults.amount = Math.floor(Math.random() * 200) + 20;
  } else if (file.name.toLowerCase().includes('transport')) {
    mockResults.description = 'Transportation expense';
    mockResults.category = 'Transportation';
    mockResults.amount = Math.floor(Math.random() * 100) + 10;
  }

  return {
    success: true,
    data: mockResults,
    confidence: Math.floor(Math.random() * 30) + 70 // 70-100% confidence
  };
};

// Real OCR implementation using Tesseract.js (commented out for now)
/*
import Tesseract from 'tesseract.js';

export const processReceiptOCR = async (file) => {
  try {
    const { data: { text } } = await Tesseract.recognize(file, 'eng', {
      logger: m => console.log(m)
    });

    // Parse the OCR text to extract expense information
    const amountMatch = text.match(/\$?(\d+\.?\d*)/g);
    const amount = amountMatch ? parseFloat(amountMatch[0].replace('$', '')) : null;

    // Extract date patterns
    const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g);
    const date = dateMatch ? new Date(dateMatch[0]).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    // Extract merchant name (usually the first line or after "at")
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const merchant = lines[0] || 'Unknown Merchant';

    // Determine category based on keywords
    let category = 'Other';
    const lowerText = text.toLowerCase();
    if (lowerText.includes('restaurant') || lowerText.includes('food') || lowerText.includes('meal')) {
      category = 'Meals';
    } else if (lowerText.includes('hotel') || lowerText.includes('accommodation')) {
      category = 'Accommodation';
    } else if (lowerText.includes('taxi') || lowerText.includes('uber') || lowerText.includes('transport')) {
      category = 'Transportation';
    } else if (lowerText.includes('office') || lowerText.includes('supplies')) {
      category = 'Office Supplies';
    }

    return {
      success: true,
      data: {
        amount,
        description: `${category} expense at ${merchant}`,
        category,
        date,
        currency: 'USD',
        merchant
      },
      confidence: 85
    };
  } catch (error) {
    console.error('OCR processing failed:', error);
    return {
      success: false,
      error: 'Failed to process receipt image'
    };
  }
};
*/
