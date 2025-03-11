document.addEventListener('DOMContentLoaded', function() {
    
    chrome.storage.local.get(['sourceCurrency', 'apiKey'], function(result) {
      if (result.sourceCurrency) {
        document.getElementById('sourceCurrency').value = result.sourceCurrency;
      }
      if (result.apiKey) {
        document.getElementById('apiKey').value = result.apiKey;
      }
    });


    document.getElementById('sourceCurrency').addEventListener('change', function() {
        chrome.storage.local.set({sourceCurrency: this.value});
      });
      
      document.getElementById('apiKey').addEventListener('change', function() {
        chrome.storage.local.set({apiKey: this.value});
    });


    document.getElementById('convertButton').addEventListener('click', function() {
        const sourceCurrency = document.getElementById('sourceCurrency').value;
        const apiKey = document.getElementById('apiKey').value;
        
        document.getElementById('status').textContent = 'Converting...';


        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'convert',
              sourceCurrency: sourceCurrency,
              apiKey: apiKey
            }, function(response) {
              if (response && response.success) {
                document.getElementById('status').textContent = 'Conversion complete!';
              } else {
                document.getElementById('status').textContent = 'Error: ' + (response ? response.error : 'Unknown error');
              }
            });
        });
    });


    
});