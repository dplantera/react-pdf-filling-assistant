import {FileUpload} from "./FileUpload";

export class ClientUpload {
    static get forDropEvent() {
        return new DropEventUpload(new FileUpload())
    }

    static get forFilePicker() {
        return new FilePickerUpload(new FileUpload());
    }

    static get forStaticFile() {
        return new FetchUpload(new FileUpload());
    }
}


function getFilenameFromPath(path) {
    //https://stackoverflow.com/a/55975214
    return path?.split(/[\\/]/).pop();
}

class FilePickerUpload {
    constructor(uploadMethod) {
        this.uploadMethod = uploadMethod;
    }

    uploadAsUint8(e) {
        return this.uploadMethod.readUnit8(e.target.files);
    }

    uploadAsText(e) {
        return this.uploadMethod.uploadAsText(e.target.files);
    }

    getFiles(e) {
        return Array.from(e.target.files);
    }
}

class DropEventUpload {
    constructor(uploadMethod) {
        this.uploadMethod = uploadMethod;
    }

    async uploadAsUint8(e) {
        return this.uploadMethod.readUnit8(e.dataTransfer.files);
    }

    async uploadAsText(e) {
        return this.uploadMethod.uploadAsText(e.dataTransfer.files);
    }

    getFiles(e) {
        return Array.from(e.dataTransfer.files);
    }
}

class FetchUpload {
    constructor(uploadMethod) {
        this.uploadMethod = uploadMethod;
    }

    /**
     * Reads a binary file from a relative path or url as an Uin8Array
     * @param path /my/path/to/file.x OR https://my.domain.root/resource/path
     */
    async uploadAsUint8(path) {
        return new Promise((async (resolve, reject) => {
            try {
                const result = await fetch(path);
                const buffer = await result.arrayBuffer();
                const filename = path.split("/").reverse()[0];
                let unit8Array = this.uploadMethod.asUnit8(buffer);
                resolve([unit8Array, filename])
            } catch (error) {
                reject(error);
            }
        }))
    }

    async uploadAsJson(path) {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await fetch(path);
                const filename = getFilenameFromPath(path);
                resolve([await result.json(), filename]);
            } catch (error) {
                reject(error);
            }
        })
    }

    async uploadAsText(path) {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await fetch(path);
                const filename = getFilenameFromPath(path);
                resolve([await result.toString(), filename]);
            } catch (error) {
                reject(error);
            }
        })
    }

    getFiles(path) {
        return path;
    }
}