const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	first_name: { type: String, required: true },
	last_name: { type: String, required: true },
	email: { type: String, required: true, minlength: 8 },
	username: String,
	membership_status: Boolean,
	messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
});

module.exports = mongoose.model("User", UserSchema);
