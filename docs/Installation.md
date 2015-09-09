# Installation guide

## Lime 1.0
http://lime.cirsfid.unibo.it/?page_id=134

## Lime 2.0 installation guide

This new release of Lime offers many new features and improved performance.

### Prerequisites

- Http server
- Node.js (version 0.12 or later)
- MongoDb (3.0 or later)
    - Setup an instance
- Php (5.3.2) with extensions (curl, fileinfo, dom, json, libxml, SimpleXML, xml, xmlreader, xmlwriter, xsl)
- Exist
    - Setup an instance
- Abiword
- Download the Lime zip.

### Node server

- Extract the `aknservices` folder from the Lime zip.
- Change the default port in `aknservices/config.json` (default is 9006)
- Modify `aknservices/documentsdb/config.json`
    - Set the MongoDb url/port in `mongodb.url`
    - Set the filesystem path for storing xml files in `filesystem.documents`
    - Set the exist host (`exist.host`), port (`exist.port`) and credentials (`exist.auth`)
- Run the server `node server.js`
    - Consider using the script in `aknservices/start.sh`, which sure only one instance of the server is running, logs errors in log.txt, and redirect output.

### Client

- Extract the `lime` folder from the Lime zip to a path accessible by the web server.
- Change `config.json` to point to the right port (If you didn't change the node port and kept 9006, this step is not needed)
- Use Lime

### Notes

We are working on improving the installation experience by using Ubuntu packages, this will make installing Lime super simple in the future.

