const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middlewares/authmiddleware");

// =============================
// SEND JOIN REQUEST
// POST /api/team/idea/:id/join-request
// =============================
router.post("/idea/:id/join-request", verifyToken, async (req, res) => {
  const ideaId = req.params.id;
  const userId = req.user.id;
  const { skills, message } = req.body;

  try {
    // Get idea + founder
    const [ideas] = await db.query(
      `SELECT user_id, title FROM startup_ideas WHERE id = ?`,
      [ideaId],
    );
    if (ideas.length === 0)
      return res.status(404).json({ error: "Idea not found" });

    const founderId = ideas[0].user_id;

    // Founder cannot join own idea
    if (founderId === userId)
      return res
        .status(400)
        .json({ error: "You are the founder of this idea" });

    // Already a member?
    const [alreadyMember] = await db.query(
      `SELECT id FROM team_members WHERE idea_id = ? AND user_id = ?`,
      [ideaId, userId],
    );
    if (alreadyMember.length > 0)
      return res.status(400).json({ error: "You are already a team member" });

    // Check existing request
    const [existing] = await db.query(
      `SELECT id, status FROM join_requests WHERE idea_id = ? AND user_id = ?`,
      [ideaId, userId],
    );

    if (existing.length > 0) {
      if (existing[0].status === "pending")
        return res.status(400).json({ error: "Request already sent" });
      if (existing[0].status === "accepted")
        return res.status(400).json({ error: "You are already a member" });
      // rejected → allow re-request
      await db.query(
        `UPDATE join_requests
         SET skills = ?, message = ?, status = 'pending', created_at = NOW()
         WHERE id = ?`,
        [skills, message, existing[0].id],
      );
    } else {
      await db.query(
        `INSERT INTO join_requests (idea_id, user_id, skills, message)
         VALUES (?, ?, ?, ?)`,
        [ideaId, userId, skills, message],
      );
    }

    // Get requester username for notification text
    const [users] = await db.query(`SELECT username FROM users WHERE id = ?`, [
      userId,
    ]);
    const username = users[0]?.username || "Someone";

    // Get new/updated request id
    const [reqRow] = await db.query(
      `SELECT id FROM join_requests WHERE idea_id = ? AND user_id = ?`,
      [ideaId, userId],
    );
    const requestId = reqRow[0]?.id || null;

    // Notify the founder
    // sender_id = person who triggered the notification (the requester)
    await db.query(
      `INSERT INTO notifications
         (user_id, sender_id, type, message, idea_id, request_id)
       VALUES (?, ?, 'join_request', ?, ?, ?)`,
      [
        founderId,
        userId,
        `${username} wants to join your idea: "${ideas[0].title}"`,
        ideaId,
        requestId,
      ],
    );

    res.json({ message: "Join request sent!" });
  } catch (err) {
    console.error("Join request error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =============================
// GET JOIN REQUESTS (Founder only)
// GET /api/team/idea/:id/join-requests
// =============================
router.get("/idea/:id/join-requests", verifyToken, async (req, res) => {
  const ideaId = req.params.id;
  const userId = req.user.id;

  try {
    const [ideas] = await db.query(
      `SELECT user_id FROM startup_ideas WHERE id = ?`,
      [ideaId],
    );
    if (ideas.length === 0)
      return res.status(404).json({ error: "Idea not found" });
    if (ideas[0].user_id !== userId)
      return res
        .status(403)
        .json({ error: "Only the founder can view requests" });

    const [requests] = await db.query(
      `SELECT
         jr.id,
         jr.skills,
         jr.message,
         jr.status,
         jr.created_at,
         u.id   AS user_id,
         u.username
       FROM join_requests jr
       JOIN users u ON jr.user_id = u.id
       WHERE jr.idea_id = ?
       ORDER BY jr.created_at DESC`,
      [ideaId],
    );

    res.json(requests);
  } catch (err) {
    console.error("Get join requests error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =============================
// ACCEPT / REJECT REQUEST (Founder only)
// PATCH /api/team/join-request/:requestId
// body: { action: 'accepted' | 'rejected' }
// =============================
router.patch("/join-request/:requestId", verifyToken, async (req, res) => {
  const requestId = req.params.requestId;
  const userId = req.user.id;
  const { action } = req.body;

  if (!["accepted", "rejected"].includes(action))
    return res.status(400).json({ error: "Invalid action" });

  try {
    const [requests] = await db.query(
      `SELECT jr.*, si.user_id AS founder_id, si.title, si.id AS idea_id
       FROM join_requests jr
       JOIN startup_ideas si ON jr.idea_id = si.id
       WHERE jr.id = ?`,
      [requestId],
    );
    if (requests.length === 0)
      return res.status(404).json({ error: "Request not found" });

    const request = requests[0];

    if (request.founder_id !== userId)
      return res.status(403).json({ error: "Only the founder can respond" });

    // Update status
    await db.query(`UPDATE join_requests SET status = ? WHERE id = ?`, [
      action,
      requestId,
    ]);

    if (action === "accepted") {
      // Add to team_members
      await db.query(
        `INSERT IGNORE INTO team_members (idea_id, user_id) VALUES (?, ?)`,
        [request.idea_id, request.user_id],
      );
    }

    // Notify the requester
    // sender_id = founder (the person who took the action)
    const notifMsg =
      action === "accepted"
        ? `Your request to join "${request.title}" was accepted! 🎉`
        : `Your request to join "${request.title}" was declined.`;

    await db.query(
      `INSERT INTO notifications
         (user_id, sender_id, type, message, idea_id, request_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        request.user_id,
        userId,
        action === "accepted" ? "request_accepted" : "request_rejected",
        notifMsg,
        request.idea_id,
        requestId,
      ],
    );

    res.json({ message: `Request ${action}` });
  } catch (err) {
    console.error("Accept/reject error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =============================
// GET TEAM MEMBERS
// GET /api/team/idea/:id/members
// =============================
router.get("/idea/:id/members", async (req, res) => {
  const ideaId = req.params.id;

  try {
    const [members] = await db.query(
      `SELECT
         tm.id,
         tm.role,
         tm.joined_at,
         u.id       AS user_id,
         u.username
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.idea_id = ?
       ORDER BY tm.joined_at ASC`,
      [ideaId],
    );

    res.json(members);
  } catch (err) {
    console.error("Get members error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =============================
// REMOVE MEMBER (Founder only)
// DELETE /api/team/idea/:id/member/:memberUserId
// =============================
router.delete(
  "/idea/:id/member/:memberUserId",
  verifyToken,
  async (req, res) => {
    const ideaId = req.params.id;
    const memberUserId = req.params.memberUserId;
    const userId = req.user.id;

    try {
      const [ideas] = await db.query(
        `SELECT user_id FROM startup_ideas WHERE id = ?`,
        [ideaId],
      );
      if (ideas.length === 0)
        return res.status(404).json({ error: "Idea not found" });
      if (ideas[0].user_id !== userId)
        return res
          .status(403)
          .json({ error: "Only founder can remove members" });

      await db.query(
        `DELETE FROM team_members WHERE idea_id = ? AND user_id = ?`,
        [ideaId, memberUserId],
      );

      // Reset their request so they can re-apply
      await db.query(
        `UPDATE join_requests SET status = 'rejected'
       WHERE idea_id = ? AND user_id = ?`,
        [ideaId, memberUserId],
      );

      res.json({ message: "Member removed" });
    } catch (err) {
      console.error("Remove member error:", err);
      res.status(500).json({ error: err.message });
    }
  },
);

// =============================
// GET MY REQUEST STATUS
// GET /api/team/idea/:id/my-request
// =============================
router.get("/idea/:id/my-request", verifyToken, async (req, res) => {
  const ideaId = req.params.id;
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      `SELECT status FROM join_requests WHERE idea_id = ? AND user_id = ?`,
      [ideaId, userId],
    );

    res.json({ status: rows.length > 0 ? rows[0].status : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
