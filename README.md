
<p align="center"><img src="https://yourdlt.tools/logo-yourdlt-192x192.png" width="250"></p>

# YourDLT Explorer

[![npm-badge][npm-badge]][npm-url]
[![dl-badge][dl-badge]][npm-url]
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

YourDLT Explorer is a read-only web application to browse the content of YourDLT and Symbol blockchain networks including: Symbol Mainnet, Symbol Testnet, dHealth Public Network and dHealth Testnet.
This software supports searching for transactions, accounts, namespaces, mosaics, nodes and blocks information on a given network.

- [Installation](#installation)
- [Developers](#developers)
- [Sponsor Us](#sponsor-us)
- [Disclaimer](#disclaimer)
- [Licensing](#license)

## Installation

YourDLT Explorer is available as a web application that you can host locally or on a VPS.

1. Download YourDLT Explorer from the [Github repository][self].

2. Install the required dependencies with `npm install`.

3. Run the web application with `npm run prod` or `npm run dev`.

4. Visit http://localhost:8080/#/ in your browser.

Following suite of commands illustrates the installation and first run of YourDLT Explorer:

```
$ git clone https://github.com/UsingBlockchain/yourdlt-explorer
$ cd yourdlt-explorer
$ npm install
$ npm run dev
```

## Developers

### Requirements

- [Node 10+](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04)

Validate your environment by running:

```bash
node -v
```

### Building

Developers can use this software and build awesome new features. Pull requests are very much appreciated.

1. Clone the project.

```
git clone https://github.com/UsingBlockchain/yourdlt-explorer.git
```

2. Install the dependencies.
```
cd yourdlt-explorer
npm install 
```

3. Start the development server.

```
npm run dev 
```

4. Visit http://localhost:8080/#/ in your browser.

### Deploying

You can deploy this web application on any VPS with Node JS 10+ support. Use the following instructions to start a web server inside a daemon docker container:

```bash
$ cd /opt/yourdlt
$ git clone https://github.com/UsingBlockchain/yourdlt-explorer.git
$ cd yourdlt-explorer
$ docker build -t explorer-0 .
$ docker run -d -p 80:80 explorer-0
```

:warning: The attached `Dockerfile` **exposes port 80** for any source (i.e. `0.0.0.0:80->80/tcp`).

### Notes

#### Architecture

* `/src/config`: Handles the explorer configuration.
* `/src/infrastructure`: Handles the API / SDK request from Symbol nodes.
* `/src/store`: Handles the application logic with state management.
* `/src/views`: Handles the UI of the explorer.

#### How to change the node list

The file `/src/config/default.json` contains the node list shown in the node selector dropdown.

1. Edit `peersApi.nodes` array to set up the custom node list.
2. Set `peersApi.defaultNode` property to the default node url.

## Sponsor us

| Platform | Sponsor Link |
| --- | --- |
| Paypal | [https://paypal.me/usingblockchainltd](https://paypal.me/usingblockchainltd) |
| Patreon | [https://patreon.com/usingblockchainltd](https://patreon.com/usingblockchainltd) |
| Github | [https://github.com/sponsors/UsingBlockchain](https://github.com/sponsors/UsingBlockchain) |
| :coffee: :coffee: :coffee: | [https://www.buymeacoffee.com/UBCDigital](https://www.buymeacoffee.com/UBCDigital) |

## Disclaimer

  *The author of this package cannot be held responsible for any loss of money or any malintentioned usage forms of this package. Please use this package with caution.*

  *Our software contains links to the websites of third parties (“external links”). As the content of these websites is not under our control, we cannot assume any liability for such external content. In all cases, the provider of information of the linked websites is liable for the content and accuracy of the information provided. At the point in time when the links were placed, no infringements of the law were recognisable to us..*

## License

Copyright 2019-2020 NEM.
Copyright 2021-present [Using Blockchain Ltd][ref-ltd], All rights reserved.

Licensed under the [Apache License 2.0](LICENSE)

[self]: https://github.com/UsingBlockchain/yourdlt-explorer
[ref-ltd]: https://using-blockchain.org
[npm-url]: https://www.npmjs.com/package/yourdlt-explorer
[npm-badge]: https://img.shields.io/npm/v/yourdlt-explorer
[dl-badge]: https://img.shields.io/npm/dt/yourdlt-explorer
