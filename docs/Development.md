# Development
If you want to edit or to extend LIME you have to read the following section after followed the [Installation](Installation.md) and [Build](Build.md) documentation.

The first time you have to run `sencha app build` this will generate some stuff and styles that LIME uses even in development.

## Config
Change the default `config.json` file with your configurations, especially the `server.node` value, change it with the url of your LIME-server instance. Every time you change this file or another json configuration file i.e. *languagesPlugins/akoma3.0/structure.json* you have to run `sencha app refresh` in order to apply configurations. Sometimes you may need to clear browser's cache or disabling it in order to see the difference.

## Run
You can choose to run the development version of LIME using the integrated web server of sencha or another stand-alone web server.
### Sencha watch
Run `sencha app watch` in the project's root, this method is good because it watches file changing and compiles styles but you cannot use PHP services unless you don't serve php folder with a web server and change the code by setting the PHP url.
### Web server
You can serve the root folder of LIME with a stand-alone (i.e. Apache) with PHP support in order to use PHP services. After that, LIME will be available at similar address http://localhost/lime/ depending on your configurations. Now you can change source code files and you have to reload the page in the browser to see your changes. The drawback of this method is that you have to run `sencha ant sass` every time you change the style or `sencha app refresh` every time you add a new Ext Class e.g. Javascript file.