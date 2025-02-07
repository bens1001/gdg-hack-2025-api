import type { Context, Service, ServiceSchema } from "moleculer";
import { Errors } from "moleculer";
const { MoleculerError } = Errors;

import DbService from "moleculer-db";
import MongooseAdapter from "moleculer-db-adapter-mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ManagerModel } from "../models/manager.schema";

export type ActionHelloParams = {
	// name: string;
};

type ServiceSettings = {
	// defaultName: string;
};

type ServiceMethods = {
	generateToken(user: any): string;
	hashPassword(password: string): Promise<string>;
	verifyPassword(password: string, hash: string): Promise<boolean>;
};

type ServiceThis = Service<ServiceSettings> & ServiceMethods;

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;

const managerService: ServiceSchema<ServiceSettings, ServiceThis> = {
	name: "manager",

	/**
	 * Settings
	 */
	settings: {
		defaultName: "Moleculer",
	},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Mixins
	 */
	mixins: [DbService],

	model: ManagerModel,

	adapter: new MongooseAdapter(
		process.env.MONGO_URI_CLOUD || "mongodb://localhost/moleculer"
	),

	/**
	 * Actions
	 */
	actions: {
		// Action for admin (or superadmin) login – only admins authenticate via JWT.

		adminLogin: {
			rest: {
				method: "POST",
				path: "/login",
			},
			params: {
				email: "string|email",
				password: "string",
			},
			async handler(ctx: Context<{ email: string; password: string }>) {
				try {
					const { email, password } = ctx.params;

					if (!SUPER_ADMIN_PASSWORD) {
						throw new MoleculerError(
							"Super admin password not set",
							500,
							"SERVER_ERROR"
						);
					}

					// Superadmin check
					if (email === SUPER_ADMIN_EMAIL) {
						const valid = await bcrypt.compare(
							password,
							await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10)
						);
						if (!valid) {
							this.logger.warn("Superadmin password mismatch");
							throw new MoleculerError(
								"Invalid superadmin credentials",
								401,
								"UNAUTHORIZED"
							);
						}
						const token = this.generateToken({
							email,
							role: "superadmin",
						});
						return { token, role: "superadmin" };
					}

					// Otherwise, check for a regular admin account in the DB
					const user = await this.adapter.findOne({
						email,
						roles: { $in: ["admin"] },
					});
					if (!user) {
						throw new MoleculerError(
							"Admin not found",
							404,
							"NOT_FOUND"
						);
					}

					const validPassword = await this.verifyPassword(
						password,
						user.password
					);
					if (!validPassword) {
						this.logger.warn("Admin password mismatch", { email });
						throw new MoleculerError(
							"Invalid admin credentials",
							401,
							"UNAUTHORIZED"
						);
					}

					const token = this.generateToken(user);
					return { token, role: "admin" };
				} catch (error) {
					this.logger.error("Error in adminLogin action", error);
					throw error;
				}
			},
		},

		createAdmin: {
			rest: {
				method: "POST",
				path: "/admin/register",
			},
			params: {
				email: "string",
				password: "string",
			},
			auth: "required",
			async handler(ctx: Context<{ email: string; password: string }>) {
				try {
					const { email, password } = ctx.params;
					const existing = await this.adapter.findOne({ email });

					if (existing) {
						throw new MoleculerError(
							"Admin already exists",
							409,
							"CONFLICT"
						);
					}

					const hashed = await this.hashPassword(password);
					const newAdmin = await this.adapter.insert({
						email,
						password: hashed,
						roles: ["admin"],
					});

					return { message: "Admin created", admin: newAdmin };
				} catch (error) {
					this.logger.error("Error in createAdmin action", error);
					throw error;
				}
			},
		},
	},

	/**
	 * Events
	 */
	events: {},

	/**
	 * Methods
	 */
	methods: {
		generateToken(user: any) {
			return jwt.sign(
				{ id: user._id, email: user.email, role: user.roles },
				JWT_SECRET,
				{
					expiresIn: "1h",
				}
			);
		},

		async hashPassword(password: string) {
			return bcrypt.hash(password, 10);
		},

		async verifyPassword(password: string, hash: string) {
			return bcrypt.compare(password, hash);
		},
	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {
		this.logger.info(`The ${this.name} service created.`);
	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {
		this.logger.info(`The ${this.name} service started.`);
		try {
			if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
				this.logger.warn(
					"SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set. Skipping seeding."
				);
				return;
			}
			const existingSuperAdmin = await this.adapter.findOne({
				email: SUPER_ADMIN_EMAIL,
			});
			if (!existingSuperAdmin) {
				this.logger.info(
					"No superadmin found. Seeding superadmin account..."
				);
				const hashedPassword = await this.hashPassword(
					SUPER_ADMIN_PASSWORD
				);
				const superAdmin = await this.adapter.insert({
					email: SUPER_ADMIN_EMAIL,
					password: hashedPassword,
					roles: ["superadmin"],
				});
				this.logger.info("Superadmin seeded successfully:", superAdmin);
			} else {
				this.logger.info("Superadmin already exists.");
			}
		} catch (error) {
			this.logger.error("Error seeding superadmin:", error);
		}
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {
		this.logger.info(`The ${this.name} service stopped.`);
	},
};

export default managerService;
