const NiceHashJS = require('../nicehashjs');
const nhClient = new NiceHashJS();
const should = require('chai').should();
const nock = require('nock');

let  nh = new NiceHashJS({apiId: 12345, apiKey: 12345});

context('NiceHashClient', () => {
    beforeEach(() => {
        nock('https://api.nicehash.com')
            .get('/api')
            .query(true)
            .reply(200, function(uri, requestbody) {
                return {ok: true, uri}
            })
    });

    after(() => {
        nock.restore();
    })

    context('Public API Methods', () => {
        describe('getApiVersion', () => {
            it('should correctly get the API version', () => {
                NiceHashJS.getApiVersion().then((response) => {
                    response.body.uri.should.eq('/api');
                });
            });
        });

        describe('getNiceHashAlgorithmNumberByName', () => {
            it('should correctly get NiceHash algorithm number from algorithm name', () => {
                const CryptoNight = NiceHashJS.getNiceHashAlgorithmNumberByName('CryptoNight');
                CryptoNight.should.eql('22');
                
                const notFound = NiceHashJS.getAlgorithmNameByNiceHashNumber(123);
                should.not.exist(notFound);
            })
        });

        describe('getAlgorithmNameByNiceHashNumber', () => {
            it('should correctly get algorithm name from NiceHash algorithm number', () => {
                const CryptoNight = NiceHashJS.getAlgorithmNameByNiceHashNumber(22);
                CryptoNight.should.eql('CryptoNight');
                
                const notFound = NiceHashJS.getAlgorithmNameByNiceHashNumber(123);
                should.not.exist(notFound);
            })
        });

        describe('getGlobalCurrentStats', () => {
            it('should correctly get global current stats', () => {
                return nh.getGlobalCurrentStats().then((response) => {
                    response.body.uri.should.eql('/api?method=stats.global.current');
                })
            })
        });

        describe('getGlobal24hStats', () => {
            it('should correctly get global 24h stats', () => {
                return nh.getGlobal24hStats().then((response) => {
                    response.body.uri.should.eql('/api?method=stats.global.24h');
                })
            })
        });

        describe('getProviderStats', () => {
            it('should correctly get provider stats', () => {
                const testAddress = `1P5PNW6Wd53QiZLdCs9EXNHmuPTX3rD6hW`;
                return nh.getProviderStats(testAddress).then((response) => {
                    response.body.uri.should.eql('/api?method=stats.provider&addr='+testAddress);
                })
            })
        });

        describe('getDetailedProviderStats', () => {
            it('should correctly get detailed provider stats', () => {
                const testAddress = `1P5PNW6Wd53QiZLdCs9EXNHmuPTX3rD6hW`;
                return nh.getDetailedProviderStats(testAddress).then((response) => {
                    response.body.uri.should.eql('/api?method=stats.provider.ex&addr='+testAddress+'&from=0');
                })
            })
        });

        describe('getProviderWorkersStats', () => {
            it('should correctly get provider workers stats', () => {
                const testAddress = `1P5PNW6Wd53QiZLdCs9EXNHmuPTX3rD6hW`;
                const testAlgo = 2
                return nh.getProviderWorkersStats(testAddress, testAlgo).then((response) => {
                    response.body.uri.should.eql('/api?method=stats.provider.workers&addr='+testAddress+'&algo='+testAlgo);
                })
            })
        });

        describe('getAllProviderWorkersStats', () => {
            it('should correctly get all provider workers stats', () => {
                const testAddress = `1P5PNW6Wd53QiZLdCs9EXNHmuPTX3rD6hW`;
                return nh.getAllProviderWorkersStats(testAddress).then((response) => {
                    response.body.uri.should.eql('/api?method=stats.provider.workers&addr='+testAddress);
                })
            })
        });
    });
} );


