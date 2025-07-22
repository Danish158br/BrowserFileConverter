
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

        if (file.type === "application/pdf") {
            reader.onload = (e) => {
                const { pdfjsLib } = window;
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;
                pdfjsLib.getDocument({ data: e.target.result }).promise.then(pdf => {
                    let text = '';
                    const numPages = pdf.numPages;
                    const promises = [];
                    for (let i = 1; i <= numPages; i++) {
                        promises.push(pdf.getPage(i).then(page => page.getTextContent()));
                    }
                    return Promise.all(promises).then(contents => {
                        contents.forEach(content => {
                            content.items.forEach(item => {
                                text += item.str + ' ';
                            });
                            text += '\n';
                        });
                        textArea.value = text;
                        currentFileContent = text;
                    });
                });
            };
            reader.readAsArrayBuffer(file);
        } else if (file.name.endsWith('.docx')) {
            reader.onload = (e) => {
                mammoth.extractRawText({ arrayBuffer: e.target.result })
                    .then(result => {
                        textArea.value = result.value;
                        currentFileContent = result.value;
                    })
                    .catch(err => console.log(err));
            };
            reader.readAsArrayBuffer(file);
        } else {
            reader.onload = (e) => {
                textArea.value = e.target.result;
                currentFileContent = e.target.result;
            };
            reader.readAsText(file);
        }
    };

    // Conversion functions
    document.getElementById('to-docx').addEventListener('click', () => {
        // Note: Creating DOCX client-side is complex. This is a simplified text-in-docx.
        // For a real implementation, a library like docx.js would be needed.
        const blob = new Blob([currentFileContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        downloadBlob(blob, `${currentFileName}.docx`);
    });

    document.getElementById('to-pdf').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text(currentFileContent, 10, 10);
        doc.save(`${currentFileName}.pdf`);
    });

    document.getElementById('to-md').addEventListener('click', () => {
        const turndownService = new TurndownService();
        const markdown = turndownService.turndown(currentFileContent);
        const blob = new Blob([markdown], { type: 'text/markdown' });
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

    const downloadBlob = (blob, name) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
});
