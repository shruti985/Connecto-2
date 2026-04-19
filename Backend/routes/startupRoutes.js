const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middlewares/authmiddleware");
const authMiddleware = require("../middlewares/authmiddleware");
// =============================
// POST IDEA
// =============================
router.post("/post-idea", verifyToken, async (req, res) => {
  try {
    const { title, problem, solution, skills, category, stage } = req.body;

    const userId = req.user.id;
    console.log(userId)

    // 🔹 Step 1 — Get username from users table

    const [userRows] = await db.query(
      `
      SELECT username 
      FROM users
      WHERE id = ?
      `,
      [userId],
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const author = userRows[0].username;
    console.log(userRows);
    console.log(author)

    // 🔹 Step 2 — Insert idea WITH author

    const sql = `
      INSERT INTO startup_ideas
      (
        title,
        problem,
        solution,
        skills,
        category,
        stage,
        user_id,
        author
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      title,
      problem,
      solution,
      JSON.stringify(skills),
      category,
      stage,
      userId,
      author,
    ]);

    // 🔹 Step 3 — Send author in response

    res.status(201).json({
      message: "Idea saved!",
      id: result.insertId,
      author: author,
    });
  } catch (err) {
    console.error("Post idea error:", err);

    res.status(500).json({
      error: "Failed to save idea",
    });
  }
});


// =============================
// GET ALL IDEAS
// =============================
router.get("/ideas", async (req, res) => {
  try {
    const [ideas] = await db.query(`
      SELECT 
        startup_ideas.*,

        COUNT(DISTINCT idea_likes.id) AS likes_count,
        COUNT(DISTINCT idea_comments.id) AS comments_count

      FROM startup_ideas

      LEFT JOIN users 
      ON startup_ideas.user_id = users.id

      LEFT JOIN idea_likes 
      ON startup_ideas.id = idea_likes.idea_id

      LEFT JOIN idea_comments 
      ON startup_ideas.id = idea_comments.idea_id

      GROUP BY startup_ideas.id

      ORDER BY startup_ideas.created_at DESC
    `);
      console.log(ideas);
    res.json(ideas);
  } catch (err) {
    console.error("Fetch ideas error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});


// =============================
// GET SINGLE IDEA
// =============================
router.get("/idea/:id", verifyToken, async (req, res) => {
  try {
    const ideaId = req.params.id;
    const userId = req.user ? req.user.id : null;

    const [rows] = await db.query(
      `
      SELECT 
        startup_ideas.*,

        COUNT(DISTINCT idea_likes.id) AS likes_count,
        COUNT(DISTINCT idea_comments.id) AS comments_count

      FROM startup_ideas

      LEFT JOIN users
      ON startup_ideas.user_id = users.id

      LEFT JOIN idea_likes
      ON startup_ideas.id = idea_likes.idea_id

      LEFT JOIN idea_comments
      ON startup_ideas.id = idea_comments.idea_id

      WHERE startup_ideas.id = ?
      GROUP BY startup_ideas.id
      `,
      [ideaId],
    );

    if (rows.length === 0) {
      console.log("Idea not found for ID:", ideaId);

      return res.status(404).json({
        message: "Idea not found",
      });
    }

    let isLiked = false;

    if (userId) {
      const [likeCheck] = await db.query(
        `
        SELECT id FROM idea_likes
        WHERE user_id = ?
        AND idea_id = ?
        `,
        [userId, ideaId],
      );

      if (likeCheck.length > 0) isLiked = true;
    }

    const idea = rows[0];

    idea.skills =
      typeof idea.skills === "string" ? JSON.parse(idea.skills) : idea.skills;

    res.json({
      ...idea,
      isLiked,
    });
  } catch (err) {
    console.error("Fetch idea error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});


// =============================
// LIKE IDEA
// =============================
router.post(
  "/idea/:id/like",
  authMiddleware,
  async (req, res) => {

    const ideaId = req.params.id;
    const userId = req.user.id;

    try {

      const [existing] = await db.query(
        `
        SELECT * FROM idea_likes
        WHERE user_id = ?
        AND idea_id = ?
        `,
        [userId, ideaId]
      );

      if (existing.length > 0) {

        await db.query(
          `
          DELETE FROM idea_likes
          WHERE user_id = ?
          AND idea_id = ?
          `,
          [userId, ideaId]
        );

        await db.query(
          `
          UPDATE startup_ideas
          SET likes_count = likes_count - 1
          WHERE id = ?
          `,
          [ideaId]
        );

        return res.json({
          liked: false,
        });

      } else {

        await db.query(
          `
          INSERT INTO idea_likes
          (user_id, idea_id)
          VALUES (?, ?)
          `,
          [userId, ideaId]
        );

        await db.query(
          `
          UPDATE startup_ideas
          SET likes_count = likes_count + 1
          WHERE id = ?
          `,
          [ideaId]
        );

        return res.json({
          liked: true,
        });
      }

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


// =============================
// ADD COMMENT
// =============================
router.post(
  "/idea/:id/comment",
  authMiddleware,
  async (req, res) => {

    const ideaId = req.params.id;
    const userId = req.user.id;
    const { comment } = req.body;

    try {

      if (!comment || comment.trim() === "") {
        return res.status(400).json({
          message: "Comment required",
        });
      }

      await db.query(
        `
        INSERT INTO idea_comments
        (idea_id, user_id, comment)
        VALUES (?, ?, ?)
        `,
        [ideaId, userId, comment]
      );

      await db.query(
        `
        UPDATE startup_ideas
        SET comments_count = comments_count + 1
        WHERE id = ?
        `,
        [ideaId]
      );

      res.json({
        message: "Comment added",
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


// =============================
// GET COMMENTS
// =============================
router.get(
  "/idea/:id/comments",
  async (req, res) => {

    const ideaId = req.params.id;

    try {

      const [comments] = await db.query(
        `
        SELECT
          idea_comments.id,
          idea_comments.comment,
          idea_comments.created_at,
          users.username AS user
        FROM idea_comments
        JOIN users
        ON idea_comments.user_id = users.id
        WHERE idea_comments.idea_id = ?
        ORDER BY created_at DESC
        `,
        [ideaId]
      );

      res.json(comments);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;