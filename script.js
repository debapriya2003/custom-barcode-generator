document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const barcodeType = document.getElementById('barcodeType');
    const barcodeValue = document.getElementById('barcodeValue');
    const barcodeText = document.getElementById('barcodeText');
    const barcodeWidth = document.getElementById('barcodeWidth');
    const barcodeHeight = document.getElementById('barcodeHeight');
    const barcodeColor = document.getElementById('barcodeColor');
    const barcodeBgColor = document.getElementById('barcodeBgColor');
    const textColor = document.getElementById('textColor');
    const fontSize = document.getElementById('fontSize');
    const showText = document.getElementById('showText');
    const addQuietZone = document.getElementById('addQuietZone');
    const generateBtn = document.getElementById('generateBtn');
    const downloadPngBtn = document.getElementById('downloadPngBtn');
    const downloadSvgBtn = document.getElementById('downloadSvgBtn');
    const savePresetBtn = document.getElementById('savePresetBtn');
    const themeToggle = document.getElementById('themeToggle');
    const widthValue = document.getElementById('widthValue');
    const heightValue = document.getElementById('heightValue');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const detailType = document.getElementById('detailType');
    const detailValue = document.getElementById('detailValue');
    const detailDimensions = document.getElementById('detailDimensions');
    const detailTime = document.getElementById('detailTime');
    const presetButtons = document.querySelectorAll('.btn-preset');

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Range value displays
    barcodeWidth.addEventListener('input', () => widthValue.textContent = barcodeWidth.value);
    barcodeHeight.addEventListener('input', () => heightValue.textContent = barcodeHeight.value);
    fontSize.addEventListener('input', () => fontSizeValue.textContent = fontSize.value);

    // Generate barcode on load
    generateBarcode();

    // Event listeners
    generateBtn.addEventListener('click', generateBarcode);
    downloadPngBtn.addEventListener('click', downloadAsPng);
    downloadSvgBtn.addEventListener('click', downloadAsSvg);
    savePresetBtn.addEventListener('click', saveCurrentAsPreset);

    presetButtons.forEach(button => {
        button.addEventListener('click', () => applyPreset(button.dataset.preset));
    });

    // Generate barcode
    function generateBarcode() {
        // Always ensure fresh SVG
        const barcodeContainer = document.getElementById('barcode');
        barcodeContainer.innerHTML = '<svg></svg>';

        const options = {
            format: barcodeType.value,
            width: parseFloat(barcodeWidth.value),
            height: parseInt(barcodeHeight.value),
            displayValue: showText.checked,
            text: barcodeText.value || undefined,
            fontOptions: 'bold',
            font: 'Arial',
            textAlign: 'center',
            textPosition: 'bottom',
            textMargin: 5,
            fontSize: parseInt(fontSize.value),
            background: barcodeBgColor.value,
            lineColor: barcodeColor.value,
            margin: addQuietZone.checked ? 10 : 0
        };

        try {
            JsBarcode('#barcode svg', barcodeValue.value, options);
            updateBarcodeDetails();

            // Change text color
            const svg = document.querySelector('#barcode svg');
            if (svg) {
                svg.querySelectorAll('text').forEach(text => {
                    text.setAttribute('fill', textColor.value);
                });
            }
        } catch (error) {
            alert('Error generating barcode: ' + error.message);
            console.error(error);
        }
    }

    // Update barcode details
    function updateBarcodeDetails() {
        detailType.textContent = barcodeType.value;
        detailValue.textContent = barcodeValue.value;

        const svg = document.querySelector('#barcode svg');
        if (svg) {
            const width = svg.getAttribute('width');
            const height = svg.getAttribute('height');
            detailDimensions.textContent = `${Math.round(width)}px × ${Math.round(height)}px`;
        }
        detailTime.textContent = new Date().toLocaleString();
    }

    // Download as PNG
    function downloadAsPng() {
        const svg = document.querySelector('#barcode svg');
        if (!svg) {
            alert('No barcode found to download');
            return;
        }

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = function () {
            canvas.width = this.naturalWidth;
            canvas.height = this.naturalHeight;

            // Fill background with selected color
            ctx.fillStyle = barcodeBgColor.value;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(this, 0, 0);

            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `barcode-${Date.now()}.png`;
                link.href = url;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 'image/png');
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }

    // Download as SVG
    function downloadAsSvg() {
        const svg = document.querySelector('#barcode svg');
        if (!svg) {
            alert('No barcode found to download');
            return;
        }

        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `barcode-${Date.now()}.svg`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Save current preset
    function saveCurrentAsPreset() {
        const presetName = prompt('Enter a name for this preset:');
        if (!presetName) return;
        const preset = {
            type: barcodeType.value,
            value: barcodeValue.value,
            text: barcodeText.value,
            width: barcodeWidth.value,
            height: barcodeHeight.value,
            color: barcodeColor.value,
            bgColor: barcodeBgColor.value,
            textColor: textColor.value,
            fontSize: fontSize.value,
            showText: showText.checked,
            quietZone: addQuietZone.checked
        };
        localStorage.setItem(`barcodePreset_${presetName}`, JSON.stringify(preset));
        alert(`Preset "${presetName}" saved successfully!`);
    }

    // Apply preset
    function applyPreset(presetName) {
        let preset;
        if (presetName === 'retail') {
            preset = { type: 'EAN13', value: '123456789012', text: 'PRODUCT-123', width: 2, height: 100, color: '#000000', bgColor: '#ffffff', textColor: '#000000', fontSize: 16, showText: true, quietZone: true };
        } else if (presetName === 'shipping') {
            preset = { type: 'CODE128', value: 'SHIP-' + Math.floor(Math.random() * 10000), text: '', width: 2.5, height: 80, color: '#0066cc', bgColor: '#ffffff', textColor: '#0066cc', fontSize: 14, showText: false, quietZone: true };
        } else if (presetName === 'inventory') {
            preset = { type: 'CODE39', value: 'INV-' + Math.floor(Math.random() * 1000), text: 'INVENTORY', width: 3, height: 120, color: '#333333', bgColor: '#f8f9fa', textColor: '#333333', fontSize: 18, showText: true, quietZone: false };
        } else {
            const data = localStorage.getItem(`barcodePreset_${presetName}`);
            if (!data) return alert(`Preset "${presetName}" not found!`);
            preset = JSON.parse(data);
        }
        barcodeType.value = preset.type;
        barcodeValue.value = preset.value;
        barcodeText.value = preset.text || '';
        barcodeWidth.value = preset.width;
        barcodeHeight.value = preset.height;
        barcodeColor.value = preset.color;
        barcodeBgColor.value = preset.bgColor;
        textColor.value = preset.textColor;
        fontSize.value = preset.fontSize;
        showText.checked = preset.showText;
        addQuietZone.checked = preset.quietZone;
        widthValue.textContent = preset.width;
        heightValue.textContent = preset.height;
        fontSizeValue.textContent = preset.fontSize;
        generateBarcode();
    }

    // Toggle theme
    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        themeToggle.querySelector('i').className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('themePreference', newTheme);
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('themePreference');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.querySelector('i').className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
});
