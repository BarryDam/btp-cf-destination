'use strict';
const { getDestination, executeHttpRequest } = require('@sap-cloud-sdk/core'),
	expressWrap = fn => (...args) => fn(...args).catch(args[2]);

class BtpCfDestination {

	/**
	 * Constructor
	 * @param {string} destination - destination name corresponding to the destination created in the SAP BTP Cockpit
	 * @param {*} param1 
	 */
	constructor(destination, { path = "/" } = {}) {
		if (!destination) { throw new Error("Destination is required"); }
		if (typeof destination !== "string") {
			console.log(destination);
			throw new Error(`Destination param is a ${typeof destination} but should be a string`);
		}
		this._destination = destination;
		this._path = !path.startsWith("/") ? `/${path}` : path;
	}

	/**
	 * Get te User JWT token from express Request object
	 * @param {Express Request} oReq 
	 */
	static getUserJwtToken(oReq) {
		if (oReq.authInfo && oReq.authInfo.getAppToken) {
			// regular ExpressJS request
			return oReq.authInfo.getAppToken();
		} else if (oReq.attr && oReq.attr.getAppToken) {
			// CDS request
			return oReq.attr.getAppToken();
		}
	}

	/**
	 * @param {string} url 
	 * @param {object} mParams
	 * 	@param {string} [mParams.method="GET"] 			- request method
	 * 	@param {string} [mParams.responseType="json"] 	- expecting response result
	 * 	@param {object} [mParams.headers] 				- additional headers to sent
	 * 	@param {object} [mParams.data] 					- Data to be send along with the request (only when the method POST, PUT)
	 * 	@param {string} [mParams.userJwt] 				- only needed when proxyType is "OnPremise" and authentication is "PrincipalPropagation". In all other casis 
	 * @returns {Axios result} 	{ data, headers, status}
	 */
	async request(url, { // optional options
		method = "GET",
		responseType = "json",
		headers = {},
		data = null,
		userJwt = null
	} = {}) {
		const oDestination = await getDestination(this._destination, {
			userJwt,
			enableCircuitBreaker: false // prevents memory leaks
		});
		oDestination.url += `${this._path}${url.startsWith("/") ? url : `/${url}`}`;
		// Proxy (needed for the SAP Business Application Studio)
		if ("HTTP_PROXY" in process.env && oDestination.proxyType === "OnPremise") {
			const aProxy = process.env.HTTP_PROXY.split(":");
			oDestination.proxyConfiguration.port = aProxy[2];
			oDestination.proxyConfiguration.host = aProxy[1].replace("//", "");
		}
		return executeHttpRequest(oDestination, { headers, method, data, responseType });
	}

	async create(sPath, mData) {
		if (!sPath) { throw "Path is not defined"; }
		return this.request(sPath, {
			method: "POST",
			data: mData
		});
	}

	async read(sPath) {
		if (!sPath) { throw "Path is not defined"; }
		return this.request(sPath, {
			method: "GET"
		});
	}

	async update(sPath, mData) {
		if (!sPath) { throw "Path is not defined"; }
		return this.request(sPath, {
			method: "PUT",
			data: mData
		});
	}

	async delete(sPath) {
		if (!sPath) { throw "Path is not defined"; }
		return this.request(sPath, {
			method: "DELETE"
		});
	}

	/**
	 * @param {object} [mParams]
	 * 	@param {string} [mParams.path] 		- Url path set as base
	 *  @param {string} [mParams.headers] 	- headers that needs to be send along with te request
	 */
	expressMiddleware({ path = "", headers = {} } = {}) {
		if (path && !path.endsWith("/")) { path += "/"; }
		return expressWrap(async (oReq, oRes) => {
			let sReqBaseurl = oReq.baseUrl;
			if (oReq.originalUrl.endsWith("/") && !sReqBaseurl.endsWith("/")) { sReqBaseurl += "/"; }
			this.expressRequestHandler(oReq, oRes, {
				url: oReq.originalUrl.replace(sReqBaseurl, path).replace(/\/\//g, "/"),
				method: oReq.method,
				data: oReq.body || null,
				headers
			});
		});
	}

	async expressRequestHandler(oReq, oRes, { url, method = "GET", headers = {}, data = null } = {}) {
		try {
			const mResult = await this.request(url, {
				method, headers, data,
				userJwt: BtpCfDestination.getUserJwtToken(oReq),
				responseType: 'stream' // stream needed for possible file downloading
			});
			oRes.writeHead(mResult.status, mResult.headers);
			mResult.data.pipe(oRes);
		} catch (e) {
			oRes.status(e.status || 500).json({
				message: e.message,
				stack: e.stack
			});
		}
	}
}
module.exports = BtpCfDestination;