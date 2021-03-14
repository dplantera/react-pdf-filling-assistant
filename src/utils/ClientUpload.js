class FileUpload {

    readUnit8(file, callback) {
        const fileReader = new FileReader();
        fileReader.onload = (progressEvent) => {
            console.log("done reading: ", file.name)
            const result = progressEvent.target.result;
            const bytearray = new Uint8Array(result);
            callback(bytearray, file.name);
        };

        fileReader.readAsArrayBuffer(file)
        console.log("reading: ", file.name)
    }
}

class FilePickerUpload {
    constructor() {
        this.uploadMethod = new FileUpload();
    }

    uploadAsUint8(e, callback) {
        let file = e.target.files[0];
        this.uploadMethod.readUnit8(file, callback)
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
}

export class ClientUpload {
    get forDropEvent() {
        return new DropEventUpload()
    }

    get forFilePicker() {
        return new FilePickerUpload();
    }
}