define([
    'dojo/_base/declare',
    'dojo/on',
    'dojo/mouse',
    'JBrowse/Util',
    'InteractivePeakAnnotator/View/Track/MultiXYPlot'
],
function (
    declare,
    on,
    mouse,
    Util,
    XYPlot
) {
    return declare([ XYPlot],
        {
            constructor: function(args)
            {
                this.inherited(arguments)
                const conf = this.config.storeConf
                const CLASS = dojo.global.require(conf.modelClass)
                const newModel = Object.assign({}, args, conf)
                newModel.config = Object.assign({}, args.config, conf)
                this.modelStore = new CLASS(newModel)
            },
            _defaultConfig: function () {
                return Util.deepUpdate(dojo.clone(this.inherited(arguments)),
                    {
                        highlightColor: function (feature, track) {
                            // determines the color of the see through part of the label
                            // to add new type of label add type to this list
                            const states = {
                                'unknown': 'rgba(100,100,100,.4)',
                                'peak': 'rgba(180,167,214,0.4)',
                                'noPeak': 'rgba(255,250,150,0.4)',
                                'peakStart': 'rgba(255,180,235,0.4)',
                                'peakEnd': 'rgba(244,185,185,0.4)'

                        };
                            return states[feature.get('label') || 'unknown'];
                        },

                        indicatorColor: function (feature, track ) {
                            // determines the color of the bar at the bottom of the label
                            // to add new type of label add type to this list
                            const states = {
                                'unknown': 'rgb(100,100,100)',
                                'peak': 'rgb(180,167,214)',
                                'noPeak': 'rgb(255,245,150)',
                                'peakStart': 'rgb(255,210,241)',
                                'peakEnd': 'rgb(244,204,204)'};
                            return states[feature.get('label') || 'unknown'];
                        },

                        style:
                        {
                            label: function( feature, track )
                            {
                                return feature.get('label');
                            }
                        },


                    });
            },

            _postDraw: function (scale, leftBase, rightBase, block, canvas) {
                // Call WiggleHighlighter post draw
                this.inherited(arguments)

                this.modelStore.getFeatures({ ref: this.browser.refSeq.name, start: leftBase, end: rightBase },
                    feature => {
                        const s = block.bpToX(
                            Math.max(
                                feature.get('start') - this.config.broaden,
                                block.startBase,
                                ),
                            );
                        const e = block.bpToX(
                            Math.min(feature.get('end') + this.config.broaden, block.endBase),
                            );

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
