export class FileUpload {
    asUnit8(buffer) {
        return new Uint8Array(buffer);
    }

    readUnit8(file) {
        return new Promise(async resolve => {
            const fileReader = new FileReader();
            fileReader.onload = (progressEvent) => {
                const result = progressEvent.target.result;
                console.log("readUnit8", {result, name: file.name})
                resolve([this.asUnit8(result), file.name]);
            };

            fileReader.readAsArrayBuffer(file)
        })
    }

    async uploadAsText(files) {
        const readFile = (file) => {
            const fileReader = new FileReader();
            return new Promise(async resolve => {
                fileReader.onload = (progressEvent) => {
                    const result = progressEvent.target.result;
                    console.log("uploadAsText", {result, name: file.name})
                    resolve([result, file.name]);
                };
                fileReader.readAsText(file)
            })
        }
        if(files instanceof File )
            return await readFile(files);
        return await readAll(files, readFile)
    }
}


async function readAll(files, asyncMethod) {
    return new Promise(async resolve => {
        console.debug("readAll: ", {files})
        const readFiles = [];
        await Array.from(files).reduce(async (lastPromise, currentPromise) => {
            await lastPromise
            const file = await asyncMethod(currentPromise);
            console.debug("lastPromise: ", {file, asyncMethod, readFiles})
            if (file)
                readFiles.push(file);
        }, Promise.resolve())
        console.debug("readFiles: ", {readFiles})
        resolve(readFiles)
    })
}