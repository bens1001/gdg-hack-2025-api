import type { IncomingMessage } from "node:http";
import process from "node:process";
import helmet from "helmet";
import type { Context, ServiceAction, ServiceSchema } from "moleculer";
import ApiGateway from "moleculer-web";
import jwt from "jsonwebtoken";

const apiService: ServiceSchema = {
	name: "api",
	mixins: [ApiGateway],

	// More info about settings: https://moleculer.services/docs/0.14/moleculer-web.html
	settings: {
		// Exposed port
		port: Number(process.env?.PORT ?? 3000),

		// Exposed IP
		ip: process.env?.SERVER_HOSTNAME ?? "0.0.0.0",

		// Global Express middlewares. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Middlewares
		use: [helmet()],

		routes: [
			{
				path: "/api/health",

				// Route CORS settings (overwrite global settings)
				cors: {
					origin: "*",
				},
				aliases: {
					check: "$node.health",
				},
			},
			{
				path: "/api",

				whitelist: ["**"],

				// Route-level Express middlewares. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Middlewares
				use: [],

				// Enable/disable parameter merging method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Disable-merging
				mergeParams: true,

				// Enable authentication. Implement the logic into `authenticate` method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Authentication
				authentication: false,

				// Enable authorization. Implement the logic into `authorize` method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Authorization
				authorization: false,

				// The auto-alias feature allows you to declare your route alias directly in your services.
				// The gateway will dynamically build the full routes from service schema.
				autoAliases: true,

				/**
				 * Before call hook. You can check the request.
				 * @param {Context} ctx
				 * @param {Object} route
				 * @param {IncomingRequest} req
				 * @param {ServerResponse} res
				 * @param {Object} data
				 *
				onBeforeCall(ctx, route, req, res) {
					// Set request headers to context meta
					ctx.meta.userAgent = req.headers["user-agent"];
				}, */

				/**
				 * After call hook. You can modify the data.
				 * @param {Context} ctx
				 * @param {Object} route
				 * @param {IncomingRequest} req
				 * @param {ServerResponse} res
				 * @param {Object} data
				onAfterCall(ctx, route, req, res, data) {
					// Async function which return with Promise
					return doSomething(ctx, res, data);
				}, */

				// Calling options. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Calling-options
				callingOptions: {},

				aliases: {},

				bodyParsers: {
					json: {
						strict: false,
						limit: "1MB",
					},
					urlencoded: {
						extended: true,
						limit: "1MB",
					},
				},

				// Mapping policy setting. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Mapping-policy
				mappingPolicy: "all", // Available values: "all", "restrict"

				// Enable/disable logging
				logging: true,
			},
		],

		// Do not log client side errors (does not log an error response when the error.code is 400<=X<500)
		// log4XXResponses: false,
		// Logging the request parameters. Set to any log level to enable it. E.g. "info"
		logRequestParams: null,
		// Logging the response data. Set to any log level to enable it. E.g. "info"
		logResponseData: null,

		// Serve assets from "public" folder. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Serve-static-files
		assets: {
			folder: "public",

			// Options to `server-static` module
			options: {},
		},
	},

	methods: {
		/**
		 * Authenticate the request.
		 * Read the `Authorization` header, verify the JWT token, and return
		 * the decoded payload (e.g., user info) to be attached to `ctx.meta.user`.
		 */
		async authenticate(
			_ctx: Context<unknown, { user?: Record<string, unknown> }>,
			_route: Record<string, unknown>,
			request: IncomingMessage & {
				$action: ServiceAction & { auth: string };
			}
		) {
			// Read the token from the Authorization header
			const auth = request.headers.authorization;
			if (auth && auth.startsWith("Bearer ")) {
				const token = auth.slice(7);
				try {
					// Verify the token using your JWT secret.
					const decoded = jwt.verify(
						token,
						process.env.JWT_SECRET || "supersecretkey"
					);
					// Return the decoded payload. It will be attached to ctx.meta.user.
					return decoded;
				} catch (error) {
					throw new ApiGateway.Errors.UnAuthorizedError(
						ApiGateway.Errors.ERR_INVALID_TOKEN,
						[]
					);
				}
			}
			// No token provided – if authentication is required, an error can be thrown here.
			return null;
		},

		/**
		 * Authorize the request.
		 * Check if the action requires authentication and that the user exists.
		 * You can also add role-based checks here.
		 */
		async authorize(
			ctx: Context<unknown, { user?: Record<string, unknown> }>,
			_route: Record<string, unknown>,
			request: IncomingMessage & {
				$action: ServiceAction & { auth: string };
			}
		) {
			// The authenticated user is available in ctx.meta.user
			const user = ctx.meta.user;
			// If the action is marked as requiring authentication and there's no user, throw an error.
			if (request.$action.auth === "required" && !user) {
				throw new ApiGateway.Errors.UnAuthorizedError("NO_RIGHTS", []);
			}
			// Additional role-based authorization logic can be implemented here.
		},
	},
};

export default apiService;
