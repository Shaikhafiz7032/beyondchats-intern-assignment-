// Basic backend with article scraping & CRUD APIs

const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
app.use(express.json());

// In-memory "database"
let articles = [];

// Scrape 5 oldest articles from BeyondChats blog
async function scrapeArticles() {
    try {
        const { data } = await axios.get("https://beyondchats.com/blogs/");
        const $ = cheerio.load(data);
        const blogLinks = $("a.blog-card").map((i, el) => $(el).attr("href")).get();
        const oldest5 = blogLinks.slice(-5);

        articles = oldest5.map(link => ({
            id: Math.random().toString(36).substr(2, 9),
            title: `Sample Title for ${link}`,
            content: `Sample content for ${link}`,
            source_url: link,
            created_at: new Date(),
            updated_at: new Date()
        }));

        console.log("Articles scraped:", articles.length);
    } catch (err) {
        console.log("Scraping error:", err.message);
    }
}

// CRUD APIs

// Get all articles
app.get("/articles", (req, res) => {
    res.json(articles);
});

// Get article by ID
app.get("/articles/:id", (req, res) => {
    const article = articles.find(a => a.id === req.params.id);
    res.json(article || {});
});

// Create new article
app.post("/articles", (req, res) => {
    const newArticle = { ...req.body, id: Math.random().toString(36).substr(2, 9), created_at: new Date(), updated_at: new Date() };
    articles.push(newArticle);
    res.json(newArticle);
});

// Update article
app.put("/articles/:id", (req, res) => {
    const article = articles.find(a => a.id === req.params.id);
    if (article) {
        Object.assign(article, req.body, { updated_at: new Date() });
    }
    res.json(article || {});
});

// Delete article
app.delete("/articles/:id", (req, res) => {
    articles = articles.filter(a => a.id !== req.params.id);
    res.json({ message: "Deleted" });
});

// Start server
app.listen(5000, () => {
    console.log("Backend running on port 5000");
    scrapeArticles();
});
