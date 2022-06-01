const async = require("async");
const Message = require("../models/message");
const User = require("../models/user");
const { body, validationResult } = require("express-validator");
const { redirect } = require("express/lib/response");

exports.messages_get = function (req, res, next) {
	Message.find({})
		.sort({ date: "desc" })
		.populate("author")
		.exec((err, results) => {
			if (err) {
				return next(err);
			}

			res.render("index", {
				title: "Message board",
				messages: results,
				user: res.locals.currentUser,
			});
		});
};

exports.messages_post = [
	body("message").trim().escape(),
	(req, res, next) => {
		const error = validationResult(req);
		const message = new Message({
			author: res.locals.currentUser._id,
			date: new Date(),
			content: req.body.message,
		});

		if (!error.isEmpty()) {
			res.render("index", { title: "Message board", message: message.content });
			return;
		} else {
			message.save((err) => {
				if (err) {
					return next(err);
				}

				User.findByIdAndUpdate(
					res.locals.currentUser._id,
					{ $push: { messages: message._id } },
					{},
					(err, user) => {
						if (err) {
							return next(err);
						}

						res.redirect("/");
					}
				);
			});
		}
	},
];

exports.message_delete = function (req, res, next) {
	User.updateOne(
		{ messages: req.body.deletemessage },
		{ $pull: { messages: req.body.deletemessage } },
		{},
		(err) => {
			if (err) {
				return next(err);
			}

			Message.findByIdAndDelete(req.body.deletemessage, (err) => {
				res.redirect("/");
			});
		}
	);
};
