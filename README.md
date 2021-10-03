[comment]: <> (imagage links)
[features]:./public/files/pdf-filling-assistant-features.png "Features" 

[comment]: <> (external links)
[client-persistence]:https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
[IndexedDB]:https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
[PWA]:https://web.dev/progressive-web-apps/

[comment]: <> (body)
# PDF Form Assistant
A complete client-side Progressive Web App to facilitate preparing PDF forms for automated form filling.  
## Demo
[pdf-filling-assistant.web.app/ ](https://pdf-filling-assistant.web.app/)

## Features
![][features]

## Introduction
This started as a quick project to make the life of my team easier and to learn about FE development with react. `PDF Form Assistant` is an integration tool for PDF form filling automation. I've decided to work a little more on it and dive deeper into FE development and react.

`PDF Form Assistant` targets a legacy software tech stack which takes a third-party PDF Form and a Java Velocity template to fill the form with data from a database. 

Since it shall be usable in an enterprise environment, I focus on a fully functional client side SPA without a backend or any other server request besides the initial delivery of the SPA. 

Yet, an app without a DB isn't quite productive, wherefore it does have client side persistence by depending on [client-persistence] (A wrapper for [IndexedDB] also authored by me).

`PDF Form Assistant` is a Progressive WEb App [PWA], thus can even be installed when using a chrome based browser.



### How does this app help?
* Field identifier are rarely expressive, hence writing templates involve a lot of investigative afford and commercial PDF Editors.
  
  `PDF Form Assistant` helps by `extracting` field information and `highlighting` a selected field side by side.
* During a period of years, many developers are working on pdf forms templates. There is a huge cost due to knowledge transfer.
  
  `PDF Form Assistant` provides `shareable` `FormVariables` and a `search` functionality, to find the right variable more quickly.
* Writing templates manually for PDF may be cumbersome due to the complexity of customized PDF forms.
  
  `PDF Form Assistant` opens the opportunity to react on different circumstances with automation by e.g. enforce specific variables or attributes.
    * Based on my personal observations, there are different __field types__ with unique requirements where each **type** may also differ in **configuration**
        * __text__ - Straight forward. Identify the field by its __name__ and set a __value__ accordingly. For configuration keep attention to **limit characters**, **visibility** and **readOnly**
        * __check box__ - May be tricky. Identify the field by its __name__. The __value__ for **checked** can be anything. In most cases checked is represented by *on* or *yes* but is not reliable. More reliable is the representation of **unchecked** which is most of the time *Off*.
        * __radio button__ - Complex. Radio buttons are somewhat a __group of check boxes__. There is most of the time only **one identifier** but **multiple** representations for *checked*. Only **one checked box** maybe permitted within a group.
    * Some PDF Forms are drastically customized where one have to lookup each `field configuration`.
    
# Getting Started
* `npm install` to install the App locally
* `npm run start` to run the App locally
* (optional) generate `variables.csv` for testing 'Upload Variables' 
    *  create `.env` in `root` by copy and renaming `.example.env`
    * `npm run pre_dev` to generate variables.csv for testing 'Upload Variables' 
