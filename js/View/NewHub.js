define([
    'dojo/_base/lang',
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/dom-construct',
    'dojo/aspect',
    'dijit/Dialog',
    'dijit/focus',
    'dijit/form/Button',
    'dijit/form/TextBox',
    'dijit/form/Select',
    'JBrowse/View/Dialog/WithActionBar',
    'dojo/domReady!'
],
function (
    lang,
    declare,
    array,
    dom,
    aspect,
    dijitDialog,
    focus,
    dButton,
    dTextBox,
    dSelect,
    ActionBarDialog
) {
    return declare(ActionBarDialog, {
        constructor: function () {
            var thisB = this;

            //On close of menu
            aspect.after(this, 'hide', function () {
                focus.curNode && focus.curNode.blur();
                setTimeout(function () {
                    thisB.destroyRecursive();
                }, 500);
            });
        },
        _dialogContent: function () {
            var myBrowser = this.browser;
            var content = this.content = {};
            var dataRoot = this.dataRoot;
            var currentStatus = ""
            var thisB = this;
            var container = dom.create('div', { className: 'search-dialog' });
            var introdiv = dom.create('div', {
                className: 'mark-dialog intro',
                innerHTML: 'Upload a new hub.txt to the PeakLearner system for configuring.'
            }, container);
            var markDescriptionDiv = dom.create('div', { className: 'markDescrpit' }, container);
            var status = dom.create('div', {
                        className: 'mark-dialog',
                        innerHTML: currentStatus,
                    }, markDescriptionDiv);
            // Add new track hub
            content.urlBox = new dTextBox({
                id: 'urlBox',
                value: '',
                placeHolder: 'TrackHub URL'
            }).placeAt(markDescriptionDiv);

            var addHubButton = new dButton({
                iconClass: 'dijitIconNewTask',
                showLabel: true,
                label: 'Upload Hub',
                onClick: () => {
                    // TODO: Make this in such a way that it can "Ping the server" on progress instead of waiting for the server to complete
                    var desc = content.urlBox.get('value');
                    var success = (data, status, xhr) => {
                        const baseUrl = thisB.browser.config.baseUrl;

                        const newUrl = baseUrl + "?data=" + data;

                        // for the love of god tell me there is a better way
                        // This is supposed to be the status div created above
                        this.domNode.children[1].children[0].children[1].children[0].innerHTML="New Hub created at " +
                            "<a href=\"" + newUrl + "\">" + newUrl + "</a> ";
                    };
                    sendPost('parseHub', desc, success);
                    content.urlBox.reset();
                }
            }).placeAt(markDescriptionDiv);
            return container;
        },
        _fillActionBar: function (actionBar) {
            //Bottom Bar
            var thisB = this;
            new dButton({
                label: 'Close',
                onClick: function () {
                    thisB.callback(false);
                    thisB.hide();
                }
            }).placeAt(actionBar);
        },
        show: function (browser, callback) {
            this.browser = browser;
            this.callback = callback || function () {
            };
            this.set('title', 'Upload New Hub');
            this.set('content', this._dialogContent());
            this.inherited(arguments);
            focus.focus(this.closeButtonNode);
        }
    });
});
