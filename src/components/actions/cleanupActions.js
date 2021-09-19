const {IDBClient} = require("client-persistence");


export function clearLocalStorage () {
    const idb = new IDBClient();
    console.debug("clearLocalStorage")
    const shouldDelete = window.confirm("Do you really wish to delete all local data? Keep in mind, thats all data because there is no server");
    console.debug("clearLocalStorage", shouldDelete)

    if(shouldDelete)
    idb.deleteDb().then(() => {
        alert("All Data deleted - Have a great day!")
        window.location.reload();
    })
}