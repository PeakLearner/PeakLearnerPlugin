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
