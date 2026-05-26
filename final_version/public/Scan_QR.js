    let scanner = new Instascan.Scanner({ video: document.getElementById('qr-reader') });

    scanner.addListener('scan', function (content) {
      alert('Scanned QR code: ' + content);
    });

    $('#btn-scan').click(function() {
      Instascan.Camera.getCameras().then(function (cameras) {
        if (cameras.length > 0) {
          scanner.start(cameras[0]); 
        } else {
          alert('No cameras found.');
        }
      }).catch(function (e) {
        alert('Error: ' + e);
      });
    });