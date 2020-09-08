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
            content.selectedRows = [];
            var container = dom.create('div', { className: 'search-dialog' });
            var introdiv = dom.create('div', {
                className: 'mark-dialog intro',
                innerHTML: 'Upload a new hub.txt to the PeakLearner system for configuring.'
            }, container);
            var markDescriptionDiv = dom.create('div', { className: 'markDescrpit' }, container);
            var matchMessageDiv = dom.create('div', {
                innerHTML: 'No bookmarks have been created.',
                className: 'header'
            }, container);
            content.matchMessageDiv = matchMessageDiv;
            var configureDiv = dom.create('div', {
                innerHTML: 'Track not yet added',
                className: 'header'
            }, container);
            content.configureDiv = configureDiv;
            var headerDiv = dom.create('div', { className: 'header' }, container);
            content.headerDiv = headerDiv;
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
                onClick: function () {
                    var desc = content.urlBox.get('value');
                    sendPost('newHub', desc)
                    content.urlBox.reset();
                }
            }).placeAt(markDescriptionDiv);
            var controldiv = dom.create('div', { className: 'control-div' }, container);
            var clearSelectedButton = new dButton({
                showLabel: true,
                label: 'Clear Selections',
                onClick: function () {
                    var existing = JSON.parse(localStorage.getItem('JBrowseMarks'));
                    var selected = content.selectedRows;
                    for (var i in selected) {
                        for (var j in existing) {
                            dojo.query('.match-header' + existing[j].Id).style('color', 'black');
                        }
                    }
                    content.selectedRows = [];
                }
            }).placeAt(controldiv);
            var removeSelectedButton = new dButton({
                iconClass: 'dijitIconDelete',
                showLabel: true,
                label: 'Remove Selected Bookmarks',
                onClick: function () {
                    var existing = JSON.parse(localStorage.getItem('JBrowseMarks'));
                    var selected = content.selectedRows;
                    for (var i in selected) {
                        for (var j in existing) {
                            console.log(existing[j].Id + '::' + selected[i]);
                            if (existing[j].Id == selected[i]) {
                                existing.splice(j, 1);
                                break;
                            }
                        }
                    }
                    content.selectedRows = [];
                    localStorage.removeItem('JBrowseMarks');
                    localStorage.setItem('JBrowseMarks', JSON.stringify(existing));
                    dojo.style(headerDiv, { display: 'none' });
                    var oldLinks = dojo.query('.match-div-header');
                    if (oldLinks.length > 0) {
                        oldLinks.forEach(dojo.destroy);
                    }
                }
            }).placeAt(controldiv);
            var openSelectedButton = new dButton({
                iconClass: 'dijitIconFolderOpen',
                showLabel: true,
                label: 'Open Selected Bookmarks',
                onClick: function () {
                    var existing = JSON.parse(localStorage.getItem('JBrowseMarks'));
                    var selected = content.selectedRows;
                    var found = [];
                    for (var i in selected) {
                        for (var j in existing) {
                            if (existing[j].Id == selected[i]) {
                                window.open(existing[j].Link, '_blank');
                            }
                            console.log(existing[j].Id + ':::' + selected[i]);
                        }
                    }
                }
            }).placeAt(controldiv);
            var removeAllButton = new dButton({
                iconClass: 'dijitIconDelete',
                showLabel: true,
                label: 'Remove All Bookmarks',
                onClick: function () {
                    dojo.style(headerDiv, { display: 'none' });
                    dojo.style(matchMessageDiv, { display: 'block' });
                    var oldLinks = dojo.query('.match-div-header');
                    if (oldLinks.length > 0) {
                        oldLinks.forEach(dojo.destroy);
                    }
                    localStorage.removeItem('JBrowseMarks');
                    content.selectedRows = [];
                }
            }).placeAt(controldiv);
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
