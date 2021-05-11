# BTP-CF-DESTINATION
This package can be used to make a connection to the connectivity service of the SAP Business Technology Platform (BTP / SCP).
The destination service is being used to retrieve the connectivity data. The @sap-cloud-sdk/core package (which uses Axios) is being used as http client.

You can used this package as a express middleware proxy or as a standalone function, see the examples below.
It can be used for all types of ProxyTypes incl OnPremise, which makes the request based on your user JWT.

## Prerequisites
- destination and destination instance created
- connectivity instance created
- xsuaa instance created
- all of the above instances bound to the node app, e.g. via manifest.yml:
```yaml
applications:
- name: my_app
  path: my_app
  memory: 128M
  services:
    - xsuaa-instance
    - connectivity-instance
    - destination-instance
```

## Usage examples
First in the SAP BTP Cockpit create a destination, for example:
```
name: my-dest
type: HTTP
url: http://my-destination-url:443
ProxyType: Internet
AuthentiCation: BasicAuthentication
```
(If you need to send along the logged used you need to configure your destination configuration in the SAP BTP Cockpit to use ProxyType: OnPremise and Authentication: PrincipalPropagation up your destination.)

### Create a module
The best practice is to first create a module in which you define the destination, for example place it in a /modules/mydestination/index.js file
```js
const BtpCfDestination = require("btp-cf-destination");
module.exports = new BtpCfDestination(
	"my-dest", // the destination name defined in the SAP BTP Cockpit destination configuration instance
	{ path : '/path/to/services.xsodata' } // optional params
);
```

### use as express middleware

```js
const myDest = require("/modules/mydestination");

//Proxy the request directely to the service
router.use("/odata", myDest.expressMiddleware());

// or specify a path
router.use("/odata/example", myDest.expressMiddleware({ path: "/specific-endpoint" }));
```

### Fire requests manually

```js
const myDest = require("/modules/mydestination");	

router.post("/send-example", async (req, res) => {
	const result = await myDest.request(
		"/books",
		{ // optional params
			method 			: "POST",
			data 			: {
				name	: "Moby Dick",
				author	: "Herman Melville"
			}
		}
	);
	res.status(result.status).set(result.headers).send(result.data);
});

// In case you need to send along the user JWT (needed when the proxytype is OnPremise and Authentication is PrincipalPropagation)
router.post("/send-example-with-user-credentials", async (req, res) => {
	const result = await myDest.request("/books", { userJwt: myDest.getUserJwtToken(req) });
	res.status(result.status).set(result.headers).send(result.data);
});

```
request additional optional params:
- method	(default: "get");
- responseType (default: "json")
- headers (default {})

