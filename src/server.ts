import express from "express";
import { PrismaClient } from "@prisma/client";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";
import { equal } from "assert";

const port = 3000;
const app = express();
const prisma = new PrismaClient()

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.get("/movies", async (_, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: { title: "asc" },
        include: {
            genres: true,
            languages: true
        }
    });

    res.json(movies);
});

app.post("/movies", async (req, res) => {
    let { title, genre_id, language_id, oscar_count, release_date } = req.body;

    title = title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();

    const movieWithSameTitle = await prisma.movie.findFirst({
        where: { title: { equals: title, mode: "insensitive" } }
    });

    if (movieWithSameTitle) {
        return res
            .status(409)
            .send({ message: "Já existe um filme cadastrado com esse titulo" })
    }

    try {
        await prisma.movie.create({
            data: {
                title,
                genre_id,
                language_id,
                oscar_count,
                release_date: new Date(release_date)
            }
        });

    } catch (error) {
        return res.status(500).send({ message: "Falha ao cadastrar um filme" });
    }

    res.status(201).send();
});
app.put("/movies/:id", async (req, res) => {

    const id = Number(req.params.id);
    try {
        const movie = await prisma.movie.findUnique({
            where: {
                id
            }
        });

        if (!movie) {
            return res.status(404).send({ message: "Filme não encontrado" })
        };

        const data = { ...req.body };
        data.release_date = data.release_date ? new Date(data.release_date) : undefined;

        await prisma.movie.update({
            where: { id },
            data: data
        });

    } catch (error) {
        return res.status(500).send({ message: "Falha ao atualizar o regitro do filme" })
    }

    res.status(200).send()
});
app.delete("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const movie = await prisma.movie.findUnique({ where: { id } });

        if (!movie) {
            return res.status(404).send({ message: "O filme não foi encontrado" })
        }

        await prisma.movie.delete({ where: { id } });
    } catch (error) {
        return res.status(500).send({ message: "Não foi possivle remover o filme" })
    }
    res.status(200).send()
})
app.get("/movies/:genreName", async (req, res) => {
    try {
        const moviesFilteredByGenreName = await prisma.movie.findMany({
            include: {
                genres: true,
                languages: true
            },
            where: {
                genres: {
                    name: {
                        equals: req.params.genreName,
                        mode: "insensitive"
                    }

                }
            }
        });

        res.status(200).send(moviesFilteredByGenreName);
    } catch (error) {
        return res.status(500).send({ message: "Falha ao filtrar filmes por gênero" });
    }
});

app.get("/genres", async (req, res) => {

    try {
        const genreFilter = await prisma.genre.findMany({
            orderBy: {
                name: "asc"
            }
        })
        const genreNames = genreFilter.map(genre => genre.name);

        res.status(200).json({ genres: genreNames });

    } catch (error) {
        res.status(500).send({ message: "Houve um problema ao buscar os gêneros" })
    }
})

app.post("/genres", async (req, res) => {
    let { name } = req.body;

    if (!name) {
        return res.status(400).send({ message: "O nome é obrigatório." })
    }
    const genreWithName = await prisma.genre.findFirst({
        where: { name: { equals: name, mode: "insensitive" } }
    })

    if (genreWithName) {
        return res.status(409).send({ message: "Esse gênero já existe." })
    }
    try {
        await prisma.genre.create({
            data: { name }
        });

        res.status(201).send({ message: "Gênero cadastrado com sucesso." });

    } catch (error) {
        res.status(500).send({ message: "Falha ao adicionar gênero." })
    }

})


app.put("/genres/:id", async (req, res) => {
    const { id } = req.params;
    let { name } = req.body;

    if (!name) {
        return res.status(400).send({ message: "O nome do gênero é obrigatório." });
    }

    name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

    try {
        const genre = await prisma.genre.findUnique({
            where: { id: Number(id) }
        });

        if (!genre) {
            return res.status(404).send({ message: "Gênero não encontrado" });
        }

        const existingGenre = await prisma.genre.findFirst({
            where: {
                name: { equals: name, mode: "insensitive" },
                id: { not: Number(id) }
            }
        });

        if (existingGenre) {
            return res.status(409).send({ message: "Este nome de Gênero já existe" })
        }

        const updateGenre = await prisma.genre.update({
            where: {
                id: Number(id)
            },
            data: { name }
        });

        res.status(200).send(updateGenre);

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Falha ao atualizar o gênero" })
    }

});

app.delete("/genres/:id", async (req, res) => {
    const { id } = req.params;
    const genreId = Number(id);  

    try {
        const genres = await prisma.genre.findMany();

        const genre = await prisma.genre.findUnique({
            where: { id: genreId },
        });

        if (!genre) {
            return res.status(404).send({ message: "Gênero não encontrado." });
        }

        await prisma.genre.delete({
            where: { id: genreId },
        });

        res.status(200).send({ message: "Gênero removido com sucesso." });
    } catch (error) {
        res.status(500).send({ message: "Houve um problema ao remover o gênero." });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});