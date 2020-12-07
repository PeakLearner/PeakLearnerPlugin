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
                this.command = "base"
            },
            getFeatures(query, featureCallback, finishedCallback, errorCallback) {
                let callback = dojo.hitch(this, '_makeFeatures', featureCallback, finishedCallback, errorCallback);

                // This should probably be handled with a get request instead
                sendPost(this.command, this.addName(query), callback, this._errorHandler(errorCallback));
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
                sendPost('addLabel', this.addName(query), callback);
            },
            updateFeature(query, callback)
            {
                sendPost('updateLabel', this.addName(query), callback);
            },
            removeFeature(query, callback)
            {
                sendPost('removeLabel', this.addName(query), callback);
            },
            addName(query)
            {
                query['name'] = this.name;
                return query;
            },
            // Aquired from jbrowse/Store/SeqFeature/REST.js
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
