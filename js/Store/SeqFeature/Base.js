define([
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/_base/array',
        'dojo/io-query',
        'dojo/request',
        'dojo/Deferred',
        'JBrowse/Util',
        'JBrowse/Model/SimpleFeature',
        'JBrowse/View/Track/_FeatureDetailMixin',
        'JBrowse/Store/LRUCache',
        'dojo/request/xhr'
    ],
    function (
        declare,
        lang,
        array,
        ioquery,
        dojoRequest,
        Deferred,
        Util,
        SimpleFeature,
        FeatureDetailMixin,
        LRUCache,
        xhr
    ) {
        return declare(FeatureDetailMixin, {
        constructor: function( args )
        {
            // make sure the baseUrl has a trailing slash
            this.baseUrl = args.baseUrl || this.config.baseUrl;
            if( this.baseUrl.charAt( this.baseUrl.length-1 ) != '/' )
                this.baseUrl = this.baseUrl + '/';

            this.name = args.name || this.config.label;
            this.track = args.track || this.config.key
            this.query = "base"

            this.cacheKey = 0;
        },
        getFeatures: function (query, featCallback, finishCallback, errorCallback) {
            var thisB = this;
            var cache = this.featureCache = this.featureCache || new LRUCache({
                name: this.handler,
                fillCallback: dojo.hitch(this, '_readChunk'),
                sizeFunction: function (features) {
                    return features.length;
                },
                maxSize: 100000
            });
            query.toString = function () {
                return query.ref + ',' + query.start + ',' + query.end + ',' + thisB.cacheKey;
            };
            let visibile = this.browser.view.visibleRegion()
            var chunkSize = visibile['end'] - visibile['start'];

            var s = query.start - query.start % chunkSize;
            var e = query.end + (chunkSize - (query.end % chunkSize));
            var chunks = [];

            var chunksProcessed = 0;
            var haveError = false;
            for (var start = s; start < e; start += chunkSize) {
                var chunk = query
                chunk['start'] = start
                chunk['end'] = start + chunkSize
                chunk.toString = function () {
                    return query.ref + ',' + query.start + ',' + query.end + ',' + thisB.cacheKey;
                };
                chunks.push(chunk);
            }


            array.forEach(chunks, function (c) {
                cache.get(c, function (f, err) {
                    if (err && !haveError) {
                        errorCallback(err);
                    }
                    haveError = haveError || err;
                    if (haveError) {
                        return;
                    }
                    thisB._resultsToFeatures(f, function (feature) {
                        if (feature.get('start') > query.end) {
                            // past end of range, can stop iterating
                            return;
                        } else if (feature.get('end') >= query.start) {
                            // must be in range
                            featCallback(feature);
                        }
                    });

                    if (++chunksProcessed === chunks.length) {
                        finishCallback();
                    }
                });
            });


        },
        _resultsToFeatures: function(results, featCallback){
            if (results)
            {
                results.forEach(data => {
                featCallback(new SimpleFeature({ data }))
                })
            }
        },
        _readChunk: function (query, callback) {
            this.sendPost('get', query, callback)
        },
        addFeature: function(query, callback)
        {
            this.sendPost('add', query, callback);
        },
        updateFeature: function(query, callback)
        {
            this.sendPost('update', query, callback);
        },
        updateAlignedFeatures(query, callback)
        {
            this.withAligned(query, callback, 'updateAligned');
        },
        removeFeature: function(query, callback)
        {
            this.sendPost('remove', query, callback);
        },
        removeAlignedFeatures(query, callback)
        {
            this.withAligned(query, callback, 'removeAligned');
        },
        withAligned(query, callback, type)
        {
            let currentStore = this.config.storeClass;

            let tracksToCheck = [];

            this.browser.view.tracks.forEach(track => {
                if(track.config.storeConf)
                {
                    if(track.config.storeConf.storeClass === currentStore)
                    {
                        tracksToCheck.push(track.config.label)
                    }
                }
            })
            if(tracksToCheck.length > 0)
            {
                query['tracks'] = tracksToCheck
                this.sendPost(type, query, callback)
            }
        },
        sendPost: function(command, query, callback)
        {
            query['name'] = this.name;

            let xhrArgs = {
                handleAs: 'json',
                method: 'post',
                data: JSON.stringify({'command': command, 'args': query})
            };
            xhr(this.getHandlerUrl(), xhrArgs).then(
              function(data)
              {
                  callback(data)
              },
              function(err)
              {
                  console.log(err)
              }
            );
        },
        getHandlerUrl: function()
        {
            return this.track + '/' + this.handler + '/'
        },
        // Acquired from jbrowse/Store/SeqFeature/REST.js
        _errorHandler: function( handler ) {
            handler = handler || function(e) {
                console.error( e, e.stack );
                throw e;
            };
            return dojo.hitch( this, function( error ) {
                var httpStatus = ((error||{}).response||{}).status;
                if( httpStatus >= 400 ) {
                    handler( "HTTP " + httpStatus + " fetching "+error.response.url+" : "+error.response.text );
                }
                else {
                    handler( error );
                }
            });
        },
        saveStore() {
            return {
                urlTemplate: this.config.blob.url
            };
        }

    });
});
