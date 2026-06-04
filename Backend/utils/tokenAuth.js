const crypto = require("crypto");
const User = require("../models/User");

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function base64UrlEncode(value) {
    return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
    return Buffer.from(value, "base64url").toString("utf8");
}

function getTokenSecret() {
    return process.env.AUTH_TOKEN_SECRET || process.env.SESSION_SECRET || "staynedt_super_secret_code";
}

function signPayload(payload) {
    return crypto
        .createHmac("sha256", getTokenSecret())
        .update(payload)
        .digest("base64url");
}

function createAuthToken(user) {
    const payload = base64UrlEncode(JSON.stringify({
        id: String(user._id),
        username: user.username,
        exp: Date.now() + TOKEN_TTL_MS,
    }));
    const signature = signPayload(payload);

    return `${payload}.${signature}`;
}

function verifyAuthToken(token) {
    const [payload, signature] = String(token || "").split(".");

    if (!payload || !signature || signPayload(payload) !== signature) {
        return null;
    }

    try {
        const data = JSON.parse(base64UrlDecode(payload));

        if (!data.id || !data.exp || Date.now() > data.exp) {
            return null;
        }

        return data;
    } catch (err) {
        return null;
    }
}

async function attachTokenUser(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }

    const authHeader = req.get("authorization") || "";
    const match = authHeader.match(/^Bearer\s+(.+)$/i);

    if (!match) {
        return next();
    }

    const tokenData = verifyAuthToken(match[1]);

    if (!tokenData) {
        return next();
    }

    const user = await User.findById(tokenData.id);

    if (user) {
        req.user = user;
        req.isAuthenticated = () => true;
    }

    next();
}

module.exports = {
    attachTokenUser,
    createAuthToken,
};
