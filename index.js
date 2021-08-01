/**
 * Nunjucks driver for Sapling
 */


/* Dependencies */
import nunjucks from 'nunjucks';
import Interface from '@sapling/sapling/drivers/render/Interface.js';

import SaplingError from '@sapling/sapling/lib/SaplingError.js';


export default class Nunjucks extends Interface {
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
		return new Promise(resolve => {
			this.engine.render(template, data, (error, response) => {
				if (error) {
					resolve(new SaplingError(error));
				}

				resolve(response);
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

			this.parse = (parser, nodes) => {
				const tok = parser.nextToken();
				const args = parser.parseSignature(null, true);
				parser.advanceAfterBlockEnd(tok.value);

				return new nodes.CallExtensionAsync(this, 'run', args, cb);
			};

			this.run = async (context, args, cb) => {
				const key = args instanceof Object && Object.keys(args).find(arg => arg !== '__keywords');

				/* Set var based on fetched data */
				context.ctx[key] = await tags.get(args[key], args.role ? args.role : null);

				if (cb) {
					cb();
				}
			};
		}

		this.engine.addExtension('GetExtension', new GetExtension());
	}
}
