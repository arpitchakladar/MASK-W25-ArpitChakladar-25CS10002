const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "tmp", "animes.json");

module.exports.getAnimes = () => {
	try {
		return JSON.parse(fs.readFileSync(filePath, "utf8"));
	} catch (err) {
		if (err.code === "ENOENT")
			return [];
		throw err;
	}
};

module.exports.addAnime = data => {
	const animes = module.exports.getAnimes();
	animes.push({ ...data, id: Date.now() });
	createFileIfNotExists();
	fs.writeFileSync(filePath, JSON.stringify(animes, null, "\t"), "utf8");
};

function createFileIfNotExists() {
	if (!fs.existsSync(filePath)) {
		fs.mkdirSync(path.dirname(filePath), { recursive: true });
		fs.writeFileSync(filePath, "[]", "utf8");
	}
}
