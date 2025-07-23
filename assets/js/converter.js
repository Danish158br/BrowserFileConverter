
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const textArea = document.getElementById('text-area');
    let currentFileContent = '';
    let currentFileName = 'converted';

    // Drag and Drop functionality
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            handleFile(fileInput.files[0]);
        }
    });

    const handleFile = (file) => {
        currentFileName = file.name.split('.').slice(0, -1).join('.');
        const reader = new FileReader();

        reader.onload = (e) => {
            textArea.value = e.target.result;
            currentFileContent = e.target.result;
        };
        reader.readAsText(file);
    };

    // Conversion functions
    

    document.getElementById('to-pdf').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text(currentFileContent, 10, 10);
        doc.save(`${currentFileName}.pdf`);
    });

    document.getElementById('to-md').addEventListener('click', () => {
        const blob = new Blob([currentFileContent], { type: 'text/markdown' });
        downloadBlob(blob, `${currentFileName}.md`);
    });

    document.getElementById('to-html').addEventListener('click', () => {
        const blob = new Blob([currentFileContent], { type: 'text/html' });
        downloadBlob(blob, `${currentFileName}.html`);
    });

    document.getElementById('to-json').addEventListener('click', () => {
        const json = JSON.stringify({ text: currentFileContent }, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        downloadBlob(blob, `${currentFileName}.json`);
    });

    document.getElementById('to-txt').addEventListener('click', () => {
        const blob = new Blob([currentFileContent], { type: 'text/plain' });
        downloadBlob(blob, `${currentFileName}.txt`);
    });

    const downloadBlob = (blob, name) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
});
