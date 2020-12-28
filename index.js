/**
 * Nunjucks driver for Sapling
 */


/* Dependencies */
const path = require("path");
const nunjucks = require("nunjucks");
const Interface = require("@sapling/sapling/drivers/render/Interface");

const { console } = require("@sapling/sapling/lib/Cluster");
const SaplingError = require("@sapling/sapling/lib/SaplingError");


module.exports = class Nunjucks extends Interface {

	/**
	 * Initialise Nunjucks
	 */
	constructor(App, viewsPath) {
		super();

		this.app = App;
		this.viewsPath = viewsPath;

		this.engine = nunjucks.configure(this.viewsPath, {
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
		return new Promise((resolve, reject) => {
			this.engine.render(template, data, (err, res) => {
				if(err)
					resolve(new SaplingError(err));

				resolve(res);
			});
		});
	}


	/**
	 * Register custom tags with the template engine
	 * 
	 * @param {object} tags Object of functions
	 */
	async registerTags(tags) {
		function GetExtension(cb) {
			this.tags = ['get'];

			this.parse = (parser, nodes, lexer) => {
				var tok = parser.nextToken();
				var args = parser.parseSignature(null, true);
				parser.advanceAfterBlockEnd(tok.value);

				return new nodes.CallExtensionAsync(this, 'run', args, cb);
			};

			this.run = async (context, args, cb) => {
				let key = args instanceof Object && Object.keys(args).filter(e => e != '__keywords')[0];

				/* Set var based on fetched data */
				context.ctx[key] = await tags.get(args[key], args.role ? args.role : null);

				cb && cb();
			};
		}

		this.engine.addExtension('GetExtension', new GetExtension());
	}
};