define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/Deferred',
    'dojo/dom',
    'dojo/dom-construct',
    'dojo/request',
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
            dojoRequest,
            dijitMenuSeparator,
            CheckedMenuItem,
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

                var datasetButton = new dijitMenuItem({
                    label: 'Upload New Dataset',
                    iconClass: 'dijitIconNewTask',
                    onClick: lang.hitch(thisB, 'newDataset')
                });

                myBrowser.addGlobalMenuItem('peaklearner', datasetButton);

                var unlabeledButton = new dijitMenuItem({
                    label: 'Go to unlabeled region',
                    onClick: lang.hitch(thisB, 'goToUnlabeled')
                });

                myBrowser.addGlobalMenuItem('peaklearner', unlabeledButton);

                var labeledButton = new dijitMenuItem({
                    label: 'Go to labeled region',
                    onClick: lang.hitch(thisB, 'goToLabeled')
                });

                myBrowser.addGlobalMenuItem('peaklearner', labeledButton);

                var cItem = new CheckedMenuItem({label:"Use LOPART Models where necessary", checked:false, id:'lopart'});

                myBrowser.addGlobalMenuItem('peaklearner', cItem)

                if (dijitRegistry.byId('dropdownmenu_peaklearner') == undefined) {
                    myBrowser.renderGlobalMenu('peaklearner', {text: 'PeakLearner'}, myBrowser.menuBar);
                }

                console.log('PeakLearner plugin added');
            });
        },
        goToUnlabeled: function(){
            this.goToRegion("unlabeled");
        },
        goToLabeled: function(){
            this.goToRegion("labeled");
        },
        goToRegion: function(region){

            let regionCallback = (data) => {
                if(data){
                    this.browser.navigateToLocation(data)
                }
            };

            let url = this.browser.config.baseUrl + 'data/hub';

            let xhrArgs = {
                url: url,
                handleAs: "json",
                postData: JSON.stringify({'command': 'goTo', 'args': {'type': region}}),
                load: regionCallback
            };

            var deferred = dojo.xhrPost(xhrArgs);
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
