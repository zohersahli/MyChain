import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export function createAuthController({ deps }) {
  const { env, models } = deps;

  return {
    register: async (req, res) => {
      const { username, password } = req.body || {};

      if (typeof username !== "string" || username.trim().length < 3) {
        return res.status(400).json({ message: "Invalid username." });
      }
      if (typeof password !== "string" || password.length < 4) {
        return res.status(400).json({ message: "Invalid password." });
      }

      try {
        const exists = await models.UserModel.findOne({ username });
        if (exists) return res.status(400).json({ message: "Username already exists (backend)" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new models.UserModel({ username, password: hashedPassword });
        await newUser.save();

        return res.status(201).json({ message: "User registered successfully" });
      } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({ message: "Registration failed" });
      }
    },

    login: async (req, res) => {
      const { username, password } = req.body || {};
      try {
        const user = await models.UserModel.findOne({ username });
        if (!user) return res.status(401).json({ message: "Invalid username or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid username or password" });

        const token = jwt.sign(
          { id: user._id, username: user.username, role: user.role },
          env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        return res.json({ token });
      } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Login failed" });
      }
    }
  };
}
