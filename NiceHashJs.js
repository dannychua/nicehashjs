const _ = require('lodash');
const axios = require('axios');
const pkg = require('./package.json');

const API_BASE_URL = 'https://api.nicehash.com/api';
const axiosConfig = {
    baseURL: API_BASE_URL,
    timeout: 1000,
    headers: {
        'user-agent': `NiceHashJs/${pkg.version} (https://github.com/dannychua/nicehashjs)`
    }
}

const LOCATIONS = {
    0: 'Europe', 
    1: 'USA',
    2: 'Hong Kong',
    3: 'Japan'
};

const ALGORITHMS = {
    0: 'Scrypt',
    1: 'SHA256',
    2: 'ScryptNf',
    3: 'X11',
    4: 'X13',
    5: 'Keccak',
    6: 'X15',
    7: 'Nist5',
    8: 'NeoScrypt',
    9: 'Lyra2RE',
    10: 'WhirlpoolX',
    11: 'Qubit',
    12: 'Quark',
    13: 'Axiom',
    14: 'Lyra2REv2',
    15: 'ScryptJaneNf16',
    16: 'Blake256r8',
    17: 'Blake256r14',
    18: 'Blake256r8vnl',
    19: 'Hodl',
    20: 'DaggerHashimoto',
    21: 'Decred',
    22: 'CryptoNight',
    23: 'Lbry',
    24: 'Equihash',
    25: 'Pascal',
    26: 'X11Gost',
    27: 'Sia',
    28: 'Blake2s',
    29: 'Skunk',
    30: 'CryptoNightV7',
    31: 'CryptoNightHeavy',
    32: 'Lyra2Z',
    33: 'X16R',
    34: 'CryptoNightV8',
    35: 'SHA256AsicBoost',
    36: 'Zhash',
    37: 'Beam',
    38: 'GrinCuckaroo29',
    39: 'GrinCuckatoo31',
    40: 'Lyra2REv3',
    41: 'MTP',
    42: 'CryptoNightR',
    43: 'CuckooCycle',
};

ALGORITHM_UNITS = {
    0: 'MH/s',
    1: 'TH/s',
    2: 'MH/s',
    3: 'MH/s',
    4: 'MH/s',
    5: 'MH/s',
    6: 'MH/s',
    7: 'MH/s',
    8: 'MH/s',
    9: 'MH/s',
    10: 'MH/s',
    11: 'MH/s',
    12: 'MH/s',
    13: 'kH/s',
    14: 'MH/s',
    15: 'kH/s',
    16: 'GH/s',
    17: 'GH/s',
    18: 'GH/s',
    19: 'kH/s',
    20: 'MH/s',
    21: 'GH/s',
    22: 'kH/s',
    23: 'GH/s',
    24: 'Sol/s',
    25: 'GH/s',
    26: 'MH/s',
    27: 'GH/s',
    28: 'GH/s',
    29: 'MH/s',
    30: 'kH/s',
    31: 'kH/s',
    32: 'MH/s',
    33: 'MH/s',
    34: 'kH/s',
    35: 'TH/s',
    36: 'Sol/s',
    37: 'Sol/s',
    38: 'G/s',
    39: 'G/s',
    40: 'MH/s',
    41: 'MH/s',
    42: 'kH/s',
    43: 'G/s',
}

const ORDER_TYPES = {
    0: 'standard',
    1: 'fixed'
};

class NiceHashClient {
    /**
     * Creates a new client
     * @param options Object
     * @param options.apiId String - API ID
     * @param options.apiKey String - API Key (note: Do not use read-only)
     */
    constructor(options) {
        this.apiId = _.get(options, 'apiId');
        this.apiKey = _.get(options, 'apiKey');
        this.axios = axios.create(axiosConfig);
    }

    hasAuthTokens() {
        return !!this.apiId && !!this.apiKey;;
    }

    getAuthParams() {
        return { id: this.apiId, key: this.apiKey };
    }

    getRequestPromise(methodName, queryParams) {
        const methodObj = { method: methodName };
        const payload = _.merge({}, {params: _.merge(methodObj, queryParams || {})});
        return this.axios.get('', payload)
    }

    // AUTHENTICATED API ENDPOINTS

    /**
     * Get all orders for certain algorithm owned by the customer. Refreshed every 30 seconds.
     * @param location - 0 for Europe (NiceHash), 1 for USA (WestHash).
     * @param algo - Algorithm marked with ID
     */
    getMyOrders(location, algo) {
        const params = _.merge({location, algo, my: ''}, this.getAuthParams());
        return this.getRequestPromise('orders.get', params);
    }

    /**
     * Create new order. Only standard orders can be created with use of API.
     * @param orderOptions Object
     * @param orderOptions.location Number - 0 for Europe (NiceHash), 1 for USA (WestHash).
     * @param orderOptions.algo Number - Algorithm marked with ID.
     * @param orderOptions.amount Number - Pay amount in BTC.
     * @param orderOptions.price Number - Price in BTC/GH/Day or BTC/TH/Day.
     * @param orderOptions.limit Number - Speed limit in GH/s or TH/s (0 for no limit).
     * @param orderOptions.code - Required code if 2FA is enabled
     * @param orderOptions.pool_host String - Pool hostname or IP.
     * @param orderOptions.pool_port String - Pool port.
     * @param orderOptions.pool_user String - Pool username.
     * @param orderOptions.pool_pass String - Pool password.
     */
    createOrder(orderOptions) {
        const params = _.merge(orderOptions, this.getAuthParams());

        return this.getRequestPromise('orders.create', params);
    }

    /**
     * Refill order with extra Bitcoins.
     * @param orderOptions Object
     * @param orderOptions.location Number - 0 for Europe (NiceHash), 1 for USA (WestHash).
     * @param orderOptions.algo Number - Algorithm marked with ID.
     * @param orderOptions.order Number - Existing orderId.
     * @param orderOptions.amount Number - Pay amount in BTC.
     */
    refillOrder(orderOptions) {
        const params = _.merge(orderOptions, this.getAuthParams());

        return this.getRequestPromise('orders.refill', params);
    }

    /**
     * Remove existing order.
     * @param orderOptions Object
     * @param orderOptions.location Number - 0 for Europe (NiceHash), 1 for USA (WestHash).
     * @param orderOptions.algo Number - Algorithm marked with ID.
     * @param orderOptions.order Number - Existing orderId.
     */
    removeOrder(orderOptions) {
        const params = _.merge(orderOptions, this.getAuthParams());

        return this.getRequestPromise('orders.remove', params);
    }

    /**
     * Set new price for the existing order. Only increase is possible.
     * @param orderOptions Object
     * @param orderOptions.location Number - 0 for Europe (NiceHash), 1 for USA (WestHash).
     * @param orderOptions.algo Number - Algorithm marked with ID.
     * @param orderOptions.order Number - Existing orderId.
     * @param orderOptions.price Number - Price in BTC/GH/Day or BTC/TH/Day
     */
    setOrderPrice(orderOptions) {
        const params = _.merge(orderOptions, this.getAuthParams());

        return this.getRequestPromise('orders.set.price', params);
    }

    /**
     * Decrease price for the existing order. Price decrease possible every 10 minutes.
     * @param orderOptions Object
     * @param orderOptions.location Number - 0 for Europe (NiceHash), 1 for USA (WestHash).
     * @param orderOptions.algo Number - Algorithm marked with ID.
     * @param orderOptions.order Number - Existing orderId.
     */
    decreaseOrderPrice(orderOptions) {
        const params = _.merge(orderOptions, this.getAuthParams());

        return this.getRequestPromise('orders.set.price.decrease', params);
    }

    /**
     * Set new limit for existing order
     * @param orderOptions Object
     * @param orderOptions.location Number - 0 for Europe (NiceHash), 1 for USA (WestHash).
     * @param orderOptions.algo Number - Algorithm marked with ID.
     * @param orderOptions.order Number - Existing orderId.
     * @param orderOptions.limit Number - Speed limit in GH/s or TH/s (0 for no limit).
     */
    setOrderLimit(orderOptions) {
        const params = _.merge(orderOptions, this.getAuthParams());

        return this.getRequestPromise('orders.set.limit', params);
    }

    getMyBalance() {
        return this.getRequestPromise('balance', this.getAuthParams());
    }

    // PUBLIC API ENDPOINTS

    static getApiVersion() {
        return axios.get(API_BASE_URL, axiosConfig);
    }

    static getNiceHashAlgorithmNumberByName(algoName) {
        return _.findKey(ALGORITHMS, (i) => { return i === algoName }) || null;
    }

    static getAlgorithmNameByNiceHashNumber(number) {
        return ALGORITHMS[number] || null;
    }

    static getLocationNameByNiceHashNumber(number) {
        return LOCATIONS[number] || null;
    }

    static getAlgorithmUnitsByNiceHashNumber(number) {
        return ALGORITHM_UNITS[number] || null;
    }

    /**
     * Get current profitability (price) and hashing speed for all algorithms. Refreshed every 30 seconds
     * @param location {Number} - Location, 0 for Europe, 1 for USA. Optional
     * @return {*}
     */
    getGlobalCurrentStats(location) {
        return this.getRequestPromise('stats.global.current', location ? {location} : null);
    }

    /**
     * Get average profitability (price) and hashing speed for all algorithms in past 24 hours.
     * @return {*}
     */
    getGlobal24hStats() {
        return this.getRequestPromise('stats.global.24h');
    }

    /**
     * Get current stats for provider for all algorithms. Refreshed every 30 seconds. It also returns past 56 payments.
     * @param addr
     * @return {*}
     */
    getProviderStats(addr) {
        return this.getRequestPromise('stats.provider', { addr });
    }

    /**
     * Get details stats for provider for all algorithms including history data and past 56 payments
     * @param addr String - Providers BTC address
     * @param from String['0'] - Get history from this time (Unix timestamp)
     * @return {*}
     */
    getDetailedProviderStats(addr, from) {
        if (!from) {
            from = '0';
        }

        return this.getRequestPromise('stats.provider.ex', { addr, from });
    }

    /**
     * Get detailed stats for provider's workers (rigs).
     * @param addr String - Provider's BTC Address
     * @param algo Number - Algorithm marked with ID
     * @return {*}
     */
    getProviderWorkersStats(addr, algo) {
        return this.getRequestPromise('stats.provider.workers', { addr, algo });
    }
    
    /**
     * Get detailed stats for provider's workers (rigs).
     * @param addr String - Provider's BTC Address
     * @param algo Number - Algorithm marked with ID
     * @return {*}
     */
    getAllProviderWorkersStats(addr) {
        return this.getRequestPromise('stats.provider.workers', { addr });
    }

    /**
     * Get all orders for certain algorithm. Refreshed every 30 seconds.
     * @param location Number - 0 for Europe (NiceHash), 1 for USA (WestHash)
     * @param algo Number - Algorithm marked with ID
     * @return {*}
     */
    getOrders(location, algo) {
        return this.getRequestPromise('orders.get', { location, algo });
    }

    /**
     * Get information about Multi-Algorithm Mining.
     * @return {*}
     */
    getMultiAlgorithmMiningInfo() {
        return this.getRequestPromise('multialgo.info');
    }

    /**
     * Get information about Simple Multi-Algorithm Mining.
     * More here: https://www.nicehash.com/?p=simplemultialgo
     * @return {*}
     */
    getSimpleMultiAlgorithmMiningInfo() {
        return this.getRequestPromise('simplemultialgo.info');
    }

    /**
     * Get needed information for buying hashing power using NiceHashBot.
     * https://github.com/nicehash/NiceHashBot
     * @return {*}
     */
    getNeededBuyingInfo() {
        return this.getRequestPromise('buy.info');
    }
}

module.exports = NiceHashClient;