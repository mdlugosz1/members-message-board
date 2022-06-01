const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

passport.use(
	new LocalStrategy((username, password, done) => {
		User.findOne({ $or: [{ username: username }, { email: username }] }, (err, user) => {
			if (err) {
				return done(err);
			}

			if (!user) {
				return done(null, false, { message: "Incorrect username" });
			}

			bcrypt.compare(password, user.password, (err, res) => {
				if (res) {
					// passwords match! log user in
					return done(null, user);
				} else {
					// passwords do not match!
					return done(null, false, { message: "Incorrect password" });
				}
			});
		});
	})
);

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

exports.user_register_get = function (req, res, next) {
	res.render("registration_form", { title: "Registration form" });
};

exports.user_register_post = [
	body("name").trim().escape(),
	body("lastName").trim().escape(),
	body("userName").trim().escape(),
	body("email").normalizeEmail().isEmail().isLength({ min: 8 }).toLowerCase(),
	body("password").isLength({ min: 8 }),
	body("confirmPassword").custom((value, { req }) => {
		if (value !== req.body.password) {
			throw new Error(`Password doesn't match!`);
		}

		return true;
	}),
	(req, res, next) => {
		bcrypt.hash(req.body.password, 10, (err, hash) => {
			const errors = validationResult(req);
			const user = new User({
				first_name: req.body.name,
				last_name: req.body.lastName,
				username: req.body.username ? req.body.username : `${req.body.name} ${req.body.lastName}`,
				email: req.body.email,
				password: hash,
				membership_status: false,
				admin: false,
			});

			if (!errors.isEmpty()) {
				console.log(errors);
				res.render("registration_form", { title: "Registration form", user: user });
			} else {
				user.save((err) => {
					if (err) {
						return next(err);
					}

					res.redirect("/");
				});
			}
		});
	},
];

exports.user_login_get = function (req, res, next) {
	res.render("login_form", { title: "Log in to your account" });
};

exports.user_login_post = passport.authenticate("local", {
	successRedirect: "/",
	failureRedirect: "/login",
});

exports.user_logout = function (req, res, next) {
	req.logout((err) => {
		if (err) {
			next(err);
		}

		res.redirect("/");
	});
};

exports.account_get = function (req, res, next) {
	res.render("account", { title: "Account", user: res.locals.currentUser });
};

exports.account_post = function (req, res, next) {
	if (req.body.memberpassword === process.env.MEMBER_PASS) {
		User.findOneAndUpdate(
			{ username: res.locals.currentUser.username },
			{ membership_status: true },
			{},
			(err, user) => {
				if (err) {
					return next(err);
				}

				res.redirect("/");
			}
		);
	} else if (req.body.adminpassword === process.env.ADMIN_PASS) {
		User.findOneAndUpdate(
			{ username: res.locals.currentUser.username },
			{ admin: true },
			{},
			(err, user) => {
				if (err) {
					return next(err);
				}

				res.redirect("/");
			}
		);
	} else {
		res.render("account");
	}
};
