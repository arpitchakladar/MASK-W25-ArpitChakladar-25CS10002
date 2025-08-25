const express = require("express");
const animes = require("./animes.js");
const app = express();
const PORT = 8080;

app.use(express.json());

app.get("/home", (req, res) => {
	res.send("Hello, world!");
});

app.get("/animes", (req, res) => {
	res.json(animes.getAnimes().map(anime => ({ name: anime.name, id: anime.id })));
});

app.get("/animes/:nameOrId", (req, res) => {
	const anime = animes.getAnimes().find(anime => anime.name === req.params.nameOrId) ||
		animes.getAnimes().find(anime => anime.id.toString() === req.params.nameOrId);
	if (!anime)
		return res.status(404).json({ message: "Anime not found." });

	res.json(anime);
});

app.post("/anime", (req, res) => {
	const { name, episodes, synopsis, rating } = req.body;

	animes.addAnime({ name, episodes, synopsis, rating });
	res.status(201).json({
		message: `Anime "${name}" was added successfully.`
	});
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
