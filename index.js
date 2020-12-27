/**
 * Nunjucks driver for Sapling
 */


/* Dependencies */
const path = require("path");
const nunjucks = require("nunjucks");
const Interface = require("@sapling/sapling/drivers/render/Interface");
const { console } = require("@sapling/sapling/lib/Cluster");


module.exports = class Nunjucks extends Interface {

	/**
	 * Initialise Nunjucks
	 */
	constructor(App) {
		super();

		this.app = App;

		this.engine = nunjucks.configure(path.resolve(this.app.dir, this.app.config.viewsDir), {
			autoescape: true,
			noCache: !(this.app.config.production === 'on' || this.app.config.production === true)
		});
	}


	/**
	 * Render a template file
	 * 
	 * @param {string} template Path of the template file being rendered, relative to views/
	 * @param {object} data Object of data to pass to the template
	 */
	async render(template, data) {
		return this.engine.render(template, data);
	}


	/**
	 * Register custom tags with the template engine
	 * 
	 * @param {object} tags Object of functions
	 */
	async registerTags(tags) {
		throw new Error("Method not implemented: registerTags")
	}
};