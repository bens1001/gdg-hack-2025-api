import type { Context, Service, ServiceSchema } from "moleculer";
import { Errors } from "moleculer";
const { MoleculerError } = Errors;

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import DbService from "moleculer-db";
import MongooseAdapter from "moleculer-db-adapter-mongoose";
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
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

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
		login: {
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

					if (!ADMIN_PASSWORD) {
						throw new MoleculerError(
							"Admin password not set",
							500,
							"SERVER_ERROR"
						);
					}

					// Admin check
					if (email === ADMIN_EMAIL) {
						const valid = await bcrypt.compare(
							password,
							await bcrypt.hash(ADMIN_PASSWORD, 10)
						);
						if (!valid) {
							this.logger.warn("Admin password mismatch");
							throw new MoleculerError(
								"Invalid admin credentials",
								401,
								"UNAUTHORIZED"
							);
						}
						const token = this.generateToken({
							email,
							role: "admin",
						});
						return { token, role: "admin" };
					}

					// Otherwise, check for a manager account in the DB
					const manager = await this.adapter.findOne({
						email,
						roles: { $in: ["manager"] },
					});
					if (!manager) {
						throw new MoleculerError(
							"Manager not found",
							404,
							"NOT_FOUND"
						);
					}

					const validPassword = await this.verifyPassword(
						password,
						manager.password
					);
					if (!validPassword) {
						this.logger.warn("Manager password mismatch", {
							email,
						});
						throw new MoleculerError(
							"Invalid manager credentials",
							401,
							"UNAUTHORIZED"
						);
					}

					const token = this.generateToken(manager);
					return { token, role: "manager" };
				} catch (error) {
					this.logger.error("Error in login action", error);
					throw error;
				}
			},
		},

		create: {
			rest: {
				method: "POST",
				path: "/",
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
							"Manager already exists",
							409,
							"CONFLICT"
						);
					}

					const hashed = await this.hashPassword(password);
					const newManager = await this.adapter.insert({
						email,
						password: hashed,
						roles: ["manager"],
					});

					return { message: "Admin created", admin: newManager };
				} catch (error) {
					this.logger.error("Error in create action", error);
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
			if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
				this.logger.warn(
					"ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping seeding."
				);
				return;
			}
			const existingAdmin = await this.adapter.findOne({
				email: ADMIN_EMAIL,
			});
			if (!existingAdmin) {
				this.logger.info("No admin found. Seeding admin account...");
				const hashedPassword = await this.hashPassword(ADMIN_PASSWORD);
				const Admin = await this.adapter.insert({
					email: ADMIN_EMAIL,
					password: hashedPassword,
					roles: ["admin"],
				});
				this.logger.info("Admin seeded successfully:", Admin);
			} else {
				this.logger.info("Admin already exists.");
			}
		} catch (error) {
			this.logger.error("Error seeding admin:", error);
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
