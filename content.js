(function() {

    let originalValues = [];


    const fallbackRates = {
        USD: 18.50, // 1 USD = 18.50 ZAR (example rate)
        EUR: 20.10, // 1 EUR = 20.10 ZAR (example rate)
        GBP: 23.80, // 1 GBP = 23.80 ZAR (example rate)
        JPY: 0.12,  // 1 JPY = 0.12 ZAR (example rate)
        AUD: 12.30, // 1 AUD = 12.30 ZAR (example rate)
        CAD: 13.70, // 1 CAD = 13.70 ZAR (example rate)
        CNY: 2.55   // 1 CNY = 2.55 ZAR (example rate)
    };


    const currencyPatterns = {
        USD: {symbol: '$', regex: /\$\s?[\d,]+(\.\d{1,2})?/g},
        EUR: {symbol: '€', regex: /€\s?[\d,]+(\.\d{1,2})?|[\d,]+(\.\d{1,2})?\s?€/g},
        GBP: {symbol: '£', regex: /£\s?[\d,]+(\.\d{1,2})?/g},
        JPY: {symbol: '¥', regex: /¥\s?[\d,]+|[\d,]+\s?¥/g},
        AUD: {symbol: 'AU$', regex: /AU\$\s?[\d,]+(\.\d{1,2})?/g},
        CAD: {symbol: 'CA$', regex: /CA\$\s?[\d,]+(\.\d{1,2})?/g},
        CNY: {symbol: '¥', regex: /¥\s?[\d,]+|[\d,]+\s?¥/g}
    };


    async function getExchangeRate(sourceCurrency, apiKey) {
        if (!apiKey) {
          return fallbackRates[sourceCurrency] || 1;
        }

        try {
            // Example API call - replace with your preferred currency API
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${sourceCurrency}?key=${apiKey}`);
            const data = await response.json();
            
            if (data && data.rates && data.rates.ZAR) {
              return data.rates.ZAR;
            } else {
              console.error('Failed to get exchange rate from API, using fallback rate');
              return fallbackRates[sourceCurrency] || 1;
            }
          } catch (error) {
            console.error('Error fetching exchange rate:', error);
            return fallbackRates[sourceCurrency] || 1;
        }
    }


    function extractNumber(str, currencyCode) {
        let num = str.replace(currencyPatterns[currencyCode].symbol, '')
                    .replace(/,/g, '')
                    .trim();
        return parseFloat(num);
    }


    function formatNumberWithSpaces(num) {
        let [integerPart, decimalPart] = num.toString().split('.'); 
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " "); 
        return decimalPart ? integerPart + '.' + decimalPart : integerPart;
    }


    async function convertCurrencies(sourceCurrency, apiKey) {
        
        restoreOriginalValues();
        originalValues = [];
        
        
        const exchangeRate = await getExchangeRate(sourceCurrency, apiKey);
        
        const pattern = currencyPatterns[sourceCurrency].regex;
        const textNodes = getTextNodes(document.body);
        
        
        textNodes.forEach(node => {
          const originalText = node.nodeValue;
          if (pattern.test(originalText)) {
            const newText = originalText.replace(pattern, match => {
              const numValue = extractNumber(match, sourceCurrency);
              const zarValue = (numValue * exchangeRate).toFixed(2);
            
              const formattedZarValue = formatNumberWithSpaces(zarValue);
              return `R${formattedZarValue} (${match})`;
            });
            
            if (originalText !== newText) {
              originalValues.push({
                node: node,
                originalValue: originalText
              });
              node.nodeValue = newText;
            }
          }
        });
        
        return originalValues.length;
    }


    function getTextNodes(node) {
        let textNodes = [];
        
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== '') {
          textNodes.push(node);
        } else {
          const children = node.childNodes;
          for (let i = 0; i < children.length; i++) {
            textNodes = textNodes.concat(getTextNodes(children[i]));
          }
        }
        
        return textNodes;
    }


    function restoreOriginalValues() {
        originalValues.forEach(item => {
          item.node.nodeValue = item.originalValue;
        });
        
        return originalValues.length;
    }


   
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    
    if (request.action === 'convert') {
      convertCurrencies(request.sourceCurrency, request.apiKey)
        .then(count => {
          sendResponse({success: true, count: count});
        })
        .catch(error => {
          sendResponse({success: false, error: error.message});
        });
      return true;

    } else if (request.action === 'restore') {
      const count = restoreOriginalValues();
      sendResponse({success: true, count: count});
    }

  });
  
})();