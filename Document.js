const mongoose = require("mongoose");

const DocumentSchema = mongoose.Schema({
	_id: String,
	data: Object,
});

module.exports = mongoose.model("Document", DocumentSchema);
