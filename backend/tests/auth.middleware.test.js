jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

jest.mock("../config/db", () => ({
  execute: jest.fn(),
}));

const jwt = require("jsonwebtoken");
const db = require("../config/db");
const verifyToken = require("../middleware/auth");

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("backend/middleware/auth verifyToken", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test("returns 401 when Authorization header is missing", async () => {
    const req = { headers: {} };
    const res = createRes();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No token provided" });
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 401 when user from token no longer exists", async () => {
    const req = { headers: { authorization: "Bearer valid-token" } };
    const res = createRes();
    const next = jest.fn();

    jwt.verify.mockReturnValue({ id: 44, role: "user" });
    db.execute.mockResolvedValue([[]]);

    await verifyToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("valid-token", "test-secret");
    expect(db.execute).toHaveBeenCalledWith("SELECT id FROM users WHERE id = ?", [44]);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "User no longer exists. Please login again.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("attaches decoded user and calls next when token is valid", async () => {
    const req = { headers: { authorization: "Bearer valid-token" } };
    const res = createRes();
    const next = jest.fn();

    const decoded = { id: 7, role: "vendor" };
    jwt.verify.mockReturnValue(decoded);
    db.execute.mockResolvedValue([[{ id: 7 }]]);

    await verifyToken(req, res, next);

    expect(req.user).toEqual(decoded);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("returns 403 when jwt verification fails", async () => {
    const req = { headers: { authorization: "Bearer bad-token" } };
    const res = createRes();
    const next = jest.fn();

    jwt.verify.mockImplementation(() => {
      throw new Error("invalid token");
    });

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });
});
