import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";
import { LanguageProvider } from "../../context/language/LanguageContext";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderLogin = () => {
  render(
    <LanguageProvider>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </LanguageProvider>
  );
};

describe("Login page", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockNavigate.mockReset();
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("shows required email validation error and blocks submit", async () => {
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("customer@gmail.com"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter password"), {
      target: { value: "Pass@123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    expect(await screen.findByText("⚠ Email is required.")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("shows phone validation error for invalid phone", async () => {
    renderLogin();

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "phone" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter phone number"), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter password"), {
      target: { value: "Pass@123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    expect(
      await screen.findByText(
        "⚠ Enter a valid 10-digit phone number starting with 6-9."
      )
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("shows password special character validation error", async () => {
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("customer@gmail.com"), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter password"), {
      target: { value: "Password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    expect(
      await screen.findByText(
        "⚠ Password must include a special character (e.g. !@#$%)."
      )
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("submits valid credentials and navigates vendor to vendor products", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        token: "token-123",
        user: { id: 1, role: "vendor" },
      }),
    });

    renderLogin();

    fireEvent.click(screen.getByLabelText("Vendor"));
    fireEvent.change(screen.getByPlaceholderText("vendor@gmail.com"), {
      target: { value: "vendor@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter password"), {
      target: { value: "Pass@123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    const [url, options] = global.fetch.mock.calls[0];
    expect(String(url)).toContain("/api/authentication/login");
    expect(options.method).toBe("POST");
    expect(options.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(options.body)).toEqual({
      identifier: "vendor@test.com",
      password: "Pass@123",
      loginAs: "vendor",
    });

    expect(localStorage.getItem("token")).toBe("token-123");
    expect(JSON.parse(localStorage.getItem("user"))).toEqual({ id: 1, role: "vendor" });
    expect(mockNavigate).toHaveBeenCalledWith("/vendor/products");
  });

  test("navigates to admin dashboard when user role is admin", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        token: "admin-token",
        user: { id: 99, role: "admin" },
      }),
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("customer@gmail.com"), {
      target: { value: "admin@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter password"), {
      target: { value: "Pass@123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(localStorage.getItem("token")).toBe("admin-token");
    expect(mockNavigate).toHaveBeenCalledWith("/admin");
  });

  test("alerts API failure message when login response is not ok", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Invalid credentials" }),
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("customer@gmail.com"), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter password"), {
      target: { value: "Pass@123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Invalid credentials");
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("alerts on network/server error", async () => {
    global.fetch.mockRejectedValue(new Error("Network error"));

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("customer@gmail.com"), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter password"), {
      target: { value: "Pass@123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Server not responding");
    });
  });
});
