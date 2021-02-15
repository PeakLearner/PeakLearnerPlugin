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
        FeatureDetailMixin
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
            },
            getFeatures(query, featureCallback, finishedCallback, errorCallback) {
                let callback = dojo.hitch(this, '_makeFeatures', featureCallback, finishedCallback, errorCallback);
                // This should probably be handled with a get request instead
                this.sendPost('get', query, callback, this._errorHandler(errorCallback));
            },
            _makeFeatures: function( featureCallback, endCallback, errorCallback, featureData ) {
                if(featureData)
                {
                    featureData.forEach(data => {
                    featureCallback(new SimpleFeature({ data }))
                })
                }
                endCallback();
            },
            addFeature: function(query, callback)
            {
                this.sendPost('add', query, callback);
            },
            updateFeature: function(query, callback)
            {
                this.sendPost('update', query, callback);
            },
            removeFeature: function(query, callback)
            {
                this.sendPost('remove', query, callback);
            },
            sendPost: function(command, query, callback)
            {
                query['name'] = this.name;
                let xhrArgs = {
                    url: this.getHandlerUrl(),
                    handleAs: 'json',
                    postData: JSON.stringify({'command': command, 'args': query}),
                    load: callback
                };

                var deferred = dojo.xhrPost(xhrArgs);
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
