const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
	author: { type: Schema.Types.ObjectId, ref: "User", required: true },
	date: { type: Date },
	content: { type: String, required: true },
});

MessageSchema.virtual("message_author").get(function () {
	return this.author.username + ", " + this.date.toLocaleString();
});

module.exports = mongoose.model("Message", MessageSchema);
