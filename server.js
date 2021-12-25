const mongoose = require("mongoose");
const Document = require("./Document");
const env = require("dotenv");
env.config();

const URL = process.env.MONGO_DB_URL;
mongoose
	.connect(`${URL}`, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log("DB Connected ");
	});
const io = require("socket.io")(3001, {
	//io object is for connection
	cors: {
		//cors allows us to connect diff ports
		origin: "http://localhost/3000",
		method: ["GET", "POST"],
	},
});

io.on("connection", (socket) => {
	socket.on("get-document", async (documentId) => {
		const document = await findOrCreateDocumentInDB(documentId);

		socket.join(documentId);
		socket.emit("load-document", document.data);

		socket.on("send-changes", (delta) => {
			socket.broadcast.to(documentId).emit("receive-changes", delta);
		});

		socket.on("save-document", async (data) => {
			await Document.findByIdAndUpdate(documentId, { data });
		});
	});
});

async function findOrCreateDocumentInDB(id) {
	if (id == null) return;

	const document = await Document.findById(id);
	if (document) return document;
	return await Document.create({ _id: id, data: "" });
}
