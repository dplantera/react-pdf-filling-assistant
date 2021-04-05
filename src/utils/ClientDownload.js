class LinkDownload {
    constructor(settings) {
        this.settings = {...{dataType: "text/csv", encoding: "utf-8"}, ...settings}
        this.dataMetaString = `data:${this.settings.dataType};charset=${this.settings.dataType},`;
    }

    download(data, fileName){
        const blob = new Blob([data], { type: this.dataMetaString });
        const encodedUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href",  encodedUrl);
        link.setAttribute("download", fileName);
        document.body.appendChild(link); // Required for FF
        link.click();// Required for FF
        link.remove();
    }
}

class CsvDownload {
    constructor() {
        this.separator_default = ";";
        this.settings = {separator: this.separator_default};
        this.downloadMethod = new LinkDownload();
    }

    download(rows, fileName, {settings = this.settings} = {}){
        let csvContent = rows.map(e => e.join(settings.separator)).join("\n");
        let universalBOM = "\uFEFF";
        const fileNameTarget = fileName.endsWith(".csv")? fileName: fileName + ".csv";
        this.downloadMethod.download(universalBOM + csvContent, fileNameTarget);
    }
}

export class ClientDownload {
    get forCsv () { return new CsvDownload()}
}