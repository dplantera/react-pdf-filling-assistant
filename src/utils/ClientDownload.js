class LinkDownload {
    constructor(settings) {
        this.settings = {...{dataType: "text/csv", encoding: "utf-8"}, ...settings}
        this.dataMetaString = `data:${this.settings.dataType};charset=${this.settings.dataType},`;
    }

    download(data, fileName){
        const encodedUri = encodeURIComponent(data);
        const link = document.createElement("a");
        link.setAttribute("href", this.dataMetaString + encodedUri);
        link.setAttribute("download", fileName);
        document.body.appendChild(link); // Required for FF
        link.click();
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
        this.downloadMethod.download(universalBOM + csvContent, fileName + ".csv");
    }
}

export class ClientDownload {
    get forCsv () { return new CsvDownload()}
}