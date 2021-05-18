define([

    'dojo/_base/declare',
    'dojo',
    'dojo/on',
    'dojo/mouse',
    'JBrowse/Util',
    'InteractivePeakAnnotator/View/Track/MultiXYPlot'
],
function (
    declare,
    dojo,
    on,
    mouse,
    Util,
    XYPlot
) {
    return declare([ XYPlot],
        {
            constructor: function(args)
            {
                this.inherited(arguments);
                const conf = this.config.storeConf;
                const CLASS = dojo.global.require(conf.modelClass);
                const newModel = Object.assign({}, args, conf);
                newModel.config = Object.assign({}, args.config, conf);
                this.modelStore = new CLASS(newModel);

                this.cacheKey = 0;

                let thisB = this;

                let updateCacheKey = function(){
                    let keys = Object.keys(thisB.browser.view.trackIndices);

                    if(keys.includes(thisB.key)) {
                        thisB.modelStore.cacheKey++
                        thisB.highlightStore.cacheKey++
                    }
                }
                dojo.subscribe('/jbrowse/v1/n/tracks/redraw', updateCacheKey)
            },
            _defaultConfig: function () {
                return Util.deepUpdate(dojo.clone(this.inherited(arguments)), {
                    addBackend: true,
                    PL: true,
                })
            },
            _postDraw: function (scale, leftBase, rightBase, block, canvas) {
                // Call WiggleHighlighter post draw
                this.inherited(arguments)

                // Because the menu is a dijit widget, dijit.byId needs to be used
                let lopart = dijit.byId("lopart")

                this.modelStore.getFeatures({ ref: this.browser.refSeq.name,
                        start: leftBase,
                        end: rightBase,
                        width: canvas.width,
                        scale: scale,
                        visible: this.browser.view.visibleRegion(),
                        useLopart: lopart.checked},
                    feature => {

                        const type = feature.get('type');
                        let s, e;
                        if (type === 'peak') {
                            s = block.bpToX(
                                Math.max(
                                    feature.get('start') - this.config.broaden,
                                    block.startBase,
                                ),
                            );
                            e = block.bpToX(
                                Math.min(feature.get('end') + this.config.broaden, block.endBase),
                            );
                        } else if (type === 'lopart') {
                            s = feature.get('start');
                            e = feature.get('end');
                        }


                        const score = Math.round(feature.get('score'));
                        const height = (parseInt(canvas.style.height, 10) - score) + "px";
                        const indicator = dojo.create(
                            'div',
                            {
                                style: {
                                    left: `${s}px`,
                                    width: `${e - s}px`,
                                    height: `5px`,
                                    zIndex: 10000,
                                    top: height,
                                    position: 'absolute',
                                    backgroundColor: 'red'
                                },
                            },
                            block.domNode,
                            );
                    },
                    () => {},
                    error => {
                        console.error(error)
                    });
            },
        });
});
