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

});