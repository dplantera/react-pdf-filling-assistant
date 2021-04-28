class LinkDownload {
    static get SETTINGS_DEFAULT() {
        return {dataType: "text/plain", encoding: "utf-8", useBOM: false};
    }

    constructor(settings = LinkDownload.SETTINGS_DEFAULT) {
        this.changeSettings(settings);
        this.settings = settings;
    }

    download(data, fileName) {
        const blob = new Blob([data], {type: this.dataMetaString});
        const encodedUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        console.log({encodedUrl, settings: this.settings, metaString: this.dataMetaString})
        link.setAttribute("href", encodedUrl);
        link.setAttribute("download", fileName);
        document.body.appendChild(link); // Required for FF
        link.click();// Required for FF
        link.remove();
    }

    get dataMetaString() {
        return `data:${this.settings.dataType};charset=${this.settings.encoding},`;
    }

    changeSettings(settings = {}) {
        if (!this.settings)
            this.settings = LinkDownload.SETTINGS_DEFAULT;

        const newSettings = {
            ...this.settings,
            ...settings
        }
        this.settings = newSettings;
        return this;
    }
}

class CsvDownload {
    static get SETTINGS_DEFAULT() {
        return {separator: ";", useBOM: false, dataType: "text/csv"};
    }

    constructor(settings = CsvDownload.SETTINGS_DEFAULT) {
        this.settings = settings;
        this.downloadMethod = new LinkDownload(settings);
    }

    changeSettings(settings = {}) {
        const newSettings = {
            ...this.settings,
            ...settings
        }
        this.settings = newSettings;
        this.downloadMethod.changeSettings(this.settings)
        return this;
    }

    download(rows, fileName, {settings = this.settings} = {}) {
        let csvContent = rows.map(e => e.join(settings.separator)).join("\n");
        let universalBOM = this.settings.useBOM ? "\uFEFF" : "";
        const fileNameTarget = fileName.endsWith(".csv") ? fileName : fileName + ".csv";
        this.downloadMethod.download(universalBOM + csvContent, fileNameTarget);
        return this;
    }
}

export class ClientDownload {
    get forCsv() {
        return new CsvDownload()
    }
}