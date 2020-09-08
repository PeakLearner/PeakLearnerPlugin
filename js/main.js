define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/Deferred',
    'dojo/dom',
    'dojo/dom-construct',
    'dijit/MenuSeparator',
    'dijit/CheckedMenuItem',
    'dijit/form/DropDownButton',
    'dijit/DropDownMenu',
    'dijit/form/Button',
    'dijit/registry',
    'dijit/MenuItem',
    'JBrowse/Plugin',
    './View/NewHub',
       ],
       function(
           declare,
            lang,
            Deferred,
            dom,
            domConstruct,
            dijitMenuSeparator,
            dijitCheckedMenuItem,
            dijitDropDownButton,
            dijitDropDownMenu,
            dijitButton,
            dijitRegistry,
            dijitMenuItem,
            JBrowsePlugin,
            NewHub
       ) {
return declare( JBrowsePlugin,
{
    constructor: function (args) {
            var thisB = this;
            var myBrowser = this.browser;

            console.log('PeakLearner plugin starting');
            myBrowser.afterMilestone('initView', function () {
                var buttontext = new dijitMenuItem({
                    label: 'Upload New Dataset',
                    iconClass: 'dijitIconNewTask',
                    onClick: lang.hitch(thisB, 'newDataset')
                });

                myBrowser.addGlobalMenuItem('peaklearner', buttontext);

                if (dijitRegistry.byId('dropdownmenu_peaklearner') == undefined) {
                    myBrowser.renderGlobalMenu('peaklearner', {text: 'PeakLearner'}, myBrowser.menuBar);
                }

                console.log('PeakLearner plugin added');
            });
        },

        newDataset: function(){
        var hub = new NewHub();
        var browser = this.browser;
        hub.show(browser, function(searchParams) {
            if (searchParams) {
                console.log(searchParams);
            }
        })
        }
    });
});
