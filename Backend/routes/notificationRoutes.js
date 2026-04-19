const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middlewares/authmiddleware");

// =============================
// GET MY NOTIFICATIONS
// GET /api/notifications
// Returns all types: connection + join team
// =============================
router.get("/", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [notifications] = await db.query(
      `SELECT
         n.id,
         n.type,
         n.message,
         n.is_read,
         n.created_at,
         n.idea_id,
         n.request_id,
         u.username AS sender_name
       FROM notifications n
       LEFT JOIN users u ON n.sender_id = u.id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json(notifications);
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =============================
// UNREAD COUNT
// GET /api/notifications/unread-count
// =============================
router.get("/unread-count", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS count
       FROM notifications
       WHERE user_id = ? AND is_read = 0`,
      [userId]
    );
    res.json({ count: rows[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================
// MARK ONE AS READ
// PATCH /api/notifications/:id/read
// =============================
router.patch("/:id/read", verifyToken, async (req, res) => {
  const notifId = req.params.id;
  const userId  = req.user.id;

  try {
    await db.query(
      `UPDATE notifications SET is_read = 1
       WHERE id = ? AND user_id = ?`,
      [notifId, userId]
    );
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================
// MARK ALL AS READ
// PATCH /api/notifications/read-all
// =============================
router.patch("/read-all", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    await db.query(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ?`,
      [userId]
    );
    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;