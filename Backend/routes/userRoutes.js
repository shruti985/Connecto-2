const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middlewares/authmiddleware");

async function tableExists(tableName) {
  const [rows] = await db.query(
    `SELECT 1
     FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = ?
     LIMIT 1`,
    [tableName],
  );
  return rows.length > 0;
}

// ─────────────────────────────────────────────────────────────
// POST /api/users/onboarding
//
// KEY FIX: Only updates fields that were actually filled in.
// If the user skipped a step (empty string / empty array),
// that field is left unchanged in the database using COALESCE.
//
// This means:
//   - First time: saves everything
//   - Skipped fields: keeps existing DB value untouched
//   - Filled fields: overwrites with new value
// ─────────────────────────────────────────────────────────────
router.post("/onboarding", authMiddleware, async (req, res) => {
  const {
    gender, year, dept, personality,
    fieldPref, sports, food, hobbies, placePref, weekendPref,
  } = req.body;

  try {
    // ── Build SET clause dynamically ──────────────────────────
    // Only update a field if the new value is non-empty.
    // Otherwise COALESCE keeps the existing DB value.
    const sets   = [];
    const values = [];

    // String fields — only update if non-empty string
    if (gender)      { sets.push("gender = ?");      values.push(gender); }
    if (year)        { sets.push("year = ?");         values.push(year); }
    if (personality) { sets.push("personality = ?"); values.push(personality); }

    // Array fields — only update if array has at least 1 item
    if (fieldPref   && fieldPref.length   > 0) { sets.push("field_prefs = ?");  values.push(JSON.stringify(fieldPref));   }
    if (sports      && sports.length      > 0) { sets.push("sports = ?");        values.push(JSON.stringify(sports));      }
    if (food        && food.length        > 0) { sets.push("food_prefs = ?");    values.push(JSON.stringify(food));        }
    if (hobbies     && hobbies.length     > 0) { sets.push("hobbies = ?");       values.push(JSON.stringify(hobbies));     }
    if (placePref   && placePref.length   > 0) { sets.push("place_prefs = ?");   values.push(JSON.stringify(placePref));   }
    if (weekendPref && weekendPref.length > 0) { sets.push("weekend = ?");       values.push(JSON.stringify(weekendPref)); }

    // Always mark onboarding as done
    sets.push("onboarding_done = 1");

    // If absolutely nothing was filled in (user skipped everything),
    // still mark onboarding done but don't touch any data columns.
    if (sets.length === 1) {
      // Only "onboarding_done = 1" — just update that
      await db.query(
        "UPDATE users SET onboarding_done = 1 WHERE id = ?",
        [req.user.id]
      );
    } else {
      values.push(req.user.id);
      await db.query(
        `UPDATE users SET ${sets.join(", ")} WHERE id = ?`,
        values
      );
    }

    res.json({ message: "Onboarding saved!", onboarding_done: true });
  } catch (err) {
    console.error("Onboarding save error:", err);
    res.status(500).json({ message: "Failed to save onboarding" });
  }
});


// Get Profile Data
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    // req.user.id aapke authMiddleware se aayega
    const [rows] = await db.query(
      "SELECT username, email, hometown,bio FROM users WHERE id = ?",
      [req.user.id],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });
   return res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update Profile Data
router.put("/profile/update", authMiddleware, async (req, res) => {
  const { name, phone, hometown, bio } = req.body;
  try {
    // Note: Agar aap username update kar rahe hain toh column name 'username' use karein
    await db.query(
      "UPDATE users SET username = ?, phone = ?, hometown = ?, bio = ? WHERE id = ?",
      [name, phone, hometown, bio, req.user.id],
    );
    res.json({ message: "Profile updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

// Get joined communities for profile
router.get("/communities", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.id, c.name, c.slug, c.icon
       FROM communities c
       INNER JOIN user_communities uc ON uc.community_id = c.id
       WHERE uc.user_id = ?
       ORDER BY c.name ASC`,
      [req.user.id],
    );
    return res.json(rows);
  } catch (err) {
    console.error("Communities fetch error:", err);
    return res.status(500).json({ message: "Could not fetch communities" });
  }
});

// Get activity summary for profile
router.get("/activity", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    let posts = 0;
    let connections = 0;
    let messages = 0;

    if (await tableExists("community_posts")) {
      const [rows] = await db.query(
        "SELECT COUNT(*) AS cnt FROM community_posts WHERE user_id = ?",
        [userId],
      );
      posts = rows[0]?.cnt || 0;
    }

    if (await tableExists("connections")) {
      const [rows] = await db.query(
        `SELECT COUNT(*) AS cnt
         FROM connections
         WHERE status = 'accepted' AND (sender_id = ? OR receiver_id = ?)`,
        [userId, userId],
      );
      connections = rows[0]?.cnt || 0;
    }

    if (await tableExists("direct_messages")) {
      const [rows] = await db.query(
        `SELECT COUNT(*) AS cnt
         FROM direct_messages
         WHERE sender_id = ? OR receiver_id = ?`,
        [userId, userId],
      );
      messages = rows[0]?.cnt || 0;
    }

    return res.json({ posts, connections, messages });
  } catch (err) {
    console.error("Activity fetch error:", err);
    return res.status(500).json({ message: "Could not fetch activity" });
  }
});

router.get("/matches", authMiddleware, async (req, res) => {
  try {
    // Step 1: Get current user's community IDs
    const [myCommRows] = await db.query(
      "SELECT community_id FROM user_communities WHERE user_id = ?",
      [req.user.id]
    );
    const myCommunityIds = myCommRows.map((r) => r.community_id);

    if (myCommunityIds.length === 0) {
      return res.json([]); // No communities joined yet
    }

    // Step 2: Find other users who share at least 1 community
    // Count shared communities and calculate match score
    const [matches] = await db.query(
      `SELECT
          u.id,
          u.username AS name,
          u.email,
          u.hometown,
          COUNT(uc.community_id)                        AS sharedCount,
          ROUND(COUNT(uc.community_id) / ? * 100)       AS score,
          GROUP_CONCAT(c.name ORDER BY c.name SEPARATOR ',') AS sharedCommunityNames,
          GROUP_CONCAT(c.slug ORDER BY c.name SEPARATOR ',') AS sharedCommunitySlugs
       FROM users u
       INNER JOIN user_communities uc
          ON u.id = uc.user_id AND uc.community_id IN (?)
       INNER JOIN communities c
          ON c.id = uc.community_id
       WHERE u.id != ?
       GROUP BY u.id, u.username, u.email, u.hometown
       ORDER BY sharedCount DESC, u.username ASC
       LIMIT 20`,
      [myCommunityIds.length, myCommunityIds, req.user.id]
    );

    // Step 3: For each match, also get ALL their communities (not just shared)
    const enriched = await Promise.all(
      matches.map(async (match) => {
        const [allComms] = await db.query(
          `SELECT c.name, c.slug, c.icon
           FROM communities c
           INNER JOIN user_communities uc ON c.id = uc.community_id
           WHERE uc.user_id = ?`,
          [match.id]
        );
        return {
          id: match.id,
          name: match.name,
          email: match.email,
          hometown: match.hometown,
          score: Math.min(match.score, 100), // cap at 100%
          shared: match.sharedCommunityNames
            ? match.sharedCommunityNames.split(",")
            : [],
          communities: allComms.map((c) => c.name),
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// Get All Buddies (Excluding current user)
router.get("/all-buddies", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, username, hometown, avatar_url, bio, course, year, travelMode, interests, online 
       FROM users 
       WHERE id != ?`,
      [req.user.id],
    );

    const formattedRows = rows.map((user) => ({
      id: user.id,
      name: user.username,
      hometown: user.hometown || "Unknown",
      // Agar avatar_url hai toh wo use karo, nahi toh naam ka pehla letter
      avatar: user.avatar_url
        ? user.avatar_url
        : user.username.charAt(0).toUpperCase(),
      course: user.course,
      year: user.year,
      interests:
        typeof user.interests === "string"
          ? JSON.parse(user.interests)
          : user.interests || [],
      travelMode: user.travelMode,
      online: Boolean(user.online),
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch buddies" });
  }
});
router.get("/profile/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;

    // 1️⃣ Get user info
    const [users] = await db.query(
      `SELECT 
        id,
        username,
        email,
        hometown,
        bio,
        course,
        year,
        interests
       FROM users
       WHERE id = ?`,
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = users[0];

    // 2️⃣ Get communities joined
    const [communities] = await db.query(
      `
      SELECT 
        c.id,
        c.name,
        c.slug
      FROM user_communities uc
      JOIN communities c
        ON uc.community_id = c.id
      WHERE uc.user_id = ?
      `,
      [userId],
    );

    res.json({
      ...user,
      communities,
      interests:
        typeof user.interests === "string"
          ? JSON.parse(user.interests)
          : user.interests || [],
    });
  } catch (err) {
    console.error("Profile fetch error:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
  });
// Delete Account (and related user data)
router.delete("/account", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const deletions = [
      { table: "connections", sql: "DELETE FROM connections WHERE sender_id = ? OR receiver_id = ?", params: [userId, userId] },
      { table: "direct_messages", sql: "DELETE FROM direct_messages WHERE sender_id = ? OR receiver_id = ?", params: [userId, userId] },
      { table: "community_members", sql: "DELETE FROM community_members WHERE user_id = ?", params: [userId] },
      { table: "user_communities", sql: "DELETE FROM user_communities WHERE user_id = ?", params: [userId] },
      { table: "post_likes", sql: "DELETE FROM post_likes WHERE user_id = ?", params: [userId] },
      { table: "comments", sql: "DELETE FROM comments WHERE user_id = ?", params: [userId] },
      { table: "community_posts", sql: "DELETE FROM community_posts WHERE user_id = ?", params: [userId] },
      { table: "idea_likes", sql: "DELETE FROM idea_likes WHERE user_id = ?", params: [userId] },
      { table: "startup_ideas", sql: "DELETE FROM startup_ideas WHERE user_id = ?", params: [userId] },
      { table: "hackathon_members", sql: "DELETE FROM hackathon_members WHERE user_id = ?", params: [userId] },
      { table: "hackathon_rooms", sql: "DELETE FROM hackathon_rooms WHERE creator_id = ?", params: [userId] },
    ];

    for (const step of deletions) {
      const exists = await tableExists(step.table);
      if (!exists) continue;
      await conn.query(step.sql, step.params);
    }

    await conn.query("DELETE FROM users WHERE id = ?", [userId]);

    await conn.commit();
    return res.json({ message: "Account deleted successfully." });
  } catch (err) {
    await conn.rollback();
    console.error("Delete account error:", err);
    return res.status(500).json({ message: "Could not delete account right now." });
  } finally {
    conn.release();
  }
});
module.exports = router;
