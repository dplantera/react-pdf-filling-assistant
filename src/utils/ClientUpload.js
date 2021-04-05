class FileUpload {

    asUnit8(buffer) {
        return new Uint8Array(buffer);
    }

    readUnit8(file, callback) {
        const fileReader = new FileReader();
        fileReader.onload = (progressEvent) => {
            console.log("done reading: ", file.name)
            const result = progressEvent.target.result;
            callback(this.asUnit8(result), file.name);
        };

        fileReader.readAsArrayBuffer(file)
        console.log("reading: ", file.name)
    }

    uploadAsText(file, callback) {
        const fileReader = new FileReader();
        fileReader.onload = (progressEvent) => {
            const result = progressEvent.target.result;
            console.log({result})
            callback(result, file.name);
        };

        fileReader.readAsText(file)
        console.log("reading: ", file.name)
    }
}

class FetchUpload {
    constructor() {
        this.uploadMethod = new FileUpload();
    }

    /**
     * Reads a binary file from a relative path or url as an Uin8Array
     * @param path /my/path/to/file.x OR https://my.domain.root/resource/path
     */
    uploadAsUint8(path) {
        return new Promise(((resolve, reject) => {
            fetch(path).then(result => {
                result.arrayBuffer()
                    .then(buffer => {
                        const filename = path.split("/").reverse()[0];
                        let unit8Array = this.uploadMethod.asUnit8(buffer);
                        resolve([unit8Array, filename])
                    })
            })
        }))
    }
}

class FilePickerUpload {
    constructor() {
        this.uploadMethod = new FileUpload();
    }

    uploadAsUint8(e, callback) {
        let file = e.target.files[0];
        console.log({file})
        this.uploadMethod.readUnit8(file, callback)
        return file;
    }

    uploadAsText(e, callback) {
        let file = e.target.files[0];
        this.uploadMethod.uploadAsText(file, callback)
        return file;
    }
}

class DropEventUpload {
    constructor() {
        this.uploadMethod = new FileUpload();
    }

    uploadAsUint8(e, callback) {
        let file = e.dataTransfer.files[0];
        this.uploadMethod.readUnit8(file, callback)
        return file;
    }

    uploadAsText(e, callback) {
        let file = e.dataTransfer.files[0];
        this.uploadMethod.uploadAsText(file, callback)
        return file;
    }
}

export class ClientUpload {
    get forDropEvent() {
        return new DropEventUpload()
    }

    get forFilePicker() {
        return new FilePickerUpload();
    }

    get forStaticFile() {
        return new FetchUpload();
    }
}