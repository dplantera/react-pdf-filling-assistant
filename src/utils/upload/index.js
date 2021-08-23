import {ClientUpload} from "./ClientUpload";
import {FileUpload} from "./FileUpload";

const __FileUpload = new FileUpload();
export const Upload = {};
Upload.getFilesToRead = (eventOrFileOrPath) => {
    if (isFileOrFileList(eventOrFileOrPath))
        return Array.from(eventOrFileOrPath);
    if (hasFilesFromDropEvent(eventOrFileOrPath))
        return ClientUpload.forDropEvent.getFiles(eventOrFileOrPath);
    if (hasFilesFromFilePickerEvent(eventOrFileOrPath))
        return ClientUpload.forFilePicker.getFiles(eventOrFileOrPath);
    if (isFilePath(eventOrFileOrPath))
        return ClientUpload.forStaticFile.getFiles(eventOrFileOrPath);
}
Upload.uploadAsText = async (eventOrFileOrPath) => {
    if (isFileOrFileList(eventOrFileOrPath))
        return __FileUpload.uploadAsText(eventOrFileOrPath);
    if (hasFilesFromDropEvent(eventOrFileOrPath))
        return ClientUpload.forDropEvent.uploadAsText(eventOrFileOrPath);
    if (hasFilesFromFilePickerEvent(eventOrFileOrPath))
        return ClientUpload.forFilePicker.uploadAsText(eventOrFileOrPath);
    if (isFilePath(eventOrFileOrPath))
        return ClientUpload.forStaticFile.uploadAsText(eventOrFileOrPath);
    console.error("cant resolve input: ", {eventOrFile: eventOrFileOrPath})
    return [];
}
Upload.uploadAsUint8 = async (eventOrFileOrPath) => {
    if (isFileOrFileList(eventOrFileOrPath))
        return __FileUpload.readUnit8(eventOrFileOrPath);
    if (hasFilesFromDropEvent(eventOrFileOrPath))
        return ClientUpload.forDropEvent.uploadAsUint8(eventOrFileOrPath);
    if (hasFilesFromFilePickerEvent(eventOrFileOrPath))
        return ClientUpload.forFilePicker.uploadAsUint8(eventOrFileOrPath);
    if (isFilePath(eventOrFileOrPath))
        return ClientUpload.forStaticFile.uploadAsUint8(eventOrFileOrPath);
    console.error("cant resolve input: ", {eventOrFile: eventOrFileOrPath})
    return [];
}
Upload.uploadAsJson = async (eventOrFile) => {
    if (isFilePath(eventOrFile))
        return ClientUpload.forStaticFile.uploadAsJson(eventOrFile);
    console.error("cant resolve input: ", {eventOrFile})
    return [];
}

export function isPdfMimeType(mimeType) {
    return mimeType?.endsWith("pdf")
}
export function getFileExtensionFromFile(file) {
    return file?.name?.replace(/.*(?=\.)/g, "") ?? file?.type?.replace(/.*\//g, ".");
}

function isFileOrFileList(eventOrFileOrPath) {
    return eventOrFileOrPath instanceof File || eventOrFileOrPath instanceof FileList
}

function hasFilesFromDropEvent(eventOrFile) {
    return eventOrFile?.dataTransfer?.files?.length > 0
}

function hasFilesFromFilePickerEvent(eventOrFile) {
    return eventOrFile?.target?.files?.length > 0
}

function isFilePath(eventOrFile) {
    if (typeof eventOrFile !== "string")
        return false;
    /* matched => from
    * tes12t\affe123\31file.ext => c:\tes12t\affe123\31file.ext
    * test/affe/file.ext => /c/test/affe/file.ext
    * ./resource/file.x
    * ./../test.x
    * www.test.de/hold/of.de
    * */
    return null !== eventOrFile?.match(/(([\w|\d]|\.)+[\\|/]([\w|\d]|\.)+)([\\|/]([\w|\d]|\.)+\.[\w|\d]+)/gm)
}
