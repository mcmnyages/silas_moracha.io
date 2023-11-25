<script src="https://cdn.jsdelivr.net/gh/davidshimjs/qrcodejs/qrcode.min.js"></script>

// JavaScript to generate QR code with image at the center
<script>
  var websiteURL = "https://mcmnyages.github.io/silas_moracha.io"; // Replace with your website URL
  var qrCode = new QRCode(document.getElementById("qrcode"), {
    width: 200,
    height: 200
  });

  // Generate the QR code
  qrCode.makeCode(websiteURL);

  // Add an image at the center of the QR code
  var img = document.createElement("img");
  img.src = "your-image-url.png"; // Replace with the URL of your desired image
  img.onload = function() {
    var canvas = document.querySelector('canvas');
    var context = canvas.getContext('2d');
    var size = 50; // Size of the image
    context.drawImage(img, (canvas.width - size) / 2, (canvas.height - size) / 2, size, size);
  }
</script>
