/**
 * This file contains the capability overview search functionality.
 *
 * @module moodle-tool_capability-search
 */

/**
 * Constructs a new capability search manager.
 *
 * @namespace M.tool_capability
 * @class Search
 * @constructor
 * @extends Base
 */
var SEARCH = function() {
    SEARCH.superclass.constructor.apply(this, arguments);
};
SEARCH.prototype = {
    /**
     * The search form.
     * @property form
     * @type Node
     * @protected
     */
    form : null,
    /**
     * The capability select node.
     * @property select
     * @type Node
     * @protected
     */
    select: null,
    /**
     * An associative array of search option. Populated from the select node above during initialisation.
     * @property selectoptions
     * @type Object
     * @protected
     */
    selectoptions : {},
    /**
     * The search input field.
     * @property input
     * @type Node
     * @protected
     */
    input: null,
    /**
     * The submit button for the form.
     * @property button
     * @type Node
     * @protected
     */
    button: null,
    /**
     * The last search node if there is one.
     * If there is a last search node then the last search term will be persisted between requests.
     * @property lastsearch
     * @type Node
     * @protected
     */
    lastsearch : null,
    /**
     * Constructs the search manager.
     * @method initializer
     */
    initializer : function() {
        this.form = Y.one('#capability-overview-form');
        this.select = this.form.one('select[data-search=capability]');
        this.select.setStyle('minWidth', this.select.get('offsetWidth'));
        this.select.get('options').each(function(option) {
            var capability = option.get('value');
            this.selectoptions[capability] = option;
        }, this);
        this.button = this.form.all('input[type=submit]');
        this.lastsearch = this.form.one('input[name=search]');

        var div = Y.Node.create('<div id="capabilitysearchui"></div>'),
            label = Y.Node.create('<label for="capabilitysearch">'+this.get('strsearch')+'</label>');
        this.input = Y.Node.create('<input type="text" id="capabilitysearch" />');

        div.append(label).append(this.input);

        this.select.insert(div, 'before');

        this.input.on('keyup', this.typed, this);
        this.select.on('change', this.validate, this);

        if (this.lastsearch) {
            this.input.set('value', this.lastsearch.get('value'));
            this.typed();
            if (this.select.one('option[selected]')) {
                this.select.set('scrollTop', this.select.one('option[selected]').get('getX'));
            }
        }

        this.validate();
    },
    /**
     * Disables the submit button if there are no capabilities selected.
     * @method validate
     */
    validate : function() {
        this.button.set('disabled', (this.select.get('value') === ''));
    },
    /**
     * Called when ever the user types into the search field.
     * This method hides any capabilities that don't match the search term.
     * @method typed
     */
    typed : function() {
        var search = this.input.get('value'),
            matching = 0,
            last = null,
            capability;
        if (this.lastsearch) {
            this.lastsearch.set('value', search);
        }
        this.select.all('option').remove();
        for (capability in this.selectoptions) {
            if (capability.indexOf(search) >= 0) {
                matching++;
                last = this.selectoptions[capability];
                this.select.append(this.selectoptions[capability]);
            }
        }
        if (matching === 0) {
            this.input.addClass("error");
        } else {
            this.input.removeClass("error");
            if (matching === 1) {
                last.set('selected', true);
            }
        }
        this.validate();
    }
};
Y.extend(SEARCH, Y.Base, SEARCH.prototype, {
    NAME : 'tool_capability-search',
    ATTRS : {
        strsearch : {}
    }
});

M.tool_capability = M.tool_capability || {};

M.tool_capability.scroll_header = function() {
    Y.on('scroll', function() {
        var main_table = Y.one('table.comparisontable');
        var parent = main_table.ancestor();
        var scroll = window.scrollY;
        var anchor_top = main_table.get('offsetTop');
        var anchor_bottom = main_table.one("tr.lastrow").get('offsetTop');
        var clone_table = Y.one('#clone');
        var background = Y.one('body').getComputedStyle(
                'background-color');

        if (scroll > anchor_top && scroll < anchor_bottom) {
            if (!clone_table) {

                // Find static navbar height.
                var navbar_height = 0;
                Y.all('header').each(function(node){
                    if (node.getComputedStyle('position') == 'fixed') {
                        navbar_height = node.getComputedStyle('height');
                    }
                });

                // Create clone table.
                clone_table = main_table.cloneNode(true);
                clone_table.setAttribute('id', 'clone');
                clone_table.setStyles({
                    position : 'fixed',
                    'margin-top' : navbar_height,
                    'pointer-events' : 'none',
                    top : 0
                });

                clone_table.one('thead tr').setStyle('height', '120');
                clone_table.setStyle('width', main_table.getComputedStyle('width'));
                parent.append(clone_table);
                clone_table.setStyle('visibility', 'hidden');
                clone_table.one('thead').setStyles({
                    visibility : 'visible',
                    'background-color' : background,
                    'pointer-events' : 'auto',
                    outline : '1px solid ' + background
                });
            }

        } else if (clone_table) {
            clone_table.remove();
            clone_table = null;
        }

        if (clone_table) {
            clone_table.setStyle(
                    'left',
                    main_table.getDOMNode().getBoundingClientRect().left
            );
        }
    });
};

/**
 * Initialises capability search functionality.
 * @static
 * @method M.tool_capability.init_capability_search
 * @param {Object} options
 */
M.tool_capability.init_capability_search = function(options) {
    new SEARCH(options);
    M.tool_capability.scroll_header();
};
