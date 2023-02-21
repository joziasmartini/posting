import express, { Request, Response } from "express";
import { faker } from "@faker-js/faker";
import mysql from "mysql";

const app = express();

interface Post {
  id: number;
  title: string;
  body: string;
  author: string;
  createdAt: Date;
}

// Create a MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "blog",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database: ", err);
    return;
  }

  console.log("Connected to MySQL database");
});

// Generate fake data for posts
const generatePosts = (count: number): Post[] => {
  const posts: Post[] = [];

  for (let i = 0; i < count; i++) {
    const post: Post = {
      id: i + 1,
      title: faker.lorem.sentence(),
      body: faker.lorem.paragraph(),
      author: faker.name.fullName(),
      createdAt: new Date(),
    };

    posts.push(post);
  }

  return posts;
};

// Insert posts data into the MySQL database
const insertPosts = (posts: Post[]): void => {
  const values = posts.map((post) => [
    post.title,
    post.body,
    post.author,
    post.createdAt,
  ]);

  const query = "INSERT INTO posts (title, body, author, created_at) VALUES ?";

  connection.query(query, [values], (err, result) => {
    if (err) {
      console.error("Error inserting posts data into MySQL database: ", err);
      return;
    }

    console.log(
      `Inserted ${result.affectedRows} posts into the MySQL database`
    );
  });
};

// Get posts data from the MySQL database
const getPosts = (callback: (posts: Post[]) => void): void => {
  const query = "SELECT * FROM posts";

  connection.query(query, (err, rows) => {
    if (err) {
      console.error("Error getting posts data from MySQL database: ", err);
      return;
    }

    const posts = rows.map((row: Post) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      author: row.author,
      createdAt: row.createdAt,
    }));

    callback(posts);
  });
};

// Define routes for posts
app.get("/api/posts", (req: Request, res: Response) => {
  getPosts((posts) => {
    res.json(posts);
  });
});

app.post("/api/posts", (req: Request, res: Response) => {
  const posts = generatePosts(10);

  insertPosts(posts);

  res.send("Posts data inserted into the MySQL database");
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
