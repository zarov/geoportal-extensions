import EventBus from "eventbusjs";
import EventEditor from "./Event";
import Utils from "../../../Common/Utils";
import ID from "../../../Common/Utils/SelectorID";
import Logger from "../../../Common/Utils/LoggerByDefault";

var logger = Logger.getLogger("editor-themes");

/**
 * @classdesc
 *
 * Mapbox Themes management
 *
 * @constructor
 * @alias ol.style.editor.Theme
 * @param {Object} options - options for function call.
 * @example
 *   var theme = new Themes ({
 *        "target": "",
 *        "tools": {
 *          "thumbnails": true,
 *          "radiobutton": true
 *        },
 *        "obj": {
 *          "themesSummary": "", // Titre du composant (non graphique !)
 *          "themes": [{
 *             "thumbnail": "data/images/layer0.png",
 *             "name": "standard0",
 *             "url": "data/styles/layer0.json",
 *             "description": ""
 *          },{
 *             "thumbnail": "data/images/layer1.png",
 *             "name": "standard1",
 *             "url": "data/styles/layer1.json",
 *             "description": ""
 *          }]
 *        }
 *   });
 *  theme.add();
 *  theme.display(true);
 *  theme.getContainer();
 */
function Themes (options) {
    logger.trace("[constructor] Themes", options);

    // options
    this.options = options || {
        // TODO default...
    };

    if (!(this instanceof Themes)) {
        throw new TypeError("ERROR CLASS_CONSTRUCTOR");
    }

    this._initialize();

    this._initContainer();
};

/**
 * Constructor (alias)
 *
 * @private
 */
Themes.prototype.constructor = Themes;

/**
 * Initialize component
 * (called by constructor)
 *
 * @private
 */
Themes.prototype._initialize = function () {
    // unique editor id (optional!)
    this.id = this.options.id || null;

    if (!this.options.target) {
        // cf. add()
    }

    var _toolsDefault = {
        thumbnails : true,
        radiobutton : true
    };

    if (!this.options.tools || Object.keys(this.options.tools) === 0) {
        this.options.tools = _toolsDefault;
    }

    Utils.mergeParams(this.options.tools, _toolsDefault, false);

    if (typeof this.options.obj === "undefined" ||
        this.options.obj === null ||
        !this.options.obj) {
        // vide par defaut ?
        this.options.obj = {
            themesSummary : "",
            themes : []
        };
    }

    this.container = null;

    // DOM : className or id
    this.name = {
        target : "GPEditorMapBoxThemeTarget",
        container : "GPEditorMapBoxThemesContainer",
        containertheme : "GPEditorMapBoxThemeContainer",
        input : "GPEditorMapBoxThemeInput",
        label : "GPEditorMapBoxThemeTitle",
        image : "GPEditorMapBoxThemeImage",
        message : "GPEditorMapBoxThemeMessage"
    };
};

/**
 * Graphical rendering of the component
 * (called by constructor)
 *
 * @private
 * @example
 *  <div class="GPEditorMapBoxThemesContainer">
 *      <div id="GPEditorMapBoxThemeContainer-1" class="GPEditorMapBoxThemeContainer">
 *          <input type="radio" id="GPEditorMapBoxThemeInput-1" class="GPEditorMapBoxThemeInput" name="1552920176933">
 *          <img class="GPEditorMapBoxThemeImage" src="http://image1.png" alt="Description1"></img>
 *          <label for="GPEditorMapBoxThemeInput-1" class="GPEditorMapBoxThemeTitle">Titre1</label>
 *      </div>
 *      <div id="GPEditorMapBoxThemeContainer-2" class="GPEditorMapBoxThemeContainer">
 *          <input type="radio" id="GPEditorMapBoxThemeInput-2" class="GPEditorMapBoxThemeInput" name="1552920176934">
 *          <img class="GPEditorMapBoxThemeImage" src="http://image2.png" alt="Description2"></img>
 *          <label for="GPEditorMapBoxThemeInput-2" class="GPEditorMapBoxThemeTitle">Titre2</label>
 *      </div>
 * </div>
 */
Themes.prototype._initContainer = function () {
    // contexte
    var self = this;

    var obj = this.options.obj;

    var id = this.id || ID.generate();

    // div principale
    var div = document.createElement("div");
    div.className = this.name.container;

    for (var i = 0; i < obj.themes.length; i++) {
        var _theme = obj.themes[i];

        // div pour chaque theme
        var divTheme = document.createElement("div");
        divTheme.id = this.name.containertheme + "-" + i;
        divTheme.className = this.name.containertheme;
        divTheme.tabIndex = i;

        // url du style est obligatoire !
        var _url = _theme.url;
        if (_url && _url !== "") {
            // bouton
            if (this.options.tools.radiobutton) {
                var _checkbox = document.createElement("input");
                _checkbox.type = "radio";
                _checkbox.id = this.name.input + "-" + id + "_" + i;
                _checkbox.className = this.name.input;
                _checkbox.name = id;
                _checkbox.checked = false;
                _checkbox.data = _url; // on lie le DOM et la couche, utile lors d'evenement !
                if (_checkbox.addEventListener) {
                    _checkbox.addEventListener("click", function (e) {
                        self.onClickThemeTitleMapBox(e);
                    });
                } else if (_checkbox.attachEvent) {
                    _checkbox.attachEvent("onclick", function (e) {
                        self.onClickThemeTitleMapBox(e);
                    });
                }
                divTheme.appendChild(_checkbox);
            }
            // vignette
            if (this.options.tools.thumbnails) {
                if (_theme.thumbnail) {
                    var _img = document.createElement("img");
                    _img.className = this.name.image;
                    _img.src = _theme.thumbnail;
                    _img.alt = _theme.thumbnail;
                    _img.title = _theme.description || ""; // une description au survol de l'image ou titre...
                    _img.data = _url; // on lie le DOM et la couche, utile lors d'evenement !
                    if (_img.addEventListener) {
                        _img.addEventListener("click", function (e) {
                            self.onClickThemeImageMapBox(e);
                            // maj du radio button
                            var nodes = e.target.parentElement.childNodes;
                            if (nodes) {
                                var node = nodes[0];
                                if (node.tagName.toLowerCase() === "input") {
                                    node.checked = !node.checked;
                                }
                            }
                        });
                    } else if (_img.attachEvent) {
                        _img.attachEvent("onclick", function (e) {
                            self.onClickThemeImageMapBox(e);
                            var nodes = e.target.parentElement.childNodes;
                            if (nodes) {
                                var node = nodes[0];
                                if (node.tagName.toLowerCase() === "input") {
                                    node.checked = !node.checked;
                                }
                            }
                        });
                    }
                    divTheme.appendChild(_img);
                }
            }
            // label
            if (_theme.name) {
                var _label = document.createElement("label");
                if (this.options.tools.radiobutton) {
                    _label.htmlFor = _checkbox.id;
                }
                _label.className = this.name.label;
                _label.innerHTML = _theme.name;
                _label.title = _theme.description || ""; // une description au survol de l'image ou titre...
                _label.data = _url; // on lie le DOM et la couche, utile lors d'evenement !
                if (!this.options.tools.radiobutton) {
                    if (_label.addEventListener) {
                        _label.addEventListener("click", function (e) {
                            self.onClickThemeTitleMapBox(e);
                        });
                    } else if (_label.attachEvent) {
                        _label.attachEvent("onclick", function (e) {
                            self.onClickThemeTitleMapBox(e);
                        });
                    }
                }
                divTheme.appendChild(_label);
            }
        } else {
            var _msg = document.createElement("label");
            _msg.className = this.name.message;
            _msg.innerHTML = "Thème non disponible...";
            divTheme.appendChild(_msg);
        }

        div.appendChild(divTheme);
    }

    this.container = div;
};

// ################################################################### //
// ##################### public methods ############################## //
// ################################################################### //

/**
 * Add element into target DOM
 * @returns {Object} - Legend instance
 */
Themes.prototype.add = function () {
    if (!this.options.target) {
        if (!document.getElementById(this.name.target)) {
            var div = document.createElement("div");
            div.id = this.name.target;
            var node = document.documentElement ||
            document.getElementsByTagName("body")[0] ||
            document.getElementsByTagName("head")[0];
            node.appendChild(div);
        }
        this.options.target = document.getElementById(this.name.target);
    }
    if (this.container) {
        this.options.target.appendChild(this.container);
    }
    return this;
};

/**
 * Set display container or get
 *
 * @param {Boolean} display - show/hidden container or get status
 * @returns {Boolean} - true/false
 */
Themes.prototype.display = function (display) {
    logger.trace("display()", display);
    if (typeof display !== "undefined") {
        this.container.style.display = (display) ? "flex" : "none";
    }
    return (this.container.style.display === "flex");
};

/**
 * Get container (DOM)
 *
 * @returns {DOMElement} DOM element
 */
Themes.prototype.getContainer = function () {
    return this.container;
};
// ################################################################### //
// ####################### handlers events to dom #################### //
// ################################################################### //

/**
 * this method is called by event '' on '' tag form
 *
 * @param {Object} e - HTMLElement
 * @private
 * @fires Themes#editor:themes:image
 */
Themes.prototype.onClickThemeImageMapBox = function (e) {
    logger.trace("onClickThemeImageMapBox", e);
    e.editorID = this.id;
    e.data = this.options;
    EventBus.dispatch(EventEditor.themes.onclickimage, e);
};

/**
 * this method is called by event '' on '' tag form
 *
 * @param {Object} e - HTMLElement
 * @private
 * @fires Themes#editor:themes:title
 */
Themes.prototype.onClickThemeTitleMapBox = function (e) {
    logger.trace("onClickThemeTitleMapBox", e);
    e.editorID = this.id;
    e.data = this.options;
    EventBus.dispatch(EventEditor.themes.onclicktitle, e);
};

export default Themes;
